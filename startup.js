const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const dbCmds = require('./dbCmds.js');

const fileParts = __filename.split(/[\\/]/);
const fileName = fileParts[fileParts.length - 1];

module.exports.startUp = async (client) => {
	const now = Math.floor(new Date().getTime() / 1000.0);
	const time = `<t:${now}:t>`;

	let countHousesSold = await dbCmds.readSummValue("countHousesSold");
	let countWarehousesSold = await dbCmds.readSummValue("countWarehousesSold");
	let countPropertiesQuoted = await dbCmds.readSummValue("countPropertiesQuoted");
	let countPropertiesRepod = await dbCmds.readSummValue("countPropertiesRepod");

	countHousesSold = countHousesSold.toString();
	countWarehousesSold = countWarehousesSold.toString();
	countPropertiesQuoted = countPropertiesQuoted.toString();
	countPropertiesRepod = countPropertiesRepod.toString();

	// Color Palette: https://www.schemecolor.com/24-karat-gold-color-palette.php

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

	const btnRow = addBtnRow();

	const oldEmbed = await dbCmds.readMsgId("embedMsg");
	const channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);

	try {
		const oldMsg = await channel.messages.fetch(oldEmbed);
		await oldMsg.delete();
	}
	catch (error) {
		console.log(`[${fileName}] Unable to delete message - message ID ${oldEmbed} not found.`);
	}

	client.embedMsg = await client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: [housesSoldEmbed, warehousesSoldEmbed, propertiesQuotedEmbed, propertiesRepodEmbed], components: btnRow });

	await dbCmds.setMsgId("embedMsg", client.embedMsg.id);

	await client.channels.cache.get(process.env.LOG_CHANNEL_ID).send(`:bangbang: The ${process.env.BOT_NAME} bot started up at ${time}.`)
};

function addBtnRow() {
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