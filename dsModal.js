let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let { v4: uuidv4 } = require('uuid');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
let personnelCmds = require('./personnelCmds.js');
let commissionCmds = require('./commissionCmds.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

function strCleanup(str) {
	var cleaned = str.replaceAll('`', '-').replaceAll('\\', '-').trimEnd().trimStart();
	return cleaned;
};

function isValidUrl(string) {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

function getAckAlertBtn() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('acknowledgeAlert')
			.setLabel('Acknowledge Alert')
			.setStyle(ButtonStyle.Primary),

	);

	let rows = [row1];
	return rows;
};

function getSaleBtns() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('setGarageSlots')
			.setLabel('Set Garage Slots')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('toggleSmartLock')
			.setLabel('Toggle Smart Locks')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('splitSaleCommission')
			.setLabel('Split Commission')
			.setStyle(ButtonStyle.Secondary),
	);

	let rows = [row1];
	return rows;
};

module.exports.modalSubmit = async (interaction) => {
	try {
		var modalID = interaction.customId;
		let interactionReply = await interaction.deferReply({ ephemeral: true });

		switch (modalID) {
			case 'addHouseSoldModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var soldTo = strCleanup(interaction.fields.getTextInputValue('soldToInput'));
				var lotNumStreetName = strCleanup(interaction.fields.getTextInputValue('lotNumStreetNameInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var locationNotes = strCleanup(interaction.fields.getTextInputValue('locNotesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Property Sales!A:H", valueInputOption: "RAW", resource: { values: [[`House Sale`, `${realtorName} (<@${interaction.user.id}>)`, saleDate, lotNumStreetName, price, soldTo, locationNotes, photosString]] }
				});

				if (isNaN(price)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var photos = [photosString];
				if (photosString.includes(",")) {
					photos = photosString.split(",")
				} else if (photosString.includes(";")) {
					photos = photosString.split(";")
				} else if (photosString.includes(" ")) {
					photos = photosString.split(" ")
				} else if (photosString.includes("|")) {
					photos = photosString.split("|")
				} else if (photos.length > 1) {
					await interaction.editReply({
						content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
						ephemeral: true
					});
					return;
				}

				for (let i = 0; i < photos.length; i++) {
					if (photos[i] == "") {
						photos.splice(i, 1);
						continue;
					}
					if (!isValidUrl(photos[i])) { // validate photo link
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (photos.length >= 10) {
					await interaction.editReply({
						content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
						ephemeral: true
					});
					return;
				}

				var formattedPrice = formatter.format(price);
				var costPrice = (price * 0.85);
				var d8Profit = price - costPrice;
				var realtorCommission = Math.round(d8Profit * 0.30);
				var assetFees = (price * 0.01);
				var taxPrice = Math.round((price * 0.052));
				var totalPrice = (price + taxPrice);

				var formattedCostPrice = formatter.format(costPrice);
				var formattedD8Profit = formatter.format(d8Profit);
				var formattedRealtorCommission = formatter.format(realtorCommission);
				var formattedAssetFees = formatter.format(assetFees);
				var formattedTotalPrice = formatter.format(totalPrice);
				var formattedTaxPrice = formatter.format(taxPrice);

				var embeds = [new EmbedBuilder()
					.setTitle('A new House has been sold!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}` },
						{ name: `Street Address:`, value: `${lotNumStreetName}` },
						{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						{ name: `House Sold To:`, value: `${soldTo}` },
						{ name: `Smart Locks?:`, value: `No`, inline: true },
						{ name: `Garage Slots #:`, value: `0`, inline: true },
						{ name: `Location/Notes:`, value: `${locationNotes}` }
					)
					.setColor('805B10')];

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('805B10').setURL('https://echorp.net/').setImage(x));
				embeds = embeds.concat(photosEmbed);

				var salesBtns = getSaleBtns();

				await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: embeds, components: salesBtns });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countHousesSold");
				await dbCmds.addOneSumm("countMonthlyHousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "housesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyHousesSold");
				await editEmbed.editMainEmbed(interaction.client);

				var reason = `House Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`;
				var currCommission = await commissionCmds.addCommission(interaction.client, 'System', realtorCommission, interaction.member.user.id, reason);

				var newHousesSoldTotal = await dbCmds.readSummValue("countHousesSold");

				await interaction.editReply({ content: `Successfully logged this House Sale - the new total is \`${newHousesSoldTotal}\`.\n\nDetails about this sale:\n> Total Price: \`${formattedTotalPrice}\` (\`${formattedPrice}\` sale + \`${formattedTaxPrice}\` tax)\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour commission is now: \`${currCommission}\`.`, ephemeral: true });

				break;
			case 'addWarehouseSoldModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var soldTo = strCleanup(interaction.fields.getTextInputValue('soldToInput'));
				var lotNumStreetName = strCleanup(interaction.fields.getTextInputValue('lotNumStreetNameInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var locationNotes = strCleanup(interaction.fields.getTextInputValue('locNotesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Property Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Warehouse Sale`, `${realtorName} (<@${interaction.user.id}>)`, saleDate, lotNumStreetName, price, soldTo, locationNotes, photosString]] }
				});

				var formattedPrice = formatter.format(price);
				var costPrice = (price * 0.85);
				var d8Profit = price - costPrice;
				var realtorCommission = Math.round(d8Profit * 0.30);
				var assetFees = (price * 0.01);
				var taxPrice = Math.round((price * 0.052));
				var totalPrice = (price + taxPrice);

				var formattedCostPrice = formatter.format(costPrice);
				var formattedD8Profit = formatter.format(d8Profit);
				var formattedRealtorCommission = formatter.format(realtorCommission);
				var formattedAssetFees = formatter.format(assetFees);
				var formattedTotalPrice = formatter.format(totalPrice);
				var formattedTaxPrice = formatter.format(taxPrice);

				if (isNaN(price)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var photos = [photosString];
				if (photosString.includes(",")) {
					photos = photosString.split(",")
				} else if (photosString.includes(";")) {
					photos = photosString.split(";")
				} else if (photosString.includes(" ")) {
					photos = photosString.split(" ")
				} else if (photosString.includes("|")) {
					photos = photosString.split("|")
				} else if (photos.length > 1) {
					await interaction.editReply({
						content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
						ephemeral: true
					});
					return;
				}

				for (let i = 0; i < photos.length; i++) {
					if (photos[i] == "") {
						photos.splice(i, 1);
						continue;
					}
					if (!isValidUrl(photos[i])) { // validate photo link
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (photos.length >= 10) {
					await interaction.editReply({
						content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
						ephemeral: true
					});
					return;
				}

				var embeds = [new EmbedBuilder()
					.setTitle('A new Warehouse has been sold!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}` },
						{ name: `Street Address:`, value: `${lotNumStreetName}` },
						{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						{ name: `Warehouse Sold To:`, value: `${soldTo}` },
						{ name: `Smart Locks?:`, value: `No`, inline: true },
						{ name: `Garage Slots #:`, value: `0`, inline: true },
						{ name: `Location/Notes:`, value: `${locationNotes}` }
					)
					.setColor('926C15')];

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('926C15').setURL('https://echorp.net/').setImage(x));
				embeds = embeds.concat(photosEmbed);

				var salesBtns = getSaleBtns();

				await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: embeds, components: salesBtns });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countWarehousesSold");
				await dbCmds.addOneSumm("countMonthlyWarehousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "warehousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyWarehousesSold");
				await editEmbed.editMainEmbed(interaction.client);

				var reason = `Warehouse Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`
				var currCommission = await commissionCmds.addCommission(interaction.client, 'System', realtorCommission, interaction.member.user.id, reason);

				var newWarehousesSoldTotal = await dbCmds.readSummValue("countWarehousesSold");

				await interaction.editReply({ content: `Successfully logged this Warehouse Sale - the new total is \`${newWarehousesSoldTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour commission is now: \`${currCommission}\`.`, ephemeral: true });

				break;
			case 'addOfficeSoldModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var clientName = strCleanup(interaction.fields.getTextInputValue('clientNameInput'));
				var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInfoInput'));
				var lotNumStreetName = strCleanup(interaction.fields.getTextInputValue('lotNumStreetNameInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Property Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Office Sale`, `${realtorName} (<@${interaction.user.id}>)`, saleDate, lotNumStreetName, price, clientName, clientInfo, photosString]] }
				});

				let officeSaleNewFile = await interaction.client.driveFiles.copy({
					auth: interaction.client.driveAuth, fileId: process.env.LIMITED_PROP_TEMPLATE_DOC_ID, resource: { name: `${clientName} | Dynasty 8 Limited Property Contract` }
				});

				let officeSaleDocumentLink = `https://docs.google.com/document/d/${officeSaleNewFile.data.id}`;

				let officeSaleTodayDate = moment().format('MMMM DD, YYYY');

				var costPrice = (price * 0.85);
				var d8Profit = price - costPrice;
				var realtorCommission = Math.round(d8Profit * 0.30);
				var assetFees = (price * 0.01);
				var taxPrice = Math.round((price * 0.052));
				var totalPrice = (price + taxPrice);
				var buybackPrice = (price * 0.75);

				var formattedPrice = formatter.format(price);
				var formattedCostPrice = formatter.format(costPrice);
				var formattedD8Profit = formatter.format(d8Profit);
				var formattedRealtorCommission = formatter.format(realtorCommission);
				var formattedAssetFees = formatter.format(assetFees);
				var formattedTotalPrice = formatter.format(totalPrice);
				var formattedTaxPrice = formatter.format(taxPrice);
				var formattedBuybackPrice = formatter.format(buybackPrice);

				await interaction.client.googleDocs.batchUpdate({
					auth: interaction.client.driveAuth, documentId: officeSaleNewFile.data.id, resource: {
						requests: [{
							replaceAllText: {
								replaceText: clientName,
								containsText: {
									"text": "{client_name}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: clientInfo,
								containsText: {
									"text": "{client_info}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: officeSaleTodayDate,
								containsText: {
									"text": "{today_date}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: lotNumStreetName,
								containsText: {
									"text": "{street_address}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedPrice,
								containsText: {
									"text": "{purchase_price}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedBuybackPrice,
								containsText: {
									"text": "{buyback_price}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: 'Office',
								containsText: {
									"text": "{property_type}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: realtorName,
								containsText: {
									"text": "{realtor_name}",
									"matchCase": true
								}
							},
						}]
					}
				});

				if (isNaN(price)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var photos = [photosString];
				if (photosString.includes(",")) {
					photos = photosString.split(",")
				} else if (photosString.includes(";")) {
					photos = photosString.split(";")
				} else if (photosString.includes(" ")) {
					photos = photosString.split(" ")
				} else if (photosString.includes("|")) {
					photos = photosString.split("|")
				} else if (photos.length > 1) {
					await interaction.editReply({
						content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
						ephemeral: true
					});
					return;
				}

				for (let i = 0; i < photos.length; i++) {
					if (photos[i] == "") {
						photos.splice(i, 1);
						continue;
					}
					if (!isValidUrl(photos[i])) { // validate photo link
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (photos.length >= 10) {
					await interaction.editReply({
						content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
						ephemeral: true
					});
					return;
				}

				var embeds = [new EmbedBuilder()
					.setTitle('A new Office has been sold!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}` },
						{ name: `Street Address:`, value: `${lotNumStreetName}` },
						{ name: `Final Sale Price:`, value: `${formattedPrice}` },
						{ name: `Client Name:`, value: `${clientName}` },
						{ name: `Client Info:`, value: `${clientInfo}` },
						{ name: `Smart Locks?:`, value: `No`, inline: true },
						{ name: `Garage Slots #:`, value: `0`, inline: true },
						{ name: `Limited Prop. Contract:`, value: `[Click to view Contract](<${officeSaleDocumentLink}>)` }

					)
					.setColor('805B10')];

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('805B10').setURL('https://echorp.net/').setImage(x));
				embeds = embeds.concat(photosEmbed);

				var salesBtns = getSaleBtns();

				await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: embeds, components: salesBtns });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countHousesSold");
				await dbCmds.addOneSumm("countMonthlyHousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "housesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyHousesSold");
				await editEmbed.editMainEmbed(interaction.client);

				var reason = `Office Sale to \`${clientName}\` costing \`${formattedPrice}\` on ${saleDate}`
				var currCommission = await commissionCmds.addCommission(interaction.client, 'System', realtorCommission, interaction.member.user.id, reason);

				var newHousesSoldTotal = await dbCmds.readSummValue("countHousesSold");

				await interaction.editReply({ content: `Successfully logged this Office Sale - the new total is \`${newHousesSoldTotal}\`.\n\nDetails about this sale:\n> Total Price: \`${formattedTotalPrice}\` (\`${formattedPrice}\` sale + \`${formattedTaxPrice}\` tax)\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n> Limited Property Contract: [Click to view Contract](<${officeSaleDocumentLink}>)\n\nYour commission is now: \`${currCommission}\`.`, ephemeral: true });

				break;
			case 'addMiscSaleModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var itemsSold = strCleanup(interaction.fields.getTextInputValue('itemsSoldInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Misc. Sales!A:D", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, itemsSold, price]] }
				});

				if (isNaN(price)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var formattedPrice = formatter.format(price);

				var embeds = [new EmbedBuilder()
					.setTitle('A new Misc. Sale has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}` },
						{ name: `Items Sold:`, value: `${itemsSold}` },
						{ name: `Sale Price:`, value: `${formattedPrice}` },
					)
					.setColor('DBB42C')];

				await interaction.client.channels.cache.get(process.env.MISC_SALES_CHANNEL_ID).send({ embeds: embeds });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countMiscSales");
				await dbCmds.addOneSumm("countMonthlyMiscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyMiscSales");
				await editEmbed.editMainEmbed(interaction.client);

				var reason = `Miscellaneous Sale of \`${itemsSold}\` costing \`${formattedPrice}\` on ${saleDate}`

				var newMiscSalesTotal = await dbCmds.readSummValue("countMiscSales");

				await interaction.editReply({ content: `Successfully logged this Miscellaneous Sale. The new total is \`${newMiscSalesTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${formattedPrice}\``, ephemeral: true });
				break;
			case 'addPropertyQuoteModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var reqDate = `<t:${now}:d>`;

				var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInfoInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var interiorType = strCleanup(interaction.fields.getTextInputValue('intTypeInput'));

				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Building Quotes!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, reqDate, clientInfo, price, interiorType, notes, photosString]] }
				});

				var formattedPrice = formatter.format(price);

				if (isNaN(price)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}
				else {
					var photos = [photosString];
					if (photosString.includes(",")) {
						photos = photosString.split(",")
					} else if (photosString.includes(";")) {
						photos = photosString.split(";")
					} else if (photosString.includes(" ")) {
						photos = photosString.split(" ")
					} else if (photosString.includes("|")) {
						photos = photosString.split("|")
					} else if (photos.length > 1) {
						await interaction.editReply({
							content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
							ephemeral: true
						});
						return;
					}

					for (let i = 0; i < photos.length; i++) {
						if (photos[i] == "") {
							photos.splice(i, 1);
							continue;
						}
						if (!isValidUrl(photos[i])) { // validate photo link
							await interaction.editReply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.editReply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (photos.length >= 10) {
						await interaction.editReply({
							content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
							ephemeral: true
						});
						return;
					}

					if (notes) {
						var embeds = [new EmbedBuilder()
							.setTitle('A new Property Quote request has been submitted!')
							.addFields(
								{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Estimated Price:`, value: `${formattedPrice}` },
								{ name: `Interior Type:`, value: `${interiorType}` },
								{ name: `Notes:`, value: `${notes}` }
							)
							.setColor('A47E1B')];
					} else {
						var embeds = [new EmbedBuilder()
							.setTitle('A new Property Quote request has been submitted!')
							.addFields(
								{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Estimated Price:`, value: `${formattedPrice}` },
								{ name: `Interior Type:`, value: `${interiorType}` },
							)
							.setColor('A47E1B')];
					}

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('A47E1B').setURL('https://echorp.net/').setImage(x));

					embeds = embeds.concat(photosEmbed);

					let quoteBtns = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveQuote')
							.setLabel('Approve Quote')
							.setStyle(ButtonStyle.Success),

						new ButtonBuilder()
							.setCustomId('adjustQuote')
							.setLabel('Adjust & Approve')
							.setStyle(ButtonStyle.Primary),

						new ButtonBuilder()
							.setCustomId('denyQuote')
							.setLabel('Deny Quote')
							.setStyle(ButtonStyle.Danger),
					)];

					await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ embeds: embeds, components: quoteBtns, });
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countPropertiesQuoted");
				await dbCmds.addOneSumm("countMonthlyPropertiesQuoted");
				await dbCmds.addOnePersStat(interaction.member.user.id, "propertiesQuoted");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyPropertiesQuoted");
				await editEmbed.editMainEmbed(interaction.client);

				var newPropertiesQuotedTotal = await dbCmds.readSummValue("countPropertiesQuoted");
				await interaction.editReply({ content: `Successfully added \`1\` to the \`Properties Quoted\` counter - the new total is \`${newPropertiesQuotedTotal}\`.`, ephemeral: true });
				break;
			case 'approveQuoteModal':
				if (interaction.member._roles.includes(process.env.QUOTE_APPROVER_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

					let approvalNotes = strCleanup(interaction.fields.getTextInputValue('approveNotesInput'));

					let approvalNow = Math.floor(new Date().getTime() / 1000.0);
					let approvalDate = `<t:${approvalNow}:d>`;

					let msgEmbeds = interaction.message.embeds;

					let mainEmbedFields = msgEmbeds[0].data.fields;

					let originalRealtor = mainEmbedFields[0].value;
					let originalRealtorId = originalRealtor.substring((originalRealtor.indexOf(`(`) + 1), originalRealtor.indexOf(`)`));
					let originalRealtorName = originalRealtor.substring(0, (originalRealtor.indexOf(`(`) - 1));

					let newQuoteBtns = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveQuote')
							.setLabel('Approve Quote')
							.setStyle(ButtonStyle.Success)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('adjustQuote')
							.setLabel('Adjust & Approve')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('denyQuote')
							.setLabel('Deny Quote')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('markAsContacted')
							.setLabel('Contacted?')
							.setStyle(ButtonStyle.Primary),
					)];

					let approvalMsgNotes;
					let approvalMsgEmbed = [];

					await dbCmds.addOnePersStat(interaction.member.id, 'quotesReviewed');
					await dbCmds.addOnePersStat(interaction.member.id, 'monthlyQuotesReviewed');
					await editEmbed.editMainEmbed(interaction.client);

					if (approvalNotes) {
						if (mainEmbedFields[5]) {
							approvalMsgNotes = `${mainEmbedFields[5].value}\n- Quote approved by <@${interaction.member.id}> on ${approvalDate} with the following note \`${approvalNotes}\`.`;
						} else {
							approvalMsgNotes = `- Quote approved by <@${interaction.member.id}> on ${approvalDate} with the following note \`${approvalNotes}\`.`;
						}

						approvalMsgEmbed = [new EmbedBuilder()
							.setTitle('A quote you submitted has been approved')
							.addFields(
								{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
								{ name: `Quote Link:`, value: `https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id}` },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` },
								{ name: `Approval Notes:`, value: `${approvalNotes}` }
							)
							.setColor('1EC276')];

					} else {
						if (mainEmbedFields[5]) {
							approvalMsgNotes = `${mainEmbedFields[5].value}\n- Quote approved by <@${interaction.member.id}> on ${approvalDate}.`;
						} else {
							approvalMsgNotes = `- Quote approved by <@${interaction.member.id}> on ${approvalDate}.`;
						}

						approvalMsgEmbed = [new EmbedBuilder()
							.setTitle('A quote you submitted has been approved')
							.addFields(
								{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
								{ name: `Quote Link:`, value: `https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id}` },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` }
							)
							.setColor('1EC276')];
					}

					msgEmbeds[0] = new EmbedBuilder()
						.setTitle('A new Property Quote request has been submitted!')
						.addFields(
							{ name: `Realtor Name:`, value: `${mainEmbedFields[0].value}` },
							{ name: `Request Date:`, value: `${mainEmbedFields[1].value}` },
							{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
							{ name: `Estimated Price:`, value: `${mainEmbedFields[3].value}` },
							{ name: `Interior Type:`, value: `${mainEmbedFields[4].value}` },
							{ name: `Notes:`, value: `${approvalMsgNotes}` }
						)
						.setColor('A47E1B');

					await interaction.message.edit({ embeds: msgEmbeds, components: newQuoteBtns })

					await interaction.message.react('✅');

					let quotePingSetting = await dbCmds.readPersSetting(interaction.member.id, 'settingQuotePing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (originalRealtorId.substring(2, (originalRealtorId.length - 1)) != interaction.user.id) {
						if (quotePingSetting) {
							await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorId}`, embeds: approvalMsgEmbed, components: acknowledgeAlertBtn });
						} else {
							await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorName}:`, embeds: approvalMsgEmbed, components: acknowledgeAlertBtn });
						}
					}

					await interaction.editReply({ content: `Successfully marked this quote as approved.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Quote Approver\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'adjustQuoteModal':
				if (interaction.member._roles.includes(process.env.QUOTE_APPROVER_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

					let adjustedPrice = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('adjustPriceInput')).replaceAll(',', '').replaceAll('$', '')));

					if (isNaN(adjustedPrice)) { // validate quantity of money
						await interaction.editReply({
							content: `:exclamation: \`${interaction.fields.getTextInputValue('adjustPriceInput')}\` is not a valid number, please be sure to only enter numbers.`,
							ephemeral: true
						});
						return;
					}

					var formattedAdjustedPrice = formatter.format(adjustedPrice);

					let approvalNotes = strCleanup(interaction.fields.getTextInputValue('adjustNotesInput'));

					let approvalNow = Math.floor(new Date().getTime() / 1000.0);
					let approvalDate = `<t:${approvalNow}:d>`;

					let msgEmbeds = interaction.message.embeds;

					let mainEmbedFields = msgEmbeds[0].data.fields;

					let originalRealtor = mainEmbedFields[0].value;
					let originalRealtorId = originalRealtor.substring((originalRealtor.indexOf(`(`) + 1), originalRealtor.indexOf(`)`));
					let originalRealtorName = originalRealtor.substring(0, (originalRealtor.indexOf(`(`) - 1));

					let newQuoteBtns = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveQuote')
							.setLabel('Approve Quote')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('adjustQuote')
							.setLabel('Adjust & Approve')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('denyQuote')
							.setLabel('Deny Quote')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('markAsContacted')
							.setLabel('Contacted?')
							.setStyle(ButtonStyle.Primary),
					)];

					let approvalMsgNotes;
					let approvalMsgEmbed = [];

					await dbCmds.addOnePersStat(interaction.member.id, 'quotesReviewed');
					await dbCmds.addOnePersStat(interaction.member.id, 'monthlyQuotesReviewed');
					await editEmbed.editMainEmbed(interaction.client);

					if (approvalNotes) {
						if (mainEmbedFields[5]) {
							approvalMsgNotes = `${mainEmbedFields[5].value}\n- Quote approved for purchase at \`${formattedAdjustedPrice}\` by <@${interaction.member.id}> on ${approvalDate} with the following note \`${approvalNotes}\`.`;
						} else {
							approvalMsgNotes = `- Quote approved for purchase at \`${formattedAdjustedPrice}\` by <@${interaction.member.id}> on ${approvalDate} with the following note \`${approvalNotes}\`.`;
						}

						approvalMsgEmbed = [new EmbedBuilder()
							.setTitle('A quote you submitted has been approved with adjustments')
							.addFields(
								{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
								{ name: `Quote Link:`, value: `https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id}` },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` },
								{ name: `Adjustment Notes:`, value: `${approvalNotes}` }
							)
							.setColor('FFA630')];
					} else {
						if (mainEmbedFields[5]) {
							approvalMsgNotes = `${mainEmbedFields[5].value}\n- Quote approved for purchase at \`${formattedAdjustedPrice}\` by <@${interaction.member.id}> on ${approvalDate}.`;
						} else {
							approvalMsgNotes = `- Quote approved for purchase at \`${formattedAdjustedPrice}\` by <@${interaction.member.id}> on ${approvalDate}.`;
						}

						approvalMsgEmbed = [new EmbedBuilder()
							.setTitle('A quote you submitted has been approved with adjustments')
							.addFields(
								{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
								{ name: `Quote Link:`, value: `https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id}` },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` }
							)
							.setColor('FFA630')];
					}

					msgEmbeds[0] = new EmbedBuilder()
						.setTitle('A new Property Quote request has been submitted!')
						.addFields(
							{ name: `Realtor Name:`, value: `${mainEmbedFields[0].value}` },
							{ name: `Request Date:`, value: `${mainEmbedFields[1].value}` },
							{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
							{ name: `Estimated Price:`, value: `${mainEmbedFields[3].value}` },
							{ name: `Interior Type:`, value: `${mainEmbedFields[4].value}` },
							{ name: `Notes:`, value: `${approvalMsgNotes}` }
						)
						.setColor('A47E1B');

					await interaction.message.edit({ embeds: msgEmbeds, components: newQuoteBtns })

					await interaction.message.react('⚠');
					await interaction.message.react('✅');

					let quotePingSetting = await dbCmds.readPersSetting(interaction.member.id, 'settingQuotePing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (originalRealtorId.substring(2, (originalRealtorId.length - 1)) != interaction.user.id) {

						if (quotePingSetting) {
							await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorId}`, embeds: approvalMsgEmbed, components: acknowledgeAlertBtn });
						} else {
							await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorName}:`, embeds: approvalMsgEmbed, components: acknowledgeAlertBtn });
						}
					}

					await interaction.editReply({ content: `Successfully marked this quote as approved with adjustments.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Quote Approver\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyQuoteModal':
				if (interaction.member._roles.includes(process.env.QUOTE_APPROVER_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

					let denialNotes = strCleanup(interaction.fields.getTextInputValue('denyNotesInput'));

					let denialNow = Math.floor(new Date().getTime() / 1000.0);
					let denialDate = `<t:${denialNow}:d>`;

					let msgEmbeds = interaction.message.embeds;

					let mainEmbedFields = msgEmbeds[0].data.fields;

					let originalRealtor = mainEmbedFields[0].value;
					let originalRealtorId = originalRealtor.substring((originalRealtor.indexOf(`(`) + 1), originalRealtor.indexOf(`)`));
					let originalRealtorName = originalRealtor.substring(0, (originalRealtor.indexOf(`(`) - 1));

					let newQuoteBtns = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveQuote')
							.setLabel('Approve Quote')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('adjustQuote')
							.setLabel('Adjust & Approve')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('denyQuote')
							.setLabel('Deny Quote')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('markAsContacted')
							.setLabel('Contacted?')
							.setStyle(ButtonStyle.Primary),
					)];

					let denialMsgNotes;
					let denialMsgEmbed = [];

					await dbCmds.addOnePersStat(interaction.member.id, 'quotesReviewed');
					await dbCmds.addOnePersStat(interaction.member.id, 'monthlyQuotesReviewed');
					await editEmbed.editMainEmbed(interaction.client);

					if (denialNotes) {
						if (mainEmbedFields[5]) {
							denialMsgNotes = `${mainEmbedFields[5].value}\n- Quote denied by <@${interaction.member.id}> on ${denialDate} with the following note \`${denialNotes}\`.`;
						} else {
							denialMsgNotes = `- Quote denied by <@${interaction.member.id}> on ${denialDate} with the following note \`${denialNotes}\`.`;
						}

						denialMsgEmbed = [new EmbedBuilder()
							.setTitle('A quote you submitted has been denied')
							.addFields(
								{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
								{ name: `Quote Link:`, value: `https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id}` },
								{ name: `Denied By:`, value: `<@${interaction.member.id}>` },
								{ name: `Denial Notes:`, value: `${denialNotes}` }
							)
							.setColor('B80600')];
					} else {
						if (mainEmbedFields[5]) {
							denialMsgNotes = `${mainEmbedFields[5].value}\n- Quote denied by <@${interaction.member.id}> on ${denialDate}.`;
						} else {
							denialMsgNotes = `- Quote denied by <@${interaction.member.id}> on ${denialDate}.`;
						}

						denialMsgEmbed = [new EmbedBuilder()
							.setTitle('A quote you submitted has been denied')
							.addFields(
								{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
								{ name: `Quote Link:`, value: `https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id}` },
								{ name: `Denied By:`, value: `<@${interaction.member.id}>` }
							)
							.setColor('B80600')];
					}

					msgEmbeds[0] = new EmbedBuilder()
						.setTitle('A new Property Quote request has been submitted!')
						.addFields(
							{ name: `Realtor Name:`, value: `${mainEmbedFields[0].value}` },
							{ name: `Request Date:`, value: `${mainEmbedFields[1].value}` },
							{ name: `Client Information:`, value: `${mainEmbedFields[2].value}` },
							{ name: `Estimated Price:`, value: `${mainEmbedFields[3].value}` },
							{ name: `Interior Type:`, value: `${mainEmbedFields[4].value}` },
							{ name: `Notes:`, value: `${denialMsgNotes}` }
						)
						.setColor('A47E1B');

					await interaction.message.edit({ embeds: msgEmbeds, components: newQuoteBtns })

					await interaction.message.react('❌');

					let quotePingSetting = await dbCmds.readPersSetting(interaction.member.id, 'settingQuotePing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (originalRealtorId.substring(2, (originalRealtorId.length - 1)) != interaction.user.id) {
						if (quotePingSetting) {
							await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorId}`, embeds: denialMsgEmbed, components: acknowledgeAlertBtn });
						} else {
							await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorName}:`, embeds: denialMsgEmbed, components: acknowledgeAlertBtn });
						}
					}

					await interaction.editReply({ content: `Successfully marked this quote as denied.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Quote Approver\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'addPropertyRepodModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var repoDate = `<t:${now}:d>`;

				var prevOwner = strCleanup(interaction.fields.getTextInputValue('prevOwnerInput'));
				var lotNumStreetName = strCleanup(interaction.fields.getTextInputValue('lotNumStreetNameInput'));
				var repoReason = strCleanup(interaction.fields.getTextInputValue('repoReasonInput'));
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Repo Logs!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, repoDate, prevOwner, lotNumStreetName, repoReason, notes, photosString]] }
				});

				var photos = [photosString];
				if (photosString.includes(",")) {
					photos = photosString.split(",")
				} else if (photosString.includes(";")) {
					photos = photosString.split(";")
				} else if (photosString.includes(" ")) {
					photos = photosString.split(" ")
				} else if (photosString.includes("|")) {
					photos = photosString.split("|")
				} else if (photos.length > 1) {
					await interaction.editReply({
						content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
						ephemeral: true
					});
					return;
				}

				for (let i = 0; i < photos.length; i++) {
					if (photos[i] == "") {
						photos.splice(i, 1);
						continue;
					}
					if (!isValidUrl(photos[i])) { // validate photo link
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (photos.length >= 10) {
					await interaction.editReply({
						content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
						ephemeral: true
					});
					return;
				}

				if (notes) {
					var embeds = [new EmbedBuilder()
						.setTitle('A new property repossession has been completed!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Repossession Date:`, value: `${repoDate}` },
							{ name: `Previous Owner Information:`, value: `${prevOwner}` },
							{ name: `Street Address:`, value: `${lotNumStreetName}` },
							{ name: `Reason for Repossession:`, value: `${repoReason}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('B69121')];
				} else {
					var embeds = [new EmbedBuilder()
						.setTitle('A new Property Repossession has been completed!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Repossession Date:`, value: `${repoDate}` },
							{ name: `Previous Owner Information:`, value: `${prevOwner}` },
							{ name: `Street Address:`, value: `${lotNumStreetName}` },
							{ name: `Reason for Repossession:`, value: `${repoReason}` },
						)
						.setColor('B69121')];
				}

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('B69121').setURL('https://echorp.net/').setImage(x));

				embeds = embeds.concat(photosEmbed);

				await interaction.client.channels.cache.get(process.env.REPO_LOGS_CHANNEL_ID).send({ embeds: embeds });
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countPropertiesRepod");
				await dbCmds.addOneSumm("countMonthlyPropertiesRepod");
				await dbCmds.addOnePersStat(interaction.member.user.id, "propertiesRepod");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyPropertiesRepod");
				await editEmbed.editMainEmbed(interaction.client);

				var reason = `Repossession of property number \`${lotNumStreetName}\` on ${repoDate}`

				var newPropertiesRepodTotal = await dbCmds.readSummValue("countPropertiesRepod");

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Properties Repossessed\` counter - the new total is \`${newPropertiesRepodTotal}\`.`, ephemeral: true });

				break;
			case 'addRepoRequestModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var reqDate = `<t:${now}:d>`;

				var ownerInfo = strCleanup(interaction.fields.getTextInputValue('currentOwnerInput'));
				var lotNumStreetName = strCleanup(interaction.fields.getTextInputValue('lotNumStreetNameInput'));
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Repo Request!A:F", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, reqDate, ownerInfo, lotNumStreetName, notes, photosString]] }
				});

				var photos = [photosString];
				if (photosString.includes(",")) {
					photos = photosString.split(",")
				} else if (photosString.includes(";")) {
					photos = photosString.split(";")
				} else if (photosString.includes(" ")) {
					photos = photosString.split(" ")
				} else if (photosString.includes("|")) {
					photos = photosString.split("|")
				} else if (photos.length > 1) {
					await interaction.editReply({
						content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
						ephemeral: true
					});
					return;
				}

				for (let i = 0; i < photos.length; i++) {
					if (photos[i] == "") {
						photos.splice(i, 1);
						continue;
					}
					if (!isValidUrl(photos[i])) { // validate photo link
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (photos.length >= 10) {
					await interaction.editReply({
						content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
						ephemeral: true
					});
					return;
				}

				if (notes) {
					var embeds = [new EmbedBuilder()
						.setTitle('A new Repossession Request has been submitted!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Request Date:`, value: `${reqDate}` },
							{ name: `Owner Information:`, value: `${ownerInfo}` },
							{ name: `Street Address:`, value: `${lotNumStreetName}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('C9A227')];
				} else {
					var embeds = [new EmbedBuilder()
						.setTitle('A new Repossession Request has been submitted!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Request Date:`, value: `${reqDate}` },
							{ name: `Owner Information:`, value: `${ownerInfo}` },
							{ name: `Street Address:`, value: `${lotNumStreetName}` }
						)
						.setColor('C9A227')];
				}

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('C9A227').setURL('https://echorp.net/').setImage(x));
				embeds = embeds.concat(photosEmbed);

				let trainActivityBtns = [new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('approveRepo')
						.setLabel('Approve Repo')
						.setStyle(ButtonStyle.Success),

					new ButtonBuilder()
						.setCustomId('recheckRepo')
						.setLabel('Mark for Recheck')
						.setStyle(ButtonStyle.Primary),

					new ButtonBuilder()
						.setCustomId('denyRepo')
						.setLabel('Deny Repo')
						.setStyle(ButtonStyle.Danger),
				)];

				await interaction.client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ embeds: embeds, components: trainActivityBtns });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countTrainActivitiesChecked");
				await dbCmds.addOneSumm("countMonthlyTrainActivitiesChecked");
				await dbCmds.addOnePersStat(interaction.member.user.id, "activityChecks");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyActivityChecks");
				await editEmbed.editMainEmbed(interaction.client);
				var newTrainActivyChecksTotal = await dbCmds.readSummValue("countTrainActivitiesChecked");
				await interaction.editReply({ content: `Successfully added \`1\` to the \`Train Activities\` counter - the new total is \`${newTrainActivyChecksTotal}\`.`, ephemeral: true });
				break;
			case 'addFinancingAgreementModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;
				var latestFinanceNum = await dbCmds.readFinanceNum('financeNum');
				var currentFinanceNum = latestFinanceNum + 1;
				await dbCmds.setFinanceNum('financeNum', currentFinanceNum);
				var financeNum = `${currentFinanceNum}`.padStart(5, '0');
				financeNum = `H${financeNum}`;

				var clientName = strCleanup(interaction.fields.getTextInputValue('clientNameInput'));
				var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInfoInput'));
				var clientContact = strCleanup(interaction.fields.getTextInputValue('clientContactInput'));
				var lotNumStreetName = strCleanup(interaction.fields.getTextInputValue('lotNumStreetNameInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));

				if (isNaN(price)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				let paidOffDays;

				if (price <= 100000) {
					paidOffDays = 20;
				} else if (price > 100000 && price <= 200000) {
					paidOffDays = 25;
				} else if (price > 200000 && price <= 300000) {
					paidOffDays = 30;
				} else if (price > 300000 && price <= 400000) {
					paidOffDays = 35;
				} else if (price > 400000 && price <= 500000) {
					paidOffDays = 40;
				} else if (price > 500000 && price <= 600000) {
					paidOffDays = 45;
				} else if (price > 600000 && price <= 700000) {
					paidOffDays = 50;
				} else if (price > 700000 && price <= 800000) {
					paidOffDays = 55;
				} else if (price > 800000 && price <= 900000) {
					paidOffDays = 60;
				} else {
					let formattedPrice = formatter.format(price);
					await interaction.editReply({
						content: `:exclamation: We are unable to finance for \`${formattedPrice}\` at this time, please be sure you're entering less than \`$900,000\` for the price.`,
						ephemeral: true
					});
					return;
				}

				let paidOffDueDateTime = now + (86400 * paidOffDays); // 86400 seconds in a day times paidOffDays days
				let paidOffDueDate = `<t:${paidOffDueDateTime}:d>`;
				let paidOffDueDateRelative = `<t:${paidOffDueDateTime}:R>`;

				var downPayment = (price * 0.1);
				var interest = ((price - downPayment) * 0.1);
				var amountOwed = (price - downPayment + interest);
				var totalOwed = (price + interest);

				var formattedPrice = formatter.format(price);
				var formattedDownPayment = formatter.format(downPayment);
				var formattedAmountOwed = formatter.format(amountOwed);
				var formattedTotalOwed = formatter.format(totalOwed);
				var formattedInterest = formatter.format(interest);

				let newFile = await interaction.client.driveFiles.copy({
					auth: interaction.client.driveAuth, fileId: process.env.FINANCE_TEMPLATE_DOC_ID, resource: { name: `${clientName} | Dynasty 8 Financing & Sales Agreement` }
				});

				let documentLink = `https://docs.google.com/document/d/${newFile.data.id}`;

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Finance Agreements!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, paidOffDueDate, clientName, clientInfo, clientContact, lotNumStreetName, price, documentLink]] }
				});

				let todayDateString = moment().format('MMMM DD, YYYY');
				let paidOffDateString = moment.unix(paidOffDueDateTime).format('MMMM DD, YYYY');

				await interaction.client.googleDocs.batchUpdate({
					auth: interaction.client.driveAuth, documentId: newFile.data.id, resource: {
						requests: [{
							replaceAllText: {
								replaceText: clientName,
								containsText: {
									"text": "{client_name}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: clientInfo,
								containsText: {
									"text": "{client_info}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: clientContact,
								containsText: {
									"text": "{client_contact}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: todayDateString,
								containsText: {
									"text": "{today_date}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: paidOffDateString,
								containsText: {
									"text": "{paid_off_date}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: lotNumStreetName,
								containsText: {
									"text": "{street_address}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedPrice,
								containsText: {
									"text": "{purchase_price}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedDownPayment,
								containsText: {
									"text": "{down_payment}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedTotalOwed,
								containsText: {
									"text": "{total_owed}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: financeNum,
								containsText: {
									"text": "{financing_number}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: realtorName,
								containsText: {
									"text": "{realtor_name}",
									"matchCase": true
								}
							},
						}]
					}
				});

				var embeds = [new EmbedBuilder()
					.setTitle('A new Financing Agreement has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}`, inline: true },
						{ name: `Paid Off Due Date:`, value: `${paidOffDueDate} (${paidOffDueDateRelative})`, inline: true },
						{ name: `Financing ID Number:`, value: `${financeNum}` },
						{ name: `Client Name:`, value: `${clientName}`, inline: true },
						{ name: `Client Info:`, value: `${clientInfo}`, inline: true },
						{ name: `Client Contact:`, value: `${clientContact}`, inline: true },
						{ name: `Street Address:`, value: `${lotNumStreetName}` },
						{ name: `Sale Price:`, value: `${formattedPrice}`, inline: true },
						{ name: `Down Payment:`, value: `${formattedDownPayment}`, inline: true },
						{ name: `Amount Owed:`, value: `${formattedAmountOwed}`, inline: true },
						{ name: `Financing Agreement:`, value: `[Click to view Financing Agreement](<${documentLink}>)` },
					)
					.setColor('FAD643')];

				await interaction.client.channels.cache.get(process.env.FINANCING_AGREEMENTS_CHANNEL_ID).send({ embeds: embeds });

				await dbCmds.addOneSumm("countFinancialAgreements");
				await dbCmds.addOneSumm("countMonthlyFinancialAgreements");
				await dbCmds.addOneSumm("activeFinancialAgreements");
				await dbCmds.addValueSumm("activeFinancialAmount", Math.round(amountOwed));
				await dbCmds.addOnePersStat(interaction.member.user.id, "financialAgreements");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyFinancialAgreements");

				await editEmbed.editMainEmbed(interaction.client);

				var newFinancialAgreementsTotal = await dbCmds.readSummValue("countFinancialAgreements");

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Financial Agreements\` counter and added this sale to the <#${process.env.FINANCING_AGREEMENTS_CHANNEL_ID}> channel - the new total is \`${newFinancialAgreementsTotal}\`.\n\nDetails about this agreement:\n> Sale Price: \`${formattedPrice}\`\n> Down Payment: \`${formattedDownPayment}\`\n> Interest Cost: \`${formattedInterest}\`\n> Amount Owed Remaining: \`${formattedAmountOwed}\`\n> Days to Pay Off: \`${paidOffDays}\` (${paidOffDueDate})\n> Financing Agreement: [Click to view Financing Agreement](<${documentLink}>)`, ephemeral: true });
				break;
			case 'addYPAdvertModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var adDate = `<t:${now}:d>`;

				var screenshotLink = strCleanup(interaction.fields.getTextInputValue('screenshotInput'));

				if (!isValidUrl(screenshotLink)) { // validate photo link
					await interaction.editReply({
						content: `:exclamation: \`${screenshotLink}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
						ephemeral: true
					});
					return;
				}
				var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
				if (!RegExp(allowedValues.join('|')).test(screenshotLink.toLowerCase())) { // validate photo link, again
					await interaction.editReply({
						content: `:exclamation: \`${screenshotLink}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
						ephemeral: true
					});
					return;
				}

				var realtorCommission = 526;
				var formattedCommission = formatter.format(realtorCommission);

				var embeds = new EmbedBuilder()
					.setTitle('A new Misc. Sale has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Ad Date:`, value: `${adDate}` },
					)
					.setColor('DBB42C');

				var photosEmbed = new EmbedBuilder()
					.setColor('DBB42C')
					.setURL('https://echorp.net/')
					.setImage(screenshotLink);

				await interaction.client.channels.cache.get(process.env.MISC_SALES_CHANNEL_ID).send({ embeds: [embeds, photosEmbed] });

				var reason = `Yellow Pages ad listed on ${adDate}`;
				var currMiscPay = await commissionCmds.addMiscPay(interaction.client, 'System', realtorCommission, interaction.member.user.id, reason);

				await interaction.editReply({ content: `Successfully logged this Yellow Pages ad listing.\n\nDetails about this listing:\n> Your Misc. Pay: \`${formattedCommission}\`\n\nYour miscellaneous pay is now: \`${currMiscPay}\`.`, ephemeral: true });

				break;
			case 'addReimbursementReqModal':
				var requestorName;
				if (interaction.member.nickname) {
					requestorName = interaction.member.nickname;
				} else {
					requestorName = interaction.member.user.username;
				}

				var personnelStats = await dbCmds.readPersStats(interaction.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.user.id);
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var requestDate = `<t:${now}:d>`;

				var refundReason = strCleanup(interaction.fields.getTextInputValue('reasonInput'));
				var refundProof = strCleanup(interaction.fields.getTextInputValue('proofInput'));
				var refundAmount = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('amountInput')).replaceAll(',', '').replaceAll('$', '')));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Reimbursement Requests!A:D", valueInputOption: "RAW", resource: { values: [[`${requestorName} (<@${interaction.user.id}>)`, refundReason, refundAmount, refundProof]] }
				});

				if (isNaN(refundAmount)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('amountInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var photos = [refundProof];
				if (refundProof.includes(",")) {
					photos = refundProof.split(",")
				} else if (refundProof.includes(";")) {
					photos = refundProof.split(";")
				} else if (refundProof.includes(" ")) {
					photos = refundProof.split(" ")
				} else if (refundProof.includes("|")) {
					photos = refundProof.split("|")
				} else if (photos.length > 1) {
					await interaction.editReply({
						content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
						ephemeral: true
					});
					return;
				}

				for (let i = 0; i < photos.length; i++) {
					if (photos[i] == "") {
						photos.splice(i, 1);
						continue;
					}
					if (!isValidUrl(photos[i])) { // validate photo link
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.editReply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (refundProof.length > 1024) {
					await interaction.editReply({
						content: `:exclamation: The length of your photos input is too long. We'd recommend downloading [ShareX](<https://getsharex.com>) (preferred) or uploading them to [Imgur](<https://imgur.com>).`,
						ephemeral: true
					});
					return;
				}

				if (photos.length >= 10) {
					await interaction.editReply({
						content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
						ephemeral: true
					});
					return;
				}

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('DBB42C').setURL('https://echorp.net/').setImage(x));

				var formattedAmount = formatter.format(refundAmount);

				var embeds;

				if (refundProof) {
					embeds = [new EmbedBuilder()
						.setTitle('A new reimbusement request has been submitted!')
						.addFields(
							{ name: `Requestor Name:`, value: `${requestorName} (<@${interaction.user.id}>)` },
							{ name: `Request Date:`, value: `${requestDate}` },
							{ name: `Reimbursement Reason:`, value: `${refundReason}`, inline: true },
							{ name: `Amount Requested:`, value: `${formattedAmount}`, inline: true },
						)
						.setColor('DBB42C')];
				} else {
					embeds = [new EmbedBuilder()
						.setTitle('A new reimbusement request has been submitted!')
						.addFields(
							{ name: `Requestor Name:`, value: `${requestorName} (<@${interaction.user.id}>)` },
							{ name: `Request Date:`, value: `${requestDate}` },
							{ name: `Reimbursement Reason:`, value: `${refundReason}`, inline: true },
							{ name: `Amount Requested:`, value: `${formattedAmount}`, inline: true },
						)
						.setColor('DBB42C')];
				}

				embeds = embeds.concat(photosEmbed);


				function addreimbursementBtns() {
					let row1 = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveReimbursement')
							.setLabel('Approve Reimbursement')
							.setStyle(ButtonStyle.Success),

						new ButtonBuilder()
							.setCustomId('denyReimbursement')
							.setLabel('Deny Reimbursement')
							.setStyle(ButtonStyle.Danger),
					);

					let rows = [row1];
					return rows;
				};


				var reimbursementReqBtns = addreimbursementBtns();

				await interaction.client.channels.cache.get(process.env.REIMBURSEMENT_REQ_CHANNEL_ID).send({ embeds: embeds, components: reimbursementReqBtns });

				await interaction.editReply({ content: `Successfully submitted a reimbusement request for \`${formattedAmount}\`. You will be notified once Management has reviewed your request.`, ephemeral: true });
				break;
			case 'approveReimbursementModal':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let todayDate = `<t:${now}:d>`;

					let approvalNotes = strCleanup(interaction.fields.getTextInputValue('approveNotesInput'));

					let oldEmbeds = interaction.message.embeds;

					let originalUserStr = oldEmbeds[0].data.fields[0].value;
					let originalUserName = originalUserStr.substring(0, (originalUserStr.indexOf(' (')));
					let originalUser = originalUserStr.substring((originalUserStr.indexOf(' (') + 2), originalUserStr.indexOf(')'));
					let originalUserId = originalUser.replaceAll('<@', '').replaceAll('>', '');

					let reimburseReason = oldEmbeds[0].data.fields[2].value;
					let amountStr = oldEmbeds[0].data.fields[3].value;
					let amountNum = amountStr.replaceAll('$', '').replaceAll(',', '');

					let reason = `Reimbursement approved for \`${reimburseReason}\``;

					let notes;
					let alertEmbed = [];

					if (approvalNotes) {
						notes = `Approved by <@${interaction.member.id}> on ${todayDate} with note \`${approvalNotes}\`.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A reimbursement request you submitted has been approved')
							.addFields(
								{ name: `Reimbursement Reason:`, value: `${reimburseReason}` },
								{ name: `Amount Requested:`, value: `${amountStr}` },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` },
								{ name: `Approval Notes:`, value: `${approvalNotes}` }
							)
							.setColor('1EC276')];

					} else {
						notes = `Approved by <@${interaction.member.id}> on ${todayDate}.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A reimbursement request you submitted has been approved')
							.addFields(
								{ name: `Reimbursement Reason:`, value: `${reimburseReason}` },
								{ name: `Amount Requested:`, value: `${amountStr}` },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` },
							)
							.setColor('1EC276')];
					}

					oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `${notes}` };

					function addReimbursementBtnsDisabled() {
						let row1 = new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('approveReimbursement')
								.setLabel('Approve Reimbursement')
								.setStyle(ButtonStyle.Success)
								.setDisabled(true),

							new ButtonBuilder()
								.setCustomId('denyReimbursement')
								.setLabel('Deny Reimbursement')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
						);

						let rows = [row1];
						return rows;
					};

					await commissionCmds.addMiscPay(interaction.client, 'System', amountNum, originalUserId, reason);

					let reimbursementBtnsDisabled = addReimbursementBtnsDisabled();

					await interaction.message.edit({ embeds: oldEmbeds, components: reimbursementBtnsDisabled });

					let settingReimbursementPing = await dbCmds.readPersSetting(originalUserId, 'settingReimbursementPing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (settingReimbursementPing) {
						await interaction.client.channels.cache.get(process.env.REIMBURSEMENT_REQ_CHANNEL_ID).send({ content: `${originalUser}`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					} else {
						await interaction.client.channels.cache.get(process.env.REIMBURSEMENT_REQ_CHANNEL_ID).send({ content: `${originalUserName}:`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					}

					await interaction.editReply({ content: `Successfully approved the reimbursement request for \`${amountStr}\` for <@${originalUserId}>.`, ephemeral: true });

				} else {
					await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyReimbursementModal':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let todayDate = `<t:${now}:d>`;

					let denyNotes = strCleanup(interaction.fields.getTextInputValue('denyNotesInput'));

					let oldEmbeds = interaction.message.embeds;

					let originalUserStr = oldEmbeds[0].data.fields[0].value;
					let originalUserName = originalUserStr.substring(0, (originalUserStr.indexOf(' (')));
					let originalUser = originalUserStr.substring((originalUserStr.indexOf(' (') + 2), originalUserStr.indexOf(')'));
					let originalUserId = originalUser.replaceAll('<@', '').replaceAll('>', '');

					let reimburseReason = oldEmbeds[0].data.fields[2].value;
					let amountStr = oldEmbeds[0].data.fields[3].value;

					let notes;
					let alertEmbed = [];

					if (denyNotes) {
						notes = `Denied by <@${interaction.member.id}> on ${todayDate} with note \`${denyNotes}\`.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A reimbursement request you submitted has been denied')
							.addFields(
								{ name: `Reimbursement Reason:`, value: `${reimburseReason}` },
								{ name: `Amount Requested:`, value: `${amountStr}` },
								{ name: `Denied By:`, value: `<@${interaction.member.id}>` },
								{ name: `Denial Notes:`, value: `${denyNotes}` }
							)
							.setColor('B80600')];

					} else {
						notes = `Denied by <@${interaction.member.id}> on ${todayDate}.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A reimbursement request you submitted has been denied')
							.addFields(
								{ name: `Reimbursement Reason:`, value: `${reimburseReason}` },
								{ name: `Amount Requested:`, value: `${amountStr}` },
								{ name: `Denied By:`, value: `<@${interaction.member.id}>` },
							)
							.setColor('B80600')];
					}

					oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `${notes}` };

					function addReimbursementBtnsDisabled() {
						let row1 = new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('approveReimbursement')
								.setLabel('Approve Reimbursement')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),

							new ButtonBuilder()
								.setCustomId('denyReimbursement')
								.setLabel('Deny Reimbursement')
								.setStyle(ButtonStyle.Danger)
								.setDisabled(true),
						);

						let rows = [row1];
						return rows;
					};

					let reimbursementBtnsDisabled = addReimbursementBtnsDisabled();

					await interaction.message.edit({ embeds: oldEmbeds, components: reimbursementBtnsDisabled });

					let settingReimbursementPing = await dbCmds.readPersSetting(originalUserId, 'settingReimbursementPing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (settingReimbursementPing) {
						await interaction.client.channels.cache.get(process.env.REIMBURSEMENT_REQ_CHANNEL_ID).send({ content: `${originalUser}`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					} else {
						await interaction.client.channels.cache.get(process.env.REIMBURSEMENT_REQ_CHANNEL_ID).send({ content: `${originalUserName}:`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					}

					await interaction.editReply({ content: `Successfully denied the reimbursement request for \`${amountStr}\` for <@${originalUserId}>.`, ephemeral: true });

				} else {
					await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'approveRepoModal':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let todayDate = `<t:${now}:d>`;

					let originalUserStr = interaction.message.embeds[0].data.fields[0].value;
					let originalUserName = originalUserStr.substring(0, (originalUserStr.indexOf(' (')));
					let originalUser = originalUserStr.substring((originalUserStr.indexOf(' (') + 2), originalUserStr.indexOf(')'));
					let originalUserId = originalUser.replaceAll('<@', '').replaceAll('>', '');

					let approveNotes = strCleanup(interaction.fields.getTextInputValue('approveNotesInput'));
					let oldEmbeds = interaction.message.embeds;
					let alertEmbed = [];
					let notes;

					if (approveNotes) {
						notes = `Repossession approved by <@${interaction.member.id}> on ${todayDate} with note \`${approveNotes}\`.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A repossession request you submitted has been approved!')
							.addFields(
								{ name: `Property Owner:`, value: `${oldEmbeds[0].data.fields[2].value}`, inline: true },
								{ name: `Street Address:`, value: `${oldEmbeds[0].data.fields[3].value}`, inline: true },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` },
								{ name: `Approval Notes:`, value: `${approveNotes}` }
							)
							.setColor('1EC276')];
					} else {
						notes = `Repossession approved by <@${interaction.member.id}> on ${todayDate}.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A repossession request you submitted has been approved!')
							.addFields(
								{ name: `Property Owner:`, value: `${oldEmbeds[0].data.fields[2].value}`, inline: true },
								{ name: `Street Address:`, value: `${oldEmbeds[0].data.fields[3].value}`, inline: true },
								{ name: `Approved By:`, value: `<@${interaction.member.id}>` },
							)
							.setColor('1EC276')];
					}

					if (oldEmbeds[0].data.fields[4]) {
						oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `${oldEmbeds[0].data.fields[4].value}\n- ${notes}` };
					} else {
						oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `- ${notes}` };
					}

					let trainActivityBtnsDisabled = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveRepo')
							.setLabel('Approve Repo')
							.setStyle(ButtonStyle.Success)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('recheckRepo')
							.setLabel('Mark for Recheck')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('denyRepo')
							.setLabel('Deny Repo')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('markAsRepod')
							.setLabel('Repo Completed?')
							.setStyle(ButtonStyle.Primary),
					)];

					await interaction.message.edit({ embeds: oldEmbeds, components: trainActivityBtnsDisabled });

					let settingRepossessionPing = await dbCmds.readPersSetting(originalUserId, 'settingRepossessionPing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (settingRepossessionPing) {
						await interaction.client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ content: `${originalUser}`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					} else {
						await interaction.client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ content: `${originalUserName}:`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					}

					await interaction.editReply({ content: `Successfully approved the repossession request for \`${oldEmbeds[0].data.fields[2].value}\`.`, ephemeral: true });

				} else {
					await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'recheckRepoModal':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let todayDate = `<t:${now}:d>`;

					let originalUserStr = interaction.message.embeds[0].data.fields[0].value;
					let originalUserName = originalUserStr.substring(0, (originalUserStr.indexOf(' (')));
					let originalUser = originalUserStr.substring((originalUserStr.indexOf(' (') + 2), originalUserStr.indexOf(')'));
					let originalUserId = originalUser.replaceAll('<@', '').replaceAll('>', '');

					let recheckNotes = strCleanup(interaction.fields.getTextInputValue('recheckNotesInput'));
					let recheckDaysInput = Number(strCleanup(interaction.fields.getTextInputValue('recheckDaysInput')));
					let oldEmbeds = interaction.message.embeds;
					let alertEmbed = [];
					let notes;

					if (isNaN(recheckDaysInput)) { // validate quantity of days
						await interaction.editReply({
							content: `:exclamation: \`${interaction.fields.getTextInputValue('recheckDaysInput')}\` is not a valid number, please be sure to only enter numbers.`,
							ephemeral: true
						});
						return;
					}

					let recheckDateTime = (now + (recheckDaysInput * 86400));

					if (recheckNotes) {
						notes = `Repossession marked for recheck in ${recheckDaysInput} days by <@${interaction.member.id}> on ${todayDate} with note \`${recheckNotes}\`.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A repossession request you submitted has been marked for recheck!')
							.addFields(
								{ name: `Property Owner:`, value: `${oldEmbeds[0].data.fields[2].value}`, inline: true },
								{ name: `Street Address:`, value: `${oldEmbeds[0].data.fields[3].value}`, inline: true },
								{ name: `Recheck Available On:`, value: `<t:${recheckDateTime}:d>` },
								{ name: `Marked for Recheck By:`, value: `<@${interaction.member.id}>` },
								{ name: `Recheck Notes:`, value: `${recheckNotes}` }
							)
							.setColor('FFA630')];
					} else {
						notes = `Repossession marked for recheck in ${recheckDaysInput} days by <@${interaction.member.id}> on ${todayDate}.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A repossession request you submitted has been marked for recheck!')
							.addFields(
								{ name: `Property Owner:`, value: `${oldEmbeds[0].data.fields[2].value}`, inline: true },
								{ name: `Street Address:`, value: `${oldEmbeds[0].data.fields[3].value}`, inline: true },
								{ name: `Recheck Available On:`, value: `<t:${recheckDateTime}:d>` },
								{ name: `Marked for Recheck By:`, value: `<@${interaction.member.id}>` },
							)
							.setColor('FFA630')];
					}

					if (oldEmbeds[0].data.fields[4]) {
						oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `${oldEmbeds[0].data.fields[4].value}\n- ${notes}` };
					} else {
						oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `- ${notes}` };
					}

					let trainActivityBtnsDisabled = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveRepo')
							.setLabel('Approve Repo')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('recheckRepo')
							.setLabel('Mark for Recheck')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('denyRepo')
							.setLabel('Deny Repo')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),
					)];

					let uniqueId = uuidv4();

					let msgLink = `https://discord.com/channels/${interaction.message.guildId}/${interaction.message.channelId}/${interaction.message.id}`;

					await dbCmds.addRepoRecheck(uniqueId, oldEmbeds[0].data.fields[2].value, oldEmbeds[0].data.fields[3].value, recheckDateTime, msgLink);

					await interaction.message.edit({ embeds: oldEmbeds, components: trainActivityBtnsDisabled });

					let settingRepossessionPing = await dbCmds.readPersSetting(originalUserId, 'settingRepossessionPing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (settingRepossessionPing) {
						await interaction.client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ content: `${originalUser}`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					} else {
						await interaction.client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ content: `${originalUserName}:`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					}

					await interaction.editReply({ content: `Successfully marked the repossession request for \`${oldEmbeds[0].data.fields[2].value}\` for recheck in \`${recheckDaysInput}\` days.`, ephemeral: true });

				} else {
					await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyRepoModal':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let todayDate = `<t:${now}:d>`;

					let originalUserStr = interaction.message.embeds[0].data.fields[0].value;
					let originalUserName = originalUserStr.substring(0, (originalUserStr.indexOf(' (')));
					let originalUser = originalUserStr.substring((originalUserStr.indexOf(' (') + 2), originalUserStr.indexOf(')'));
					let originalUserId = originalUser.replaceAll('<@', '').replaceAll('>', '');

					let denyNotes = strCleanup(interaction.fields.getTextInputValue('denyNotesInput'));
					let oldEmbeds = interaction.message.embeds;
					let alertEmbed = [];
					let notes;

					if (denyNotes) {
						notes = `Repossession denied by <@${interaction.member.id}> on ${todayDate} with note \`${denyNotes}\`.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A repossession request you submitted has been denied!')
							.addFields(
								{ name: `Property Owner:`, value: `${oldEmbeds[0].data.fields[2].value}`, inline: true },
								{ name: `Street Address:`, value: `${oldEmbeds[0].data.fields[3].value}`, inline: true },
								{ name: `Denial By:`, value: `<@${interaction.member.id}>` },
								{ name: `Denial Notes:`, value: `${denyNotes}` }
							)
							.setColor('B80600')];
					} else {
						notes = `Repossession denied by <@${interaction.member.id}> on ${todayDate}.`

						alertEmbed = [new EmbedBuilder()
							.setTitle('A repossession request you submitted has been denied!')
							.addFields(
								{ name: `Property Owner:`, value: `${oldEmbeds[0].data.fields[2].value}`, inline: true },
								{ name: `Street Address:`, value: `${oldEmbeds[0].data.fields[3].value}`, inline: true },
								{ name: `Denial By:`, value: `<@${interaction.member.id}>` },
							)
							.setColor('B80600')];
					}

					if (oldEmbeds[0].data.fields[4]) {
						oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `${oldEmbeds[0].data.fields[4].value}\n- ${notes}` };
					} else {
						oldEmbeds[0].data.fields[4] = { name: `Notes:`, value: `- ${notes}` };
					}

					let trainActivityBtnsDisabled = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveRepo')
							.setLabel('Approve Repo')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('recheckRepo')
							.setLabel('Mark for Recheck')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('denyRepo')
							.setLabel('Deny Repo')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),
					)];

					await interaction.message.edit({ embeds: oldEmbeds, components: trainActivityBtnsDisabled });

					let settingRepossessionPing = await dbCmds.readPersSetting(originalUserId, 'settingRepossessionPing');

					let acknowledgeAlertBtn = getAckAlertBtn();

					if (settingRepossessionPing) {
						await interaction.client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ content: `${originalUser}`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					} else {
						await interaction.client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ content: `${originalUserName}:`, embeds: alertEmbed, components: acknowledgeAlertBtn });
					}

					await interaction.editReply({ content: `Successfully denied the repossession request for \`${oldEmbeds[0].data.fields[2].value}\`.`, ephemeral: true });

				} else {
					await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'completeRepoModal':
				if (1 == 1) {
					let realtorName;
					if (interaction.member.nickname) {
						realtorName = interaction.member.nickname;
					} else {
						realtorName = interaction.member.user.username;
					}

					let now = Math.floor(new Date().getTime() / 1000.0);
					let repoDate = `<t:${now}:d>`;

					let prevEmbeds = interaction.message.embeds;
					let lotNumStreetName = prevEmbeds[0].data.fields[3].value;
					let prevNotes = prevEmbeds[0].data.fields[4].value;

					let repoReason = strCleanup(interaction.fields.getTextInputValue('completeRepoReasonInput'));

					prevEmbeds[0].data.title = "A Property Repossession has been completed!"
					prevEmbeds[0].data.fields[4] = { name: `Reason for Repossession:`, value: `${repoReason}` };
					prevEmbeds[0].data.fields[5] = { name: `Notes:`, value: `${prevNotes}\n- Repossesion completed by <@${interaction.user.id}> on ${repoDate}.` };

					let trainActivityBtnsDisabled = [new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('approveRepo')
							.setLabel('Approve Repo')
							.setStyle(ButtonStyle.Success)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('recheckRepo')
							.setLabel('Mark for Recheck')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('denyRepo')
							.setLabel('Deny Repo')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true),

						new ButtonBuilder()
							.setCustomId('markAsRepod')
							.setLabel('Repo Completed?')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),
					)];

					await dbCmds.addOneSumm("countPropertiesRepod");
					await dbCmds.addOneSumm("countMonthlyPropertiesRepod");
					await dbCmds.addOnePersStat(interaction.member.user.id, "propertiesRepod");
					await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyPropertiesRepod");
					await editEmbed.editMainEmbed(interaction.client);

					await interaction.client.channels.cache.get(process.env.REPO_LOGS_CHANNEL_ID).send({ embeds: prevEmbeds, components: trainActivityBtnsDisabled });

					await interaction.message.delete();

					await interaction.editReply({ content: `Successfully marked the property at address \`${lotNumStreetName}\` as repossessed.`, ephemeral: true });
				}
				break;
			case 'markPaymentsCompleteModal':
				if (interaction.member._roles.includes(process.env.FINANCING_MGR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

					var completedNotes = strCleanup(interaction.fields.getTextInputValue('completedNotesInput'));

					var currentMsg = interaction.message;

					var msgFinanceNum = currentMsg.embeds[0].data.fields[3].value;
					if (currentMsg.embeds[0].data.fields[12]) {
						var msgNotes = currentMsg.embeds[0].data.fields[12].value;
					}

					var now = Math.floor(new Date().getTime() / 1000.0);
					var markCompletedDate = `<t:${now}:d>`;

					if (currentMsg.embeds[0].data.fields[12]) {
						if (completedNotes) {
							currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `${msgNotes}\n- Payments marked as completed <@${interaction.user.id}> on ${markCompletedDate} with the following note \`${completedNotes}\`.` };
						} else {
							currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `${msgNotes}\n- Payments marked as completed <@${interaction.user.id}> on ${markCompletedDate}.` };
						}
					} else {
						if (completedNotes) {
							currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `- Payments marked as completed <@${interaction.user.id}> on ${markCompletedDate} with the following note \`${completedNotes}\`.` };
						} else {
							currentMsg.embeds[0].data.fields[12] = { name: `Notes:`, value: `- Payments marked as completed <@${interaction.user.id}> on ${markCompletedDate}.` };
						}
					}

					await dbCmds.subtractOneSumm("activeFinancialAgreements");
					await editEmbed.editMainEmbed(interaction.client);

					let btnRows = addBtnRows();
					await interaction.client.channels.cache.get(process.env.COMPLETED_FINANCING_CHANNEL_ID).send({ embeds: currentMsg.embeds, components: btnRows });
					await currentMsg.delete();

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

					await interaction.editReply({ content: `Successfully marked the payments for the \`${msgFinanceNum}\` Financing Agreement as completed.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Financing Manager\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'garageSlotsModal':
				if (1 == 1) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let today = `<t:${now}:d>`;
					let newGarageSlotsNumInput = Math.abs(strCleanup(interaction.fields.getTextInputValue('garageSlotsNumInput')));

					if (isNaN(newGarageSlotsNumInput)) { // validate quantity of garage slots
						await interaction.editReply({
							content: `:exclamation: \`${interaction.fields.getTextInputValue('garageSlotsNumInput')}\` is not a valid number, please be sure to only enter numbers.`,
							ephemeral: true
						});
						return;
					}

					let embedTitle = interaction.message.embeds[0].data.title;
					if (embedTitle.toLowerCase().includes("office")) {
						interaction.message.embeds[0].data.fields[7].value = newGarageSlotsNumInput;

						if (interaction.message.embeds[0].data.fields[9]) {
							interaction.message.embeds[0].data.fields[9].value = `${interaction.message.embeds[0].data.fields[9].value}\n- Garage Slots set to \`${newGarageSlotsNumInput}\` by <@${interaction.user.id}> on ${today}.`;
						} else {
							interaction.message.embeds[0].data.fields[9] = { name: `Notes:`, value: `\n- Garage Slots set to \`${newGarageSlotsNumInput}\` by <@${interaction.user.id}> on ${today}.` };
						}
					} else if (embedTitle.toLowerCase().includes("warehouse")) {
						interaction.message.embeds[0].data.fields[6].value = newGarageSlotsNumInput;

						if (interaction.message.embeds[0].data.fields[7]) {
							interaction.message.embeds[0].data.fields[7].value = `${interaction.message.embeds[0].data.fields[7].value}\n- Garage Slots set to \`${newGarageSlotsNumInput}\` by <@${interaction.user.id}> on ${today}.`;
						} else {
							interaction.message.embeds[0].data.fields[7] = { name: `Notes:`, value: `\n- Garage Slots set to \`${newGarageSlotsNumInput}\` by <@${interaction.user.id}> on ${today}.` };
						}
					} else if (embedTitle.toLowerCase().includes("house")) {
						interaction.message.embeds[0].data.fields[6].value = newGarageSlotsNumInput;

						if (interaction.message.embeds[0].data.fields[7]) {
							interaction.message.embeds[0].data.fields[7].value = `${interaction.message.embeds[0].data.fields[7].value}\n- Garage Slots set to \`${newGarageSlotsNumInput}\` by <@${interaction.user.id}> on ${today}.`;
						} else {
							interaction.message.embeds[0].data.fields[7] = { name: `Notes:`, value: `\n- Garage Slots set to \`${newGarageSlotsNumInput}\` by <@${interaction.user.id}> on ${today}.` };
						}
					}

					await dbCmds.addOneSumm("countMiscSales");
					await dbCmds.addOneSumm("countMonthlyMiscSales");
					await dbCmds.addOnePersStat(interaction.user.id, "miscSales");
					await dbCmds.addOnePersStat(interaction.user.id, "monthlyMiscSales");
					await editEmbed.editMainEmbed(interaction.client);

					await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });
					await interaction.editReply({
						content: `Successfully set the Garage Slots to \`${newGarageSlotsNumInput}\` for property \`${interaction.message.embeds[0].data.fields[2].value}\`.`, ephemeral: true
					});
				}
				break;
			case 'assistantsPurchasePropertyModal':
				if (interaction.member._roles.includes(process.env.ASSISTANT_ROLE_ID) || interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var assistantName;
					if (interaction.member.nickname) {
						assistantName = interaction.member.nickname;
					} else {
						assistantName = interaction.member.user.username;
					}

					var now = Math.floor(new Date().getTime() / 1000.0);
					var reqDate = `<t:${now}:d>`;

					var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInformationInput'));
					var paymentMethod = strCleanup(interaction.fields.getTextInputValue('paymentMethodInput'));
					var shiftAvailable = strCleanup(interaction.fields.getTextInputValue('shiftAvailableInput'));
					var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

					await interaction.client.googleSheets.values.append({
						auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Asst - Property Purchase Request!A:F", valueInputOption: "RAW", resource: { values: [[`${assistantName} (<@${interaction.user.id}>)`, reqDate, clientInfo, paymentMethod, shiftAvailable, notes]] }
					});

					if (notes) {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Property Purchase Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Payment Method:`, value: `${paymentMethod}` },
								{ name: `Shift Available:`, value: `${shiftAvailable}` },
								{ name: `Notes:`, value: `${notes}` }
							)
							.setColor('EDC531')];
					} else {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Property Purchase Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Payment Method:`, value: `${paymentMethod}` },
								{ name: `Shift Available:`, value: `${shiftAvailable}` },
							)
							.setColor('EDC531')];
					}

					var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
					if (personnelStats == null || personnelStats.charName == null) {
						await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
					}

					await dbCmds.addOneSumm("countContactRequests");
					await dbCmds.addOneSumm("countMonthlyContactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "contactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyContactRequests");
					await editEmbed.editMainEmbed(interaction.client);

					let assistantBtns = getAssistantBtns();

					await interaction.client.channels.cache.get(process.env.CONTACT_US_FORMS_CHANNEL_ID).send({ embeds: embeds/*, components: assistantBtns*/ });

					await interaction.editReply({ content: `Successfully logged this Property Purchase Request.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Assistant\` role, the \`Full-Time\` role, or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'assistantsRequestQuoteModal':
				if (interaction.member._roles.includes(process.env.ASSISTANT_ROLE_ID) || interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var assistantName;
					if (interaction.member.nickname) {
						assistantName = interaction.member.nickname;
					} else {
						assistantName = interaction.member.user.username;
					}

					var now = Math.floor(new Date().getTime() / 1000.0);
					var reqDate = `<t:${now}:d>`;
					var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInformationInput'));
					var gpsPropertyString = strCleanup(interaction.fields.getTextInputValue('gpsPropertyImagesInput'));
					var interiorInfo = strCleanup(interaction.fields.getTextInputValue('interiorInput'));
					var zoneShiftInfo = strCleanup(interaction.fields.getTextInputValue('zoneShiftInput'));
					var notesInfo = strCleanup(interaction.fields.getTextInputValue('notesInput'));

					await interaction.client.googleSheets.values.append({
						auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Asst - Property Quote Request!A:G", valueInputOption: "RAW", resource: { values: [[`${assistantName} (<@${interaction.user.id}>)`, reqDate, clientInfo, gpsPropertyString, interiorInfo, zoneShiftInfo, notesInfo]] }
					});

					var photos = [gpsPropertyString];
					if (gpsPropertyString.includes(",")) {
						photos = gpsPropertyString.split(",")
					} else if (gpsPropertyString.includes(";")) {
						photos = gpsPropertyString.split(";")
					} else if (gpsPropertyString.includes(" ")) {
						photos = gpsPropertyString.split(" ")
					} else if (gpsPropertyString.includes("|")) {
						photos = gpsPropertyString.split("|")
					} else if (photos.length > 1) {
						await interaction.editReply({
							content: `:exclamation: The photos you linked are not separated properly *(or you didn't submit multiple photos)*. Please be sure to use commas (\`,\`), semicolons(\`;\`), vertical pipes(\`|\`), or spaces (\` \`) to separate your links.`,
							ephemeral: true
						});
						return;
					}

					for (let i = 0; i < photos.length; i++) {
						if (photos[i] == "") {
							photos.splice(i, 1);
							continue;
						}
						if (!isValidUrl(photos[i])) { // validate photo link
							await interaction.editReply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.editReply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (gpsPropertyString.length > 1024) {
						await interaction.editReply({
							content: `:exclamation: The length of your photos input is too long. We'd recommend downloading [ShareX](<https://getsharex.com>) (preferred) or uploading them to [Imgur](<https://imgur.com>).`,
							ephemeral: true
						});
						return;
					}

					if (photos.length >= 10) {
						await interaction.editReply({
							content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
							ephemeral: true
						});
						return;
					}

					if (notesInfo) {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Quote Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Interior Information:`, value: `${interiorInfo}` },
								{ name: `Zone and Shift Information:`, value: `${zoneShiftInfo}` },
								{ name: `Notes:`, value: `${notesInfo}` },
								{ name: `Photo Links:`, value: `${gpsPropertyString}` }
							)
							.setColor('FFE169')];
					} else {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Quote Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Interior Information:`, value: `${interiorInfo}` },
								{ name: `Zone and Shift Information:`, value: `${zoneShiftInfo}` },
								{ name: `Photo Links:`, value: `${gpsPropertyString}` }
							)
							.setColor('FFE169')];
					}

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('FFE169').setURL('https://echorp.net/').setImage(x));

					embeds = embeds.concat(photosEmbed);

					var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
					if (personnelStats == null || personnelStats.charName == null) {
						await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
					}

					await dbCmds.addOneSumm("countContactRequests");
					await dbCmds.addOneSumm("countMonthlyContactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "contactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyContactRequests");
					await editEmbed.editMainEmbed(interaction.client);

					let assistantBtns = getAssistantBtns();

					await interaction.client.channels.cache.get(process.env.CONTACT_US_FORMS_CHANNEL_ID).send({ embeds: embeds/*, components: assistantBtns*/ });

					await interaction.editReply({ content: `Successfully logged this Quote Request.`, ephemeral: true });
				} else {

					await interaction.editReply({ content: `:x: You must have the \`Assistant\` role, the \`Full-Time\` role, or the \`Administrator\` permission to use this function.`, ephemeral: true });

				}
				break;
			case 'assistantsRequestSmartLockModal':
				if (interaction.member._roles.includes(process.env.ASSISTANT_ROLE_ID) || interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var assistantName;
					if (interaction.member.nickname) {
						assistantName = interaction.member.nickname;
					} else {
						assistantName = interaction.member.user.username;
					}

					var now = Math.floor(new Date().getTime() / 1000.0);
					var reqDate = `<t:${now}:d>`;

					var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInformationInput'));
					var propertyID = strCleanup(interaction.fields.getTextInputValue('propertyIDInput'));
					var bankNumber = strCleanup(interaction.fields.getTextInputValue('bankNumberInput'));
					var shiftAvailable = strCleanup(interaction.fields.getTextInputValue('shiftAvailableInput'));
					var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

					await interaction.client.googleSheets.values.append({
						auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Asst - Smart Lock Update!A:G", valueInputOption: "RAW", resource: { values: [[`${assistantName} (<@${interaction.user.id}>)`, reqDate, clientInfo, propertyID, bankNumber, shiftAvailable, notes]] }
					});
					if (notes) {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Smart Lock Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Property ID:`, value: `${propertyID}` },
								{ name: `Bank Number:`, value: `${bankNumber}` },
								{ name: `Shift Available:`, value: `${shiftAvailable}` },
								{ name: `Notes:`, value: `${notes}` }
							)
							.setColor('B69121')];
					} else {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Smart Lock Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Property ID:`, value: `${propertyID}` },
								{ name: `Bank Number:`, value: `${bankNumber}` },
								{ name: `Shift Available:`, value: `${shiftAvailable}` },
							)
							.setColor('B69121')];
					}


					var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
					if (personnelStats == null || personnelStats.charName == null) {
						await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
					}

					await dbCmds.addOneSumm("countContactRequests");
					await dbCmds.addOneSumm("countMonthlyContactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "contactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyContactRequests");
					await editEmbed.editMainEmbed(interaction.client);

					let assistantBtns = getAssistantBtns();

					await interaction.client.channels.cache.get(process.env.CONTACT_US_FORMS_CHANNEL_ID).send({ embeds: embeds/*, components: assistantBtns*/ });

					await interaction.editReply({ content: `Successfully logged this Smart Lock Request.`, ephemeral: true });
				} else {

					await interaction.editReply({ content: `:x: You must have the \`Assistant\` role, the \`Full-Time\` role, or the \`Administrator\` permission to use this function.`, ephemeral: true });

				}
				break;
			case 'assistantsRequestGarageSlotModal':
				if (interaction.member._roles.includes(process.env.ASSISTANT_ROLE_ID) || interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var assistantName;
					if (interaction.member.nickname) {
						assistantName = interaction.member.nickname;
					} else {
						assistantName = interaction.member.user.username;
					}

					var now = Math.floor(new Date().getTime() / 1000.0);
					var reqDate = `<t:${now}:d>`;

					var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInformationInput'));
					var propertyIDCurrentSlots = strCleanup(interaction.fields.getTextInputValue('propertyIDCurrentSlotsInput'));
					var bankNumber = strCleanup(interaction.fields.getTextInputValue('bankNumberInput'));
					var amountSlotsWantAdded = strCleanup(interaction.fields.getTextInputValue('amountSlotsWantAddedInput'));
					var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));

					await interaction.client.googleSheets.values.append({
						auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Asst - Garage Slots Update!A:G", valueInputOption: "RAW", resource: { values: [[`${assistantName} (<@${interaction.user.id}>)`, reqDate, clientInfo, propertyIDCurrentSlots, bankNumber, amountSlotsWantAdded, notes]] }
					});
					if (notes) {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Garage Slot Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Property ID & Current Amount of Slots Owned:`, value: `${propertyIDCurrentSlots}` },
								{ name: `Bank Number:`, value: `${bankNumber}` },
								{ name: `Amount of Slots to Add:`, value: `${amountSlotsWantAdded}` },
								{ name: `Notes:`, value: `${notes}` }
							)
							.setColor('B69121')];
					} else {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Garage Slot Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Property ID & Current Amount of Slots Owned:`, value: `${propertyIDCurrentSlots}` },
								{ name: `Bank Number:`, value: `${bankNumber}` },
								{ name: `Amount of Slots to Add:`, value: `${amountSlotsWantAdded}` },
							)
							.setColor('B69121')];
					}

					var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
					if (personnelStats == null || personnelStats.charName == null) {
						await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
					}

					await dbCmds.addOneSumm("countContactRequests");
					await dbCmds.addOneSumm("countMonthlyContactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "contactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyContactRequests");
					await editEmbed.editMainEmbed(interaction.client);

					let assistantBtns = getAssistantBtns();

					await interaction.client.channels.cache.get(process.env.CONTACT_US_FORMS_CHANNEL_ID).send({ embeds: embeds/*, components: assistantBtns*/ });

					await interaction.editReply({ content: `Successfully logged this Garage Slot Request.`, ephemeral: true });
				} else {

					await interaction.editReply({ content: `:x: You must have the \`Assistant\` role, the \`Full-Time\` role, or the \`Administrator\` permission to use this function.`, ephemeral: true });

				}
				break;
			case 'assistantsOtherRequestModal':
				if (interaction.member._roles.includes(process.env.ASSISTANT_ROLE_ID) || interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var assistantName;
					if (interaction.member.nickname) {
						assistantName = interaction.member.nickname;
					} else {
						assistantName = interaction.member.user.username;
					}

					var now = Math.floor(new Date().getTime() / 1000.0);
					var reqDate = `<t:${now}:d>`;
					var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInformationInput'));
					var inquiry = strCleanup(interaction.fields.getTextInputValue('inquiryInput'));
					var shiftAvailable = strCleanup(interaction.fields.getTextInputValue('shiftAvailableInput'));
					var notesInfo = strCleanup(interaction.fields.getTextInputValue('notesInput'));

					await interaction.client.googleSheets.values.append({
						auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Asst - Misc. Inquiry!A:F", valueInputOption: "RAW", resource: { values: [[`${assistantName} (<@${interaction.user.id}>)`, reqDate, clientInfo, inquiry, shiftAvailable, notesInfo]] }
					});

					if (notesInfo) {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Misc. Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Inquiry Information:`, value: `${inquiry}` },
								{ name: `Shift Available:`, value: `${shiftAvailable}` },
								{ name: `Notes:`, value: `${notesInfo}` }
							)
							.setColor('76520E')];
					} else {
						var embeds = [new EmbedBuilder()
							.setTitle('An Assistant submitted a Misc. Request!')
							.addFields(
								{ name: `Assistant Name:`, value: `${assistantName} (<@${interaction.user.id}>)` },
								{ name: `Request Date:`, value: `${reqDate}` },
								{ name: `Client Information:`, value: `${clientInfo}` },
								{ name: `Inquiry Information:`, value: `${inquiry}` },
								{ name: `Shift Available:`, value: `${shiftAvailable}` },
							)
							.setColor('76520E')];
					}

					var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
					if (personnelStats == null || personnelStats.charName == null) {
						await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
					}

					await dbCmds.addOneSumm("countContactRequests");
					await dbCmds.addOneSumm("countMonthlyContactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "contactRequests");
					await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyContactRequests");
					await editEmbed.editMainEmbed(interaction.client);

					let assistantBtns = getAssistantBtns();

					await interaction.client.channels.cache.get(process.env.CONTACT_US_FORMS_CHANNEL_ID).send({ embeds: embeds/*, components: assistantBtns*/ });

					await interaction.editReply({ content: `Successfully logged this Other Request.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Assistant\` role, the \`Full-Time\` role, or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'evictionNoticeSentModal':
				if (1 == 1) {
					let now = Math.floor(new Date().getTime() / 1000.0);
					let today = `<t:${now}:d>`;
					let proofLinkInput = strCleanup(interaction.fields.getTextInputValue('proofLinkInput'));

					if (!isValidUrl(proofLinkInput)) { // validate url of proof
						await interaction.editReply({
							content: `:exclamation: \`${interaction.fields.getTextInputValue('proofLinkInput')}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}

					let origNotes = interaction.message.embeds[0].data.fields[12].value;

					origNotes = origNotes + `\n- [Proof of Eviction Notice Sent](${proofLinkInput}) added by <@${interaction.user.id}> on ${today}.`;

					interaction.message.embeds[0].data.fields[12].value = origNotes;

					let btnComp = [new ActionRowBuilder().addComponents(
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
					)];

					let watchlistBtns = getPotentialWatchlistBtns();

					let saleDate = interaction.message.embeds[0].data.fields[1].value;
					saleDate = Number(saleDate.replaceAll('<t:', '').replaceAll(':d>', ''));

					let dueDate = interaction.message.embeds[0].data.fields[2].value;
					dueDate = dueDate.split(' ')[0];
					dueDate = Number(dueDate.replaceAll('<t:', '').replaceAll(':d>', ''));

					let expireDate = now + (dueDate - saleDate);

					await interaction.message.edit({ embeds: interaction.message.embeds, components: btnComp });

					let watchlistEmbed = [new EmbedBuilder()
						.setTitle('Watchlist Addition Details')
						.addFields(
							{ name: `Client Name:`, value: `${interaction.message.embeds[0].data.fields[4].value}`, inline: true },
							{ name: `Client Info:`, value: `${interaction.message.embeds[0].data.fields[5].value}`, inline: true },
							{ name: `Client Contact:`, value: `${interaction.message.embeds[0].data.fields[6].value}`, inline: true },
							{ name: `Watchlist Expires:`, value: `<t:${expireDate}:R>` },
						)
						.setColor('FFA630')];

					await interaction.editReply({ content: `Successfully added Proof of Eviction Notice Sent to the \`${interaction.message.embeds[0].data.fields[3].value}\` Financing Agreement. Would you like us to add the following person to the watchlist?`, embeds: watchlistEmbed, components: watchlistBtns, ephemeral: true });

					exports.origInteraction = interactionReply.interaction;
				}
				break;
			default:
				await interaction.editReply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			console.error(error);

			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.log(`An error occured at ${errTime} at file ${fileName}!`);

			let errString = error.toString();

			if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.') {
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

function getAssistantBtns() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('markFormCompleted')
			.setLabel('Mark Completed')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId('markIncomplete')
			.setLabel('Mark Incomplete')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId('markContacted')
			.setLabel('Mark as Contacted')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('markFor48HrHold')
			.setLabel('Add 48 Hour Hold')
			.setStyle(ButtonStyle.Secondary),
	);

	let rows = [row1];
	return rows;
};

function getPotentialWatchlistBtns() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('yesAddToWatchlist')
			.setLabel('Yes, add to list')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId('noDontAddToWatchlist')
			.setLabel('No, don\'t add to list')
			.setStyle(ButtonStyle.Danger),
	);

	let rows = [row1];
	return rows;
};