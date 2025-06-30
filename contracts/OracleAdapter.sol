// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OracleAdapter
 * @dev Thin helper that forwards attention-score queries to a base oracle and
 *      guarantees freshness. Keeping this as a standalone contract lets us
 *      swap multi-source median logic later without touching the core futures
 *      contract.
 */
interface IAttentionOracle {
    function getAttentionScore(string calldata token) external view returns (uint256 score, uint256 timestamp);
    function isDataFresh(string calldata token) external view returns (bool);
}

contract OracleAdapter {
    IAttentionOracle public immutable oracle;

    error StaleData();

    constructor(address _oracle) {
        oracle = IAttentionOracle(_oracle);
    }

    /// @notice Returns the latest score, reverting if the data is stale.
    function getScoreFresh(string calldata token) external view returns (uint256) {
        if (!oracle.isDataFresh(token)) revert StaleData();
        (uint256 score, ) = oracle.getAttentionScore(token);
        return score;
    }

    /// @notice Returns the raw score and timestamp without freshness guarantee.
    function getScoreUnsafe(string calldata token) external view returns (uint256 score, uint256 timestamp) {
        return oracle.getAttentionScore(token);
    }
} 