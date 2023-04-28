require('discord.js');
var dbCmds = require('./dbCmds.js');
var postEmbed = require('./postEmbed.js');
var editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	var channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	var oldEmbed = await dbCmds.readMsgId("embedMsg");

	try {
		await channel.messages.fetch(oldEmbed);
		editEmbed.editEmbed(client);
		return "edited";
	}
	catch (error) {
		postEmbed.postEmbed(client);
		return "posted";
	}
};