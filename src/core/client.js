const config = require('./config');
const { WebClient } = require('@slack/web-api');

const web = new WebClient(config.SLACK_TOKEN);

module.exports = web;
