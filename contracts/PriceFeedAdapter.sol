// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title PriceFeedAdapter
/// @notice Minimal wrapper that translates a token symbol ("ETH", "BTC", "PEPE") into a Chainlink
///         AggregatorV3 feed address and exposes the latest USD price with 8-decimals precision.
///         New feeds can be added by the owner on the fly, letting the core protocol stay upgrade-free.
contract PriceFeedAdapter is Ownable {
    /*────────────────── STATE ──────────────────*/

    mapping(bytes32 => AggregatorV3Interface) public feeds; // symbolHash → feed

    event FeedSet(string indexed symbol, address indexed aggregator);

    /*────────────────── CONSTRUCTOR ──────────────────*/

    /// @param symbols   Array of uppercase token symbols (e.g. ["ETH","BTC"]. Empty allowed).
    /// @param addrs     Matching array of AggregatorV3 addresses on the same network.
    constructor(string[] memory symbols, address[] memory addrs) Ownable(msg.sender) {
        require(symbols.length == addrs.length, "len mismatch");
        for (uint256 i; i < symbols.length; ++i) {
            _setFeed(symbols[i], addrs[i]);
        }
    }

    /*────────────────── OWNER ACTIONS ──────────────────*/

    /// @notice Map / remap a token symbol to a Chainlink price feed.
    function setFeed(string calldata symbol, address aggregator) external onlyOwner {
        _setFeed(symbol, aggregator);
    }

    function _setFeed(string memory symbol, address aggregator) internal {
        require(bytes(symbol).length > 0, "sym empty");
        require(aggregator != address(0), "agg 0");
        feeds[keccak256(bytes(symbol))] = AggregatorV3Interface(aggregator);
        emit FeedSet(symbol, aggregator);
    }

    /*────────────────── VIEW ──────────────────*/

    /// @notice Return latest USD price for `symbol` with the feed's native decimals (usually 8).
    ///         Reverts if no feed is configured.
    function latestPriceUsd(string calldata symbol) external view returns (uint256) {
        AggregatorV3Interface agg = feeds[keccak256(bytes(symbol))];
        require(address(agg) != address(0), "feed missing");
        (, int256 answer,,,) = agg.latestRoundData();
        require(answer > 0, "stale");
        return uint256(answer);
    }
} 