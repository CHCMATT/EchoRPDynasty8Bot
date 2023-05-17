var dbCmds = require('./dbCmds.js');
var { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editEmbed = async (client) => {
	var employeeStats = await dbCmds.currStats();
	var embeds = [];

	for (var i = 0; i < employeeStats.length; i++) {
		var charName = employeeStats[i].charName;
		var embedColor = employeeStats[i].embedColor;
		var housesSold = employeeStats[i].housesSold;
		var warehousesSold = employeeStats[i].warehousesSold;
		var propertiesQuoted = employeeStats[i].propertiesQuoted;
		var propertiesRepod = employeeStats[i].propertiesRepod;
		var activityChecks = employeeStats[i].activityChecks;
		var miscSales = employeeStats[i].miscSales;
		var monthlyHousesSold = employeeStats[i].monthlyHousesSold;
		var monthlyWarehousesSold = employeeStats[i].monthlyWarehousesSold;
		var monthlyPropertiesQuoted = employeeStats[i].monthlyPropertiesQuoted;
		var monthlyPropertiesRepod = employeeStats[i].monthlyPropertiesRepod;
		var monthlyActivityChecks = employeeStats[i].monthlyActivityChecks;
		var monthlyMiscSales = employeeStats[i].monthlyMiscSales;

		var currEmbed = new EmbedBuilder().setTitle(`Dynasty 8 statistics for ${charName}:`).setColor(embedColor).setDescription(`__Overall__
		• **Houses Sold:** ${housesSold}
		• **Warehouses Sold:** ${warehousesSold}
		• **Properties Quoted:** ${propertiesQuoted}
		• **Properties Repossessed:** ${propertiesRepod}
		• **Train Activities Checked:** ${activityChecks}
		• **Misc. Sales Completed:** ${miscSales}
		
		__Monthly__
		• **Houses Sold:** ${monthlyHousesSold}
		• **Warehouses Sold:** ${monthlyWarehousesSold}
		• **Properties Quoted:** ${monthlyPropertiesQuoted}
		• **Properties Repossessed:** ${monthlyPropertiesRepod}
		• **Train Activities Checked:** ${monthlyActivityChecks}
		• **Misc. Sales Completed:** ${monthlyMiscSales}`);

		embeds = embeds.concat(currEmbed);
	}

	var currEmbed = await dbCmds.readMsgId("statsMsg");

	var channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
	var currMsg = await channel.messages.fetch(currEmbed);

	currMsg.edit({ embeds: embeds });


	let countHousesSold = await dbCmds.readSummValue("countHousesSold");
	let countWarehousesSold = await dbCmds.readSummValue("countWarehousesSold");
	let countPropertiesQuoted = await dbCmds.readSummValue("countPropertiesQuoted");
	let countPropertiesRepod = await dbCmds.readSummValue("countPropertiesRepod");
	let countTrainActivitiesChecked = await dbCmds.readSummValue("countTrainActivitiesChecked");
	let countMiscSales = await dbCmds.readSummValue("countMiscSales");

	// theme color palette: https://coolors.co/palette/ffe169-fad643-edc531-dbb42c-c9a227-b69121-a47e1b-926c15-805b10-76520e

	countHousesSold = countHousesSold.toString();
	countWarehousesSold = countWarehousesSold.toString();
	countPropertiesQuoted = countPropertiesQuoted.toString();
	countPropertiesRepod = countPropertiesRepod.toString();
	countTrainActivitiesChecked = countTrainActivitiesChecked.toString();
	countMiscSales = countMiscSales.toString();

	var housesSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Houses Sold:')
		.setDescription(countHousesSold)
		.setColor('#805B10');

	var warehousesSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Warehouses Sold:')
		.setDescription(countWarehousesSold)
		.setColor('#926C15');

	var propertiesQuotedEmbed = new EmbedBuilder()
		.setTitle('Amount of Properties Quoted:')
		.setDescription(countPropertiesQuoted)
		.setColor('#A47E1B');

	var propertiesRepodEmbed = new EmbedBuilder()
		.setTitle('Amount of Properties Repossessed:')
		.setDescription(countPropertiesRepod)
		.setColor('#B69121');

	var trainActivitiesCheckedEmbed = new EmbedBuilder()
		.setTitle('Amount of Train Activities Checked:')
		.setDescription(countTrainActivitiesChecked)
		.setColor('#C9A227');

	var miscSalesEmbed = new EmbedBuilder()
		.setTitle('Amount of Miscellaneous Sales Completed:')
		.setDescription(countMiscSales)
		.setColor('#C9A227');

	var currEmbed = await dbCmds.readMsgId("embedMsg");

	var channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
	var currMsg = await channel.messages.fetch(currEmbed);

	var btnRows = addBtnRows();

	currMsg.edit({ embeds: [housesSoldEmbed, warehousesSoldEmbed, propertiesQuotedEmbed, propertiesRepodEmbed, trainActivitiesCheckedEmbed, miscSalesEmbed], components: btnRows });
};

function addBtnRows() {
	var row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addHouseSold')
			.setLabel('Add a House Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addWarehouseSold')
			.setLabel('Add a Warehouse Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addMiscSale')
			.setLabel('Add a Misc. Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addHouseRemodel')
			.setLabel('Add a House Remodel')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addWarehouseRemodel')
			.setLabel('Add a Warehouse Remodel')
			.setStyle(ButtonStyle.Success),
	);

	var row2 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addPropQuoted')
			.setLabel('Add a Property Quote')
			.setStyle(ButtonStyle.Primary),

		new ButtonBuilder()
			.setCustomId('addPropRepod')
			.setLabel('Add a Property Repo')
			.setStyle(ButtonStyle.Primary),

		new ButtonBuilder()
			.setCustomId('addTrainCheck')
			.setLabel('Add a Train Check')
			.setStyle(ButtonStyle.Primary),
	);

	var row3 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addFinancingAgreement')
			.setLabel('Add a Financing Agreement')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('addFinancingPayment')
			.setLabel('Add a Financing Payment')
			.setStyle(ButtonStyle.Secondary),
	);

	var rows = [row1, row2, row3];
	return rows;
};