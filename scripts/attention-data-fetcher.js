// This JavaScript runs on Chainlink Functions nodes
// It fetches real-time Twitter mention count for the supplied token.

const token = args[0]; // e.g. "BTC"
const bearer = secrets.TWITTER_BEARER;

if (!bearer) {
  throw Error("TWITTER_BEARER secret missing");
}

try {
  const resp = await Functions.makeHttpRequest({
    url: "https://api.twitter.com/2/tweets/search/recent",
    headers: { Authorization: `Bearer ${bearer}` },
    params: { query: token, max_results: 100 }
  });

  if (resp.error) throw Error(`HTTP ${resp.error}`);

  const count = resp.data.meta?.result_count ?? 0;
  return Functions.encodeUint256(count);

} catch (err) {
  throw Error(`Request failed: ${err.message}`);
}