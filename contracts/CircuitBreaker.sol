// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/// @notice Minimal interface for the parts of AttentionFutures we interact with
interface IAttentionFutures {
    function pause() external;
    function unpause() external;
    function paused() external view returns (bool);
}

/// @notice Minimal interface for the oracle used by AttentionFutures
interface IAttentionOracle {
    function getAttentionScore(string calldata token) external view returns (uint256 score, uint256 timestamp);
}

/// @title CircuitBreaker for AttentionFutures
/// @dev Chainlink Automation-compatible contract that automatically pauses the
///      trading contract when oracle data becomes stale, and unpauses once the
///      data is fresh again.
contract CircuitBreaker is AutomationCompatibleInterface {
    // ---------------------------------------------------------------------
    // Immutable configuration
    // ---------------------------------------------------------------------
    IAttentionFutures public immutable futures;
    IAttentionOracle  public immutable oracle;
    string  public token;       // token symbol monitored (e.g. "BTC")

    // ---------------------------------------------------------------------
    // Mutable configuration
    // ---------------------------------------------------------------------
    /// @notice Maximum permitted age (in seconds) of oracle data before the
    ///         futures exchange is paused.
    uint256 public maxDataAge;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------
    event PausedByCB();
    event UnpausedByCB();
    event MaxDataAgeUpdated(uint256 newValue);

    address private immutable _ownerAddr;

    constructor(address _futures, address _oracle, string memory _token, uint256 _maxAgeSeconds) {
        require(_futures != address(0) && _oracle != address(0), "zero addr");
        require(_maxAgeSeconds > 0, "age 0");
        futures     = IAttentionFutures(_futures);
        oracle      = IAttentionOracle(_oracle);
        token       = _token;
        maxDataAge  = _maxAgeSeconds;
        _ownerAddr  = msg.sender;
    }

    //-----------------------------------------------------------------------
    // Automation logic
    //-----------------------------------------------------------------------

    /// @inheritdoc AutomationCompatibleInterface
    function checkUpkeep(bytes calldata /*checkData*/)
        external view override
        returns (bool upkeepNeeded, bytes memory /*performData*/)
    {
        (, uint256 ts) = oracle.getAttentionScore(token);
        bool isStale       = block.timestamp - ts > maxDataAge;
        bool isPaused      = futures.paused();
        upkeepNeeded = (isStale && !isPaused) || (!isStale && isPaused);
    }

    /// @inheritdoc AutomationCompatibleInterface
    function performUpkeep(bytes calldata /*performData*/) external override {
        (, uint256 ts) = oracle.getAttentionScore(token);
        bool isStale  = block.timestamp - ts > maxDataAge;
        bool isPaused = futures.paused();

        if (isStale && !isPaused) {
            futures.pause();
            emit PausedByCB();
        } else if (!isStale && isPaused) {
            futures.unpause();
            emit UnpausedByCB();
        }
        // If neither condition is true, nothing to do.
    }

    //-----------------------------------------------------------------------
    // Admin
    //-----------------------------------------------------------------------

    /// @notice Allows an authorised account to update the freshness threshold.
    ///         Must be called via governance / owner wallet that owns this
    ///         contract. For simplicity we rely on implicit ownership (EOA).
    function setMaxDataAge(uint256 newAge) external {
        // only deployer (tx.origin) or a future governance can change this.
        // The Automation network never calls this, so we can use msg.sender.
        require(newAge > 0, "age 0");
        require(msg.sender == _owner(), "not owner");
        maxDataAge = newAge;
        emit MaxDataAgeUpdated(newAge);
    }

    //-----------------------------------------------------------------------
    // Very light-weight ownership (deployer == owner)
    //-----------------------------------------------------------------------
    function _owner() internal view returns (address) { return _ownerAddr; }
    function owner() external view returns (address) { return _ownerAddr; }
} 