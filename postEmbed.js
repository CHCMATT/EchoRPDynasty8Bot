const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const dbCmds = require('./dbCmds.js');
const postEmbed = require('./postEmbed.js');
const editEmbed = require('./editEmbed.js');

const fileParts = __filename.split(/[\\/]/);
const fileName = fileParts[fileParts.length - 1];

module.exports.postEmbed = async (client) => {
	let countHousesSold = await dbCmds.readSummValue("countHousesSold");
	let countWarehousesSold = await dbCmds.readSummValue("countWarehousesSold");
	let countPropertiesQuoted = await dbCmds.readSummValue("countPropertiesQuoted");
	let countPropertiesRepod = await dbCmds.readSummValue("countPropertiesRepod");

	// Color Palette: https://www.schemecolor.com/24-karat-gold-color-palette.php

	countHousesSold = countHousesSold.toString();
	countWarehousesSold = countWarehousesSold.toString();
	countPropertiesQuoted = countPropertiesQuoted.toString();
	countPropertiesRepod = countPropertiesRepod.toString();

	const housesSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Houses Sold:')
		.setDescription(countHousesSold)
		.setColor('#A67C00');

	const warehousesSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Warehouses Sold:')
		.setDescription(countWarehousesSold)
		.setColor('#FFBF00');

	const propertiesQuotedEmbed = new EmbedBuilder()
		.setTitle('Amount of Properties Quoted:')
		.setDescription(countPropertiesQuoted)
		.setColor('#FFD447');

	const propertiesRepodEmbed = new EmbedBuilder()
		.setTitle('Amount of Properties Repossessed:')
		.setDescription(countPropertiesRepod)
		.setColor('#FFE878');

	const btnRows = addBtnRows();

	client.embedMsg = await client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: [housesSoldEmbed, warehousesSoldEmbed, propertiesQuotedEmbed, propertiesRepodEmbed], components: btnRows });

	await dbCmds.setMsgId("embedMsg", client.embedMsg.id);
};

function addBtnRows() {
	const row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addHouseSold')
			.setLabel('Add a House Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addWarehouseSold')
			.setLabel('Add a Warehouse Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addPropQuoted')
			.setLabel('Add a Property Quote')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addPropRepod')
			.setLabel('Add a Property Repo')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addTrainCheck')
			.setLabel('Add a Train Check')
			.setStyle(ButtonStyle.Success)
	);
	const rows = [row1];
	return rows;
};