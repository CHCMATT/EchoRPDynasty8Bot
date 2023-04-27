var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var { EmbedBuilder } = require('discord.js');
var personnelCmds = require('./personnelCmds.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

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

				var soldTo = interaction.fields.getTextInputValue('soldToInput').trimEnd().trimStart();
				var lotNum = interaction.fields.getTextInputValue('lotNumInput').trimEnd().trimStart();
				var price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));
				var formattedPrice = formatter.format(price);
				var locationNotes = interaction.fields.getTextInputValue('locNotesInput').trimEnd().trimStart();
				var photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();

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
						console.log(photos.length);
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.avif\`, \`.webp\`.`,
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
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countHousesSold");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "housesSold");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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

				var soldTo = interaction.fields.getTextInputValue('soldToInput').trimEnd().trimStart();
				var lotNum = interaction.fields.getTextInputValue('lotNumInput').trimEnd().trimStart();
				var price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));
				var formattedPrice = formatter.format(price);
				var locationNotes = interaction.fields.getTextInputValue('locNotesInput').trimEnd().trimStart();
				var photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();

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
						console.log(photos.length);
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.avif\`, \`.webp\`.`,
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
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countWarehousesSold");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "warehousesSold");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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

				var clientInfo = interaction.fields.getTextInputValue('clientInfoInput').trimEnd().trimStart();
				var price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));
				var formattedPrice = formatter.format(price);
				var interiorType = interaction.fields.getTextInputValue('intTypeInput').trimEnd().trimStart();

				var notes = interaction.fields.getTextInputValue('notesInput').trimEnd().trimStart();
				var photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();

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
						console.log(photos.length);
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.avif\`, \`.webp\`.`,
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
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countPropertiesQuoted");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "propertiesQuoted");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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

				var prevOwner = interaction.fields.getTextInputValue('prevOwnerInput').trimEnd().trimStart();
				var lotNum = interaction.fields.getTextInputValue('lotNumInput').trimEnd().trimStart();
				var repoReason = interaction.fields.getTextInputValue('repoReasonInput').trimEnd().trimStart();
				var notes = interaction.fields.getTextInputValue('notesInput').trimEnd().trimStart();
				var photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();

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
					console.log(photos.length);
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
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.avif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.avif\`, \`.webp\`.`,
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
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countPropertiesRepod");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "propertiesRepod");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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

				var ownerInfo = interaction.fields.getTextInputValue('currentOwnerInput').trimEnd().trimStart();
				var lotNum = interaction.fields.getTextInputValue('lotNumInput').trimEnd().trimStart();
				var notes = interaction.fields.getTextInputValue('notesInput').trimEnd().trimStart();
				var photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();
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
					console.log(photos.length);
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
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.avif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.avif\`, \`.webp\`.`,
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
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countTrainActivitiesChecked");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "activityChecks");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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

				var itemsSold = interaction.fields.getTextInputValue('itemsSoldInput').trimEnd().trimStart();
				var price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));;

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
					.setTitle('A new misc. sale has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}` },
						{ name: `Items Sold:`, value: `${itemsSold}` },
						{ name: `Sale Price:`, value: `${formattedPrice}` },
					)
					.setColor('DBB42C')];

				await interaction.client.channels.cache.get(process.env.MISC_SALES_CHANNEL_ID).send({ embeds: embeds });

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countMiscSales");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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

				var remodelFor = interaction.fields.getTextInputValue('remodelForInput').trimEnd().trimStart();
				var oldLotNum = interaction.fields.getTextInputValue('oldLotNumInput').trimEnd().trimStart();
				var newLotNumNotes = interaction.fields.getTextInputValue('newLotNumNotesInput').trimEnd().trimStart();
				var price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));
				var photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();

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
						console.log(photos.length);
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.avif\`, \`.webp\`.`,
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
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countMiscSales");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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

				var upgradeFor = interaction.fields.getTextInputValue('remodelForInput').trimEnd().trimStart();
				var oldLotNum = interaction.fields.getTextInputValue('oldLotNumInput').trimEnd().trimStart();
				var newLotNumNotes = interaction.fields.getTextInputValue('newLotNumNotesInput').trimEnd().trimStart();
				var price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));
				var photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();

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
						console.log(photos.length);
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i].toLowerCase())) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.avif\`, \`.webp\`.`,
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
				if (personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countMiscSales");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "miscSales");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
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
				var repoDateTime = now + (86400 * 25); // 86400 seconds in a day times 25 days
				var repoDate = `<t:${repoDateTime}:d>`;
				var repoDateRelative = `<t:${repoDateTime}:R>`;
				var latestFinanceNum = await dbCmds.readFinanceNum('financeNum');
				var currentFinanceNum = latestFinanceNum + 1;
				await dbCmds.setFinanceNum('financeNum', currentFinanceNum);
				var financeNum = `${currentFinanceNum}`.padStart(5, '0');
				financeNum = `H${financeNum}`;

				var ownerInfo = interaction.fields.getTextInputValue('ownerInfoInput').trimEnd().trimStart();
				var ownerEmail = interaction.fields.getTextInputValue('ownerEmailInput').trimEnd().trimStart();
				var lotNum = interaction.fields.getTextInputValue('lotNumInput').trimEnd().trimStart();
				var price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));
				var documentLink = interaction.fields.getTextInputValue('documentLinkInput').trimEnd().trimStart();

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var downPayment = (price * 0.5);
				var finalPayment = (downPayment + (downPayment * 0.12));
				var amountOwed = finalPayment;

				var formattedPrice = formatter.format(price);
				var formattedDownPayment = formatter.format(downPayment);
				var formattedFinalPayment = formatter.format(finalPayment);
				var formattedAmountOwed = formatter.format(amountOwed);

				var embeds = [new EmbedBuilder()
					.setTitle('A new Financing Agreement has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}`, inline: true },
						{ name: `Latest Payment Date:`, value: `${saleDate}`, inline: true },
						{ name: `Repossession Date:`, value: `${repoDate} (${repoDateRelative})`, inline: true },
						{ name: `Financing ID Number:`, value: `${financeNum}` },
						{ name: `Owner Info:`, value: `${ownerInfo}`, inline: true },
						{ name: `Owner Email:`, value: `${ownerEmail}`, inline: true },
						{ name: `Lot Number:`, value: `${lotNum}` },
						{ name: `Sale Price:`, value: `${formattedPrice}`, inline: true },
						{ name: `Down Payment:`, value: `${formattedDownPayment}`, inline: true },
						{ name: `Final Payment:`, value: `${formattedFinalPayment}`, inline: true },
						{ name: `Amount Owed:`, value: `${formattedAmountOwed}` },
						{ name: `Financing Agreement:`, value: `${documentLink}` },
					)
					.setColor('FAD643')];

				await interaction.client.channels.cache.get(process.env.FINANCING_AGREEMENTS_CHANNEL_ID).send({ embeds: embeds });

				await interaction.reply({ content: `Successfully added this sale to the \`Financing Agreement\` channel.\n\n\Details about this agreement:\n> Sale Price: \`${formattedPrice}\`\n> Amount Owed Remaining: \`${formattedAmountOwed}\`\n> Down Payment: \`${formattedDownPayment}\`\n> Final Payment: \`${formattedFinalPayment}\``, ephemeral: true });
				break;
			case 'addFinancingPaymentModal':
				var realtorName;
				if (interaction.member.nickname) {
					realtorName = interaction.member.nickname;
				} else {
					realtorName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var paymentDate = `<t:${now}:d>`;

				var payersName = interaction.fields.getTextInputValue('payersNameInput').trimEnd().trimStart();
				var financingNum = interaction.fields.getTextInputValue('financingNumInput').trimEnd().trimStart().toUpperCase();
				var paymentAmt = Math.abs(Number(interaction.fields.getTextInputValue('paymentInput').trimEnd().trimStart().replaceAll(',', '').replaceAll('$', '')));

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

				var formattedAfterPaymentAmt = '$0';

				messages.forEach(async (message) => {
					var msgId = message.id;
					var msgRealtor = message.embeds[0].data.fields[0].value;
					var msgSaleDate = message.embeds[0].data.fields[1].value;
					var msgPaymentDate = message.embeds[0].data.fields[2].value;
					var msgRepoDateString = message.embeds[0].data.fields[3].value;
					var msgFinanceNum = message.embeds[0].data.fields[4].value;
					var msgOwnerInfo = message.embeds[0].data.fields[5].value;
					var msgOwnerEmail = message.embeds[0].data.fields[6].value;
					var msgLotNumber = message.embeds[0].data.fields[7].value;
					var msgSalePrice = message.embeds[0].data.fields[8].value;
					var msgDownPayment = message.embeds[0].data.fields[9].value;
					var msgFinalPayment = message.embeds[0].data.fields[10].value;
					var msgAmtOwed = message.embeds[0].data.fields[11].value;
					var msgFinancingAgreement = message.embeds[0].data.fields[12].value;

					var amtOwed = msgAmtOwed.replaceAll('$', '').replaceAll(',', '');

					if (msgFinanceNum === financingNum) {
						var afterPaymentAmt = amtOwed - paymentAmt;
						if (afterPaymentAmt < 0) {
							await interaction.reply({
								content: `:exclamation: A payment of \`${formattedPaymentAmt}\` will result in a negative balance. The maximum payment allowed should be \`${msgAmtOwed}\`.`,
								ephemeral: true
							});
							return;
						} else {
							formattedAfterPaymentAmt = formatter.format(afterPaymentAmt);

							var agreementEmbed = [new EmbedBuilder()
								.setTitle('A new Financing Agreement has been submitted!')
								.addFields(
									{ name: `Realtor Name:`, value: `${msgRealtor}` },
									{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
									{ name: `Latest Payment Date:`, value: `${paymentDate}`, inline: true },
									{ name: `Repossession Date:`, value: `${msgRepoDateString}`, inline: true },
									{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
									{ name: `Owner Info:`, value: `${msgOwnerInfo}`, inline: true },
									{ name: `Owner Email:`, value: `${msgOwnerEmail}`, inline: true },
									{ name: `Lot Number:`, value: `${msgLotNumber}` },
									{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
									{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
									{ name: `Final Payment:`, value: `${msgFinalPayment}`, inline: true },
									{ name: `Amount Owed:`, value: `${formattedAfterPaymentAmt}` },
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
									{ name: `Payment Date:`, value: `${paymentDate}` },
									{ name: `Financing ID Number:`, value: `${financingNum}` },
									{ name: `Payer's Name:`, value: `${payersName}` },
									{ name: `Payment Amount:`, value: `${formattedPaymentAmt}` },
								)
								.setColor('FFE169')];

							await interaction.client.channels.cache.get(process.env.FINANCING_PAYMENTS_CHANNEL_ID).send({ embeds: embeds });

							await interaction.reply({ content: `Successfully submitted a payment of \`${formattedPaymentAmt}\` to the \`${financingNum}\` Financing Agreement - the new amount owed is \`${formattedAfterPaymentAmt}\`.`, ephemeral: true });
						}
					}
				});
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


