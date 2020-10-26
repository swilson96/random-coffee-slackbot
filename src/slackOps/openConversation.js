const web = require("../core/client");

module.exports = async (users) => {
  const openResult = await web.conversations.open({
    users: users.join(","),
  })

  return openResult.channel.id;
}
