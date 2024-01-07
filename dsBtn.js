let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let dsModal = require('./dsModal.js');
let editEmbed = require('./editEmbed.js');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.btnPressed = async (interaction) => {
	try {
		var buttonID = interaction.customId;
		switch (buttonID) {
			case 'addSale':
				await interaction.deferReply({ ephemeral: true });

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

				await interaction.editReply({ content: `What type of **sale** is this?`, components: [addSaleSelectionsComponent], ephemeral: true });
				break;
			case 'addPropAction':
				await interaction.deferReply({ ephemeral: true });

				let addPropActionSelectOptions = new StringSelectMenuBuilder()
					.setCustomId('addPropActionDropdown')
					.setPlaceholder('Select a Property Action Type')
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('Property Quote')
							.setEmoji('🏡')
							.setValue('propQuote'),
						new StringSelectMenuOptionBuilder()
							.setLabel('Repossession Request')
							.setEmoji('🦵')
							.setValue('repoRequest'),
					);

				let addPropActionSelectionsComponent = new ActionRowBuilder()
					.addComponents(addPropActionSelectOptions);

				await interaction.editReply({ content: `What type of **property action** are you taking?`, components: [addPropActionSelectionsComponent], ephemeral: true });
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
			case 'approveQuote':
				if (interaction.member._roles.includes(process.env.QUOTE_APPROVER_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
					await interaction.reply({ content: `:x: You must have the \`Quote Approver\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'adjustQuote':
				if (interaction.member._roles.includes(process.env.QUOTE_APPROVER_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
					await interaction.reply({ content: `:x: You must have the \`Quote Approver\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyQuote':
				if (interaction.member._roles.includes(process.env.QUOTE_APPROVER_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
					await interaction.reply({ content: `:x: You must have the \`Quote Approver\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'markAsContacted':
				await interaction.deferReply({ ephemeral: true });

				var currentMsg = interaction.message;

				var now = Math.floor(new Date().getTime() / 1000.0);
				var contactedDate = `<t:${now}:d>`;

				currentMsg.embeds[0].data.fields[5].value = `${currentMsg.embeds[0].data.fields[5].value}\n- Client contacted by <@${interaction.user.id}> on ${contactedDate}.`

				currentMsg.components[0].components[3].data.disabled = true;

				await currentMsg.react(process.env.PHONEHELLO_EMOJI_ID);

				await currentMsg.edit({ embeds: currentMsg.embeds, components: [currentMsg.components[0]] });

				await interaction.editReply({ content: `Successfully marked the quote for \`${currentMsg.embeds[0].data.fields[2].value}\` as contacted.`, ephemeral: true });
				break;
			case 'setContacted':
				await interaction.deferReply({ ephemeral: true });

				var currentMsg = interaction.message;

				var now = Math.floor(new Date().getTime() / 1000.0);
				var contactedDate = `<t:${now}:d>`;

				currentMsg.embeds[0].data.fields[5].value = `${currentMsg.embeds[0].data.fields[5].value}\n- Client contacted by <@${interaction.user.id}> on ${contactedDate}.`

				currentMsg.components[0].components[3].data.disabled = true;

				await currentMsg.react(process.env.PHONEHELLO_EMOJI_ID);

				await currentMsg.edit({ embeds: currentMsg.embeds, components: [currentMsg.components[0]] });

				await interaction.editReply({ content: `Successfully marked the quote for \`${currentMsg.embeds[0].data.fields[2].value}\` as contacted.`, ephemeral: true });
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
					.setRequired(true);

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
			case 'createEvictionNotice':
				await interaction.deferReply({ ephemeral: true });

				if (interaction.member._roles.includes(process.env.FINANCING_MGR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `${msgNotes}\n- [Eviction Notice](${documentLink}) created by <@${interaction.user.id}> on ${evictionSentDate}.` };
					} else {
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `- [Eviction Notice](${documentLink}) created by <@${interaction.user.id}> on ${evictionSentDate}.` };
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

							new ButtonBuilder()
								.setCustomId('addNoticeSentProof')
								.setLabel('Add Proof of Eviction Sent')
								.setStyle(ButtonStyle.Primary),
						);

						let rows = [row1];
						return rows;
					};

					await interaction.editReply({ content: `Successfully created an Eviction Notice document for \`${msgClientName}\` for the \`${msgFinanceNum}\` Financing Agreement.\nDetails about this eviction:\n> Eviction Notice: [Click to view Eviction Notice](<${documentLink}>)`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Financing Manager\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'markPaymentsComplete':
				if (interaction.member._roles.includes(process.env.FINANCING_MGR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let markPaymentsCompleteModal = new ModalBuilder()
						.setCustomId('markPaymentsCompleteModal')
						.setTitle('Mark Financing Payment Completed');

					let completedNotesInput = new TextInputBuilder()
						.setCustomId('completedNotesInput')
						.setLabel('Any notes to submit with this completion?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Yeet \'em cowboy 🤠')
						.setRequired(false);

					let completedNotesInputRow = new ActionRowBuilder().addComponents(completedNotesInput);

					markPaymentsCompleteModal.addComponents(completedNotesInputRow);
					await interaction.showModal(markPaymentsCompleteModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Financing Manager\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'completeEviction':
				await interaction.deferReply({ ephemeral: true });

				if (interaction.member._roles.includes(process.env.FINANCING_MGR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var currentMsg = interaction.message;

					var msgFinanceNum = currentMsg.embeds[0].data.fields[3].value;

					var now = Math.floor(new Date().getTime() / 1000.0);
					var markCompletedDate = `<t:${now}:d>`;

					if (currentMsg.embeds[0].data.fields[12]) {
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `${currentMsg.embeds[0].data.fields[12].value}\n- Eviction marked as complete <@${interaction.user.id}> on ${markCompletedDate}.` };
					} else {
						currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `- Eviction marked as complete <@${interaction.user.id}> on ${markCompletedDate}.` };
					}

					await dbCmds.subtractOneSumm("activeFinancialAgreements");
					await editEmbed.editMainEmbed(interaction.client);

					let completedEvictionBtnRows = addCompletedEvictionBtnRows();
					await interaction.client.channels.cache.get(process.env.COMPLETED_FINANCING_CHANNEL_ID).send({ embeds: currentMsg.embeds, components: completedEvictionBtnRows });
					await currentMsg.delete();

					function addCompletedEvictionBtnRows() {
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

							new ButtonBuilder()
								.setCustomId('addNoticeSentProof')
								.setLabel('Add Proof of Eviction Sent')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true),

							new ButtonBuilder()
								.setCustomId('completeEviction')
								.setLabel('Mark Eviction as Complete')
								.setStyle(ButtonStyle.Danger)
								.setDisabled(true),
						);

						let rows = [row1];
						return rows;
					};

					await interaction.editReply({ content: `Successfully marked the eviction for the \`${msgFinanceNum}\` Financing Agreement as completed.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'approveRepo':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let approveRepoModal = new ModalBuilder()
						.setCustomId('approveRepoModal')
						.setTitle('Approve a Request for Property Repossession');

					let approveNotesInput = new TextInputBuilder()
						.setCustomId('approveNotesInput')
						.setLabel('Any notes to submit with this repo approval?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Owner has no train activity since last year')
						.setRequired(false);

					let approveNotesInputRow = new ActionRowBuilder().addComponents(approveNotesInput);

					approveRepoModal.addComponents(approveNotesInputRow);
					await interaction.showModal(approveRepoModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'recheckRepo':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let recheckRepoModal = new ModalBuilder()
						.setCustomId('recheckRepoModal')
						.setTitle('Request Recheck for a Property Repossession');

					let recheckDaysInput = new TextInputBuilder()
						.setCustomId('recheckDaysInput')
						.setLabel('How many days from now should they recheck?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('45')
						.setRequired(true);

					let recheckNotesInput = new TextInputBuilder()
						.setCustomId('recheckNotesInput')
						.setLabel('Any notes to submit with this repo recheck?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Owner has train activity a month ago')
						.setRequired(false);

					let recheckDaysInputRow = new ActionRowBuilder().addComponents(recheckDaysInput);
					let recheckNotesInputRow = new ActionRowBuilder().addComponents(recheckNotesInput);

					recheckRepoModal.addComponents(recheckDaysInputRow, recheckNotesInputRow);
					await interaction.showModal(recheckRepoModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyRepo':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let denyRepoModal = new ModalBuilder()
						.setCustomId('denyRepoModal')
						.setTitle('Deny a Request for Property Repossession');

					let denyNotesInput = new TextInputBuilder()
						.setCustomId('denyNotesInput')
						.setLabel('Any notes to submit with this repo denial?')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Owner has train activity as recent as yesterday')
						.setRequired(false);

					let denyNotesInputRow = new ActionRowBuilder().addComponents(denyNotesInput);

					denyRepoModal.addComponents(denyNotesInputRow);
					await interaction.showModal(denyRepoModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'markAsRepod':
				let completeRepoModal = new ModalBuilder()
					.setCustomId('completeRepoModal')
					.setTitle('Complete Property Repossession');

				let completeRepoReasonInput = new TextInputBuilder()
					.setCustomId('completeRepoReasonInput')
					.setLabel('What is the reason for this repossession?')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Owner hasn\'t been around in a while')
					.setRequired(true);

				let completeRepoReasonInputRow = new ActionRowBuilder().addComponents(completeRepoReasonInput);

				completeRepoModal.addComponents(completeRepoReasonInputRow);
				await interaction.showModal(completeRepoModal);
				break;
			case 'acknowledgeAlert':
				await interaction.deferReply({ ephemeral: true });

				if (1 == 1) {
					let origMsgContent = interaction.message.content;
					let origRealtor = '';
					if (origMsgContent.startsWith("<")) { //check if msgContent is a user's @ (they had pings enabled)
						origRealtor = origMsgContent.replaceAll('<@', '').replaceAll('>', '');

						if (interaction.user.id == origRealtor || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
							let disabledAckBtns = getDisabledAckAlertBtn();
							await interaction.message.edit({ content: interaction.message.content, embeds: interaction.message.embeds, components: disabledAckBtns });

							let now = Math.floor(new Date().getTime() / 1000.0);
							let waitSeconds = 15;
							let deletionTime = now + waitSeconds;
							interaction.editReply({ content: `Alert has been successfully acknowledged and will be deleted <t:${deletionTime}:R>.`, ephemeral: true });

							setTimeout(async () => {
								await interaction.message.delete();
							}, (waitSeconds * 1000));
						} else {
							interaction.editReply({ content: `:x: You must be <@${origRealtor}> or have the \`Administrator\` permission to take this action.`, ephemeral: true });
						}
					} else { // assume msgContent is a nickname (they had pings disabled)
						origRealtor = origMsgContent.replaceAll(':', '');

						if (interaction.message.nickname == origRealtor || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
							let now = Math.floor(new Date().getTime() / 1000.0);
							let waitSeconds = 15;
							let deletionTime = now + waitSeconds;
							interaction.editReply({ content: `Alert has been successfully acknowledged and will be deleted <t:${deletionTime}:R>.`, ephemeral: true });

							setTimeout(async () => {
								await interaction.message.delete();
							}, (waitSeconds * 1000));
						} else {
							interaction.editReply({ content: `:x: You must be <@${origRealtor}> or have the \`Administrator\` permission to take this action.`, ephemeral: true });
						}
					}
				}
				break;
			case 'setGarageSlots':
				if (1 == 1) {
					let garageSlotsModal = new ModalBuilder()
						.setCustomId('garageSlotsModal')
						.setTitle('Set Garage Slots Amount');

					let garageSlotsNumInput = new TextInputBuilder()
						.setCustomId('garageSlotsNumInput')
						.setLabel('How many garage slots does the property have?')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('7')
						.setRequired(true);

					let garageSlotsNumInputRow = new ActionRowBuilder().addComponents(garageSlotsNumInput);

					garageSlotsModal.addComponents(garageSlotsNumInputRow);
					await interaction.showModal(garageSlotsModal);
				}
				break;
			case 'toggleSmartLock':
				await interaction.deferReply({ ephemeral: true });

				if (1 == 1) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let today = `<t:${now}:d>`;
					let newSlStatus = "";
					let embedTitle = interaction.message.embeds[0].data.title;
					if (embedTitle.toLowerCase().includes("office")) {
						if (interaction.message.embeds[0].data.fields[6].value === "No") {
							newSlStatus = "Yes"
							interaction.message.embeds[0].data.fields[6].value = newSlStatus;
						} else {
							newSlStatus = "No";
							interaction.message.embeds[0].data.fields[6].value = newSlStatus;
						}
						if (interaction.message.embeds[0].data.fields[9]) {
							interaction.message.embeds[0].data.fields[9].value = `${interaction.message.embeds[0].data.fields[9].value}\n- Smart Locks toggled to ${newSlStatus} by <@${interaction.user.id}> on ${today}.`;
						} else {
							interaction.message.embeds[0].data.fields[9] = { name: `Notes:`, value: `\n- Smart Locks toggled to ${newSlStatus} by <@${interaction.user.id}> on ${today}.` };
						}
					} else if (embedTitle.toLowerCase().includes("warehouse")) {
						if (interaction.message.embeds[0].data.fields[5].value === "No") {
							newSlStatus = "Yes"
							interaction.message.embeds[0].data.fields[5].value = newSlStatus;
						} else {
							newSlStatus = "No";
							interaction.message.embeds[0].data.fields[5].value = newSlStatus;
						}
						if (interaction.message.embeds[0].data.fields[7]) {
							interaction.message.embeds[0].data.fields[7].value = `${interaction.message.embeds[0].data.fields[7].value}\n- Smart Locks toggled to ${newSlStatus} by <@${interaction.user.id}> on ${today}.`;
						} else {
							interaction.message.embeds[0].data.fields[7] = { name: `Notes:`, value: `\n- Smart Locks toggled to ${newSlStatus} by <@${interaction.user.id}> on ${today}.` };
						}
					} else if (embedTitle.toLowerCase().includes("house")) {
						if (interaction.message.embeds[0].data.fields[5].value === "No") {
							newSlStatus = "Yes"
							interaction.message.embeds[0].data.fields[5].value = newSlStatus;
						} else {
							newSlStatus = "No";
							interaction.message.embeds[0].data.fields[5].value = newSlStatus;
						}
						if (interaction.message.embeds[0].data.fields[7]) {
							interaction.message.embeds[0].data.fields[7].value = `${interaction.message.embeds[0].data.fields[7].value}\n- Smart Locks toggled to ${newSlStatus} by <@${interaction.user.id}> on ${today}.`;
						} else {
							interaction.message.embeds[0].data.fields[7] = { name: `Notes:`, value: `\n- Smart Locks toggled to ${newSlStatus} by <@${interaction.user.id}> on ${today}.` };
						}
					}

					await dbCmds.addOneSumm("countMiscSales");
					await dbCmds.addOneSumm("countMonthlyMiscSales");
					await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
					await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyMiscSales");
					await editEmbed.editMainEmbed(interaction.client);

					await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });
					await interaction.editReply({
						content: `Successfully toggled the smart locks status to \`${newSlStatus}\` for property \`${interaction.message.embeds[0].data.fields[2].value}\`.`, ephemeral: true
					});
				}
				break;
			case 'splitSaleCommission':
				let commissionSplitReply = await interaction.deferReply({ ephemeral: true });

				if (1 == 1) {
					let originalUserStr = interaction.message.embeds[0].data.fields[0].value;
					let originalUser = originalUserStr.substring((originalUserStr.indexOf(' (') + 2), originalUserStr.indexOf(')'));
					let originalUserId = originalUser.replaceAll('<@', '').replaceAll('>', '');

					if (interaction.user.id == originalUserId || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
						let allUsers = await interaction.member.guild.members.fetch();
						let allRealtors = allUsers.filter(
							member => member._roles.includes(process.env.FULL_TIME_ROLE_ID) || member._roles.includes(process.env.ASSISTANT_ROLE_ID) || member._roles.includes(process.env.FULL_TIME_PD_ROLE_ID));

						let allRealtorsArray = allRealtors.map(function (member) {
							if (member.nickname) {
								return new StringSelectMenuOptionBuilder().setLabel(member.nickname).setValue(member.user.id)
							} else {
								return new StringSelectMenuOptionBuilder().setLabel(`no nickname: ${member.user.username}`).setValue(member.user.id)
							}
						});

						allRealtorsArray = allRealtorsArray.filter(function (realtor) {
							return realtor.data.label !== interaction.member.nickname;
						});

						// Sort the array alphabetically by label
						allRealtorsArray.sort((a, b) => a.data.label.localeCompare(b.data.label));

						let realtorSelectionOptions = new StringSelectMenuBuilder()
							.setCustomId('swapCommissionRealtorDropdown')
							.setPlaceholder('Select a Realtor')
							.addOptions(allRealtorsArray);

						let realtorSelectionComponent = new ActionRowBuilder()
							.addComponents(realtorSelectionOptions);

						let salePriceStr = interaction.message.embeds[0].data.fields[3].value;
						let salePriceNum = Number(salePriceStr.replaceAll('$', '').replaceAll(',', ''));
						let d8CostPrice = (salePriceNum * 0.85);
						let d8Profit = salePriceNum - d8CostPrice;
						let realtorCommission = Math.round(d8Profit * 0.30);

						let formattedRealtorCommission = formatter.format(realtorCommission);

						await interaction.editReply({ content: `Who should your commission of \`${formattedRealtorCommission}\` from the sale be split with?`, components: [realtorSelectionComponent], ephemeral: true });
						exports.commissionSplitReply = commissionSplitReply.interaction;
					}
				}
				break;
			case 'assistantsPortal':
				await interaction.deferReply({ ephemeral: true });

				if (interaction.member._roles.includes(process.env.ASSISTANT_ROLE_ID) || interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member._roles.includes(process.env.FULL_TIME_PD_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let addAssistantsPortalOptions = new StringSelectMenuBuilder()
						.setCustomId('assistantsPortalDropdown')
						.setPlaceholder('Select an Action')
						.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel('Request a Quote')
								.setEmoji('🏠')
								.setValue('assistantsRequestQuote'),
							new StringSelectMenuOptionBuilder()
								.setLabel('Purchase Property')
								.setEmoji('💰')
								.setValue('assistantsPurchaseProperty'),
							new StringSelectMenuOptionBuilder()
								.setLabel('Request Smart Lock')
								.setEmoji('🔐')
								.setValue('assistantsRequestSmartLock'),
							new StringSelectMenuOptionBuilder()
								.setLabel('Request Garage Slot(s)')
								.setEmoji('🚘')
								.setValue('assistantsRequestGarageSlot'),
							new StringSelectMenuOptionBuilder()
								.setLabel('Other Request')
								.setEmoji('🧠')
								.setValue('assistantsOtherRequest'),
						);


					let addAssistantsPortalSelection = new ActionRowBuilder()
						.addComponents(addAssistantsPortalOptions);

					await interaction.editReply({ content: `What type of **action** do you want to take?`, components: [addAssistantsPortalSelection], ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have either the \`Assistant\` or \`Full-Time\` or \`PD Full-Time\` role, or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'addNoticeSentProof':
				if (interaction.member._roles.includes(process.env.FINANCING_MGR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let evictionNoticeSentModal = new ModalBuilder()
						.setCustomId('evictionNoticeSentModal')
						.setTitle('Add Proof of Eviction Notice Sent');

					let proofLinkInput = new TextInputBuilder()
						.setCustomId('proofLinkInput')
						.setLabel('Please provide proof of notice sent')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Link to a screenshot from your phone of the eviction being sent')
						.setRequired(true);

					let proofLinkInputRow = new ActionRowBuilder().addComponents(proofLinkInput);

					evictionNoticeSentModal.addComponents(proofLinkInputRow);
					await interaction.showModal(evictionNoticeSentModal);
				} else {
					await interaction.reply({ content: `:x: You must have the \`Financing Manager\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'yesAddToWatchlist':
				if (1 == 1) {
					let oldWatchlistEmbed = interaction.message.embeds[0];
					let watchlistEmbed = [oldWatchlistEmbed];
					watchlistEmbed[0].data.title = `A new person has been added to the watchlist!`;

					let watchlistUntil = oldWatchlistEmbed.data.fields[3].value;
					watchlistUntil = watchlistUntil.replaceAll(':R>', ':D>')

					await interaction.client.channels.cache.get(process.env.WATCHLIST_CHANNEL_ID).send({ embeds: watchlistEmbed });

					let disabledWatchlistYesBtns = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('yesAddToWatchlist')
							.setLabel('Yes, add to list')
							.setStyle(ButtonStyle.Success)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('noDontAddToWatchlist')
							.setLabel('No, don\'t add to list')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),
					)];

					let prevInteraction = dsModal.origInteraction;

					await prevInteraction.editReply({ content: interaction.message.content, embeds: [oldWatchlistEmbed], components: disabledWatchlistYesBtns, ephemeral: true });

					await interaction.reply({ content: `Successfully added \`${oldWatchlistEmbed.data.fields[0].value}\` to the watchlist until ${watchlistUntil}.`, ephemeral: true });
				}
				break;
			case 'noDontAddToWatchlist':
				if (1 == 1) {
					let oldWatchlistEmbed = interaction.message.embeds[0];

					let disabledWatchlistNoBtns = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('yesAddToWatchlist')
							.setLabel('Yes, add to list')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('noDontAddToWatchlist')
							.setLabel('No, don\'t add to list')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(true),
					)];

					let prevInteraction = dsModal.origInteraction;

					await prevInteraction.editReply({ content: interaction.message.content, embeds: [oldWatchlistEmbed], components: disabledWatchlistNoBtns, ephemeral: true });

					await interaction.reply({ content: `Successfully declined to add \`${oldWatchlistEmbed.data.fields[0].value}\` to the watchlist.`, ephemeral: true });
				}
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.error(errTime, fileName, error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];
			console.error(errTime, fileName, error);

			console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

			let errString = error.toString();

			if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
				try {
					await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				} catch {
					await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				}
			}

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};

function getDisabledAckAlertBtn() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('acknowledgeAlert')
			.setLabel('Acknowledge Alert')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true),
	);

	let rows = [row1];
	return rows;
};