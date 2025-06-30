// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/// @notice Minimal interface to the project's oracle consumer
interface IAttentionOracle {
    function getAttentionScore(string calldata token) external view returns (uint256 score, uint256 timestamp);
    function requestAttentionData(string calldata token, uint64 subId, uint8 slotId, uint64 secretsVersion) external returns (bytes32);
}

/// @title DataRefresher
/// @notice Chainlink Automation contract that calls `requestAttentionData()` on the
///         AttentionOracle whenever the existing data exceeds `maxAge` seconds.
contract DataRefresher is AutomationCompatibleInterface {
    IAttentionOracle public immutable oracle;

    string  public token;          // symbol, e.g. "BTC"
    uint64  public subId;          // Functions subscription ID
    uint8   public slotId;         // DON-hosted secrets slot
    uint64  public secretsVersion; // DON-hosted secrets version
    uint256 public maxAge;         // freshness threshold (seconds)

    event Refreshed(string indexed token, bytes32 requestId);
    event ConfigUpdated(uint256 maxAge);
    event SecretsVersionUpdated(uint64 version);
    event SecretsSlotUpdated(uint8 slotId);

    constructor(
        address _oracle,
        string memory _token,
        uint64 _subId,
        uint8  _slotId,
        uint64 _secretsVersion,
        uint256 _maxAge
    ) {
        require(_oracle != address(0), "oracle 0");
        oracle          = IAttentionOracle(_oracle);
        token           = _token;
        subId           = _subId;
        slotId          = _slotId;
        secretsVersion  = _secretsVersion;
        maxAge          = _maxAge;
    }

    /* ───────────────── AUTOMATION ───────────────── */

    function checkUpkeep(bytes calldata)
        external view override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        (, uint256 ts) = oracle.getAttentionScore(token);
        upkeepNeeded = (block.timestamp - ts) > maxAge;
        performData = ""; // not utilised
    }

    function performUpkeep(bytes calldata) external override {
        (, uint256 ts) = oracle.getAttentionScore(token);
        if (block.timestamp - ts <= maxAge) return; // already fresh

        bytes32 reqId = oracle.requestAttentionData(token, subId, slotId, secretsVersion);
        emit Refreshed(token, reqId);
    }

    /* ───────────────── ADMIN ───────────────── */

    /// @notice Update freshness threshold (ownerless pattern – can be called by anyone
    ///         via governance later; frictionless for hackathon).
    function setMaxAge(uint256 _maxAge) external {
        require(_maxAge > 0 && _maxAge <= 1 days, "bad age");
        maxAge = _maxAge;
        emit ConfigUpdated(_maxAge);
    }

    /// @notice Update the secrets version that will be passed to the oracle.
    ///         Anyone can call (ownerless pattern) – keepers/governance can react
    ///         whenever you re-upload DON secrets and get a new timestamp.
    function setSecretsVersion(uint64 _version) external {
        require(_version > 0, "bad version");
        secretsVersion = _version;
        emit SecretsVersionUpdated(_version);
    }

    /// @notice (Optional) update the secrets slot id if you ever migrate.
    function setSecretsSlot(uint8 _slotId) external {
        slotId = _slotId;
        emit SecretsSlotUpdated(_slotId);
    }
} 