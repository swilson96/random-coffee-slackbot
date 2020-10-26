require('dotenv').config();

const CHANNEL_ID = process.env.CHANNEL_ID;
const SELF_ID = process.env.SELF_ID;
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const PORT = process.env.PORT;

console.log("SLACK_TOKEN: " + SLACK_TOKEN);
console.log("CHANNEL_ID: " + CHANNEL_ID);

module.exports = {
  SLACK_TOKEN,
  CHANNEL_ID,
  SELF_ID,
  PORT,
};
