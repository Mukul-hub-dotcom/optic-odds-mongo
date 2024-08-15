const { default: axios } = require("axios");
const express = require("express");
const connectDB = require("./db");
const router = express.Router();
const app = express();
const mongoose = require("mongoose");
const EventSource = require("eventsource"); // npm install eventsource


const db = connectDB();
app.use(express.json());

app.post("/fixtures", (req, res) => {
  try {
    const FixtureSchema = new mongoose.Schema(
      { id: { type: String, required: true } },
      { strict: false }
    );

    const Fixture = mongoose.model("Fixture", FixtureSchema, "fixture");
    for (let i = 1; i <= 108; i++) {
      axios
        .get(
          `https://api.opticodds.com/api/v3/fixtures?sport=soccer&page=${i}&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a`
        )
        .then(async (response) => {
          // Handle the successful response here
          console.log("Data:", response.data.data.length);
          const items = response.data.data;
          const result = await Fixture.insertMany(items);
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error fetching data:", error.message);
        });
    }

    res.status(201).json("result");

    // Respond with the saved items
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save items", error: error.message });
  }
});

app.post("/fixtures/odds", (req, res) => {
  try {
    const FixtureSchema = new mongoose.Schema(
      { id: { type: String, required: true } },
      { strict: false }
    );

    const Fixture = mongoose.model("Fixture", FixtureSchema, "fixtures_odds");
    for (let i = 1; i <= 5; i++) {
      axios
        .get(
          `https://api.opticodds.com/api/v3/fixtures?sport=cricket&page=${i}&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a`
        )
        .then(async (response) => {
          // Handle the successful response here
          for (let j = 0; j < response.data.data.length; j++) {
            console.log(response.data.data[j].id);
            axios
              .get(
                `https://api.opticodds.com/api/v3/fixtures/odds?sportsbook=1XBet&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a&fixture_id=${response.data.data[j].id}`
              )
              .then(async (res) => {
                // Handle the successful response here
                // console.log("Data:", res.data.data.length);
                const items = res.data.data;
                console.log(items[0]?.league.name);
return
                let arr=[]
                arr.push(items[0]?.league.name)
                const url =
                  "https://api.opticodds.com/api/v3/stream/cricket/odds";
                const params = {
                  key: "2f5a62c8-3bad-4c04-8ffa-78e786909f9a",
                  sportsbook: ["DraftKings", "FanDuel", "Hard Rock", "1XBet"],
                  market: ["Moneyline"],
                  league: arr,
                };

                function connectToStream() {
                  // Construct the query string with repeated parameters
                  const queryString = new URLSearchParams();
                  queryString.append("key", params.key);
                  params.sportsbook.forEach((sportsbook) =>
                    queryString.append("sportsbook", sportsbook)
                  );
                  params.market.forEach((market) =>
                    queryString.append("market", market)
                  );
                  params.league.forEach((league) =>
                    queryString.append("league", league)
                  );

                  console.log(`${url}?${queryString.toString()}`);

                  const eventSource = new EventSource(
                    `${url}?${queryString.toString()}`
                  );

                  eventSource.onmessage = function (event) {
                    try {
                      const data = JSON.parse(event.data);
                      console.log("message data:", data);
                    } catch (e) {
                      console.log("Error parsing message data:", e);
                    }
                  };

                  const oddData = eventSource.addEventListener(
                    "odds",
                    function (event) {
                      const data = JSON.parse(event.data);
                      console.log("odds data:", data);
                    }
                  );
                  console.log(oddData);
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
                // const result = await Fixture.create(items);cmmnted now
                // const result = await Fixture.insert(items);
              });
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error fetching data:", error.message);
        });
    }

    res.status(201).json("result");

    // Respond with the saved items
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save items", error: error.message });
  }
});
app.post("/player-results", (req, res) => {
  try {
    const FixtureSchema = new mongoose.Schema({}, { strict: false });

    const Fixture = mongoose.model(
      "Fixture",
      FixtureSchema,
      "fixtures_player-results"
    );
    for (let i = 1; i <= 108; i++) {
      axios
        .get(
          `https://api.opticodds.com/api/v3/players?sport=cricket&page=${i}&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a`
        )
        .then(async (response) => {
          // Handle the successful response here
          for (let j = 0; j < response.data.data.length; j++) {
            console.log(response.data.data[j].id);
            axios
              .get(
                `https://api.opticodds.com/api/v3/fixtures/player-results?key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a&fixture_id=${response.data.data[j].id}`
              )
              .then(async (res) => {
                // Handle the successful response here
                console.log("Data:", res.data.data.length);
                const items = res.data.data;
                const result = await Fixture.create(items);
                // const result = await Fixture.insert(items);
              });
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error fetching data:", error.message);
        });
    }

    res.status(201).json("result");

    // Respond with the saved items
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save items", error: error.message });
  }
});
app.post("/fixtures/player-results/last-x", (req, res) => {
  try {
    const FixtureSchema = new mongoose.Schema({}, { strict: false });

    const Fixture = mongoose.model(
      "Fixture",
      FixtureSchema,
      "fixtures_player-results_last-x"
    );
    for (let i = 1; i <= 1820; i++) {
      axios
        .get(
          `https://api.opticodds.com/api/v3/players?sport=soccer&page=${i}&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a`
        )
        .then(async (response) => {
          // Handle the successful response here
          for (let j = 0; j < response.data.data.length; j++) {
            console.log(response.data.data[j].id);
            axios
              .get(
                `https://api.opticodds.com/api/v3/fixtures/player-results/last-x?key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a&player_id=${response.data.data[j].id}`
              )
              .then(async (res) => {
                // Handle the successful response here
                console.log("Data:", res.data.data.length);
                const items = res.data.data;
                const result = await Fixture.create(items);
                // const result = await Fixture.insert(items);
              });
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error fetching data:", error.message);
        });
    }

    res.status(201).json("result");

    // Respond with the saved items
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save items", error: error.message });
  }
});
app.post("/fixture/active", async (req, res) => {
  try {
    const FixtureSchema = new mongoose.Schema(
      { id: { type: String, required: true } },
      { strict: false }
    );

    const Fixture = mongoose.model("Fixture", FixtureSchema, "fixture_active");
    for (let i = 1; i <= 8; i++) {
      axios
        .get(
          `https://api.opticodds.com/api/v3/fixtures/active?sport=soccer&page=${i}&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a`
        )
        .then(async (response) => {
          // Handle the successful response here
          console.log("Data:", response.data.data.length);
          const items = response.data.data;
          const result = await Fixture.insertMany(items);
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error fetching data:", error.message);
        });
    }

    res.status(201).json("result");

    // Respond with the saved items
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save items", error: error.message });
  }
});

app.post("/players", (req, res) => {
  try {
    const FixtureSchema = new mongoose.Schema(
      { id: { type: String, required: true } },
      { strict: false }
    );

    const Fixture = mongoose.model("Fixture", FixtureSchema, "players");
    for (let i = 1; i <= 1822; i++) {
      axios
        .get(
          `https://api.opticodds.com/api/v3/fixtures?sport=soccer&page=${i}&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a`
        )
        .then(async (response) => {
          // Handle the successful response here
          console.log("Data:", response.data.data.length);
          const items = response.data.data;
          const result = await Fixture.insertMany(items);
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error fetching data:", error.message);
        });
    }

    res.status(201).json("result");

    // Respond with the saved items
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save items", error: error.message });
  }
});

app.post("/teams", (req, res) => {
  try {
    const FixtureSchema = new mongoose.Schema(
      { id: { type: String, required: true } },
      { strict: false }
    );

    const Fixture = mongoose.model("Fixture", FixtureSchema, "teams");
    for (let i = 1; i <= 105; i++) {
      axios
        .get(
          `https://api.opticodds.com/api/v3/teams?sport=soccer&page=${i}&key=2f5a62c8-3bad-4c04-8ffa-78e786909f9a`
        )
        .then(async (response) => {
          // Handle the successful response here
          console.log("Data:", response.data.data.length);
          const items = response.data.data;
          const result = await Fixture.insertMany(items);
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error fetching data:", error.message);
        });
    }

    res.status(201).json("result");

    // Respond with the saved items
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save items", error: error.message });
  }
});

const PORT = 3081;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
