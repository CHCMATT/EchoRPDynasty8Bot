let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editEmbed = async (client) => {
	let employeeStats = await dbCmds.currStats();
	let overallDescList = '';

	let now = Math.floor(new Date().getTime() / 1000.0);
	let today = `<t:${now}:d>`;

	for (let i = 0; i < employeeStats.length; i++) {
		if (employeeStats[i].housesSold > 0 ||
			employeeStats[i].warehousesSold > 0 ||
			employeeStats[i].propertiesQuoted > 0 ||
			employeeStats[i].propertiesRepod > 0 ||
			employeeStats[i].activityChecks > 0 ||
			employeeStats[i].miscSales > 0 ||
			employeeStats[i].financialAgreements > 0 ||
			employeeStats[i].financialPayments > 0) {

			overallDescList = overallDescList.concat(`\n\n<@${employeeStats[i].discordId}>`);

			if (employeeStats[i].housesSold >= 1) {
				overallDescList = overallDescList.concat(`\n• **Houses Sold:** ${employeeStats[i].housesSold}`);
			}
			if (employeeStats[i].warehousesSold >= 1) {
				overallDescList = overallDescList.concat(`\n• **Warehouses Sold:** ${employeeStats[i].warehousesSold}`);
			}
			if (employeeStats[i].propertiesQuoted >= 1) {
				overallDescList = overallDescList.concat(`\n• **Properties Quoted:** ${employeeStats[i].propertiesQuoted}`);
			}
			if (employeeStats[i].propertiesRepod >= 1) {
				overallDescList = overallDescList.concat(`\n• **Properties Repossessed:** ${employeeStats[i].propertiesRepod}`);
			}
			if (employeeStats[i].activityChecks >= 1) {
				overallDescList = overallDescList.concat(`\n• **Train Activities Checked:** ${employeeStats[i].activityChecks}`);
			}
			if (employeeStats[i].miscSales >= 1) {
				overallDescList = overallDescList.concat(`\n• **Misc. Sales Completed:** ${employeeStats[i].miscSales}`);
			}
			if (employeeStats[i].financialAgreements >= 1) {
				overallDescList = overallDescList.concat(`\n• **Financial Agreements Filed:** ${employeeStats[i].financialAgreements}`);
			}
			if (employeeStats[i].financialPayments >= 1) {
				overallDescList = overallDescList.concat(`\n• **Financial Payments Accepted:** ${employeeStats[i].financialPayments}`);
			}
		}
	}

	if (overallDescList == '') {
		overallDescList = "There is no realtor data to display yet."
	}

	let overallStatsEmbed = new EmbedBuilder()
		.setTitle(`Overall Realtor Statistics as of ${today}:`)
		.setDescription(overallDescList)
		.setColor('A47E1B');

	let monthlyDescList = '';

	for (let i = 0; i < employeeStats.length; i++) {
		if (employeeStats[i].monthlyHousesSold > 0 ||
			employeeStats[i].monthlyWarehousesSold > 0 ||
			employeeStats[i].monthlyPropertiesQuoted > 0 ||
			employeeStats[i].monthlyPropertiesRepod > 0 ||
			employeeStats[i].monthlyActivityChecks > 0 ||
			employeeStats[i].monthlyMiscSales > 0 ||
			employeeStats[i].monthlyFinancialAgreements > 0 ||
			employeeStats[i].monthlyFinancialPayments > 0) {

			monthlyDescList = monthlyDescList.concat(`\n\n<@${employeeStats[i].discordId}>`);

			if (employeeStats[i].monthlyHousesSold >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Houses Sold:** ${employeeStats[i].monthlyHousesSold}`);
			}
			if (employeeStats[i].monthlyWarehousesSold >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Warehouses Sold:** ${employeeStats[i].monthlyWarehousesSold}`);
			}
			if (employeeStats[i].monthlyPropertiesQuoted >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Properties Quoted:** ${employeeStats[i].monthlyPropertiesQuoted}`);
			}
			if (employeeStats[i].monthlyPropertiesRepod >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Properties Repossessed:** ${employeeStats[i].monthlyPropertiesRepod}`);
			}
			if (employeeStats[i].monthlyActivityChecks >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Train Activities Checked:** ${employeeStats[i].monthlyActivityChecks}`);
			}
			if (employeeStats[i].monthlyMiscSales >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Misc. Sales Completed:** ${employeeStats[i].monthlyMiscSales}`);
			}
			if (employeeStats[i].monthlyFinancialAgreements >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Financial Agreements Filed:** ${employeeStats[i].monthlyFinancialAgreements}`);
			}
			if (employeeStats[i].monthlyFinancialPayments >= 1) {
				monthlyDescList = monthlyDescList.concat(`\n• **Financial Payments Accepted:** ${employeeStats[i].monthlyFinancialPayments}`);
			}
		}
	}

	if (monthlyDescList == '') {
		monthlyDescList = "There is no realtor data to display yet."
	}

	let monthlyStatsEmbed = new EmbedBuilder()
		.setTitle(`Monthly Realtor Statistics as of ${today}:`)
		.setDescription(monthlyDescList)
		.setColor('926C15');

	let embedChannel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)

	let statsMsgId = await dbCmds.readMsgId("statsMsg");

	let statsMsg = await embedChannel.messages.fetch(statsMsgId);

	statsMsg.edit({ embeds: [overallStatsEmbed, monthlyStatsEmbed] });


	let countHousesSold = await dbCmds.readSummValue("countHousesSold");
	let countWarehousesSold = await dbCmds.readSummValue("countWarehousesSold");
	let countPropertiesQuoted = await dbCmds.readSummValue("countPropertiesQuoted");
	let countPropertiesRepod = await dbCmds.readSummValue("countPropertiesRepod");
	let countTrainActivitiesChecked = await dbCmds.readSummValue("countTrainActivitiesChecked");
	let countMiscSales = await dbCmds.readSummValue("countMiscSales");
	let countFinancialAgreements = await dbCmds.readSummValue("countFinancialAgreements");
	let activeFinancialAgreements = await dbCmds.readSummValue("activeFinancialAgreements");
	let countFinancialPayments = await dbCmds.readSummValue("countFinancialPayments");

	// theme color palette: https://coolors.co/palette/ffe169-fad643-edc531-dbb42c-c9a227-b69121-a47e1b-926c15-805b10-76520e

	countHousesSold = countHousesSold.toString();
	countWarehousesSold = countWarehousesSold.toString();
	countPropertiesQuoted = countPropertiesQuoted.toString();
	countPropertiesRepod = countPropertiesRepod.toString();
	countTrainActivitiesChecked = countTrainActivitiesChecked.toString();
	countMiscSales = countMiscSales.toString();
	countFinancialAgreements = countFinancialAgreements.toString();
	activeFinancialAgreements = activeFinancialAgreements.toString();
	countFinancialPayments = countFinancialPayments.toString();

	let mainEmbed = new EmbedBuilder()
		.setTitle(`Dynasty 8 Overall Statistics as of ${today}:`)
		.addFields(
			{ name: `Houses Sold:`, value: `${countHousesSold}` },
			{ name: `Warehouses Sold:`, value: `${countWarehousesSold}` },
			{ name: `Properties Quoted:`, value: `${countPropertiesQuoted}` },
			{ name: `Properties Repossessed:`, value: `${countPropertiesRepod}` },
			{ name: `Train Activities Checked:`, value: `${countTrainActivitiesChecked}` },
			{ name: `Misc. Sales Completed:`, value: `${countMiscSales}` },
			{ name: `Financial Agreements Filed:`, value: `${countFinancialAgreements} (${activeFinancialAgreements} active)` },
			{ name: `Financial Payments Accepted:`, value: `${countFinancialPayments}` }
		)
		.setColor('926C15');

	let currEmbed = await dbCmds.readMsgId("embedMsg");

	let embedChannel2 = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
	let currMsg = await embedChannel2.messages.fetch(currEmbed);

	let btnRows = addBtnRows();

	currMsg.edit({
		embeds: [mainEmbed], components: btnRows
	});
};

function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addSale')
			.setLabel('Add a Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addPropAction')
			.setLabel('Add a Property Action')
			.setStyle(ButtonStyle.Primary),

		new ButtonBuilder()
			.setCustomId('addYPAdvert')
			.setLabel('Log a YP Ad')
			.setStyle(ButtonStyle.Secondary),
	);

	let rows = [row1];
	return rows;
};