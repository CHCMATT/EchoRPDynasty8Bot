require('discord.js');
let dbCmds = require('./dbCmds.js');
let postEmbed = require('./postEmbed.js');
let editEmbed = require('./editEmbed.js');

module.exports.mainStartUp = async (client) => {
	let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	let oldMainEmbed = await dbCmds.readMsgId("embedMsg");

	try {
		await channel.messages.fetch(oldMainEmbed);
		await editEmbed.editMainEmbed(client);
		return "edited";
	}
	catch (error) {
		await postEmbed.postMainEmbed(client);
		return "posted";
	}
};

module.exports.frontDeskStartUp = async (client) => {
	let channel = await client.channels.fetch(process.env.FRONT_DESK_CHANNEL_ID);
	let oldFrontDeskEmbed = await dbCmds.readMsgId("frontDeskMsg");

	try {
		await channel.messages.fetch(oldFrontDeskEmbed);
		await editEmbed.editFrontDeskEmbed(client);
		return "edited";
	}
	catch (error) {
		await postEmbed.postFrontDeskEmbed(client);
		return "posted";
	}
};