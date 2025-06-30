const fs = require("fs");

require("dotenv").config();

const Location = {
    Inline:0,
    Remote:1,
}

const CodeLanguage = {
    JavaScript:0,
}

const ReturnType = {
    uint:"uint256",
    uint256:"uint256",
    int:"int256",
    int256:"int256",
    string:"string",
    bytes:"Buffer",
}

const requestConfig = {
    codeLocation:Location.Inline,
    codeLanguage:CodeLanguage.JavaScript,
    source:fs.readFileSync("./scripts/attention-data-fetcher.js").toString(),
    args:["BTC"],
    secrets:{ TWITTER_BEARER: process.env["TWITTER_BEARER"] || "" },
    perNodeSecrets:[],
    walletPrivateKey:process.env["PRIVATE_KEY"],
    expectedReturnType:ReturnType.uint256,
}

module.exports = requestConfig;