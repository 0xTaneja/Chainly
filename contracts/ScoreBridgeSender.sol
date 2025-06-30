// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AttentionOracle} from "./AttentionOracle.sol";

/// @dev Minimal subset of the CCIP router admin interface used by ScoreBridgeSender.
interface IRouterAdmin {
    function updateDestinationChainSelector(address sender, uint64 dest, bool allowed) external;
}

/// @title ScoreBridgeSender
/// @notice Reads the latest attention score from the local Sepolia oracle and
///         sends it cross-chain to Avalanche Fuji via CCIP.
contract ScoreBridgeSender is ConfirmedOwner {
    /*────────────────── STATE ──────────────────*/

    IRouterClient public immutable router;   // CCIP router on this chain
    IERC20       public immutable linkToken; // LINK used to pay fees
    uint64       public destChainSelector;   // Fuji selector
    address      public destReceiver;        // ScoreBridgeReceiver on Fuji
    AttentionOracle public immutable oracle;

    /*────────────────── CONSTRUCTOR ──────────────────*/

    constructor(
        address _router,
        address _link,
        uint64  _destSelector,
        address _destReceiver,
        address _oracle
    ) ConfirmedOwner(msg.sender) {
        router            = IRouterClient(_router);
        linkToken         = IERC20(_link);
        destChainSelector = _destSelector;
        destReceiver      = _destReceiver;
        oracle            = AttentionOracle(_oracle);
    }

    /*────────────────── OWNER ADMIN ──────────────────*/

    function setDestination(uint64 selector, address receiver) external onlyOwner {
        destChainSelector = selector;
        destReceiver      = receiver;
    }

    function withdrawLink(uint256 amount,address to) external onlyOwner {
        linkToken.transfer(to, amount);
    }

    /*────────────────── ALLOWLIST ──────────────────*/

    /// @notice Allowlist (or un-allowlist) a destination chain for this sender on the CCIP router.
    /// @dev    The CCIP router keeps a per-sender mapping of permitted destination chain selectors. The
    ///         only entity authorised to update that mapping is *the sender contract itself* (i.e.,
    ///         `msg.sender` must equal the first argument).  Therefore an EOA cannot call the router
    ///         directly.  Instead, the owner calls this helper which re-enters the router in the
    ///         correct context.
    function allowlistDestinationChain(uint64 selector, bool allowed) external onlyOwner {
        IRouterAdmin(address(router)).updateDestinationChainSelector(address(this), selector, allowed);
    }

    /*────────────────── CORE ──────────────────*/

    /// @notice Bridges the latest score for `token` to the destination chain.
    function sendScore(string calldata token) external returns (bytes32 messageId) {
        (uint256 score, uint256 ts) = oracle.getAttentionScore(token);
        require(score > 0 && ts > 0, "no score");

        bytes memory payload = abi.encode(token, score);

        Client.EVM2AnyMessage memory msgData = Client.EVM2AnyMessage({
            receiver: abi.encode(destReceiver),
            data: payload,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            feeToken: address(linkToken),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 200000}))
        });

        uint256 fee = router.getFee(destChainSelector, msgData);
        require(linkToken.balanceOf(address(this)) >= fee, "not enough LINK");
        linkToken.approve(address(router), fee);

        messageId = router.ccipSend(destChainSelector, msgData);
    }
} 