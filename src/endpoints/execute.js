const web = require("../core/client");
const config = require("../core/config");

const sendPairingMessages = require("../slackOps/sendPairingMessage");
const openConversation = require("../slackOps/openConversation");

const group = require("../util/group");
const shuffle = require("../util/shuffle");

const execute = async () => {
  const memberInfo = await web.conversations.members({
    channel: config.CHANNEL_ID,
  })
  const memberIDs = memberInfo.members.filter(user => user != config.SELF_ID);

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
    // Member names here, or extract to a constant field
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

  return groups;
};

module.exports = execute;
