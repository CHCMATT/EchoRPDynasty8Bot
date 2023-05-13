var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder } = require('discord.js');
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
				var lotNum = strCleanup(interaction.fields.getTextInputValue('lotNumInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var locationNotes = strCleanup(interaction.fields.getTextInputValue('locNotesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "House Sales!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, lotNum, price, soldTo, locationNotes, photosString]] }
				});

				var formattedPrice = formatter.format(price);
				var costPrice = (price * 0.70);
				var d8Profit = price - costPrice;
				var realtorCommission = (d8Profit * 0.20);

				var formattedCostPrice = formatter.format(costPrice);
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

					var embeds = [new EmbedBuilder()
						.setTitle('A new House has been sold!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Lot Number:`, value: `${lotNum}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `House Sold To:`, value: `${soldTo}` },
							{ name: `Location/Notes:`, value: `${locationNotes}` }
						)
						.setColor('805B10')];

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('805B10').setURL('https://echorp.net/').setImage(x));

					embeds = embeds.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.HOUSE_SALES_CHANNEL_ID).send({ embeds: embeds });
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countHousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "housesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyHousesSold");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addCommission(interaction.member.user.id, realtorCommission);

				var formattedCommission = formatter.format(realtorCommission);
				var newHousesSoldTotal = await dbCmds.readSummValue("countHousesSold");
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
				var reason = `House Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Houses Sold\` counter - the new total is \`${newHousesSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
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
				var lotNum = strCleanup(interaction.fields.getTextInputValue('lotNumInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var locationNotes = strCleanup(interaction.fields.getTextInputValue('locNotesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Warehouse Sales!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, lotNum, price, soldTo, locationNotes, photosString]] }
				});

				var formattedPrice = formatter.format(price);
				var costPrice = (price * 0.70);
				var d8Profit = price - costPrice;
				var realtorCommission = (d8Profit * 0.20);

				var formattedCostPrice = formatter.format(costPrice);
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

					var embeds = [new EmbedBuilder()
						.setTitle('A new Warehouse has been sold!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Sale Date:`, value: `${saleDate}` },
							{ name: `Lot Number:`, value: `${lotNum}` },
							{ name: `Final Sale Price:`, value: `${formattedPrice}` },
							{ name: `Warehouse Sold To:`, value: `${soldTo}` },
							{ name: `Location/Notes:`, value: `${locationNotes}` }
						)
						.setColor('926C15')];

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('926C15').setURL('https://echorp.net/').setImage(x));

					embeds = embeds.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.WAREHOUSE_SALES_CHANNEL_ID).send({ embeds: embeds });
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countWarehousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "warehousesSold");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyWarehousesSold");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addCommission(interaction.member.user.id, realtorCommission);

				var formattedCommission = formatter.format(realtorCommission);
				var newWarehousesSoldTotal = await dbCmds.readSummValue("countWarehousesSold");
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
				var reason = `Warehouse Sale to \`${soldTo}\` costing \`${formattedPrice}\` on ${saleDate}`

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Warehouses Sold\` counter - the new total is \`${newWarehousesSoldTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
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
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Property Quotes!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, reqDate, clientInfo, price, interiorType, notes, photosString]] }
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

					await interaction.client.channels.cache.get(process.env.PROPERTY_QUOTES_CHANNEL_ID).send({ embeds: embeds });
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countPropertiesQuoted");
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
				var lotNum = strCleanup(interaction.fields.getTextInputValue('lotNumInput'));
				var repoReason = strCleanup(interaction.fields.getTextInputValue('repoReasonInput'));
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Property Repos!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, repoDate, prevOwner, lotNum, repoReason, notes, photosString]] }
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
							{ name: `Lot Number:`, value: `${lotNum}` },
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
							{ name: `Lot Number:`, value: `${lotNum}` },
							{ name: `Reason for Repossession:`, value: `${repoReason}` },
						)
						.setColor('B69121')];
				}

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('B69121').setURL('https://echorp.net/').setImage(x));

				embeds = embeds.concat(photosEmbed);

				await interaction.client.channels.cache.get(process.env.PROPERTY_REPOS_CHANNEL_ID).send({ embeds: embeds });
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countPropertiesRepod");
				await dbCmds.addOnePersStat(interaction.member.user.id, "propertiesRepod");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyPropertiesRepod");
				await editEmbed.editEmbed(interaction.client);
				var newPropertiesRepodTotal = await dbCmds.readSummValue("countPropertiesRepod");
				await interaction.reply({ content: `Successfully added \`1\` to the \`Properties Repossessed\` counter - the new total is \`${newPropertiesRepodTotal}\`.`, ephemeral: true });
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
				var lotNum = strCleanup(interaction.fields.getTextInputValue('lotNumInput'));
				var notes = strCleanup(interaction.fields.getTextInputValue('notesInput'));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Train Checks!A:F", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, reqDate, ownerInfo, lotNum, notes, photosString]] }
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
							{ name: `Lot Number:`, value: `${lotNum}` },
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
							{ name: `Lot Number:`, value: `${lotNum}` },
						)
						.setColor('C9A227')];
				}

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('C9A227').setURL('https://echorp.net/').setImage(x));

				embeds = embeds.concat(photosEmbed);

				await interaction.client.channels.cache.get(process.env.TRAIN_ACTIVITY_CHECKS_CHANNEL_ID).send({ embeds: embeds });
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countTrainActivitiesChecked");
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
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Misc. Sales!A:D", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, itemsSold, price]] }
				});

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var formattedPrice = formatter.format(price);

				var d8Profit = price;
				var realtorCommission = (d8Profit * 0.20);

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
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyMiscSales");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addCommission(interaction.member.user.id, realtorCommission);

				var formattedCommission = formatter.format(realtorCommission);
				var newMiscSalesTotal = await dbCmds.readSummValue("countMiscSales");
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
				var reason = `Miscellaneous Sale of \`${itemsSold}\` costing \`${formattedPrice}\` on ${saleDate}`

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Misc. Sales\` counter - the new total is \`${newMiscSalesTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
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
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "House Remodel!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, remodelDate, remodelFor, oldLotNum, newLotNumNotes, price, photosString]] }
				});

				var formattedPrice = formatter.format(price);

				var d8Profit = price;
				var realtorCommission = (d8Profit * 0.20);

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
							{ name: `Old Lot Number:`, value: `${oldLotNum}` },
							{ name: `New Lot Number/Notes:`, value: `${newLotNumNotes}` },
							{ name: `Remodel Completed For:`, value: `${remodelFor}` },
							{ name: `Remodel Price:`, value: `${formattedPrice}` },
						)
						.setColor('DBB42C')];


					var itemsSold = `House Remodel of \`${oldLotNum}\` for \`${remodelFor}\``;

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('A47E1B').setURL('https://echorp.net/').setImage(x));

					houseSaleEmbed = houseSaleEmbed.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.HOUSE_SALES_CHANNEL_ID).send({ embeds: houseSaleEmbed });
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
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyMiscSales");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addCommission(interaction.member.user.id, realtorCommission);

				var formattedCommission = formatter.format(realtorCommission);
				var newMiscSalesTotal = await dbCmds.readSummValue("countMiscSales");
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
				var reason = `House Remodel of \`${oldLotNum}\` for \`${remodelFor}\``;

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${itemsSold}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Misc. Sales\` counter - the new total is \`${newMiscSalesTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
				break;
			case 'addWarehouseUpgradeModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var upgradeDate = `<t:${now}:d>`;

				var upgradeFor = strCleanup(interaction.fields.getTextInputValue('remodelForInput'));
				var oldLotNum = strCleanup(interaction.fields.getTextInputValue('oldLotNumInput'));
				var newLotNumNotes = strCleanup(interaction.fields.getTextInputValue('newLotNumNotesInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var photosString = strCleanup(interaction.fields.getTextInputValue('photosInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Warehouse Upgrade!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, upgradeDate, upgradeFor, oldLotNum, newLotNumNotes, price, photosString]] }
				});

				var formattedPrice = formatter.format(price);

				var d8Profit = price;
				var realtorCommission = (d8Profit * 0.20);

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

					var warehouseUpgradeEmbed = [new EmbedBuilder()
						.setTitle('A new Warehouse Upgrade has been completed!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Upgrade Date:`, value: `${upgradeDate}` },
							{ name: `Old Lot Number:`, value: `${oldLotNum}` },
							{ name: `New Lot Number/Notes:`, value: `${newLotNumNotes}` },
							{ name: `Upgrade Completed For:`, value: `${upgradeFor}` },
							{ name: `Upgrade Price:`, value: `${formattedPrice}` },
						)
						.setColor('DBB42C')];


					var itemsSold = `Warehouse Upgrade of \`${oldLotNum}\` for \`${upgradeFor}\``;

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('A47E1B').setURL('https://echorp.net/').setImage(x));

					warehouseUpgradeEmbed = warehouseUpgradeEmbed.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.WAREHOUSE_SALES_CHANNEL_ID).send({ embeds: warehouseUpgradeEmbed });
				}

				var miscSaleEmbed = [new EmbedBuilder()
					.setTitle('A new Misc. Sale has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${upgradeDate}` },
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
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyMiscSales");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addCommission(interaction.member.user.id, realtorCommission);

				var formattedCommission = formatter.format(realtorCommission);
				var newMiscSalesTotal = await dbCmds.readSummValue("countMiscSales");
				var currCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
				var reason = `Warehouse Upgrade of \`${oldLotNum}\` for \`${remodelFor}\``;

				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${itemsSold}.`)
					.setColor('#1EC276');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

				await interaction.reply({ content: `Successfully added \`1\` to the \`Misc. Sales\` counter - the new total is \`${newMiscSalesTotal}\`.\n\n\Details about this sale:\n> Sale Price: \`${formattedPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\`\n\nYour weekly commission is now: \`${currCommission}\`.`, ephemeral: true });
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
				var nextPaymentDateTime = now + (86400 * 14); // 86400 seconds in a day times 14 days
				var nextPaymentDate = `<t:${nextPaymentDateTime}:d>`;
				var nextPaymentDateRelative = `<t:${nextPaymentDateTime}:R>`;
				var latestFinanceNum = await dbCmds.readFinanceNum('financeNum');
				var currentFinanceNum = latestFinanceNum + 1;
				await dbCmds.setFinanceNum('financeNum', currentFinanceNum);
				var financeNum = `${currentFinanceNum}`.padStart(5, '0');
				financeNum = `H${financeNum}`;

				var ownerInfo = strCleanup(interaction.fields.getTextInputValue('ownerInfoInput'));
				var ownerEmail = strCleanup(interaction.fields.getTextInputValue('ownerEmailInput'));
				var lotNum = strCleanup(interaction.fields.getTextInputValue('lotNumInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));
				var documentLink = strCleanup(interaction.fields.getTextInputValue('documentLinkInput'));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Finance Agreements!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, ownerInfo, ownerEmail, lotNum, price, documentLink]] }
				});

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var downPayment = (price * 0.3);
				var amountOwed = (price - downPayment + ((price - downPayment) * .14));

				var formattedPrice = formatter.format(price);
				var formattedDownPayment = formatter.format(downPayment);
				var formattedAmountOwed = formatter.format(amountOwed);

				var embeds = [new EmbedBuilder()
					.setTitle('A new Financing Agreement has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}`, inline: true },
						{ name: `Latest Payment:`, value: `${saleDate}`, inline: true },
						{ name: `Next Payment Due:`, value: `${nextPaymentDate} (${nextPaymentDateRelative})`, inline: true },
						{ name: `Financing ID Number:`, value: `${financeNum}` },
						{ name: `Owner Info:`, value: `${ownerInfo}`, inline: true },
						{ name: `Owner Email:`, value: `${ownerEmail}`, inline: true },
						{ name: `Lot Number:`, value: `${lotNum}` },
						{ name: `Sale Price:`, value: `${formattedPrice}`, inline: true },
						{ name: `Down Payment:`, value: `${formattedDownPayment}`, inline: true },
						{ name: `Amount Owed:`, value: `${formattedAmountOwed}`, inline: true },
						{ name: `Financing Agreement:`, value: `${documentLink}` },
					)
					.setColor('FAD643')];

				await interaction.client.channels.cache.get(process.env.FINANCING_AGREEMENTS_CHANNEL_ID).send({ embeds: embeds });

				await interaction.reply({ content: `Successfully added this sale to the \`Financing Agreement\` channel.\n\n\Details about this agreement:\n> Sale Price: \`${formattedPrice}\`\n> Down Payment: \`${formattedDownPayment}\`\n> Amount Owed Remaining: \`${formattedAmountOwed}\`.`, ephemeral: true });
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
					auth: interaction.client.auth, spreadsheetId: interaction.client.sheetId, range: "Finance Payments!A:E", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, currPaymentDate, payersName, financingNum, paymentAmt]] }
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
							var msgOwnerInfo = message.embeds[0].data.fields[5].value;
							var msgOwnerEmail = message.embeds[0].data.fields[6].value;
							var msgLotNumber = message.embeds[0].data.fields[7].value;
							var msgSalePrice = message.embeds[0].data.fields[8].value;
							var msgDownPayment = message.embeds[0].data.fields[9].value;
							var msgAmtOwed = message.embeds[0].data.fields[10].value;
							var msgFinancingAgreement = message.embeds[0].data.fields[11].value;

							var amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''));

							if (msgFinanceNum === financingNum) {
								var afterPaymentAmt = amtOwed - paymentAmt;
								agreementFound = true;
								if (afterPaymentAmt < 0) {
									var afterPaymentAmt = amtOwed - paymentAmt;
									formattedAfterPaymentAmt = formatter.format(afterPaymentAmt);
									await interaction.reply({
										content: `:exclamation: A payment of \`${formattedPaymentAmt}\` will result in a negative balance on agreement \`${msgFinanceNum}\`. The maximum payment allowed should be \`${msgAmtOwed}\`.`,
										ephemeral: true
									});
									return;
								} else if (afterPaymentAmt == 0) {
									var afterPaymentAmt = amtOwed - paymentAmt;
									formattedAfterPaymentAmt = formatter.format(afterPaymentAmt);

									try {
										message.reactions.cache.get('⏰').remove()
									} catch {
										// if no reaction to remove, do nothing
									}

									var agreementEmbed = [new EmbedBuilder()
										.setTitle('A new Financing Agreement has been submitted!')
										.addFields(
											{ name: `Realtor Name:`, value: `${msgRealtor}` },
											{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
											{ name: `Latest Payment:`, value: `${currPaymentDate}`, inline: true },
											{ name: `Next Payment Due:`, value: `N/A`, inline: true },
											{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
											{ name: `Owner Info:`, value: `${msgOwnerInfo}`, inline: true },
											{ name: `Owner Email:`, value: `${msgOwnerEmail}`, inline: true },
											{ name: `Lot Number:`, value: `${msgLotNumber}` },
											{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
											{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
											{ name: `Amount Owed:`, value: `${formattedAfterPaymentAmt}`, inline: true },
											{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
											{ name: `Notes:`, value: `Financing payments completed on ${currPaymentDate}.` }
										)
										.setColor('FAD643')];

									var channel = await interaction.client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID)
									var currMsg = await channel.messages.fetch(msgId);
									currMsg.edit({ embeds: agreementEmbed });

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

									await interaction.client.channels.cache.get(process.env.FINANCING_PAYMENTS_CHANNEL_ID).send({ embeds: embeds });

									await interaction.reply({ content: `Successfully submitted a payment of \`${formattedPaymentAmt}\` to the \`${financingNum}\` Financing Agreement - the new amount owed is \`${formattedAfterPaymentAmt}\`.`, ephemeral: true });
								} else {
									var afterPaymentAmt = amtOwed - paymentAmt;
									formattedAfterPaymentAmt = formatter.format(afterPaymentAmt);

									try {
										message.reactions.cache.get('⏰').remove()
									} catch {
										// if no reaction to remove, do nothing
									}

									var agreementEmbed = [new EmbedBuilder()
										.setTitle('A new Financing Agreement has been submitted!')
										.addFields(
											{ name: `Realtor Name:`, value: `${msgRealtor}` },
											{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
											{ name: `Latest Payment:`, value: `${currPaymentDate}`, inline: true },
											{ name: `Next Payment Due:`, value: `${nextPaymentDate} (${nextPaymentDateRelative})`, inline: true },
											{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
											{ name: `Owner Info:`, value: `${msgOwnerInfo}`, inline: true },
											{ name: `Owner Email:`, value: `${msgOwnerEmail}`, inline: true },
											{ name: `Lot Number:`, value: `${msgLotNumber}` },
											{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
											{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
											{ name: `Amount Owed:`, value: `${formattedAfterPaymentAmt}`, inline: true },
											{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
										)
										.setColor('FAD643')];

									var channel = await interaction.client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID)
									var currMsg = await channel.messages.fetch(msgId);
									currMsg.edit({ embeds: agreementEmbed });

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

									await interaction.client.channels.cache.get(process.env.FINANCING_PAYMENTS_CHANNEL_ID).send({ embeds: embeds });

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
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		console.log(`Error in modal popup!`);
		console.error(error);
	}
};


