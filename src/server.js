const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require('dotenv').config();

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
    console.log("SLACK_TOKEN: " + process.env.SLACK_TOKEN);
    console.log("CHANNEL_ID: " + process.env.CHANNEL_ID);
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

const sendPairingMessages = async (channel, isThreesome = false) => {
  const sendMessage = (text) => web.chat.postMessage({ channel, text });
  await sendMessage(`Hi! You have been ${isThreesome ? "trupled" : "paired"} at random this week for a virtual coffee. :computer: :coffee:`);
  await sendMessage(`Feel free to arrange something social that suits you ${isThreesome ? "all" : "both"}, as brief or as deep as you like. Have fun!`);
}

app.post("/execute", async (req, res) => {
  try {
    const memberInfo = await web.conversations.members({
      channel: CHANNEL_ID,
    })
    const memberIDs = memberInfo.members.filter(user => user != SELF_ID);

    if (memberIDs.length === 1) {
      res.send("only one person!");
      return;
    }

    // Decorate with names
    var userInfo = await Promise.all(memberIDs.map(user => web.users.info({ user })));

    const memberName = (userID) => {
      var matches = userInfo.filter(u => u.user && u.user.id == userID);
      if (matches.length < 1) return "unknown";
      return matches[0].user.real_name;
    }

    allMembers = memberIDs.map(m => ({ id: m, name: memberName(m)}));

    // Remove any blacklisted (e.g. furloughed) members
    filteredMembers = allMembers.filter(m => ![
      "Gjokica Zafirovski",
      "Zara Hillary",
    ].includes(m.name));

    // Pair members completely at random!
    shuffle(filteredMembers);
    const groups = group(filteredMembers);

    // Send pairing messages
    await Promise.all(groups.map(async (group) => {
      const channel = await openConversation(group.map(m => m.id));
      console.log(`Sending message to group: ${group.map(m => m.name).join(", ")}, is threesome: ${group.length === 3}`);
      await sendPairingMessages(channel, group.length === 3);
    }))

    // Report pairings
    res.send(groups.map(g => g.map(m => m.name)));
  } catch (error) {
    printError(error)
    res.send(error);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
