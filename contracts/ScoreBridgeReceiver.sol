// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

import {AttentionOracle} from "./AttentionOracle.sol";

/// @dev  Minimal subset of router admin ABI (receiver-side)
interface IRouterReceiverAdmin {
    function updateSourceChainSender(address receiver, uint64 srcSelector, address sender, bool allowed) external;
}

/// @title ScoreBridgeReceiver
/// @notice Receives cross-chain attention-score messages from the Sepolia sender via CCIP and
///         stores them into the local AttentionOracle on Avalanche Fuji.
contract ScoreBridgeReceiver is CCIPReceiver, ConfirmedOwner {
    /*────────────────── STATE ──────────────────*/

    uint64 public immutable allowedSourceChain; // chain selector expected from sender
    address public allowedSender;               // sender contract address on source chain

    AttentionOracle public immutable oracle;
    address public immutable routerAddress;

    /*────────────────── CONSTRUCTOR ──────────────────*/

    /// @param router             CCIP router address on this chain (Fuji)
    /// @param _sourceSelector    Chain selector of the source chain (Sepolia)
    /// @param _oracle            Local AttentionOracle instance to update
    constructor(address router, uint64 _sourceSelector, address _oracle)
        CCIPReceiver(router)
        ConfirmedOwner(msg.sender)
    {
        allowedSourceChain = _sourceSelector;
        oracle = AttentionOracle(_oracle);
        routerAddress = router;
    }

    /// @notice Owner can update the allow-listed sender address if we redeploy it.
    function setAllowedSender(address sender) external onlyOwner {
        allowedSender = sender;
    }

    /*────────────────── INTERNAL CCIP HOOK ──────────────────*/

    /// @inheritdoc CCIPReceiver
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        // 1. Source chain must match expected selector
        require(message.sourceChainSelector == allowedSourceChain, "bad src chain");
        // 2. Sender address must match allow-listed contract (if set)
        if (allowedSender != address(0)) {
            require(abi.decode(message.sender, (address)) == allowedSender, "untrusted sender");
        }

        // 3. Decode payload → (token, score)
        (string memory token, uint256 score) = abi.decode(message.data, (string, uint256));

        // 4. Write into oracle (via owner-only setter)
        oracle.setAttentionScore(token, score);
    }

    function claimOracleOwnership() external onlyOwner {
    oracle.acceptOwnership();
    }

    /*────────────────── ALLOWLIST ──────────────────*/

    /// @notice Registers (or unregisters) an authorised sender on the CCIP router.
    /// @dev    The CCIP router keeps a mapping
    ///           receiver  ⇒  (sourceSelector ⇒ sender ⇒ allowed?)
    ///         and only the *receiver contract* itself can modify its own entry.
    ///         This helper lets the owner toggle that flag without needing to
    ///         know the router's admin ABI.
    ///
    ///         Chainlink router admin function signature used:
    ///           updateSourceChainSender(address receiver, uint64 srcSel, address sender, bool allowed)
    ///
    /// @param allowed  true to allow, false to block
    function allowlistSourceChainSender(bool allowed) external onlyOwner {
        // Interface with only the needed function
        IRouterReceiverAdmin(routerAddress).updateSourceChainSender(address(this), allowedSourceChain, allowedSender, allowed);
    }
} 