let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let dsModal = require('./dsModal.js');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		var buttonID = interaction.customId;
		switch (buttonID) {
			case 'addHouseSold':
				var addHouseSoldModal = new ModalBuilder()
					.setCustomId('addHouseSoldModal')
					.setTitle('Log a house that you sold');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel('What is the name and info of the buyer?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName - CID - DOB')
					.setRequired(true);
				var lotNumStreetNameInput = new TextInputBuilder()
					.setCustomId('lotNumStreetNameInput')
					.setLabel('What is the house street address?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('1234 Baytree Canyon Rd')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel('What was the final sale price?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('150000')
					.setRequired(true);
				var locNotesInput = new TextInputBuilder()
					.setCustomId('locNotesInput')
					.setLabel('What is the phone num & notes about the sale?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('956-252-1929, Provided smart locks')
					.setRequired(true);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel('Include photos of GPS & front of house')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/wgJiq13.jpg, https://i.imgur.com/hv6jVYT.jpg')
					.setRequired(true);

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var locNotesInputRow = new ActionRowBuilder().addComponents(locNotesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addHouseSoldModal.addComponents(soldToInputRow, lotNumStreetNameInputRow, priceInputRow, locNotesInputRow, photosInputRow);

				await interaction.showModal(addHouseSoldModal);
				break;
			case 'addWarehouseSold':
				var addWarehouseSoldModal = new ModalBuilder()
					.setCustomId('addWarehouseSoldModal')
					.setTitle('Log a warehouse that you sold');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel('What is the name and info of the buyer?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName - CID - DOB')
					.setRequired(true);
				var lotNumStreetNameInput = new TextInputBuilder()
					.setCustomId('lotNumStreetNameInput')
					.setLabel('What is the warehouse street address?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('2345 Grove St')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel('What was the final sale price?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('250000')
					.setRequired(true);
				var locNotesInput = new TextInputBuilder()
					.setCustomId('locNotesInput')
					.setLabel('What is the phone num & notes about the sale?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('956-252-1929, Remodeled to 5 car garage')
					.setRequired(true);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel('Include photos of GPS & front of warehouse')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/TBj8voN.jpg, https://i.imgur.com/gLGae7c.jpg')
					.setRequired(true);

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var locNotesInputRow = new ActionRowBuilder().addComponents(locNotesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addWarehouseSoldModal.addComponents(soldToInputRow, lotNumStreetNameInputRow, priceInputRow, locNotesInputRow, photosInputRow);

				await interaction.showModal(addWarehouseSoldModal);
				break;
			case 'addPropQuoted':
				var addPropertyQuoteModal = new ModalBuilder()
					.setCustomId('addPropertyQuoteModal')
					.setTitle('Request a quote for a property');
				var clientInfoInput = new TextInputBuilder()
					.setCustomId('clientInfoInput')
					.setLabel('What is the name and phone # of the client?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName - Phone Number')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel('What is the price you estimate it will be?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('850000')
					.setRequired(true);
				var intTypeInput = new TextInputBuilder()
					.setCustomId('intTypeInput')
					.setLabel('What is the requested interior type?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('HighEndV2')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel('Any notes about the requested quote?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('House with a view on Rich Bitch Avenue, vibes like Malibu')
					.setRequired(false);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel('Include photos of GPS & front of house')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('Must have multiple photos of the property incl. several diff. sides. Links must be comma separated')
					.setRequired(true);

				var clientInfoInputRow = new ActionRowBuilder().addComponents(clientInfoInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var intTypeInputRow = new ActionRowBuilder().addComponents(intTypeInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addPropertyQuoteModal.addComponents(clientInfoInputRow, priceInputRow, intTypeInputRow, notesInputRow, photosInputRow);

				await interaction.showModal(addPropertyQuoteModal);
				break;
			case 'addPropRepod':
				var addPropertyRepodModal = new ModalBuilder()
					.setCustomId('addPropertyRepodModal')
					.setTitle('Log a property that you repossessed');
				var prevOwnerInput = new TextInputBuilder()
					.setCustomId('prevOwnerInput')
					.setLabel('What is the name and info of the prev. owner?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName - CID - DOB')
					.setRequired(true);
				var lotNumStreetNameInput = new TextInputBuilder()
					.setCustomId('lotNumStreetNameInput')
					.setLabel('What is the property Street Address?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('3456')
					.setRequired(true);
				var repoReasonInput = new TextInputBuilder()
					.setCustomId('repoReasonInput')
					.setLabel('What was the reason for the repossession?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Foreclosure')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel('Any notes about the repossession?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Foreclosure, failure to pay')
					.setRequired(false);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel('Include photos of GPS & front of property')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/tnLaQWD.jpg, https://i.imgur.com/EZ81DMA.jpg')
					.setRequired(true);

				var prevOwnerInputRow = new ActionRowBuilder().addComponents(prevOwnerInput);
				var lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
				var repoReasonInputRow = new ActionRowBuilder().addComponents(repoReasonInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addPropertyRepodModal.addComponents(prevOwnerInputRow, lotNumStreetNameInputRow, repoReasonInputRow, notesInputRow, photosInputRow);

				await interaction.showModal(addPropertyRepodModal);
				break;
			case 'addTrainCheck':
				var addTrainCheckModal = new ModalBuilder()
					.setCustomId('addTrainCheckModal')
					.setTitle('Request a train activity check');
				var currentOwnerInput = new TextInputBuilder()
					.setCustomId('currentOwnerInput')
					.setLabel('What is the name & CID of the current owner?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName - CID')
					.setRequired(true);
				var lotNumStreetNameInput = new TextInputBuilder()
					.setCustomId('lotNumStreetNameInput')
					.setLabel('What is the property Street Address?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('4567')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel('Any notes about the train activity check?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Neighbor stated saw the owner with a moving truck')
					.setRequired(false);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel('Include 1 photo of GPS & front of house')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/D0IUm1C.jpg, https://i.imgur.com/Qo10LVH.jpg')
					.setRequired(true);

				var currentOwnerInputRow = new ActionRowBuilder().addComponents(currentOwnerInput);
				var lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);
				addTrainCheckModal.addComponents(currentOwnerInputRow, lotNumStreetNameInputRow, notesInputRow, photosInputRow);
				await interaction.showModal(addTrainCheckModal);
				break;
			case 'addMiscSale':
				var addMiscSaleModal = new ModalBuilder()
					.setCustomId('addMiscSaleModal')
					.setTitle('Add a Miscellaneous Sale');
				var itemsSoldInput = new TextInputBuilder()
					.setCustomId('itemsSoldInput')
					.setLabel('What did you sell?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('3x Garage Slots')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel('What was the total sale price?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('30000')
					.setRequired(true);

				var itemsSoldInputRow = new ActionRowBuilder().addComponents(itemsSoldInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				addMiscSaleModal.addComponents(itemsSoldInputRow, priceInputRow);
				await interaction.showModal(addMiscSaleModal);
				break;
			case 'addHouseRemodel':
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
				break;
			case 'addWarehouseRemodel':
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
				break;
			case 'addFinancingAgreement':
				var addFinancingAgreementModal = new ModalBuilder()
					.setCustomId('addFinancingAgreementModal')
					.setTitle('Log a financing agreement that you completed');
				var clientNameInput = new TextInputBuilder()
					.setCustomId('clientNameInput')
					.setLabel('What is the name of the client?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName')
					.setRequired(true);
				var clientInfoInput = new TextInputBuilder()
					.setCustomId('clientInfoInput')
					.setLabel('What is the CID and DOB of the client?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('CID | DOB')
					.setRequired(true);
				var clientContactInput = new TextInputBuilder()
					.setCustomId('clientContactInput')
					.setLabel('What is the contact info for the client?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('phone # | email | bank account #')
					.setRequired(true);
				var lotNumStreetNameInput = new TextInputBuilder()
					.setCustomId('lotNumStreetNameInput')
					.setLabel('What is the street address?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('8912 Paleto Blvd')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel('What was the final sale price?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('275000')
					.setRequired(true);

				var clientNameInputRow = new ActionRowBuilder().addComponents(clientNameInput);
				var clientInfoInputRow = new ActionRowBuilder().addComponents(clientInfoInput);
				var clientContactInputRow = new ActionRowBuilder().addComponents(clientContactInput);
				var lotNumStreetNameInputRow = new ActionRowBuilder().addComponents(lotNumStreetNameInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);

				addFinancingAgreementModal.addComponents(clientNameInputRow, clientInfoInputRow, clientContactInputRow, lotNumStreetNameInputRow, priceInputRow);
				await interaction.showModal(addFinancingAgreementModal);
				break;
			case 'addFinancingPayment':
				var addFinancingPaymentModal = new ModalBuilder()
					.setCustomId('addFinancingPaymentModal')
					.setTitle('Log a financing payment that you received');
				var payersNameInput = new TextInputBuilder()
					.setCustomId('payersNameInput')
					.setLabel('What is the name of the person paying?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName')
					.setRequired(true);
				var financingNumInput = new TextInputBuilder()
					.setCustomId('financingNumInput')
					.setLabel('What is the financing agreement number?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('H12345')
				var paymentInput = new TextInputBuilder()
					.setCustomId('paymentInput')
					.setLabel('What is the payment amount?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('120000')
					.setRequired(true);

				var payersNameInputRow = new ActionRowBuilder().addComponents(payersNameInput);
				var financingNumInputRow = new ActionRowBuilder().addComponents(financingNumInput);
				var paymentInputRow = new ActionRowBuilder().addComponents(paymentInput);

				addFinancingPaymentModal.addComponents(payersNameInputRow, financingNumInputRow, paymentInputRow);
				await interaction.showModal(addFinancingPaymentModal);
				break;
			case 'createEvictionNotice':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					await interaction.deferReply({ ephemeral: true });
					var currentMsg = interaction.message;

					var realtorName;
					if (interaction.member.nickname) {
						realtorName = interaction.member.nickname;
					} else {
						realtorName = interaction.member.user.username;
					}

					var msgSaleDate = currentMsg.embeds[0].data.fields[1].value;
					var msgFinanceNum = currentMsg.embeds[0].data.fields[3].value;
					var msgClientName = currentMsg.embeds[0].data.fields[4].value;
					var msgStreetAddress = currentMsg.embeds[0].data.fields[7].value;
					if (currentMsg.embeds[0].data.fields[12]) {
						var msgNotes = currentMsg.embeds[0].data.fields[12].value;
					}

					let newFile = await interaction.client.driveFiles.copy({
						auth: interaction.client.driveAuth, fileId: process.env.EVICTION_TEMPLATE_DOC_ID, resource: { name: `${msgClientName} | Dynasty 8 Notice of Eviction` }
					});

					let todayDate = moment().format('MMMM DD, YYYY');
					let todayDatePlus3 = moment().add(3, 'days').format('MMMM DD, YYYY');

					let financingDateUnix = msgSaleDate.replaceAll('<t:', '').replaceAll(':d>', '');
					let financingDate = moment.unix(financingDateUnix).format('MMMM DD, YYYY');

					await interaction.client.googleDocs.batchUpdate({
						auth: interaction.client.driveAuth, documentId: newFile.data.id, resource: {
							requests: [{
								replaceAllText: {
									replaceText: todayDate,
									containsText: {
										'text': '{today_date}',
										'matchCase': true
									}
								},
							}, {
								replaceAllText: {
									replaceText: msgClientName,
									containsText: {
										'text': '{client_name}',
										'matchCase': true
									}
								},
							}, {
								replaceAllText: {
									replaceText: msgStreetAddress,
									containsText: {
										'text': '{street_address}',
										'matchCase': true
									}
								},
							}, {
								replaceAllText: {
									replaceText: financingDate,
									containsText: {
										'text': '{finance_date}',
										'matchCase': true
									}
								},
							}, {
								replaceAllText: {
									replaceText: todayDatePlus3,
									containsText: {
										'text': '{today_plus3}',
										'matchCase': true
									}
								},
							}, {
								replaceAllText: {
									replaceText: realtorName,
									containsText: {
										'text': '{realtor_name}',
										'matchCase': true
									}
								},
							}]
						}
					});

					let documentLink = `https://docs.google.com/document/d/${newFile.data.id}`;

					var now = Math.floor(new Date().getTime() / 1000.0);
					var evictionSentDate = `<t:${now}:d>`;

					if (currentMsg.embeds[0].data.fields[12]) {
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `${msgNotes}\n- [Eviction Notice](${documentLink}) sent by <@${interaction.user.id}> on ${evictionSentDate}.` };
					} else {
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `- [Eviction Notice](${documentLink}) sent by <@${interaction.user.id}> on ${evictionSentDate}.` };
					}

					let btnRows = addBtnRows();
					await currentMsg.edit({ embeds: [currentMsg.embeds[0]], components: btnRows });

					function addBtnRows() {
						let row1 = new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('markPaymentsComplete')
								.setLabel('Mark as Completed')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),

							new ButtonBuilder()
								.setCustomId('createEvictionNotice')
								.setLabel('Create an Eviction Notice')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true),
						);

						let rows = [row1];
						return rows;
					};

					await interaction.editReply({ content: `Successfully created an Eviction Notice document for \`${msgClientName}\` for the \`${msgFinanceNum}\` Financing Agreement.\nDetails about this eviction:\n> Eviction Notice: [Click to view Eviction Notice](<${documentLink}>)`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'addSale':
				let addSaleSelectOptions = new StringSelectMenuBuilder()
					.setCustomId('addSaleDropdown')
					.setPlaceholder('Select a Sale Type')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('House')
							.setEmoji('🏡')
							.setValue('houseSale'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Warehouse')
							.setEmoji('🏭')
							.setValue('warehouseSale'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Office')
							.setEmoji('🏢')
							.setValue('officeSale'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Miscellaneous')
							.setEmoji('🇲')
							.setValue('miscSale'),
					);

				let addSaleSelectionsComponent = new ActionRowBuilder()
					.addComponents(addSaleSelectOptions);

				await interaction.reply({ content: `What type of **sale** is this?`, components: [addSaleSelectionsComponent], ephemeral: true });
				break;
			case 'addRemodel':
				let addRemodelSelectOptions = new StringSelectMenuBuilder()
					.setCustomId('addRemodelDropdown')
					.setPlaceholder('Select a Remodel Type')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('House')
							.setEmoji('🏡')
							.setValue('houseRemodel'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Warehouse')
							.setEmoji('🏭')
							.setValue('warehouseRemodel'),
					);

				let addRemodelSelectionsComponent = new ActionRowBuilder()
					.addComponents(addRemodelSelectOptions);

				await interaction.reply({ content: `What type of **remodel** is this?`, components: [addRemodelSelectionsComponent], ephemeral: true });
				break;
			case 'addYPAdvert':
				let addYPAdvertModal = new ModalBuilder()
					.setCustomId('addYPAdvertModal')
					.setTitle('Log a Yellow Pages advertisement');
				let screenshotInput = new TextInputBuilder()
					.setCustomId('screenshotInput')
					.setLabel('What is the link to a screenshot of the ad?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://i.imgur.com/wXfNIId.jpeg')
					.setRequired(true);
				let screenshotInputRow = new ActionRowBuilder().addComponents(screenshotInput);
				addYPAdvertModal.addComponents(screenshotInputRow);
				await interaction.showModal(addYPAdvertModal);
				break;
			case 'addPropAction':
				let addPropActionSelectOptions = new StringSelectMenuBuilder()
					.setCustomId('addPropActionDropdown')
					.setPlaceholder('Select a Property Action Type')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('Property Quote')
							.setEmoji('🏡')
							.setValue('propQuote'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Property Repo')
							.setEmoji('📋')
							.setValue('propRepo'),
						new StringSelectMenuOptionBuilder()
							.setLabel('House Remodel')
							.setEmoji('🏘')
							.setValue('houseRemodel'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Warehouse Remodel')
							.setEmoji('🏭')
							.setValue('warehouseRemodel'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Train Check')
							.setEmoji('🚄')
							.setValue('trainCheck'),
					);

				let addPropActionSelectionsComponent = new ActionRowBuilder()
					.addComponents(addPropActionSelectOptions);

				await interaction.reply({ content: `What type of **property action** are you taking?`, components: [addPropActionSelectionsComponent], ephemeral: true });
				break;
			case 'approveQuote':
				if (interaction.member._roles.includes(process.env.SR_REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let approveQuoteModal = new ModalBuilder()
						.setCustomId('approveQuoteModal')
						.setTitle('Approve a submitted quote');
					let approveNotesInput = new TextInputBuilder()
						.setCustomId('approveNotesInput')
						.setLabel('Any notes to submit with this approval?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Max Medium WH')
						.setRequired(false);

					let approveNotesInputRow = new ActionRowBuilder().addComponents(approveNotesInput);

					approveQuoteModal.addComponents(approveNotesInputRow);
					await interaction.showModal(approveQuoteModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Senior Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'adjustQuote':
				if (interaction.member._roles.includes(process.env.SR_REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let adjustQuoteModal = new ModalBuilder()
						.setCustomId('adjustQuoteModal')
						.setTitle('Adjust and approve a submitted quote');
					let adjustPriceInput = new TextInputBuilder()
						.setCustomId('adjustPriceInput')
						.setLabel('What is the adjusted price?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('150000')
						.setRequired(true);
					let adjustNotesInput = new TextInputBuilder()
						.setCustomId('adjustNotesInput')
						.setLabel('Any notes to submit with this adjustment?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Has a nice backyard with a pool')
						.setRequired(false);

					let adjustPriceInputRow = new ActionRowBuilder().addComponents(adjustPriceInput);
					let adjustNotesInputRow = new ActionRowBuilder().addComponents(adjustNotesInput);

					adjustQuoteModal.addComponents(adjustPriceInputRow, adjustNotesInputRow);
					await interaction.showModal(adjustQuoteModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Senior Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyQuote':
				if (interaction.member._roles.includes(process.env.SR_REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let denyQuoteModal = new ModalBuilder()
						.setCustomId('denyQuoteModal')
						.setTitle('Deny a submitted quote');
					let denyNotesInput = new TextInputBuilder()
						.setCustomId('denyNotesInput')
						.setLabel('Any notes to submit with this denial?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Property photos are not sufficient')
						.setRequired(false);

					let denyNotesInputRow = new ActionRowBuilder().addComponents(denyNotesInput);

					denyQuoteModal.addComponents(denyNotesInputRow);
					await interaction.showModal(denyQuoteModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Senior Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'houseSwapSaleCommission':
				if (0 == 0) {
					let allRealtors = await dbCmds.readAllRealtors();

					let allRealtorsArray = allRealtors.map(x => new StringSelectMenuOptionBuilder().setLabel(x.charName).setValue(x.discordId));

					allRealtorsArray = allRealtorsArray.filter(function (realtor) {
						return realtor.data.label !== interaction.member.nickname;
					});

					let realtorSelectionOptions = new StringSelectMenuBuilder()
						.setCustomId('houseSwapCommissionRealtorDropdown')
						.setPlaceholder('Select a Realtor')
						.addOptions(allRealtorsArray);

					let realtorSelectionComponent = new ActionRowBuilder()
						.addComponents(realtorSelectionOptions);

					let messageContent = interaction.message.content;
					let commissionString = messageContent.substring((messageContent.indexOf(`Your Commission:`) + 18), (messageContent.indexOf(`Your commission is now:`) - 3));

					let commissionSwapInteraction = await interaction.reply({ content: `Who should your commission of \`${commissionString}\` be split with?`, components: [realtorSelectionComponent], ephemeral: true });
					exports.commissionSwapInteraction = commissionSwapInteraction.interaction;

				}
				break;
			case 'warehouseSwapSaleCommission':
				if (0 == 0) {
					let allRealtors = await dbCmds.readAllRealtors();

					let allRealtorsArray = allRealtors.map(x => new StringSelectMenuOptionBuilder().setLabel(x.charName).setValue(x.discordId));

					allRealtorsArray = allRealtorsArray.filter(function (realtor) {
						return realtor.data.label !== interaction.member.nickname;
					});

					let realtorSelectionOptions = new StringSelectMenuBuilder()
						.setCustomId('warehouseSwapCommissionRealtorDropdown')
						.setPlaceholder('Select a Realtor')
						.addOptions(allRealtorsArray);

					let realtorSelectionComponent = new ActionRowBuilder()
						.addComponents(realtorSelectionOptions);

					let messageContent = interaction.message.content;
					let commissionString = messageContent.substring((messageContent.indexOf(`Your Commission:`) + 18), (messageContent.indexOf(`Your commission is now:`) - 3));

					let commissionSwapInteraction = await interaction.reply({ content: `Who should your commission of \`${commissionString}\` be split with?`, components: [realtorSelectionComponent], ephemeral: true });
					exports.commissionSwapInteraction = commissionSwapInteraction.interaction;

				}
				break;
			case 'officeSwapSaleCommission':
				if (0 == 0) {
					let allRealtors = await dbCmds.readAllRealtors();

					let allRealtorsArray = allRealtors.map(x => new StringSelectMenuOptionBuilder().setLabel(x.charName).setValue(x.discordId));

					allRealtorsArray = allRealtorsArray.filter(function (realtor) {
						return realtor.data.label !== interaction.member.nickname;
					});

					let realtorSelectionOptions = new StringSelectMenuBuilder()
						.setCustomId('officeSwapCommissionRealtorDropdown')
						.setPlaceholder('Select a Realtor')
						.addOptions(allRealtorsArray);

					let realtorSelectionComponent = new ActionRowBuilder()
						.addComponents(realtorSelectionOptions);

					let messageContent = interaction.message.content;
					let commissionString = messageContent.substring((messageContent.indexOf(`Your Commission:`) + 18), (messageContent.indexOf(`Limited Property Contract:`) - 4));

					let commissionSwapInteraction = await interaction.reply({ content: `Who should your commission of \`${commissionString}\` be split with?`, components: [realtorSelectionComponent], ephemeral: true });
					exports.commissionSwapInteraction = commissionSwapInteraction.interaction;

				}
				break;
			case 'addReimbursementReq':
				var addReimbursementReqModal = new ModalBuilder()
					.setCustomId('addReimbursementReqModal')
					.setTitle('Request Reimbursement');
				var reasonInput = new TextInputBuilder()
					.setCustomId('reasonInput')
					.setLabel('What are you requesting funds for?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Repairs on Omnis')
					.setRequired(true);
				var amountInput = new TextInputBuilder()
					.setCustomId('amountInput')
					.setLabel('What is the amount you are requesting?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('5000')
					.setRequired(true);
				var proofInput = new TextInputBuilder()
					.setCustomId('proofInput')
					.setLabel('What proof do you have?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://i.imgur.com/qtzNB2p.jpeg')
					.setRequired(false);

				var reasonInputRow = new ActionRowBuilder().addComponents(reasonInput);
				var amountInputRow = new ActionRowBuilder().addComponents(amountInput);
				var proofInputRow = new ActionRowBuilder().addComponents(proofInput);
				addReimbursementReqModal.addComponents(reasonInputRow, amountInputRow, proofInputRow);
				await interaction.showModal(addReimbursementReqModal);
				break;
			case 'approveReimbursement':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let approveReimbursementModal = new ModalBuilder()
						.setCustomId('approveReimbursementModal')
						.setTitle('Approve a reimbursment request');
					let approveNotesInput = new TextInputBuilder()
						.setCustomId('approveNotesInput')
						.setLabel('Any notes to submit with this approval?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Thanks for getting the Omnis repaired!')
						.setRequired(false);

					let approveNotesInputRow = new ActionRowBuilder().addComponents(approveNotesInput);

					approveReimbursementModal.addComponents(approveNotesInputRow);
					await interaction.showModal(approveReimbursementModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyReimbursement':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let denyReimbursementModal = new ModalBuilder()
						.setCustomId('denyReimbursementModal')
						.setTitle('Deny a reimbursment request');
					let denyNotesInput = new TextInputBuilder()
						.setCustomId('denyNotesInput')
						.setLabel('Any notes to submit with this denial?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('We aren\'t paying for your coke addiciton')
						.setRequired(false);

					let denyNotesInputRow = new ActionRowBuilder().addComponents(denyNotesInput);

					denyReimbursementModal.addComponents(denyNotesInputRow);
					await interaction.showModal(denyReimbursementModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'markPaymentsComplete':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var currentMsg = interaction.message;

					var msgFinanceNum = currentMsg.embeds[0].data.fields[3].value;
					if (currentMsg.embeds[0].data.fields[12]) {
						var msgNotes = currentMsg.embeds[0].data.fields[12].value;
					}

					var now = Math.floor(new Date().getTime() / 1000.0);
					var markCompletedDate = `<t:${now}:d>`;

					if (currentMsg.embeds[0].data.fields[12]) {
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `${msgNotes}\n- Payments marked as completed <@${interaction.user.id}> on ${markCompletedDate}.` };
					} else {
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `- Payments marked as completed <@${interaction.user.id}> on ${markCompletedDate}.` };
					}

					let btnRows = addBtnRows();
					await currentMsg.edit({ embeds: [currentMsg.embeds[0]], components: btnRows });

					function addBtnRows() {
						let row1 = new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('markPaymentsComplete')
								.setLabel('Mark as Completed')
								.setStyle(ButtonStyle.Success)
								.setDisabled(true),

							new ButtonBuilder()
								.setCustomId('createEvictionNotice')
								.setLabel('Create an Eviction Notice')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
						);

						let rows = [row1];
						return rows;
					};

					await interaction.reply({ content: `Successfully marked the \`${msgFinanceNum}\` Financing Agreement as completed.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'setContacted':
				var currentMsg = interaction.message;

				var now = Math.floor(new Date().getTime() / 1000.0);
				var contactedDate = `<t:${now}:d>`;

				currentMsg.embeds[0].data.fields[5].value = `${currentMsg.embeds[0].data.fields[5].value}\n- Client contacted by <@${interaction.user.id}> on ${contactedDate}.`

				currentMsg.components[0].components[3].data.disabled = true;

				await currentMsg.react(process.env.PHONEHELLO_EMOJI_ID);

				await currentMsg.edit({ embeds: [currentMsg.embeds[0], currentMsg.embeds[1]], components: [currentMsg.components[0]] });

				await interaction.reply({ content: `Successfully marked the quote for \`${currentMsg.embeds[0].data.fields[2].value}\` as contacted.`, ephemeral: true });

				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
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