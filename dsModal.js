var moment = require('moment');
var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
var personnelCmds = require('./personnelCmds.js');

var formatter = new Intl.NumberFormat('en-US', {
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

module.exports.modalSubmit = async (interaction) => {
	try {
		var modalID = interaction.customId;
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

				var formattedPrice = formatter.format(price);
				var costPrice = (price * 0.85);
				var d8Profit = price - costPrice;
				var realtorCommission = (d8Profit * 0.30);
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
					await interaction.reply({
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
						await interaction.reply({
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
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (photos.length >= 10) {
						await interaction.reply({
							content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
							ephemeral: true
						});
						return;
					}

					var embeds = [new EmbedBuilder()
						.setTitle('A new House has been sold!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Street Address:`, value: `${lotNumStreetName}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `House Sold To:`, value: `${soldTo}` },
							{ name: `Location/Notes:`, value: `${locationNotes}` }
						)
						.setColor('805B10')];

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('805B10').setURL('https://echorp.net/').setImage(x));
					embeds = embeds.concat(photosEmbed);

					let houseSaleMsg = await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: embeds });
					exports.houseSaleMsg = houseSaleMsg;
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countHousesSold");
				await dbCmds.addOneSumm("countMonthlyHousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "housesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyHousesSold");
				await editEmbed.editEmbed(interaction.client);
				if (realtorCommission > 0) {
					await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				}
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

				if (realtorCommission > 0) {
					var formattedCommission = formatter.format(realtorCommission);
					var reason = `House Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				}

				var newHousesSoldTotal = await dbCmds.readSummValue("countHousesSold");

				let houseSaleBtns = [new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('houseSwapSaleCommission')
						.setLabel('Split Commission')
						.setStyle(ButtonStyle.Primary)
				)];

				let originalHouseSaleReply = await interaction.reply({ content: `Successfully logged this House sale - the new total is \`${newHousesSoldTotal}\`.\n\nDetails about this sale:\n> Total Price: \`${formattedTotalPrice}\` (\`${formattedPrice}\` sale + \`${formattedTaxPrice}\` tax)\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, components: houseSaleBtns, ephemeral: true });

				exports.originalHouseSaleReply = originalHouseSaleReply.interaction;
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
				var realtorCommission = (d8Profit * 0.30);
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
					await interaction.reply({
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
						await interaction.reply({
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
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (photos.length >= 10) {
						await interaction.reply({
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
							{ name: `Location/Notes:`, value: `${locationNotes}` }
						)
						.setColor('926C15')];

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('926C15').setURL('https://echorp.net/').setImage(x));
					embeds = embeds.concat(photosEmbed);

					let warehouseSaleMsg = await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: embeds });
					exports.warehouseSaleMsg = warehouseSaleMsg;
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countWarehousesSold");
				await dbCmds.addOneSumm("countMonthlyWarehousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "warehousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyWarehousesSold");
				await editEmbed.editEmbed(interaction.client);
				if (realtorCommission > 0) {
					await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				}
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

				if (realtorCommission > 0) {
					var formattedCommission = formatter.format(realtorCommission);
					var reason = `Warehouse Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				}

				var newWarehousesSoldTotal = await dbCmds.readSummValue("countWarehousesSold");

				let warehouseSaleBtns = [new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('warehouseSwapSaleCommission')
						.setLabel('Split Commission')
						.setStyle(ButtonStyle.Primary)
				)];

				let originalWarehouseSaleReply = await interaction.reply({ content: `Successfully logged this Warehouse sale - the new total is \`${newWarehousesSoldTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, components: warehouseSaleBtns, ephemeral: true });

				exports.originalWarehouseSaleReply = originalWarehouseSaleReply.interaction;
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
					await interaction.reply({
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
						await interaction.reply({
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
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (photos.length >= 10) {
						await interaction.reply({
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
				await editEmbed.editEmbed(interaction.client);

				var newPropertiesQuotedTotal = await dbCmds.readSummValue("countPropertiesQuoted");
				await interaction.reply({ content: `Successfully added \`1\` to the \`Properties Quoted\` counter - the new total is \`${newPropertiesQuotedTotal}\`.`, ephemeral: true });
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
					await interaction.reply({
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
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (photos.length >= 10) {
					await interaction.reply({
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
				await editEmbed.editEmbed(interaction.client);

				var realtorCommission = 4500;
				var formattedCommission = formatter.format(realtorCommission);

				await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
				var reason = `Repossession of property number \`${lotNumStreetName}\` on ${repoDate}`

				// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				var newPropertiesRepodTotal = await dbCmds.readSummValue("countPropertiesRepod");

				await interaction.reply({ content: `Successfully added \`1\` to the \`Properties Repossessed\` counter - the new total is \`${newPropertiesRepodTotal}\`.\n\nDetails about this repossession:\n> Your Commission: \`$4500\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });

				break;
			case 'addTrainCheckModal':
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
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Train Activity!A:F", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, reqDate, ownerInfo, lotNumStreetName, notes, photosString]] }
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
					await interaction.reply({
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
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
							ephemeral: true
						});
						return;
					}
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
							ephemeral: true
						});
						return;
					}
				}

				if (photos.length >= 10) {
					await interaction.reply({
						content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
						ephemeral: true
					});
					return;
				}

				if (notes) {
					var embeds = [new EmbedBuilder()
						.setTitle('A new Train Activity Check request has been submitted!')
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
						.setTitle('A new Train Activity Check request has been submitted!')
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

				await interaction.client.channels.cache.get(process.env.TRAIN_ACTIVITY_CHANNEL_ID).send({ embeds: embeds });
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countTrainActivitiesChecked");
				await dbCmds.addOneSumm("countMonthlyTrainActivitiesChecked");
				await dbCmds.addOnePersStat(interaction.member.user.id, "activityChecks");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyActivityChecks");
				await editEmbed.editEmbed(interaction.client);
				var newTrainActivyChecksTotal = await dbCmds.readSummValue("countTrainActivitiesChecked");
				await interaction.reply({ content: `Successfully added \`1\` to the \`Train Activities\` counter - the new total is \`${newTrainActivyChecksTotal}\`.`, ephemeral: true });
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
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var formattedPrice = formatter.format(price);

				var d8Cost = (price * 0.9);
				var d8Profit = price - d8Cost;
				var realtorCommission = (d8Profit * 0.5);

				var formattedD8Cost = formatter.format(d8Cost);
				var formattedD8Profit = formatter.format(d8Profit);
				var formattedRealtorCommission = formatter.format(realtorCommission);

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
				await editEmbed.editEmbed(interaction.client);
				if (realtorCommission > 0) {
					await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				}
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

				if (realtorCommission > 0) {
					var formattedCommission = formatter.format(realtorCommission);
					var reason = `Miscellaneous Sale of \`${itemsSold}\` costing \`${formattedPrice}\` on ${saleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				}
				var newMiscSalesTotal = await dbCmds.readSummValue("countMiscSales");

				await interaction.reply({ content: `Successfully added \`1\` to the \`Misc. Sales\` counter - the new total is \`${newMiscSalesTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Dynasty 8 Cost: \`${formattedD8Cost}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
				break;
			case 'addHouseRemodelModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var remodelDate = `<t:${now}:d>`;

				var remodelFor = strCleanup(interaction.fields.getTextInputValue('remodelForInput'));
				var oldLotNum = strCleanup(interaction.fields.getTextInputValue('oldLotNumInput'));
				var newLotNumNotes = strCleanup(interaction.fields.getTextInputValue('newLotNumNotesInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Property Sales!A:H", valueInputOption: "RAW", resource: { values: [[`House Remodel`, `${realtorName} (<@${interaction.user.id}>)`, remodelDate, remodelFor, oldLotNum, newLotNumNotes, price, photosString]] }
				});

				var formattedPrice = formatter.format(price);

				var costPrice = (price * 0.85);
				var d8Profit = price - costPrice;
				var realtorCommission = (d8Profit * 0.30);

				var formattedD8Profit = formatter.format(d8Profit);
				var formattedRealtorCommission = formatter.format(realtorCommission);

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
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
						await interaction.reply({
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
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (photos.length >= 10) {
						await interaction.reply({
							content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
							ephemeral: true
						});
						return;
					}

					var houseSaleEmbed = [new EmbedBuilder()
						.setTitle('A new House Remodel has been completed!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Remodel Date:`, value: `${remodelDate}` },
							{ name: `Old Street Address/Notes:`, value: `${oldLotNum}` },
							{ name: `New Street Address:`, value: `${newLotNumNotes}` },
							{ name: `Remodel Completed For:`, value: `${remodelFor}` },
							{ name: `Remodel Price:`, value: `${formattedPrice}` },
						)
						.setColor('DBB42C')];


					var itemsSold = `House Remodel of \`${oldLotNum}\` for \`${remodelFor}\``;

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('A47E1B').setURL('https://echorp.net/').setImage(x));

					houseSaleEmbed = houseSaleEmbed.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: houseSaleEmbed });
				}

				var miscSaleEmbed = [new EmbedBuilder()
					.setTitle('A new Misc. Sale has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${remodelDate}` },
						{ name: `Items Sold:`, value: `${itemsSold}` },
						{ name: `Sale Price:`, value: `${formattedPrice}` },
					)
					.setColor('DBB42C')];

				await interaction.client.channels.cache.get(process.env.MISC_SALES_CHANNEL_ID).send({ embeds: miscSaleEmbed });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countMiscSales");
				await dbCmds.addOneSumm("countMonthlyMiscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyMiscSales");
				await editEmbed.editEmbed(interaction.client);
				if (realtorCommission > 0) {
					await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				}
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

				if (realtorCommission > 0) {
					var formattedCommission = formatter.format(realtorCommission);
					var reason = `House Remodel to \`${remodelFor}\` costing \`${formattedPrice}\` on ${remodelDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				}
				var newMiscSalesTotal = await dbCmds.readSummValue("countMiscSales");

				await interaction.reply({ content: `Successfully logged this \`House Remodel\` and added \`1\` to the \`Misc. Sales\` counter - the new total is \`${newMiscSalesTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
				break;
			case 'addWarehouseRemodelModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var remodelDate = `<t:${now}:d>`;

				var remodelFor = strCleanup(interaction.fields.getTextInputValue('remodelForInput'));
				var oldLotNum = strCleanup(interaction.fields.getTextInputValue('oldLotNumInput'));
				var newLotNumNotes = strCleanup(interaction.fields.getTextInputValue('newLotNumNotesInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Property Sales!A:H", valueInputOption: "RAW", resource: { values: [[`Warehouse Remodel`, `${realtorName} (<@${interaction.user.id}>)`, remodelDate, remodelFor, oldLotNum, newLotNumNotes, price, photosString]] }
				});

				var formattedPrice = formatter.format(price);

				var costPrice = (price * 0.85);
				var d8Profit = price - costPrice;
				var realtorCommission = (d8Profit * 0.30);

				var formattedD8Profit = formatter.format(d8Profit);
				var formattedRealtorCommission = formatter.format(realtorCommission);

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
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
						await interaction.reply({
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
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (photos.length >= 10) {
						await interaction.reply({
							content: `:exclamation: You may only include a maximum of 9 photo links (\`${photos.length}\` detected).`,
							ephemeral: true
						});
						return;
					}

					var warehouseRemodelEmbed = [new EmbedBuilder()
						.setTitle('A new Warehouse Remodel has been completed!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Remodel Date:`, value: `${remodelDate}` },
							{ name: `Old Street Address:`, value: `${oldLotNum}` },
							{ name: `New Street Address/Notes:`, value: `${newLotNumNotes}` },
							{ name: `Remodel Completed For:`, value: `${remodelFor}` },
							{ name: `Remodel Price:`, value: `${formattedPrice}` },
						)
						.setColor('DBB42C')];


					var itemsSold = `Warehouse Remodel of \`${oldLotNum}\` for \`${remodelFor}\``;

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('A47E1B').setURL('https://echorp.net/').setImage(x));

					warehouseRemodelEmbed = warehouseRemodelEmbed.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: warehouseRemodelEmbed });
				}

				var miscSaleEmbed = [new EmbedBuilder()
					.setTitle('A new Misc. Sale has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${remodelDate}` },
						{ name: `Items Sold:`, value: `${itemsSold}` },
						{ name: `Sale Price:`, value: `${formattedPrice}` },
					)
					.setColor('DBB42C')];

				await interaction.client.channels.cache.get(process.env.MISC_SALES_CHANNEL_ID).send({ embeds: miscSaleEmbed });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countMiscSales");
				await dbCmds.addOneSumm("countMonthlyMiscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyMiscSales");
				await editEmbed.editEmbed(interaction.client);
				if (realtorCommission > 0) {
					await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				}
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

				if (realtorCommission > 0) {
					var formattedCommission = formatter.format(realtorCommission);
					var reason = `Warehouse Remodel to \`${remodelFor}\` costing \`${formattedPrice}\` on ${remodelDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				}
				var newMiscSalesTotal = await dbCmds.readSummValue("countMiscSales");

				await interaction.reply({ content: `Successfully logged this \`Warehouse Remodel\` and added \`1\` to the \`Misc. Sales\` counter - the new total is \`${newMiscSalesTotal}\`.\n\nDetails about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
				break;
			case 'addFinancingAgreementModal':
				await interaction.deferReply({ ephemeral: true });
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;
				var nextPaymentDateTime = now + (86400 * 14); // 86400 seconds in a day times 14 days
				var nextPaymentDate = `<t:${nextPaymentDateTime}:d>`;
				var nextPaymentDateRelative = `<t:${nextPaymentDateTime}:R>`;
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
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Finance Agreements!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, clientName, clientInfo, clientContact, lotNumStreetName, price, documentLink]] }
				});

				let todayDate = moment().format('MMMM DD, YYYY');

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
								replaceText: todayDate,
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
						{ name: `Latest Payment:`, value: `${saleDate}`, inline: true },
						{ name: `Next Payment Due:`, value: `${nextPaymentDate} (${nextPaymentDateRelative})`, inline: true },
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

				await editEmbed.editEmbed(interaction.client);

				var newFinancialAgreementsTotal = await dbCmds.readSummValue("countFinancialAgreements");

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Financial Agreements\` counter and added this sale to the <${process.env.FINANCING_AGREEMENTS_CHANNEL_ID}> channel - the new total is \`${newFinancialAgreementsTotal}\`.\n\nDetails about this agreement:\n> Sale Price: \`${formattedPrice}\`\n> Down Payment: \`${formattedDownPayment}\`\n> Interest Cost: \`${formattedInterest}\`\n> Amount Owed Remaining: \`${formattedAmountOwed}\`\n> Financing Agreement: [Click to view Financing Agreement](<${documentLink}>)`, ephemeral: true });
				break;
			case 'addFinancingPaymentModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var currPaymentDate = `<t:${now}:d>`;

				var payersName = strCleanup(interaction.fields.getTextInputValue('payersNameInput'));
				var financingNum = strCleanup(interaction.fields.getTextInputValue('financingNumInput')).toUpperCase();
				var paymentAmt = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('paymentInput')).replaceAll(',', '').replaceAll('$', '')));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Finance Payments!A:E", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, currPaymentDate, payersName, financingNum, paymentAmt]] }
				});

				if (isNaN(paymentAmt)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('paymentInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var formattedPaymentAmt = formatter.format(paymentAmt);

				var channel = await interaction.client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID)
				var messages = await channel.messages.fetch();

				var formattedAfterPaymentAmt = '';

				var nextPaymentDateTime = now + (86400 * 14); // 86400 seconds in a day times 14 days
				var nextPaymentDate = `<t:${nextPaymentDateTime}:d>`;
				var nextPaymentDateRelative = `<t:${nextPaymentDateTime}:R>`;
				var agreementFound = false;

				messages.forEach(async (message) => {
					var msgId = message.id;
					if (message.embeds[0]) {
						var embedTitle = message.embeds[0].data.title;
						if (embedTitle === 'A new Financing Agreement has been submitted!') {
							var msgRealtor = message.embeds[0].data.fields[0].value;
							var msgSaleDate = message.embeds[0].data.fields[1].value;
							var msgFinanceNum = message.embeds[0].data.fields[4].value;
							var msgClientName = message.embeds[0].data.fields[5].value;
							var msgClientInfo = message.embeds[0].data.fields[6].value;
							var msgClientContact = message.embeds[0].data.fields[7].value;
							var msgStreetAddress = message.embeds[0].data.fields[8].value;
							var msgSalePrice = message.embeds[0].data.fields[9].value;
							var msgDownPayment = message.embeds[0].data.fields[10].value;
							var msgAmtOwed = message.embeds[0].data.fields[11].value;
							var msgFinancingAgreement = message.embeds[0].data.fields[12].value;
							if (message.embeds[0].data.fields[13]) {
								var msgNotes = message.embeds[0].data.fields[13].value;
							}

							var amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''));

							if (msgFinanceNum === financingNum) {
								var afterPaymentAmt = amtOwed - paymentAmt;
								agreementFound = true;
								if (afterPaymentAmt < 0) { // if attempting to pay more than they owe
									var afterPaymentAmt = amtOwed - paymentAmt;
									formattedAfterPaymentAmt = formatter.format(afterPaymentAmt);
									await interaction.reply({
										content: `:exclamation: A payment of \`${formattedPaymentAmt}\` will result in a negative balance on agreement \`${msgFinanceNum}\`. The maximum payment allowed should be \`${msgAmtOwed}\`.`,
										ephemeral: true
									});
									return;
								} else if (afterPaymentAmt == 0) { // if payments are no longer due ($0 balance)
									var afterPaymentAmt = amtOwed - paymentAmt;
									formattedAfterPaymentAmt = formatter.format(afterPaymentAmt);

									if (message.embeds[0].data.fields[13]) {
										var agreementEmbed = [new EmbedBuilder()
											.setTitle('A new Financing Agreement has been submitted!')
											.addFields(
												{ name: `Realtor Name:`, value: `${msgRealtor}` },
												{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
												{ name: `Latest Payment:`, value: `${currPaymentDate}`, inline: true },
												{ name: `Next Payment Due:`, value: `N/A`, inline: true },
												{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
												{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
												{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
												{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
												{ name: `Street Address:`, value: `${msgStreetAddress}` },
												{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
												{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
												{ name: `Amount Owed:`, value: `${formattedAfterPaymentAmt}`, inline: true },
												{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
												{ name: `Notes:`, value: `${msgNotes}\n- Payment of ${formattedPaymentAmt} submitted on ${currPaymentDate}.\n- Financing Payments completed on ${currPaymentDate}.` }
											)
											.setColor('1EC276')];
									} else {
										var agreementEmbed = [new EmbedBuilder()
											.setTitle('A new Financing Agreement has been submitted!')
											.addFields(
												{ name: `Realtor Name:`, value: `${msgRealtor}` },
												{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
												{ name: `Latest Payment:`, value: `${currPaymentDate}`, inline: true },
												{ name: `Next Payment Due:`, value: `N/A`, inline: true },
												{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
												{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
												{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
												{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
												{ name: `Street Address:`, value: `${msgStreetAddress}` },
												{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
												{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
												{ name: `Amount Owed:`, value: `${formattedAfterPaymentAmt}`, inline: true },
												{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
												{ name: `Notes:`, value: `- Payment of ${formattedPaymentAmt} submitted on ${currPaymentDate}.\n- Financing Payments completed on ${currPaymentDate}.` }
											)
											.setColor('1EC276')];
									}

									await interaction.client.channels.cache.get(process.env.COMPLETED_FINANCING_CHANNEL_ID).send({ embeds: agreementEmbed });

									await message.delete();

									await dbCmds.addOneSumm("countFinancialPayments");
									await dbCmds.addOneSumm("countMonthlyFinancialPayments");
									await dbCmds.addOnePersStat(interaction.member.user.id, "financialPayments");
									await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyFinancialPayments");

									await dbCmds.subtractOneSumm("activeFinancialAgreements");
									await dbCmds.subtractValueSumm("activeFinancialAmount", paymentAmt);

									await editEmbed.editEmbed(interaction.client);

									var embeds = [new EmbedBuilder()
										.setTitle('A new Financing Payment has been submitted!')
										.addFields(
											{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
											{ name: `Payment Date:`, value: `${currPaymentDate}` },
											{ name: `Financing ID Number:`, value: `${financingNum}` },
											{ name: `Payer's Name:`, value: `${payersName}` },
											{ name: `Payment Amount:`, value: `${formattedPaymentAmt}` },
										)
										.setColor('FFE169')];

									await interaction.client.channels.cache.get(process.env.MISC_SALES_CHANNEL_ID).send({ embeds: embeds });

									await interaction.reply({ content: `Successfully submitted a payment of \`${formattedPaymentAmt}\` to the \`${financingNum}\` Financing Agreement and moved the agreement to the Completed Financing section.`, ephemeral: true });
								} else { // if payments are still due
									var afterPaymentAmt = amtOwed - paymentAmt;
									formattedAfterPaymentAmt = formatter.format(afterPaymentAmt);

									if (message.embeds[0].data.fields[13]) {
										var agreementEmbed = [new EmbedBuilder()
											.setTitle('A new Financing Agreement has been submitted!')
											.addFields(
												{ name: `Realtor Name:`, value: `${msgRealtor}` },
												{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
												{ name: `Latest Payment:`, value: `${currPaymentDate}`, inline: true },
												{ name: `Next Payment Due:`, value: `${nextPaymentDate} (${nextPaymentDateRelative})`, inline: true },
												{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
												{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
												{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
												{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
												{ name: `Street Address:`, value: `${msgStreetAddress}` },
												{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
												{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
												{ name: `Amount Owed:`, value: `${formattedAfterPaymentAmt}`, inline: true },
												{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
												{ name: `Notes:`, value: `${msgNotes}\n- Payment of ${formattedPaymentAmt} submitted on ${currPaymentDate}.` }
											)
											.setColor('FAD643')];
									} else {
										var agreementEmbed = [new EmbedBuilder()
											.setTitle('A new Financing Agreement has been submitted!')
											.addFields(
												{ name: `Realtor Name:`, value: `${msgRealtor}` },
												{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
												{ name: `Latest Payment:`, value: `${currPaymentDate}`, inline: true },
												{ name: `Next Payment Due:`, value: `${nextPaymentDate} (${nextPaymentDateRelative})`, inline: true },
												{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
												{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
												{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
												{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
												{ name: `Street Address:`, value: `${msgStreetAddress}` },
												{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
												{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
												{ name: `Amount Owed:`, value: `${formattedAfterPaymentAmt}`, inline: true },
												{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
												{ name: `Notes:`, value: `- Payment of ${formattedPaymentAmt} submitted on ${currPaymentDate}.` }
											)
											.setColor('FAD643')];
									}

									var channel = await interaction.client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID)
									var currMsg = await channel.messages.fetch(msgId);
									currMsg.edit({ embeds: agreementEmbed, components: [] });

									var embeds = [new EmbedBuilder()
										.setTitle('A new Financing Payment has been submitted!')
										.addFields(
											{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
											{ name: `Payment Date:`, value: `${currPaymentDate}` },
											{ name: `Financing ID Number:`, value: `${financingNum}` },
											{ name: `Payer's Name:`, value: `${payersName}` },
											{ name: `Payment Amount:`, value: `${formattedPaymentAmt}` },
										)
										.setColor('FFE169')];

									await dbCmds.addOneSumm("countFinancialPayments");
									await dbCmds.addOneSumm("countMonthlyFinancialPayments");

									await dbCmds.addOnePersStat(interaction.member.user.id, "financialPayments");
									await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyFinancialPayments");

									await dbCmds.subtractValueSumm("activeFinancialAmount", paymentAmt);

									await editEmbed.editEmbed(interaction.client);

									await interaction.client.channels.cache.get(process.env.MISC_SALES_CHANNEL_ID).send({ embeds: embeds });

									await interaction.reply({ content: `Successfully submitted a payment of \`${formattedPaymentAmt}\` to the \`${financingNum}\` Financing Agreement - the new amount owed is \`${formattedAfterPaymentAmt}\`.`, ephemeral: true });
								}
							}
						}
					}
				});
				if (!agreementFound) {
					await interaction.reply({
						content: `:exclamation: Unable to locate any agreements with the ID number \`${financingNum}\`. Please try again!`,
						ephemeral: true
					});
				};
				break;
			case 'addOfficeSoldModal':
				await interaction.deferReply({ ephemeral: true });

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
				var realtorCommission = (d8Profit * 0.30);
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
					await interaction.reply({
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
						await interaction.reply({
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
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
								ephemeral: true
							});
							return;
						}
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
								ephemeral: true
							});
							return;
						}
					}

					if (photos.length >= 10) {
						await interaction.reply({
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
							{ name: `Limited Prop. Contract:`, value: `[Click to view Contract](<${officeSaleDocumentLink}>)` }

						)
						.setColor('805B10')];

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('805B10').setURL('https://echorp.net/').setImage(x));
					embeds = embeds.concat(photosEmbed);

					let officeSaleMsg = await interaction.client.channels.cache.get(process.env.PROPERTY_SALES_CHANNEL_ID).send({ embeds: embeds });

					exports.officeSaleMsg = officeSaleMsg;
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countHousesSold");
				await dbCmds.addOneSumm("countMonthlyHousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "housesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyHousesSold");
				await editEmbed.editEmbed(interaction.client);
				if (realtorCommission > 0) {
					await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				}
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

				if (realtorCommission > 0) {
					var formattedCommission = formatter.format(realtorCommission);
					var reason = `Office Sale to \`${clientName}\` costing \`${formattedPrice}\` on ${saleDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				}

				var newHousesSoldTotal = await dbCmds.readSummValue("countHousesSold");

				let officeSaleBtns = [new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('officeSwapSaleCommission')
						.setLabel('Split Commission')
						.setStyle(ButtonStyle.Primary)
				)];

				let originalOfficeSaleReply = await interaction.editReply({ content: `Successfully logged this Office sale - the new total is \`${newHousesSoldTotal}\`.\n\nDetails about this sale:\n> Total Price: \`${formattedTotalPrice}\` (\`${formattedPrice}\` sale + \`${formattedTaxPrice}\` tax)\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n> Limited Property Contract: [Click to view Contract](<${officeSaleDocumentLink}>)\n\nYour weekly commission is now: \`${currCommission}\`.`, components: officeSaleBtns, ephemeral: true });

				exports.originalOfficeSaleReply = originalOfficeSaleReply.interaction;
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
					await interaction.reply({
						content: `:exclamation: \`${screenshotLink}\` is not a valid URL, please be sure to enter a URL including the \`http\:\/\/\` or \`https\:\/\/\` portion.`,
						ephemeral: true
					});
					return;
				}
				var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
				if (!RegExp(allowedValues.join('|')).test(screenshotLink.toLowerCase())) { // validate photo link, again
					await interaction.reply({
						content: `:exclamation: \`${screenshotLink}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.webp\`.`,
						ephemeral: true
					});
					return;
				}

				var realtorCommission = 526;
				var formattedCommission = formatter.format(realtorCommission);
				var reason = `Yellow Pages ad listed on ${adDate}`;

				await dbCmds.addCommission(interaction.member.user.id, realtorCommission);
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));

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

				// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully logged this Yellow Pages ad listing.\n\nDetails about this listing:\n> Your Commission: \`${formattedCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });

				break;
			case 'approveQuoteModal':
				if (interaction.member._roles.includes(process.env.SR_REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

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
					)];

					let approvalMsgNotes;
					let approvalMsgEmbed = [];

					let reviewerCommission = 250;
					await dbCmds.addOnePersStat(interaction.member.id, 'quotesReviewed');
					await dbCmds.addOnePersStat(interaction.member.id, 'monthlyQuotesReviewed');
					await dbCmds.addCommission(interaction.member.id, reviewerCommission);
					let currCommission = await dbCmds.readCommission(interaction.member.id);
					let formattedReviewerCommission = formatter.format(reviewerCommission);
					let formattedCurrCommission = formatter.format(currCommission);

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
							approvalMsgNotes = `${mainEmbedFields[5].value}\n- Quote approved by <@${interaction.member.id}> on ${approvalDate} without notes.`;
						} else {
							approvalMsgNotes = `- Quote approved by <@${interaction.member.id}> on ${approvalDate} without notes.`;
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

					if (quotePingSetting) {
						await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorId}`, embeds: approvalMsgEmbed });
					} else {
						await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorName}:`, embeds: approvalMsgEmbed });
					}

					let reason = `Quote Approval for \`${mainEmbedFields[2].value}\` on ${approvalDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedReviewerCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${formattedCurrCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

					await interaction.reply({ content: `Successfully marked this quote as approved and added \`${formattedReviewerCommission}\` to your commission for a new total of \`${formattedCurrCommission}\`.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:x: You must have the \`Senior Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'adjustQuoteModal':
				if (interaction.member._roles.includes(process.env.SR_REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

					let adjustedPrice = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('adjustPriceInput')).replaceAll(',', '').replaceAll('$', '')));

					if (isNaN(adjustedPrice)) { // validate quantity of money
						await interaction.reply({
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
					)];

					let approvalMsgNotes;
					let approvalMsgEmbed = [];

					let reviewerCommission = 250;
					await dbCmds.addOnePersStat(interaction.member.id, 'quotesReviewed');
					await dbCmds.addOnePersStat(interaction.member.id, 'monthlyQuotesReviewed');
					await dbCmds.addCommission(interaction.member.id, reviewerCommission);
					let currCommission = await dbCmds.readCommission(interaction.member.id);
					let formattedReviewerCommission = formatter.format(reviewerCommission);
					let formattedCurrCommission = formatter.format(currCommission);

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
							approvalMsgNotes = `${mainEmbedFields[5].value}\n- Quote approved for purchase at \`${formattedAdjustedPrice}\` by <@${interaction.member.id}> on ${approvalDate} without notes.`;
						} else {
							approvalMsgNotes = `- Quote approved for purchase at \`${formattedAdjustedPrice}\` by <@${interaction.member.id}> on ${approvalDate} without notes.`;
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

					if (quotePingSetting) {
						await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorId}`, embeds: approvalMsgEmbed });
					} else {
						await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorName}:`, embeds: approvalMsgEmbed });
					}

					let reason = `Quote Adjustment for \`${mainEmbedFields[2].value}\` on ${approvalDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedReviewerCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${formattedCurrCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

					await interaction.reply({ content: `Successfully marked this quote as approved with adjustments and added \`${formattedReviewerCommission}\` to your commission for a new total of \`${formattedCurrCommission}\`.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:x: You must have the \`Senior Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			case 'denyQuoteModal':
				if (interaction.member._roles.includes(process.env.SR_REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

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
					)];

					let denialMsgNotes;
					let denialMsgEmbed = [];

					let reviewerCommission = 250;
					await dbCmds.addOnePersStat(interaction.member.id, 'quotesReviewed');
					await dbCmds.addOnePersStat(interaction.member.id, 'monthlyQuotesReviewed');
					await dbCmds.addCommission(interaction.member.id, reviewerCommission);
					let currCommission = await dbCmds.readCommission(interaction.member.id);
					let formattedReviewerCommission = formatter.format(reviewerCommission);
					let formattedCurrCommission = formatter.format(currCommission);

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
							denialMsgNotes = `${mainEmbedFields[5].value}\n- Quote denied by <@${interaction.member.id}> on ${denialDate} without notes.`;
						} else {
							denialMsgNotes = `- Quote denied by <@${interaction.member.id}> on ${denialDate} without notes.`;
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

					if (quotePingSetting) {
						await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorId}`, embeds: denialMsgEmbed });
					} else {
						await interaction.client.channels.cache.get(process.env.BUILDING_QUOTES_CHANNEL_ID).send({ content: `${originalRealtorName}:`, embeds: denialMsgEmbed });
					}

					let reason = `Quote Denial for \`${mainEmbedFields[2].value}\` on ${denialDate}`

					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedReviewerCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${formattedCurrCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

					await interaction.reply({ content: `Successfully marked this quote as denied and added \`${formattedReviewerCommission}\` to your commission for a new total of \`${formattedCurrCommission}\`.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:x: You must have the \`Senior Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			default:
				await interaction.reply({
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


