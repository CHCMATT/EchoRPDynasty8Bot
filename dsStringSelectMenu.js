let moment = require('moment');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports.stringSelectMenuSubmit = async (interaction) => {
	try {
		let selectStringMenuID = interaction.customId;
		switch (selectStringMenuID) {
			case 'addSaleDropdown':
				if (interaction.values[0] == 'houseSale') {
					let addHouseSoldModal = new ModalBuilder()
						.setCustomId('addHouseSoldModal')
						.setTitle('Log a house that you sold');
					let soldToInput = new TextInputBuilder()
						.setCustomId('soldToInput')
						.setLabel('What is the name and info of the buyer?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID - DOB')
						.setRequired(true);
					let lotNumStreetNameInput = new TextInputBuilder()
						.setCustomId('lotNumStreetNameInput')
						.setLabel('What is the house lot number?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('1234 Baytree Canyon Rd')
						.setRequired(true);
					let priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the final sale price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('150000')
						.setRequired(true);
					let locNotesInput = new TextInputBuilder()
						.setCustomId('locNotesInput')
						.setLabel('What is the phone num & notes about the sale?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('956-252-1929, Provided smart locks')
						.setRequired(true);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of house')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/wgJiq13.jpg, https://i.imgur.com/hv6jVYT.jpg')
						.setRequired(true);

					let soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
					let lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
					let priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					let locNotesInputRow = new ActionRowBuilder().addComponents(locNotesInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addHouseSoldModal.addComponents(soldToInputRow, lotNumStreetNameInputRow, priceInputRow, locNotesInputRow, photosInputRow);

					await interaction.showModal(addHouseSoldModal);
				} else if (interaction.values[0] == 'warehouseSale') {
					let addWarehouseSoldModal = new ModalBuilder()
						.setCustomId('addWarehouseSoldModal')
						.setTitle('Log a warehouse that you sold');
					let soldToInput = new TextInputBuilder()
						.setCustomId('soldToInput')
						.setLabel('What is the name and info of the buyer?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID - DOB')
						.setRequired(true);
					let lotNumStreetNameInput = new TextInputBuilder()
						.setCustomId('lotNumStreetNameInput')
						.setLabel('What is the warehouse lot number?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('2345 Grove St')
						.setRequired(true);
					let priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the final sale price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('250000')
						.setRequired(true);
					let locNotesInput = new TextInputBuilder()
						.setCustomId('locNotesInput')
						.setLabel('What is the phone num & notes about the sale?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('956-252-1929, Remodeled to 5 car garage')
						.setRequired(true);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of warehouse')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/TBj8voN.jpg, https://i.imgur.com/gLGae7c.jpg')
						.setRequired(true);

					let soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
					let lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
					let priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					let locNotesInputRow = new ActionRowBuilder().addComponents(locNotesInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addWarehouseSoldModal.addComponents(soldToInputRow, lotNumStreetNameInputRow, priceInputRow, locNotesInputRow, photosInputRow);

					await interaction.showModal(addWarehouseSoldModal);
				} else if (interaction.values[0] == 'officeSale') {
					let addOfficeSoldModal = new ModalBuilder()
						.setCustomId('addOfficeSoldModal')
						.setTitle('Log an office that you sold');
					let clientNameInput = new TextInputBuilder()
						.setCustomId('clientNameInput')
						.setLabel('What is the name of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName')
						.setRequired(true);
					let clientInfoInput = new TextInputBuilder()
						.setCustomId('clientInfoInput')
						.setLabel('What is the CID, DOB & phone # of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('CID | DOB | phone # ')
						.setRequired(true);
					let lotNumStreetNameInput = new TextInputBuilder()
						.setCustomId('lotNumStreetNameInput')
						.setLabel('What is the lot number and nearest street?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('9498 Algonquin Blvd')
						.setRequired(true);
					let priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the final sale price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('1250000')
						.setRequired(true);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of house')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/MZB6ee6.jpeg, https://i.imgur.com/vTyUomL.png')
						.setRequired(true);

					let clientNameInputRow = new ActionRowBuilder().addComponents(clientNameInput);
					let clientInfoInputRow = new ActionRowBuilder().addComponents(clientInfoInput);
					let lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
					let priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addOfficeSoldModal.addComponents(clientNameInputRow, clientInfoInputRow, lotNumStreetNameInputRow, priceInputRow, photosInputRow);

					await interaction.showModal(addOfficeSoldModal);
				} else if (interaction.values[0] == 'miscSale') {
					let addMiscSaleModal = new ModalBuilder()
						.setCustomId('addMiscSaleModal')
						.setTitle('Add a Miscellaneous Sale');
					let itemsSoldInput = new TextInputBuilder()
						.setCustomId('itemsSoldInput')
						.setLabel('What did you sell?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('3x Garage Slots')
						.setRequired(true);
					let priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the total sale price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('30000')
						.setRequired(true);

					let itemsSoldInputRow = new ActionRowBuilder().addComponents(itemsSoldInput);
					let priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					addMiscSaleModal.addComponents(itemsSoldInputRow, priceInputRow);
					await interaction.showModal(addMiscSaleModal);
				} else {
					await interaction.reply({ content: `I'm not familiar with this string select value. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				}
				break;
			case 'addRemodelDropdown':
				if (interaction.values[0] == 'houseRemodel') {
					let addHouseRemodelModal = new ModalBuilder()
						.setCustomId('addHouseRemodelModal')
						.setTitle('Log a house remodel that you completed');
					let remodelForInput = new TextInputBuilder()
						.setCustomId('remodelForInput')
						.setLabel('What is the name and info of the owner?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID - DOB')
						.setRequired(true);
					let newLotNumNotesInput = new TextInputBuilder()
						.setCustomId('newLotNumNotesInput')
						.setLabel('What is the new property id and nearest street?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('6789 Grove St')
						.setRequired(true);
					let oldLotNumInput = new TextInputBuilder()
						.setCustomId('oldLotNumInput')
						.setLabel('What is the old street address, & any notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('5678 Grove St, ph. num, remodeled to HighEndV3')
						.setRequired(true);
					let priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the remodel price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('35000')
						.setRequired(true);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of house')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/qTL6xiG.jpg, https://i.imgur.com/jMYxD9d.jpg')
						.setRequired(true);

					let remodelForInputRow = new ActionRowBuilder().addComponents(remodelForInput);
					let newLotNumNotesInputRow = new ActionRowBuilder().addComponents(newLotNumNotesInput);
					let oldLotNumInputRow = new ActionRowBuilder().addComponents(oldLotNumInput);
					let priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addHouseRemodelModal.addComponents(remodelForInputRow, newLotNumNotesInputRow, oldLotNumInputRow, priceInputRow, photosInputRow);
					await interaction.showModal(addHouseRemodelModal);
					break;
				} else if (interaction.values[0] == 'warehouseRemodel') {
					let addWarehouseRemodelModal = new ModalBuilder()
						.setCustomId('addWarehouseRemodelModal')
						.setTitle('Log a warehouse remodel that you completed');
					let remodelForInput = new TextInputBuilder()
						.setCustomId('remodelForInput')
						.setLabel('What is the name and info of the owner?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID - DOB')
						.setRequired(true);
					let newLotNumNotesInput = new TextInputBuilder()
						.setCustomId('newLotNumNotesInput')
						.setLabel('What is the new property id and nearest street?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('8910 Route 68')
						.setRequired(true);
					let oldLotNumInput = new TextInputBuilder()
						.setCustomId('oldLotNumInput')
						.setLabel('What is the old street address, & any notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('7891 Route 68, ph. num, remodeled to Small WH')
						.setRequired(true);
					let priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the remodel price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('45000')
						.setRequired(true);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of warehouse')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/iKef1iS.jpg, https://i.imgur.com/w1N7n0x.jpg')
						.setRequired(true);

					let remodelForInputRow = new ActionRowBuilder().addComponents(remodelForInput);
					let newLotNumNotesInputRow = new ActionRowBuilder().addComponents(newLotNumNotesInput);
					let oldLotNumInputRow = new ActionRowBuilder().addComponents(oldLotNumInput);
					let priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addWarehouseRemodelModal.addComponents(remodelForInputRow, newLotNumNotesInputRow, oldLotNumInputRow, priceInputRow, photosInputRow);
					await interaction.showModal(addWarehouseRemodelModal);
				} else {
					await interaction.reply({ content: `I'm not familiar with this string select value. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				}
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this string select type. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized string select ID: ${interaction.customId}`);
		}
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
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


