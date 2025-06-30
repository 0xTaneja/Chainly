// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract AttentionOracle is FunctionsClient,ConfirmedOwner,ReentrancyGuard{
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    mapping(string => uint256) public tokenAttentionScores;
    mapping(string => uint256) public lastUpdated;
    mapping(bytes32 => string) private _pendingToken;

    // ───────────────── AUTOMATION SECURITY ─────────────────
    /// @notice Chainlink Automation upkeep contract allowed to trigger new requests
    address public automationContract;
    event AutomationContractSet(address indexed newAddress);

    event AttentionUpdated(string indexed token,uint256 score, uint256 timestamp);

    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0; // Sepolia router
    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000; // Sepolia DON ID
    
    constructor() FunctionsClient(router) ConfirmedOwner(msg.sender){}

    /**
     * @notice Sends an on–chain Functions request to fetch CryptoCompare social followers for `token`.
     * @param token Symbol to query (e.g. "BTC").
     * @param subscriptionId Billing subscription authorised for this contract.
     * @param secretsSlotId DON–hosted secrets slot ID.
     * @param secretsVersion DON–hosted secrets version.
     */
    function requestAttentionData(
        string memory token,
        uint64 subscriptionId,
        uint8 secretsSlotId,
        uint64 secretsVersion
    ) external returns (bytes32 requestId) {
        // Only the pre-authorised Automation contract or the owner wallet may call.
        if (automationContract != address(0)) {
            require(msg.sender == automationContract || msg.sender == owner(), "not authorised");
        }

        FunctionsRequest.Request memory req;

        // Inline JavaScript executed by every DON node — free APIs only
        req.initializeRequestForInlineJavaScript(
            "const token = args[0];\n"
            "const redditMap = { BTC:'Bitcoin', ETH:'ethereum', DOGE:'dogecoin', PEPE:'pepecoin', LINK:'chainlink' };\n"
            "const ghRepo   = { BTC:'bitcoin/bitcoin', ETH:'ethereum/ethereum-org-website', DOGE:'dogecoin/dogecoin', PEPE:'pepe-studio/pepe-core', LINK:'smartcontractkit/chainlink' };\n"
            "\n"
            "// --- 1) Public subreddit about.json ---\n"
            "async function rdSubs(sub){\n"
            "  const url = `https://www.reddit.com/r/${sub}/about.json`;\n"
            "  const r = await Functions.makeHttpRequest({ url, headers:{ 'User-Agent':'cl-functions' } });\n"
            "  return r.error ? 0 : (r.data?.data?.subscribers || 0);\n"
            "}\n"
            "\n"
            "// --- 2) CryptoCompare Reddit metric ---\n"
            "async function ccSubs(sym){\n"
            "  const url = `https://min-api.cryptocompare.com/data/social/coin/latest?fsym=${sym}`;\n"
            "  const r = await Functions.makeHttpRequest({ url, headers:{ 'User-Agent':'cl-functions', 'Authorization': secrets.CC_KEY || '' } });\n"
            "  return r.error ? 0 : (r.data?.Data?.Reddit?.subscribers || 0);\n"
            "}\n"
            "\n"
            "// --- 3) GitHub stargazers ---\n"
            "async function ghStars(repo){\n"
            "  const url = `https://api.github.com/repos/${repo}`;\n"
            "  const r = await Functions.makeHttpRequest({ url, headers:{ 'User-Agent':'cl-functions' } });\n"
            "  return r.error ? 0 : (r.data?.stargazers_count || 0);\n"
            "}\n"
            "\n"
            "async function median(samples){\n"
            "  samples.sort((a,b)=>a-b);\n"
            "  return samples[Math.floor(samples.length/2)];\n"
            "}\n"
            "\n"
            "const subs = [\n"
            "  await rdSubs(redditMap[token]),\n"
            "  await ccSubs(token),\n"
            "  await ghStars(ghRepo[token])\n"
            "];\n"
            "const filtered = subs.filter(x=>x>0);\n"
            "if(filtered.length===0) throw Error('all zero');\n"
            "const med = await median(filtered);\n"
            "return Functions.encodeUint256(med);"
        );
        
        string[] memory args = new string[](1);
        args[0] = token;
        req.setArgs(args);
       
        // Attach DON–hosted secrets reference (slot + version)
        require(secretsVersion > 0, "Secrets version required");
        req.addDONHostedSecrets(secretsSlotId, secretsVersion);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            300000,
            donID
        );
         _pendingToken[s_lastRequestId] = token;

        return s_lastRequestId;
    }

    function fulfillRequest(bytes32 requestId,bytes memory response, bytes memory err) internal override{
               // Verify the request is one we initiated
               string memory token = _pendingToken[requestId];
               require(bytes(token).length != 0, "unknown request");

               s_lastResponse = response;
               s_lastError = err;

               // Only persist if no offchain error was returned
               if (err.length == 0) {
                   uint256 attentionScore = abi.decode(response, (uint256));

                   delete _pendingToken[requestId];

                   tokenAttentionScores[token] = attentionScore;
                   lastUpdated[token] = block.timestamp;

                   emit AttentionUpdated(token, attentionScore, block.timestamp);
               }
    }

    function getAttentionScore(string memory token) external view returns(uint256,uint256){
        return (tokenAttentionScores[token],lastUpdated[token]);
    }

    function isDataFresh(string memory token) external view returns(bool){
        return (block.timestamp - lastUpdated[token])<300;
    }

    /* ───────────────── CCIP BRIDGE HOOK ───────────────── */
    /// @notice Allows the contract owner (e.g., a CCIP receiver) to inject a fresh score that was
    ///         bridged from another chain. Emits the same AttentionUpdated event that fulfillRequest() emits.
    /// @dev    Keeps the same storage layouts & freshness semantics so downstream contracts don't care
    ///         whether the score came from Functions or from a cross-chain bridge.
    function setAttentionScore(string calldata token,uint256 score) external onlyOwner {
        tokenAttentionScores[token] = score;
        lastUpdated[token] = block.timestamp;
        emit AttentionUpdated(token, score, block.timestamp);
    }

    /// @notice Owner sets or updates the Automation upkeep address that is permitted
    ///         to invoke `requestAttentionData`. Setting to the zero address removes
    ///         the restriction (owner only).
    function setAutomationContract(address _automation) external onlyOwner {
        automationContract = _automation;
        emit AutomationContractSet(_automation);
    }

}
