let moment = require('moment');
let dsBtn = require('./dsBtn.js');
let dsModal = require('./dsModal.js');
let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

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
						.setLabel('What is the house Street Address?')
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
						.setLabel('What is the warehouse Street Address?')
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
						.setLabel('What is the street address?')
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
						.setLabel('What is the new property id and nearest st.?')
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
						.setLabel('What is the new property id and nearest st.?')
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
			case 'addPropActionDropdown':
				if (interaction.values[0] == 'propQuote') {
					let addPropertyQuoteModal = new ModalBuilder()
						.setCustomId('addPropertyQuoteModal')
						.setTitle('Request a quote for a property');
					let clientInfoInput = new TextInputBuilder()
						.setCustomId('clientInfoInput')
						.setLabel('What is the name and phone # of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - Phone Number')
						.setRequired(true);
					let priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What is the price you estimate it will be?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('850000')
						.setRequired(true);
					let intTypeInput = new TextInputBuilder()
						.setCustomId('intTypeInput')
						.setLabel('What is the requested interior type?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('HighEndV2')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any notes about the requested quote?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('House with a view on Rich Bitch Avenue, vibes like Malibu')
						.setRequired(false);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of house')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Must have multiple photos of the property incl. several diff. sides. Links must be comma separated')
						.setRequired(true);

					let clientInfoInputRow = new ActionRowBuilder().addComponents(clientInfoInput);
					let priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					let intTypeInputRow = new ActionRowBuilder().addComponents(intTypeInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addPropertyQuoteModal.addComponents(clientInfoInputRow, priceInputRow, intTypeInputRow, notesInputRow, photosInputRow);

					await interaction.showModal(addPropertyQuoteModal);
				} else if (interaction.values[0] == 'propRepo') {
					let addPropertyRepodModal = new ModalBuilder()
						.setCustomId('addPropertyRepodModal')
						.setTitle('Log a property that you repossessed');
					let prevOwnerInput = new TextInputBuilder()
						.setCustomId('prevOwnerInput')
						.setLabel('What is the name and info of the prev. owner?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID - DOB')
						.setRequired(true);
					let lotNumStreetNameInput = new TextInputBuilder()
						.setCustomId('lotNumStreetNameInput')
						.setLabel('What is the property Street Address?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('3456')
						.setRequired(true);
					let repoReasonInput = new TextInputBuilder()
						.setCustomId('repoReasonInput')
						.setLabel('What was the reason for the repossession?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Foreclosure')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any notes about the repossession?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Foreclosure, failure to pay')
						.setRequired(false);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of property')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/tnLaQWD.jpg, https://i.imgur.com/EZ81DMA.jpg')
						.setRequired(true);

					let prevOwnerInputRow = new ActionRowBuilder().addComponents(prevOwnerInput);
					let lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
					let repoReasonInputRow = new ActionRowBuilder().addComponents(repoReasonInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addPropertyRepodModal.addComponents(prevOwnerInputRow, lotNumStreetNameInputRow, repoReasonInputRow, notesInputRow, photosInputRow);

					await interaction.showModal(addPropertyRepodModal);
				} else if (interaction.values[0] == 'houseRemodel') {
					var addHouseRemodelModal = new ModalBuilder()
						.setCustomId('addHouseRemodelModal')
						.setTitle('Log a house remodel that you completed');
					var remodelForInput = new TextInputBuilder()
						.setCustomId('remodelForInput')
						.setLabel('What is the name and info of the owner?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID - DOB')
						.setRequired(true);
					var newLotNumNotesInput = new TextInputBuilder()
						.setCustomId('newLotNumNotesInput')
						.setLabel('What is the street address?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('6789 Grove St')
						.setRequired(true);
					var oldLotNumInput = new TextInputBuilder()
						.setCustomId('oldLotNumInput')
						.setLabel('What is the old street address, & any notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('5678 Grove St, ph. num, remodeled to HighEndV3')
						.setRequired(true);
					var priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the remodel price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('35000')
						.setRequired(true);
					var photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of house')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/qTL6xiG.jpg, https://i.imgur.com/jMYxD9d.jpg')
						.setRequired(true);

					var remodelForInputRow = new ActionRowBuilder().addComponents(remodelForInput);
					var newLotNumNotesInputRow = new ActionRowBuilder().addComponents(newLotNumNotesInput);
					var oldLotNumInputRow = new ActionRowBuilder().addComponents(oldLotNumInput);
					var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addHouseRemodelModal.addComponents(remodelForInputRow, newLotNumNotesInputRow, oldLotNumInputRow, priceInputRow, photosInputRow);
					await interaction.showModal(addHouseRemodelModal);
				} else if (interaction.values[0] == 'warehouseRemodel') {
					var addWarehouseRemodelModal = new ModalBuilder()
						.setCustomId('addWarehouseRemodelModal')
						.setTitle('Log a warehouse remodel that you completed');
					var remodelForInput = new TextInputBuilder()
						.setCustomId('remodelForInput')
						.setLabel('What is the name and info of the owner?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID - DOB')
						.setRequired(true);
					var newLotNumNotesInput = new TextInputBuilder()
						.setCustomId('newLotNumNotesInput')
						.setLabel('What is the street address?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('8910 Route 68')
						.setRequired(true);
					var oldLotNumInput = new TextInputBuilder()
						.setCustomId('oldLotNumInput')
						.setLabel('What is the old street address, & any notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('7891 Route 68, ph. num, remodeled to Small WH')
						.setRequired(true);
					var priceInput = new TextInputBuilder()
						.setCustomId('priceInput')
						.setLabel('What was the remodel price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('45000')
						.setRequired(true);
					var photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include photos of GPS & front of warehouse')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/iKef1iS.jpg, https://i.imgur.com/w1N7n0x.jpg')
						.setRequired(true);

					var remodelForInputRow = new ActionRowBuilder().addComponents(remodelForInput);
					var newLotNumNotesInputRow = new ActionRowBuilder().addComponents(newLotNumNotesInput);
					var oldLotNumInputRow = new ActionRowBuilder().addComponents(oldLotNumInput);
					var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
					var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

					addWarehouseRemodelModal.addComponents(remodelForInputRow, newLotNumNotesInputRow, oldLotNumInputRow, priceInputRow, photosInputRow);
					await interaction.showModal(addWarehouseRemodelModal);
				} else if (interaction.values[0] == 'trainCheck') {
					let addTrainCheckModal = new ModalBuilder()
						.setCustomId('addTrainCheckModal')
						.setTitle('Request a train activity check');
					let currentOwnerInput = new TextInputBuilder()
						.setCustomId('currentOwnerInput')
						.setLabel('What is the name & CID of the current owner?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID')
						.setRequired(true);
					let lotNumStreetNameInput = new TextInputBuilder()
						.setCustomId('lotNumStreetNameInput')
						.setLabel('What is the property Street Address?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('4567')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any notes about the train activity check?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Neighbor stated saw the owner with a moving truck')
						.setRequired(false);
					let photosInput = new TextInputBuilder()
						.setCustomId('photosInput')
						.setLabel('Include 1 photo of GPS & front of house')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/D0IUm1C.jpg, https://i.imgur.com/Qo10LVH.jpg')
						.setRequired(true);

					let currentOwnerInputRow = new ActionRowBuilder().addComponents(currentOwnerInput);
					let lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);
					let photosInputRow = new ActionRowBuilder().addComponents(photosInput);
					addTrainCheckModal.addComponents(currentOwnerInputRow, lotNumStreetNameInputRow, notesInputRow, photosInputRow);
					await interaction.showModal(addTrainCheckModal);
				}
				else {
					await interaction.reply({ content: `I'm not familiar with this string select value. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				}
				break;
			case 'houseSwapCommissionRealtorDropdown':
				if (0 == 0) {
					let fromUserId = interaction.member.id;
					let toUserId = interaction.values[0];

					let messageContent = interaction.message.content;
					let commissionString = messageContent.substring((messageContent.indexOf(`Who should your commission of \``) + 31), (messageContent.indexOf(`\` be swapped to?`)));
					let commissionNumber = Number(commissionString.replaceAll('$', '').replaceAll(',', ''));

					await dbCmds.removeCommission(fromUserId, commissionNumber);
					await dbCmds.addCommission(toUserId, commissionNumber);

					let fromUserCommission = await dbCmds.readCommission(fromUserId);
					let toUserCommission = await dbCmds.readCommission(toUserId);

					let formattedCommission = formatter.format(commissionNumber);
					let formattedFromUserCommission = formatter.format(fromUserCommission);
					let formattedToUserCommission = formatter.format(toUserCommission);

					let reason = `Commission Swap for House Sale`;

					let notificationEmbed1 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> removed \`${formattedCommission}\` from <@${fromUserId}>'s current commission for a new total of \`${formattedFromUserCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('FFA630');

					let notificationEmbed2 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> added \`${formattedCommission}\` to <@${toUserId}>'s current commission for a new total of \`${formattedToUserCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('FFA630');

					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed1] });
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed2] });

					let prevInteraction = dsBtn.commissionSwapInteraction;
					let originalHouseSaleReply = dsModal.originalHouseSaleReply;

					await prevInteraction.editReply({ content: `Successfully swapped your commission of \`${commissionString}\` to <@${toUserId}>.`, components: [], ephemeral: true })

					let disabledSwapCommissionBtn = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('houseSwapSaleCommission')
							.setLabel('Swap Commission')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true)
					)];

					await originalHouseSaleReply.editReply({ content: prevInteraction.message.content, components: disabledSwapCommissionBtn, ephemeral: true });

					let houseSaleMsg = dsModal.houseSaleMsg;
					let houseSaleMsgEmbeds = houseSaleMsg.embeds;

					houseSaleMsgEmbeds[0].data.fields[5].value = `${houseSaleMsgEmbeds[0].data.fields[5].value}\n- Commission swapped to <@${toUserId}>.`

					await houseSaleMsg.edit({ embeds: houseSaleMsgEmbeds })
				}
				break;
			case 'warehouseSwapCommissionRealtorDropdown':
				if (0 == 0) {
					let fromUserId = interaction.member.id;
					let toUserId = interaction.values[0];

					let messageContent = interaction.message.content;
					let commissionString = messageContent.substring((messageContent.indexOf(`Who should your commission of \``) + 31), (messageContent.indexOf(`\` be swapped to?`)));
					let commissionNumber = Number(commissionString.replaceAll('$', '').replaceAll(',', ''));

					await dbCmds.removeCommission(fromUserId, commissionNumber);
					await dbCmds.addCommission(toUserId, commissionNumber);

					let fromUserCommission = await dbCmds.readCommission(fromUserId);
					let toUserCommission = await dbCmds.readCommission(toUserId);

					let formattedCommission = formatter.format(commissionNumber);
					let formattedFromUserCommission = formatter.format(fromUserCommission);
					let formattedToUserCommission = formatter.format(toUserCommission);

					let reason = `Commission Swap for Warehouse Sale`;

					let notificationEmbed1 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> removed \`${formattedCommission}\` from <@${fromUserId}>'s current commission for a new total of \`${formattedFromUserCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('FFA630');

					let notificationEmbed2 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> added \`${formattedCommission}\` to <@${toUserId}>'s current commission for a new total of \`${formattedToUserCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('FFA630');

					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed1] });
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed2] });

					let prevInteraction = dsBtn.commissionSwapInteraction;
					let originalWarehouseSaleReply = dsModal.originalWarehouseSaleReply;

					await prevInteraction.editReply({ content: `Successfully swapped your commission of \`${commissionString}\` to <@${toUserId}>.`, components: [], ephemeral: true })

					let disabledSwapCommissionBtn = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('warehouseSwapSaleCommission')
							.setLabel('Swap Commission')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true)
					)];

					await originalWarehouseSaleReply.editReply({ content: prevInteraction.message.content, components: disabledSwapCommissionBtn, ephemeral: true });

					let warehouseSaleMsg = dsModal.warehouseSaleMsg;
					let warehouseSaleMsgEmbeds = warehouseSaleMsg.embeds;

					warehouseSaleMsgEmbeds[0].data.fields[5].value = `${warehouseSaleMsgEmbeds[0].data.fields[5].value}\n- Commission swapped to <@${toUserId}>.`

					await warehouseSaleMsg.edit({ embeds: warehouseSaleMsgEmbeds })
				}
				break;
			case 'officeSwapCommissionRealtorDropdown':
				if (0 == 0) {
					let fromUserId = interaction.member.id;
					let toUserId = interaction.values[0];

					let messageContent = interaction.message.content;
					let commissionString = messageContent.substring((messageContent.indexOf(`Who should your commission of \``) + 31), (messageContent.indexOf(`\` be swapped to?`)));
					let commissionNumber = Number(commissionString.replaceAll('$', '').replaceAll(',', ''));

					await dbCmds.removeCommission(fromUserId, commissionNumber);
					await dbCmds.addCommission(toUserId, commissionNumber);

					let fromUserCommission = await dbCmds.readCommission(fromUserId);
					let toUserCommission = await dbCmds.readCommission(toUserId);

					let formattedCommission = formatter.format(commissionNumber);
					let formattedFromUserCommission = formatter.format(fromUserCommission);
					let formattedToUserCommission = formatter.format(toUserCommission);

					let reason = `Commission Swap for Office Sale`;

					let notificationEmbed1 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> removed \`${formattedCommission}\` from <@${fromUserId}>'s current commission for a new total of \`${formattedFromUserCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('FFA630');

					let notificationEmbed2 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> added \`${formattedCommission}\` to <@${toUserId}>'s current commission for a new total of \`${formattedToUserCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('FFA630');

					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed1] });
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed2] });

					let prevInteraction = dsBtn.commissionSwapInteraction;
					let originalOfficeSaleReply = dsModal.originalOfficeSaleReply;
					console.log(originalOfficeSaleReply);

					await prevInteraction.editReply({ content: `Successfully swapped your commission of \`${commissionString}\` to <@${toUserId}>.`, components: [], ephemeral: true })

					let disabledSwapCommissionBtn = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('officeSwapSaleCommission')
							.setLabel('Swap Commission')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true)
					)];

					await originalOfficeSaleReply.editReply({ content: prevInteraction.message.content, components: disabledSwapCommissionBtn, ephemeral: true });

					let officeSaleMsg = dsModal.officeSaleMsg;
					let officeSaleMsgEmbeds = officeSaleMsg.embeds;

					officeSaleMsgEmbeds[0].data.fields[5].value = `${officeSaleMsgEmbeds[0].data.fields[5].value}\n- Commission swapped to <@${toUserId}>.`

					await officeSaleMsg.edit({ embeds: officeSaleMsgEmbeds })
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


