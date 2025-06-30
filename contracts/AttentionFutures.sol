//SPDX License - Identifier: MIT
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

pragma solidity ^0.8.19;

// --------------------------------------------
// Chainlink price-feed adapter interface
// --------------------------------------------
interface IPriceFeedAdapter {
    function latestPriceUsd(string calldata symbol) external view returns (uint256);
}

/// @notice minimal interface to read scores from your oracle
interface IAttentionOracle {
   function getAttentionScore(string calldata token)
        external
        view
        returns (uint256 score, uint256 timestamp);

    function isDataFresh(string calldata token) external view returns (bool);
}

/// @title Attention–settled Futures Exchange
/// @notice Traders can long/short social-media "attention" with leverage, while LPs provide pooled liquidity. A flat protocol fee (0.1% per open/close) is collected and withdrawable by the owner.
contract AttentionFutures is ReentrancyGuard, Pausable, Ownable {
    /*---------- CONFIG ----------*/
    uint256 public constant MIN_COLLATERAL = 0.01 ether;      // change later
    uint256 public constant SECONDS_IN_DAY = 1 days;
    uint256 public constant MIN_LP_DEPOSIT = 0.01 ether;
    uint256 public constant MIN_HEALTH_FACTOR = 1e18;
    
    event CollateralAdded (uint256 indexed id,uint256 amount);
    event CollateralRemoved(uint256 indexed id,uint256 amount);


    /*---------- DATA TYPES ----------*/
    struct Position {
        address trader;
        string  token;        // e.g. "PEPE"
        bool    isLong;
        uint256 collateral;   // wei or token decimals
        uint256 leverage;     // 2 / 5 / 10
        uint256 openScore;    // oracle score when opened
        uint256 openTime;
        bool    isActive;
    }

    /*---------- STATE ----------*/
    IAttentionOracle  public immutable oracle;
    IPriceFeedAdapter public immutable priceFeed;
    uint256 public nextId = 1;
    mapping(uint256 => Position) public positions;           // id -> Position
    mapping(address => uint256[]) public userPositionIds;    // wallet -> list
    uint256 public totalShares;
    mapping(address=>uint256) public shares;
    /// @notice Accumulated protocol fees (in wei) waiting to be withdrawn by owner
    uint256 public protocolFees;
    event LiquidityAdded(address indexed lp,uint256 amount,uint256 sharesMinted);
    event LiquidityRemoved(address indexed lp,uint256 amount,uint256 sharesBurned);
    /// @dev Emitted whenever the protocol fee is charged on open / close
    event FeeCollected(address indexed trader,uint256 amount);

    /*---------- EVENTS ----------*/
    event PositionOpened(
        uint256 indexed id,
        address indexed trader,
        string  token,
        bool    isLong,
        uint256 collateral,
        uint256 leverage,
        uint256 openScore
    );
    event PositionClosed(uint256 indexed id, int256 pnl);
    event Liquidated(uint256 indexed id, int256 pnl, address liquidator);
    /// @dev Fires every time collateral or PnL changes the protection ratio
    event HealthFactorUpdated(uint256 indexed id, uint256 healthFactor);
    /// @dev Fired when the owner updates economic parameters
    event ParametersUpdated(uint256 feeBps, uint256 maxLev, uint256 liqTh);

    /*---------- ERRORS ----------*/
    error InvalidLeverage();
    error NotFreshData();
    // error AlreadyActive();
    error NotOwner();
    error Inactive();
    error ZeroCollateral();

    /*---------- PARAMS (mutable by owner) ----------*/
    uint256 public maxLeverage  = 10;                  // 10x cap (mutable)
    uint256 public protocolFeeBps = 10;                // 0.1 % default (mutable)
    uint256 public liqThreshold = 95e16;               // 95 % default (mutable)

    /*---------- CONSTRUCTOR ----------*/
    constructor(address _oracle, address _priceFeed) Ownable(msg.sender) {
        oracle = IAttentionOracle(_oracle);
        priceFeed = IPriceFeedAdapter(_priceFeed);
    }

    /*---------- EXTERNAL  ----------*/
    /// @notice Open a leveraged long or short position on a token's attention score
    /// @param token        Symbol string (e.g. "PEPE")
    /// @param isLong       True for long, false for short
    /// @param leverage     Permitted values: 2, 5, or 10
    function openPosition(
        string calldata token,
        bool    isLong,
        uint256 leverage
    ) external payable nonReentrant whenNotPaused {
        
        if (msg.value <MIN_COLLATERAL) revert ZeroCollateral();
        if(leverage != 2 && leverage!=5 && leverage!=10)
        {
            revert InvalidLeverage();
        }        
        if(leverage > maxLeverage) revert InvalidLeverage();

        if(!oracle.isDataFresh(token)) revert NotFreshData(); 
        (uint256 score,) = oracle.getAttentionScore(token);
        
        uint256 fee = (msg.value * protocolFeeBps) / 10_000;
        uint256 netCollateral = msg.value - fee;
        protocolFees += fee;
        emit FeeCollected(msg.sender, fee);

        uint256 id = nextId;
        positions[id] = Position({
            trader:msg.sender,
            token:token,
            isLong:isLong,
            collateral:netCollateral,
            leverage:leverage,
            openScore:score,
            openTime:block.timestamp,
            isActive:true
        });

        userPositionIds[msg.sender].push(id);

        emit PositionOpened(id, msg.sender, token, isLong, netCollateral, leverage, score);

        emit HealthFactorUpdated(id, healthFactor(id));

        unchecked {
            nextId = id + 1;
        }

    }

    /// @notice Position net equity (collateral plus PnL); negative is possible
    function equity(uint256 id) public view returns (int256) {
        Position storage p = positions[id];
        return int256(p.collateral) + calcPnl(id);
    }

    /// @notice Health factor scaled to 1e18 (100 % == safe)
    function healthFactor(uint256 id) public view returns (uint256) {
        Position storage p = positions[id];
        if (!p.isActive || p.collateral == 0) return 0;
        int256 eq = equity(id);
        if (eq <= 0) return 0;
        return uint256(eq) * 1e18 / p.collateral;
    }

    /// @notice Collateral value in USD (8-decimals) – useful for the UI; does NOT affect core math yet.
    function collateralUsd(uint256 id) external view returns (uint256) {
        Position storage p = positions[id];
        uint256 ethPrice = priceFeed.latestPriceUsd("ETH");
        return (p.collateral * ethPrice) / 1e18; // wei→ETH then × price /1e8
    }

    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_LP_DEPOSIT,"min 0.01 ETH");
        uint256 minted;
        if (totalShares == 0) {
            // first LP sets the initial share price: 1 wei deposit ⇒ 1 share
            minted = msg.value;
        } else {
            uint256 poolBalanceBefore = address(this).balance - msg.value - protocolFees; // exclude this deposit + protocol fees
            minted = (msg.value * totalShares) / poolBalanceBefore;
            require(minted > 0, "deposit too small");
        }
        totalShares += minted;
        shares[msg.sender] += minted;

        emit LiquidityAdded(msg.sender, msg.value, minted);
    }


    function withdraw(uint256 shareAmount) external nonReentrant whenNotPaused {
       require(shareAmount > 0,"zero");
       require(shares[msg.sender] >= shareAmount,"too many shares");
       uint256 payout = (shareAmount * (address(this).balance - protocolFees)) / totalShares;

       shares[msg.sender] -=shareAmount;
       totalShares -= shareAmount;

       emit LiquidityRemoved(msg.sender, payout, shareAmount);
       (bool ok,) = payable(msg.sender).call{value:payout}("");
       require(ok,"eth transfer failed");
    }

    /// @notice Add margin to an open position
    function addCollateral(uint256 id) external payable nonReentrant whenNotPaused {
        Position storage p = positions[id];
        require(p.isActive,           "closed");
        require(p.trader == msg.sender, "not owner");
        require(msg.value > 0,        "zero");

        p.collateral += msg.value;
        emit CollateralAdded(id, msg.value);

        emit HealthFactorUpdated(id, healthFactor(id));
    }
     
    ///@notice Withdraw Margin if position stays healthy
    function removeCollateral(uint256 id,uint256 amount) external nonReentrant whenNotPaused {
        Position storage p = positions[id];
        require(p.isActive,            "closed");
        require(p.trader == msg.sender,"not owner");
        require(amount > 0 && amount <= p.collateral, "bad amount");

        // simulate post-withdraw health
        int256 newEquity = int256(p.collateral - amount) + calcPnl(id);
        uint256 newHealth = newEquity <= 0
            ? 0
            : uint256(newEquity) * 1e18 / (p.collateral - amount);

        require(newHealth >= MIN_HEALTH_FACTOR, "would be unsafe");

        p.collateral -= amount;
        emit CollateralRemoved(id, amount);

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "transfer failed");

        emit HealthFactorUpdated(id, healthFactor(id));
    }




    function closePosition(uint256 id) external nonReentrant whenNotPaused {
     Position storage p = positions[id];
     if(!p.isActive) revert Inactive();
     if(p.trader != msg.sender) revert NotOwner();

     // Calculate PnL *before* we mark the position inactive; otherwise
     // calcPnl() would short-circuit to 0.
     int256 pnl = calcPnl(id);

     // Now deactivate the position (re-entrancy safety before transferring value)
     p.isActive = false;

     uint256 payout;
     if(pnl > 0){
        payout = p.collateral + uint256(pnl);
        // apply closing fee only on positive payout
        uint256 fee = (payout * protocolFeeBps) / 10_000;
        payout -= fee;
        protocolFees += fee;
        emit FeeCollected(p.trader, fee);
        require(address(this).balance >= payout,"pool insolvent");
     } else {
        int256 remaining = int256(p.collateral) + pnl; // pnl is negative here or zero
        payout = remaining  > 0 ? uint256(remaining) : 0;
        // no fee taken on loss-making close
     }

     emit PositionClosed(
        id, pnl);

     if(payout > 0 ){
        (bool ok,) = payable(p.trader).call{value: payout}("");
        require(ok,"Transfer failed");
     }
    }

    /*---------- VIEW HELPERS ----------*/
    function calcPnl(uint256 id) public view returns (int256 pnl) {
        Position storage p = positions[id];
        if (!p.isActive) return 0;

        
        (uint256 currentScore,) = oracle.getAttentionScore(p.token);

        int256 diff = int256(currentScore) - int256(p.openScore);
        int256 pctChange = (diff * 1e18) / int256(p.openScore);   // ±1e18 = ±100 %

        int256 gross = (int256(p.collateral) * int256(p.leverage) * pctChange) / 1e18;

        if(!p.isLong) gross = -gross;
        return gross;


    }

    function liquidate(uint256 id) external nonReentrant whenNotPaused {
        Position storage p = positions[id];
        require(p.isActive, "closed");

        // ─── new health-factor based check ───
        uint256 hf = healthFactor(id);            // scaled 1e18
        require(hf < liqThreshold, "not liquidatable");

        // PnL must be calculated *before* we flip the active flag
        int256 pnl = calcPnl(id);

        p.isActive = false;                       // lock state

        uint256 bounty = (p.collateral * 5) / 100;   // 5 % bounty
        (bool ok,) = payable(msg.sender).call{value: bounty}("");
        require(ok, "bounty transfer failed");

        emit Liquidated(id, pnl, msg.sender);
    }

    /* ───────────────── PROTOCOL FEE MANAGEMENT ───────────────── */

    /// @notice Withdraw accumulated protocol fees to the contract owner
    function withdrawProtocolFees(address payable to,uint256 amount) external onlyOwner {
        require(amount > 0 && amount <= protocolFees, "invalid amount");
        protocolFees -= amount;
        (bool ok,) = to.call{value: amount}("");
        require(ok, "fee withdraw failed");
    }

    /* ───────────────── PAUSING ───────────────── */

    /// @notice Emergency stop; callable by the owner (or circuit-breaker) to halt trading.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume trading after the emergency condition is cleared.
    function unpause() external onlyOwner {
        _unpause();
    }

    /* ───────────────── PARAMETER GOVERNANCE ───────────────── */

    /// @notice Owner can update fee, leverage cap & liquidation threshold.
    /// @param _feeBps Protocol fee in basis-points (e.g. 10 = 0.1 %).
    /// @param _maxLev Maximum leverage multiple allowed (>=2).
    /// @param _liqTh  Health-factor (%) below which liquidation is allowed, scaled 1e18 (e.g. 0.95e18).
    function setParameters(uint256 _feeBps, uint256 _maxLev, uint256 _liqTh) external onlyOwner {
        require(_feeBps <= 100, "fee too high (>1%)");
        require(_maxLev >= 2 && _maxLev <= 50, "bad leverage");
        require(_liqTh >= 8e17 && _liqTh <= 1e18, "bad threshold");
        protocolFeeBps = _feeBps;
        maxLeverage    = _maxLev;
        liqThreshold   = _liqTh;
        emit ParametersUpdated(_feeBps, _maxLev, _liqTh);
    }
}