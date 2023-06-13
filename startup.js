require('discord.js');
let dbCmds = require('./dbCmds.js');
let postEmbed = require('./postEmbed.js');
let editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	let oldEmbed = await dbCmds.readMsgId("embedMsg");

	await dbCmds.resetSummValue("countMonthlyHousesSold");
	await dbCmds.resetSummValue("countMonthlyWarehousesSold");
	await dbCmds.resetSummValue("countMonthlyPropertiesRepod");
	await dbCmds.resetSummValue("countMonthlyPropertiesQuoted");
	await dbCmds.resetSummValue("countMonthlyTrainActivitiesChecked");
	await dbCmds.resetSummValue("countMonthlyMiscSales");
	await dbCmds.resetSummValue("countMonthlyFinancialAgreements");
	await dbCmds.resetSummValue("countMonthlyFinancialPayments");

	try {
		await channel.messages.fetch(oldEmbed);
		await editEmbed.editEmbed(client);
		return "edited";
	}
	catch (error) {
		await postEmbed.postEmbed(client);
		return "posted";
	}
};