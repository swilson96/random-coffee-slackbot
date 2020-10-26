const web = require("./core/client");
const config = require("./core/config");
const execute = require("./endpoints/execute");

const sendPairingMessages = require("./slackOps/sendPairingMessage");
const openConversation = require("./slackOps/openConversation");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = config.PORT || 5000;

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const printError = (error) => {
  console.error(error);
  console.error(error.data.response_metadata);
};

app.get("/hello", async (req, res) => {
  try {
    // Use the `chat.postMessage` method to send a message from this app
    await web.chat.postMessage({
      channel: "#simon-experimental-2",
      text: "Hello! Do you like coffee?",
    });
    res.send("done");
  } catch (error) {
    printError(error)
    res.send(error);
  }
});

app.get("/channels", async (req, res) => {
  try {
    const channels = await web.conversations.list();
    res.send(channels);
  } catch (error) {
    printError(error)
    res.send(error);
  }
});

app.get("/participants", async (req, res) => {
  try {
    const channelInfo = await web.conversations.members({
      channel: config.CHANNEL_ID,
    })

    console.log(channelInfo.members);

    var userInfo = await Promise.all(channelInfo.members.map(user => web.users.info({ user })));

    res.send(userInfo);
  } catch (error) {
    printError(error);
    res.send(error);
  }
});

app.get("/info", async (req, res) => {
  try {
    const channelInfo = await web.conversations.info({
      channel: config.CHANNEL_ID,
    })
    res.send(channelInfo);
  } catch (error) {
    printError(error)
    res.send(error);
  }
});

/**
 * Me and the drummer, check it
 */
app.get("/open", async (req, res) => {
  try {
    const channel = await openConversation(["URB82JUH3"]);
    await sendPairingMessages(channel);
    res.send("open!");
  } catch (error) {
    printError(error)
    res.send(error);
  }
});

app.post("/execute", async (req, res) => {
  try {
    const groups = await execute();

    // Report pairings
    res.send(groups.map(g => g.map(m => m.name)));
  } catch (error) {
    printError(error)
    res.send(error);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
