let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');

module.exports.statsReport = async (client) => {
	try {
		let lastRep = await dbCmds.readRepDate("lastRealtorStatsReportDate");
		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		let realtorStatsArray = await dbCmds.monthlyRealtorStatsRep();
		let realtorStatsDescList = '';

		for (i = 0; i < realtorStatsArray.length; i++) {
			let charName = realtorStatsArray[i].charName;
			let monthlyHousesSold = realtorStatsArray[i].monthlyHousesSold;
			let monthlyWarehousesSold = realtorStatsArray[i].monthlyWarehousesSold;
			let monthlyPropertiesQuoted = realtorStatsArray[i].monthlyPropertiesQuoted;
			let monthlyPropertiesRepod = realtorStatsArray[i].monthlyPropertiesRepod;
			let monthlyActivityChecks = realtorStatsArray[i].monthlyActivityChecks;
			let monthlyMiscSales = realtorStatsArray[i].monthlyMiscSales;
			let monthlyFinancialAgreements = realtorStatsArray[i].monthlyFinancialAgreements;
			let monthlyFinancialPayments = realtorStatsArray[i].monthlyFinancialPayments;
			let discordId = realtorStatsArray[i].discordId;

			realtorStatsDescList = realtorStatsDescList.concat(`__${charName}__:
• **Houses Sold:** ${monthlyHousesSold}
• **Warehouses Sold:** ${monthlyWarehousesSold}
• **Properties Quoted:** ${monthlyPropertiesQuoted}
• **Properties Repossessed:** ${monthlyPropertiesRepod}
• **Train Activities Checked:** ${monthlyActivityChecks}
• **Misc. Sales Completed:** ${monthlyMiscSales}
• **Financial Agreements Filed:** ${monthlyFinancialAgreements}
• **Financial Payments Accepted:** ${monthlyFinancialPayments}\n\n`);

			await dbCmds.resetMonthlyRealtorStats(discordId);
		}

		await editEmbed.editEmbed(client);

		if (lastRep == null || lastRep.includes("Value not found")) {
			let nowMinus7 = now - 604800;
			lastRep = `<t:${nowMinus7}:d>`
		}

		if (realtorStatsDescList == '') {
			realtorStatsDescList = "There is no realtor data to display for this time period."
		}

		let countMonthlyHousesSold = await dbCmds.readSummValue("countMonthlyHousesSold");
		let countMonthlyWarehousesSold = await dbCmds.readSummValue("countMonthlyWarehousesSold");
		let countMonthlyPropertiesRepod = await dbCmds.readSummValue("countMonthlyPropertiesRepod");
		let countMonthlyPropertiesQuoted = await dbCmds.readSummValue("countMonthlyPropertiesQuoted");
		let countMonthlyTrainActivitiesChecked = await dbCmds.readSummValue("countMonthlyTrainActivitiesChecked");
		let countMonthlyMiscSales = await dbCmds.readSummValue("countMonthlyMiscSales");
		let countMonthlyFinancialAgreements = await dbCmds.readSummValue("countMonthlyFinancialAgreements");
		let countMonthlyFinancialPayments = await dbCmds.readSummValue("countMonthlyFinancialPayments");

		await dbCmds.resetSummValue("countMonthlyHousesSold");
		await dbCmds.resetSummValue("countMonthlyWarehousesSold");
		await dbCmds.resetSummValue("countMonthlyPropertiesRepod");
		await dbCmds.resetSummValue("countMonthlyPropertiesQuoted");
		await dbCmds.resetSummValue("countMonthlyTrainActivitiesChecked");
		await dbCmds.resetSummValue("countMonthlyMiscSales");
		await dbCmds.resetSummValue("countMonthlyFinancialAgreements");
		await dbCmds.resetSummValue("countMonthlyFinancialPayments");

		let overallStatsEmbed = new EmbedBuilder()
			.setTitle(`Monthly Dynasty 8 Stats Report for ${lastRep} through ${today}:`)
			.setDescription(`• **Houses Sold:** ${countMonthlyHousesSold}
			• **Warehouses Sold:** ${countMonthlyWarehousesSold}
			• **Properties Quoted:** ${countMonthlyPropertiesRepod}
			• **Properties Repossessed:** ${countMonthlyPropertiesQuoted}
			• **Train Activities Checked:** ${countMonthlyTrainActivitiesChecked}
			• **Misc. Sales Completed:** ${countMonthlyMiscSales}
			• **Financial Agreements Filed:** ${countMonthlyFinancialAgreements}
			• **Financial Payments Accepted:** ${countMonthlyFinancialPayments}`)
			.setColor('DBB42C');

		let realtorStatsEmbed = new EmbedBuilder()
			.setTitle(`Monthly Realtor Stats Report for ${lastRep} through ${today}:`)
			.setDescription(realtorStatsDescList)
			.setColor('EDC531');
		await client.channels.cache.get(process.env.CEO_COO_OFFICE_CHANNEL_ID).send({ embeds: [overallStatsEmbed, realtorStatsEmbed] });

		// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
		await dbCmds.setRepDate("lastRealtorStatsReportDate", today);

	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

			console.log(`Error occured at ${errTime} at file ${fileName}!`);
			console.error(error);
		}
	}
};