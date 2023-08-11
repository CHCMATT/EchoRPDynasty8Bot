let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');

module.exports.statsReport = async (client, commandType) => {
	try {
		let lastRep = await dbCmds.readRepDate("lastRealtorStatsReportDate");
		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		console.log(`Running ${commandType} Statistics Report on ${logTime}`);

		let employeeStats = await dbCmds.monthlyRealtorStatsRep();
		let realtorStatsDescList = '';

		for (let i = 0; i < employeeStats.length; i++) {
			if (employeeStats[i].monthlyHousesSold > 0 ||
				employeeStats[i].monthlyWarehousesSold > 0 ||
				employeeStats[i].monthlyPropertiesQuoted > 0 ||
				employeeStats[i].monthlyPropertiesRepod > 0 ||
				employeeStats[i].monthlyActivityChecks > 0 ||
				employeeStats[i].monthlyMiscSales > 0 ||
				employeeStats[i].monthlyFinancialAgreements > 0 ||
				employeeStats[i].monthlyFinancialPayments > 0 ||
				employeeStats[i].monthlyQuotesReviewed > 0) {

				realtorStatsDescList = realtorStatsDescList.concat(`\n\n<@${employeeStats[i].discordId}>`);

				if (employeeStats[i].monthlyHousesSold >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Houses Sold:** ${employeeStats[i].monthlyHousesSold}`);
				}
				if (employeeStats[i].monthlyWarehousesSold >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Warehouses Sold:** ${employeeStats[i].monthlyWarehousesSold}`);
				}
				if (employeeStats[i].monthlyPropertiesQuoted >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Properties Quoted:** ${employeeStats[i].monthlyPropertiesQuoted}`);
				}
				if (employeeStats[i].monthlyPropertiesRepod >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Properties Repossessed:** ${employeeStats[i].monthlyPropertiesRepod}`);
				}
				if (employeeStats[i].monthlyActivityChecks >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Train Activities Checked:** ${employeeStats[i].monthlyActivityChecks}`);
				}
				if (employeeStats[i].monthlyMiscSales >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Misc. Sales Completed:** ${employeeStats[i].monthlyMiscSales}`);
				}
				if (employeeStats[i].monthlyFinancialAgreements >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Financial Agreements Filed:** ${employeeStats[i].monthlyFinancialAgreements}`);
				}
				if (employeeStats[i].monthlyFinancialPayments >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Financial Payments Accepted:** ${employeeStats[i].monthlyFinancialPayments}`);
				}
				if (employeeStats[i].monthlyQuotesReviewed >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Quotes Reviewed:** ${employeeStats[i].monthlyQuotesReviewed}`);
				}
			}
			await dbCmds.resetMonthlyRealtorStats(employeeStats[i].discordId);
		}

		await editEmbed.editMainEmbed(client);

		if (lastRep == null || lastRep.includes("Value not found")) {
			let nowMinus7 = now - 604800;
			lastRep = `<t:${nowMinus7}:d>`
		}

		if (realtorStatsDescList == '') {
			realtorStatsDescList = "There is no realtor data to display for this time period."
		}

		let countMonthlyHousesSold = await dbCmds.readSummValue("countMonthlyHousesSold");
		let countMonthlyWarehousesSold = await dbCmds.readSummValue("countMonthlyWarehousesSold");
		let countMonthlyPropertiesQuoted = await dbCmds.readSummValue("countMonthlyPropertiesQuoted");
		let countMonthlyPropertiesRepod = await dbCmds.readSummValue("countMonthlyPropertiesRepod");
		let countMonthlyTrainActivitiesChecked = await dbCmds.readSummValue("countMonthlyTrainActivitiesChecked");
		let countMonthlyMiscSales = await dbCmds.readSummValue("countMonthlyMiscSales");
		let countMonthlyFinancialAgreements = await dbCmds.readSummValue("countMonthlyFinancialAgreements");
		let countMonthlyFinancialPayments = await dbCmds.readSummValue("countMonthlyFinancialPayments");

		await dbCmds.resetSummValue("countMonthlyHousesSold");
		await dbCmds.resetSummValue("countMonthlyWarehousesSold");
		await dbCmds.resetSummValue("countMonthlyPropertiesQuoted");
		await dbCmds.resetSummValue("countMonthlyPropertiesRepod");
		await dbCmds.resetSummValue("countMonthlyTrainActivitiesChecked");
		await dbCmds.resetSummValue("countMonthlyMiscSales");
		await dbCmds.resetSummValue("countMonthlyFinancialAgreements");
		await dbCmds.resetSummValue("countMonthlyFinancialPayments");

		// theme color palette: https://coolors.co/palette/ffe169-fad643-edc531-dbb42c-c9a227-b69121-a47e1b-926c15-805b10-76520e

		let mainFields = [];

		if (countMonthlyHousesSold >= 1) {
			countMonthlyHousesSold = countMonthlyHousesSold.toString();
			mainFields.push({ name: `Houses Sold: `, value: `${countMonthlyHousesSold}` });
		}
		if (countMonthlyWarehousesSold >= 1) {
			countMonthlyWarehousesSold = countMonthlyWarehousesSold.toString();
			mainFields.push({ name: `Warehouses Sold:`, value: `${countMonthlyWarehousesSold}` });
		}
		if (countMonthlyPropertiesQuoted >= 1) {
			countMonthlyPropertiesQuoted = countMonthlyPropertiesQuoted.toString();
			mainFields.push({ name: `Properties Quoted:`, value: `${countMonthlyPropertiesQuoted}` });
		}
		if (countMonthlyPropertiesRepod >= 1) {
			countMonthlyPropertiesRepod = countMonthlyPropertiesRepod.toString();
			mainFields.push({ name: `Properties Repossessed:`, value: `${countMonthlyPropertiesRepod}` });
		}
		if (countMonthlyTrainActivitiesChecked >= 1) {
			countMonthlyTrainActivitiesChecked = countMonthlyTrainActivitiesChecked.toString();
			mainFields.push({ name: `Train Activities Checked:`, value: `${countMonthlyTrainActivitiesChecked}` });
		}
		if (countMonthlyMiscSales >= 1) {
			countMonthlyMiscSales = countMonthlyMiscSales.toString();
			mainFields.push({ name: `Misc. Sales Completed:`, value: `${countMonthlyMiscSales}` });
		}
		if (countMonthlyFinancialAgreements >= 1) {
			countMonthlyFinancialAgreements = countMonthlyFinancialAgreements.toString();
			mainFields.push({ name: `Financial Agreements Filed:`, value: `${countMonthlyFinancialAgreements}` });
		}
		if (countMonthlyFinancialPayments >= 1) {
			countMonthlyFinancialPayments = countMonthlyFinancialPayments.toString();
			mainFields.push({ name: `Financial Payments Accepted:`, value: `${countMonthlyFinancialPayments} ` });
		}

		let overallStatsEmbed = new EmbedBuilder()
			.setTitle(`Monthly Dynasty 8 Stats Report for ${lastRep} through ${today}:`)
			.addFields(mainFields)
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
			console.error(error);

			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.log(`Error occured at ${errTime} at file ${fileName}!`);

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};