const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const group = require("./util/group");
const shuffle = require("./util/shuffle");

const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_TOKEN);

const CHANNEL_ID = process.env.CHANNEL_ID;
const SELF_ID = process.env.SELF_ID;

const app = express();
const port = process.env.PORT || 5000;

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
      channel: CHANNEL_ID,
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
      channel: CHANNEL_ID,
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

const openConversation = async (users) => {
  const openResult = await web.conversations.open({
    users: users.join(","),
  })

  return openResult.channel.id;
}

const sendPairingMessages = async (channel) => {
  const sendMessage = (text) => web.chat.postMessage({ channel, text });
  await sendMessage("Hi! You have been paired at random this week for a virtual coffee! :computer: :coffee:");
  await sendMessage("Feel free to arrange something social that suits you both, as brief or as deep as you like.");
  await sendMessage("Have fun!");
}

app.post("/execute", async (req, res) => {
  try {
    const memberInfo = await web.conversations.members({
      channel: CHANNEL_ID,
    })
    const members = memberInfo.members.filter(user => user != SELF_ID);

    if (members.length === 1) {
      res.send("only one person!");
      return;
    }

    // Pair members!
    console.log("not shuffled: " + members);
    shuffle(members);
    console.log("shuffled: " + members);

    const groups = group(members);

    // Send pairing messages
    await Promise.all(groups.map(async (group) => {
      const channel = await openConversation(group);
      await sendPairingMessages(channel);
    }))

    // Report pairings
    res.send(groups);
  } catch (error) {
    printError(error)
    res.send(error);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
