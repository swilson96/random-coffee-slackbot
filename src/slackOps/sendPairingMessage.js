const web = require("../core/client");

module.exports = async (channel, isThreesome = false) => {
  const sendMessage = (text) => web.chat.postMessage({ channel, text });
  await sendMessage(`Hi! You have been ${isThreesome ? "trupled" : "paired"} at random this week for a virtual coffee. :computer: :coffee:`);
  await sendMessage(`Feel free to arrange something social that suits you ${isThreesome ? "all" : "both"}, as brief or as deep as you like. Have fun!`);
}
