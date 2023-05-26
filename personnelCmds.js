require('discord.js');
var dbCmds = require('./dbCmds.js');

module.exports.initPersonnel = async (client, userId) => {
	var guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
	var user = await guild.members.fetch(userId);
	var initCharName = user.nickname;
	await dbCmds.initPersStats(userId, initCharName);
};