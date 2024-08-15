const EventSource = require("eventsource");  // npm install eventsource

const url = "https://api.opticodds.com/api/v3/stream/cricket/odds";
const params = {
  key: "2f5a62c8-3bad-4c04-8ffa-78e786909f9a",
  sportsbook: ["DraftKings", "FanDuel", "Hard Rock","1XBet"],
  market: ["Moneyline"],
  league: ["International - Tours"],
};

function connectToStream() {
  // Construct the query string with repeated parameters
  const queryString = new URLSearchParams();
  queryString.append("key", params.key);
  params.sportsbook.forEach((sportsbook) =>
    queryString.append("sportsbook", sportsbook)
  );
  params.market.forEach((market) => queryString.append("market", market));
  params.league.forEach((league) => queryString.append("league", league));

  console.log(`${url}?${queryString.toString()}`);

  const eventSource = new EventSource(`${url}?${queryString.toString()}`);

  eventSource.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);
      console.log("message data:", data);
    } catch (e) {
      console.log("Error parsing message data:", e);
    }
  };

  const oddData=eventSource.addEventListener("odds", function (event) {
    const data = JSON.parse(event.data);
    console.log("odds data:", data);
  });
console.log(oddData)
  eventSource.addEventListener("locked-odds", function (event) {
    const data = JSON.parse(event.data);
    console.log("locked-odds data:", data);
  });

  eventSource.onerror = function (event) {
    console.error("EventSource failed:", event);
    eventSource.close();
    setTimeout(connectToStream, 1000); // Attempt to reconnect after 1 second
  };
}

connectToStream();