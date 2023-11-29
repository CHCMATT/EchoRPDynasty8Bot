let moment = require('moment');
let dsBtn = require('./dsBtn.js');
let dsModal = require('./dsModal.js');
let commissionCmds = require('./commissionCmds.js');
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
					await interaction.reply({ content: `I'm not familiar with this string select value option. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
					console.log(`Error: Unrecognized string select ID: ${interaction.values[0]}`);
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
					await interaction.reply({ content: `I'm not familiar with this string select value option. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
					console.log(`Error: Unrecognized string select ID: ${interaction.values[0]}`);
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
						.setLabel('What is the Property Street Address?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('3456 Cougar Avenue')
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
				} else if (interaction.values[0] == 'repoRequest') {
					let addRepoRequestModal = new ModalBuilder()
						.setCustomId('addRepoRequestModal')
						.setTitle('Request a property repossession');
					let currentOwnerInput = new TextInputBuilder()
						.setCustomId('currentOwnerInput')
						.setLabel('What is the name & CID of the current owner?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName - CID')
						.setRequired(true);
					let lotNumStreetNameInput = new TextInputBuilder()
						.setCustomId('lotNumStreetNameInput')
						.setLabel('What is the property street address?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('4567 Richman Street')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any notes about the repossession request?')
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
					addRepoRequestModal.addComponents(currentOwnerInputRow, lotNumStreetNameInputRow, notesInputRow, photosInputRow);
					await interaction.showModal(addRepoRequestModal);
				} else {
					await interaction.reply({ content: `I'm not familiar with this string select value option. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
					console.log(`Error: Unrecognized string select ID: ${interaction.values[0]}`);
				}
				break;
			case 'swapCommissionRealtorDropdown':
				let channel = await interaction.client.channels.fetch(process.env.PROPERTY_SALES_CHANNEL_ID);
				let messages = await channel.messages.fetch();

				messages.forEach(async (message) => {
					if (message.id == interaction.message.reference.messageId) {
						let originalUserStr = message.embeds[0].data.fields[0].value;
						let originalUser = originalUserStr.substring((originalUserStr.indexOf(' (') + 2), originalUserStr.indexOf(')'));
						let fromUserId = originalUser.replaceAll('<@', '').replaceAll('>', '');
						let toUserId = interaction.values[0];

						let messageContent = interaction.message.content;
						let commissionString = messageContent.substring((messageContent.indexOf(`Who should your commission of \``) + 31), (messageContent.indexOf(`\` from the sale be split with?`)));
						let commissionNumber = Number(commissionString.replaceAll('$', '').replaceAll(',', ''));
						let commissionSplit = Math.round(commissionNumber * 0.50);
						let formattedCommissionSwapped = formatter.format(commissionSplit);

						let origHouseAddr = message.embeds[0].data.fields[2].value;

						let msgTitle = message.embeds[0].data.title;
						let msgTitleSplit = msgTitle.split(" ");
						let saleType = msgTitleSplit[2];

						let reason = `Commission Split for ${saleType} Sale at ${origHouseAddr}`;

						await commissionCmds.removeCommission(interaction.client, `<@${fromUserId}>`, commissionSplit, fromUserId, reason);
						await commissionCmds.addCommission(interaction.client, `<@${fromUserId}>`, commissionSplit, toUserId, reason);

						let prevInteraction = dsBtn.commissionSplitReply;

						if (saleType === "House" || saleType === "Warehouse") {
							message.embeds[0].data.fields[7].value = `${message.embeds[0].data.fields[7].value}\n- Commission split with <@${toUserId}>.`;
						} else if (saleType === "Office") {
							message.embeds[0].data.fields[9] = { name: `Notes:`, value: `- Commission split with <@${toUserId}>.` };
						}
						message.components[0].components[2].data.disabled = true;

						await message.edit({ embeds: message.embeds, components: message.components })

						await prevInteraction.editReply({ content: `Successfully swapped \`${formattedCommissionSwapped}\` of your \`${commissionString}\` commission from sale of \`${origHouseAddr}\` to <@${toUserId}>.`, components: [], ephemeral: true })
					}
				});

				break;
			case 'assistantsPortalDropdown':
				if (interaction.values[0] == 'assistantsPurchaseProperty') {
					let assistantsPurchasePropertyModal = new ModalBuilder()
						.setCustomId('assistantsPurchasePropertyModal')
						.setTitle(`Assistant's Purchase Property Request`);
					let clientInformationInput = new TextInputBuilder()
						.setCustomId('clientInformationInput')
						.setLabel('What is the name & phone # of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName | Phone Number')
						.setRequired(true);
					let paymentMethodInput = new TextInputBuilder()
						.setCustomId('paymentMethodInput')
						.setLabel('How do they plan to pay?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Pay upfront or finance')
						.setRequired(true);
					let shiftAvailableInput = new TextInputBuilder()
						.setCustomId('shiftAvailableInput')
						.setLabel('what shift are they available?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('2nd')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any additional notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Contact method preferred, etc.')
						.setRequired(false);


					let clientInformationInputRow = new ActionRowBuilder().addComponents(clientInformationInput);
					let paymentMethodInputRow = new ActionRowBuilder().addComponents(paymentMethodInput);
					let shiftAvailableInputRow = new ActionRowBuilder().addComponents(shiftAvailableInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);

					assistantsPurchasePropertyModal.addComponents(clientInformationInputRow, paymentMethodInputRow, shiftAvailableInputRow, notesInputRow);

					await interaction.showModal(assistantsPurchasePropertyModal);
				} else if (interaction.values[0] == 'assistantsRequestQuote') {
					let assistantsRequestQuoteModal = new ModalBuilder()
						.setCustomId('assistantsRequestQuoteModal')
						.setTitle(`Assistant's Quote Request`);
					let clientInformationInput = new TextInputBuilder()
						.setCustomId('clientInformationInput')
						.setLabel('What is the name & phone # of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName | Phone Number')
						.setRequired(true);
					let gpsPropertyImagesInput = new TextInputBuilder()
						.setCustomId('gpsPropertyImagesInput')
						.setLabel('GPS and Property Photos')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('https://i.imgur.com/PYrIiB0.jpeg, https://i.imgur.com/8tg4i7P.jpeg')
						.setRequired(true);
					let interiorInput = new TextInputBuilder()
						.setCustomId('interiorInput')
						.setLabel('What is the interior?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Large warehouse, AVPShell1')
						.setRequired(true);
					let zoneShiftInput = new TextInputBuilder()
						.setCustomId('zoneShiftInput')
						.setLabel(`Price Zone and Shift They Are Around`)
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Zone 7, 2nd Shift')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any additional notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Property looks like it can fit 20 cows in it. 2 stories.')
						.setRequired(false);


					let clientInformationInputRow = new ActionRowBuilder().addComponents(clientInformationInput);
					let gpsPropertyImagesInputRow = new ActionRowBuilder().addComponents(gpsPropertyImagesInput);
					let interiorInputRow = new ActionRowBuilder().addComponents(interiorInput);
					let zoneShiftInputRow = new ActionRowBuilder().addComponents(zoneShiftInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);



					assistantsRequestQuoteModal.addComponents(clientInformationInputRow, gpsPropertyImagesInputRow, interiorInputRow, zoneShiftInputRow, notesInputRow);

					await interaction.showModal(assistantsRequestQuoteModal);
				} else if (interaction.values[0] == 'assistantsRequestSmartLock') {
					let assistantsRequestSmartLockModal = new ModalBuilder()
						.setCustomId('assistantsRequestSmartLockModal')
						.setTitle(`Assistant's Smart Lock Request`);
					let clientInformationInput = new TextInputBuilder()
						.setCustomId('clientInformationInput')
						.setLabel('What is the name & phone # of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName | Phone Number')
						.setRequired(true);
					let propertyIDInput = new TextInputBuilder()
						.setCustomId('propertyIDInput')
						.setLabel('What is their property ID?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('123')
						.setRequired(true);
					let bankNumberInput = new TextInputBuilder()
						.setCustomId('bankNumberInput')
						.setLabel('What is their bank account number?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('1234 5678')
						.setRequired(true);
					let shiftAvailableInput = new TextInputBuilder()
						.setCustomId('shiftAvailableInput')
						.setLabel('What shift are they available?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('2nd')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any additional notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Remote or In person')
						.setRequired(false);


					let clientInformationInputRow = new ActionRowBuilder().addComponents(clientInformationInput);
					let propertyIDInputRow = new ActionRowBuilder().addComponents(propertyIDInput);
					let bankNumberInputRow = new ActionRowBuilder().addComponents(bankNumberInput);
					let shiftAvailableInputRow = new ActionRowBuilder().addComponents(shiftAvailableInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);

					assistantsRequestSmartLockModal.addComponents(clientInformationInputRow, propertyIDInputRow, bankNumberInputRow, shiftAvailableInputRow, notesInputRow);

					await interaction.showModal(assistantsRequestSmartLockModal);
				} else if (interaction.values[0] == 'assistantsRequestGarageSlot') {
					let assistantsRequestGarageSlotModal = new ModalBuilder()
						.setCustomId('assistantsRequestGarageSlotModal')
						.setTitle(`Assistant's Garage Slot(s) Request`);
					let clientInformationInput = new TextInputBuilder()
						.setCustomId('clientInformationInput')
						.setLabel('What is the name & phone # of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName | Phone Number')
						.setRequired(true);
					let propertyIDCurrentSlotsInput = new TextInputBuilder()
						.setCustomId('propertyIDCurrentSlotsInput')
						.setLabel('Property ID & current amount of owned slots?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('123 and 2 slots')
						.setRequired(true);
					let bankNumberInput = new TextInputBuilder()
						.setCustomId('bankNumberInput')
						.setLabel('What is their bank account number?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('1234 5678')
						.setRequired(true);
					let amountSlotsWantAddedInput = new TextInputBuilder()
						.setCustomId('amountSlotsWantAddedInput')
						.setLabel('How many slots do they want to add?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('1')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any additional notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Remote or In person, available 2nd shift')
						.setRequired(false);


					let clientInformationInputRow = new ActionRowBuilder().addComponents(clientInformationInput);
					let propertyIDCurrentSlotsInputRow = new ActionRowBuilder().addComponents(propertyIDCurrentSlotsInput);
					let bankNumberInputRow = new ActionRowBuilder().addComponents(bankNumberInput);
					let amountSlotsWantAddedInputRow = new ActionRowBuilder().addComponents(amountSlotsWantAddedInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);

					assistantsRequestGarageSlotModal.addComponents(clientInformationInputRow, propertyIDCurrentSlotsInputRow, bankNumberInputRow, amountSlotsWantAddedInputRow, notesInputRow);

					await interaction.showModal(assistantsRequestGarageSlotModal);
				} else if (interaction.values[0] == 'assistantsOtherRequest') {
					let assistantsOtherRequestModal = new ModalBuilder()
						.setCustomId('assistantsOtherRequestModal')
						.setTitle(`Assistant's Other Request`);
					let clientInformationInput = new TextInputBuilder()
						.setCustomId('clientInformationInput')
						.setLabel('What is the name & phone # of the client?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('FirstName LastName | Phone Number')
						.setRequired(true);
					let inquiryInput = new TextInputBuilder()
						.setCustomId('inquiryInput')
						.setLabel('What do they need help with?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Interior tour, question, etc.')
						.setRequired(true);
					let shiftAvailableInput = new TextInputBuilder()
						.setCustomId('shiftAvailableInput')
						.setLabel('What shift are they available?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('2nd')
						.setRequired(true);
					let notesInput = new TextInputBuilder()
						.setCustomId('notesInput')
						.setLabel('Any additional notes?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Client wants to purchase an office.')
						.setRequired(false);


					let clientInformationInputRow = new ActionRowBuilder().addComponents(clientInformationInput);
					let inquiryInputRow = new ActionRowBuilder().addComponents(inquiryInput);
					let shiftAvailableInputRow = new ActionRowBuilder().addComponents(shiftAvailableInput);
					let notesInputRow = new ActionRowBuilder().addComponents(notesInput);

					assistantsOtherRequestModal.addComponents(clientInformationInputRow, inquiryInputRow, shiftAvailableInputRow, notesInputRow);

					await interaction.showModal(assistantsOtherRequestModal);
				} else {
					await interaction.reply({ content: `I'm not familiar with this string select value option. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
					console.log(`Error: Unrecognized string select ID: ${interaction.values[0]}`);
				}
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this string select type. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized string select ID: ${interaction.customId}`);
		}
	} catch (error) {
		if (process.env.BOT_NAME === 'test') {
			console.error(error);
		} else {
			console.error(error);

			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.log(`Error occured at ${errTime} at file ${fileName}!`);

			let errString = error.toString();

			let gServUnavailIndc;

			if (errString === 'Error: The service is currently unavailable.') {
				gServUnavailIndc = '\`gServUnavailIndc: true\`';
			} else {
				gServUnavailIndc = '\`gServUnavailIndc: false\`';
			}

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ content: gServUnavailIndc, embeds: errorEmbed });
		}
	}
};