let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');

module.exports.statsReport = async (client) => {
	let lastRep = await dbCmds.readRepDate("lastRealtorStatsReportDate");
	let now = Math.floor(new Date().getTime() / 1000.0);
	let today = `<t:${now}:d>`;

	let statsArray = await dbCmds.monthlyStatsRep();
	let statsDescList = '';

	for (i = 0; i < statsArray.length; i++) {
		statsDescList = statsDescList.concat(`__${statsArray[i].charName}__:
• **Houses Sold:** ${statsArray[i].monthlyHousesSold}
• **Warehouses Sold:** ${statsArray[i].monthlyWarehousesSold}
• **Properties Quoted:** ${statsArray[i].monthlyPropertiesQuoted}
• **Properties Repossessed:** ${statsArray[i].monthlyPropertiesRepod}
• **Train Activities Checked:** ${statsArray[i].monthlyActivityChecks}
• **Misc. Sales Completed:** ${statsArray[i].monthlyMiscSales}\n\n`);
		await dbCmds.resetMonthlyStats(statsArray[i].discordId);
	}

	await editEmbed.editEmbed(client);

	if (lastRep == null || lastRep.includes("Value not found")) {
		let nowMinus7 = now - 604800;
		let lastRep = `<t:${nowMinus7}:d>`
	}

	if (statsDescList == '') {
		statsDescList = "There is no realtor data to display for this time period."
	}

	let embed = new EmbedBuilder()
		.setTitle(`Monthly Realtor Stats Report for ${lastRep} through ${today}:`)
		.setDescription(statsDescList)
		.setColor('EDC531');
	await client.channels.cache.get(process.env.CEO_COO_OFFICE_CHANNEL_ID).send({ embeds: [embed] });

	// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
	await dbCmds.setRepDate("lastRealtorStatsReportDate", today);

};