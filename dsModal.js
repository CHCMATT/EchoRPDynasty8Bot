var dbCmds = require('./dbCmds.js');
var editEmbed = require('./editEmbed.js');
var personnelCmds = require('./personnelCmds.js');

var { EmbedBuilder } = require('discord.js');

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

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers (no $ or commas or periods).`,
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.svg', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i])) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.svg\`, \`.avif\`, \`.webp\`.`,
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
						.setColor('A67C00')];

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('A67C00').setURL('https://echorp.net/').setImage(x));

					embeds = embeds.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.HOUSE_SALES_CHANNEL_ID).send({ embeds: embeds });
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countHousesSold");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "housesSold");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
				var newHousesSoldTotal = await dbCmds.readSummValue("countHousesSold");
				await interaction.reply({ content: `Successfully added \`1\` to the \`Houses Sold\` counter - the new total is \`${newHousesSoldTotal}\`.`, ephemeral: true });
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

				if (isNaN(price)) { // validate quantity of money
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers (no $ or commas or periods).`,
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.svg', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i])) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.svg\`, \`.avif\`, \`.webp\`.`,
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
						.setColor('BF9B30')];

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('BF9B30').setURL('https://echorp.net/').setImage(x));

					embeds = embeds.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.WAREHOUSE_SALES_CHANNEL_ID).send({ embeds: embeds });
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}
				await dbCmds.addOneSumm("countWarehousesSold");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "warehousesSold");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
				var newWarehousesSoldTotal = await dbCmds.readSummValue("countWarehousesSold");
				await interaction.reply({ content: `Successfully added \`1\` to the \`Warehouses Sold\` counter - the new total is \`${newWarehousesSoldTotal}\`.`, ephemeral: true });
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
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers (no $ or commas or periods).`,
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
						var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.svg', '.avif', '.webp'];
						if (!RegExp(allowedValues.join('|')).test(photos[i])) { // validate photo link, again
							await interaction.reply({
								content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.svg\`, \`.avif\`, \`.webp\`.`,
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
							.setColor('FFBF00')];
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
							.setColor('FFBF00')];
					}

					var photosEmbed = photos.map(x => new EmbedBuilder().setColor('FFBF00').setURL('https://echorp.net/').setImage(x));

					embeds = embeds.concat(photosEmbed);

					await interaction.client.channels.cache.get(process.env.PROPERTY_QUOTES_CHANNEL_ID).send({ embeds: embeds });
				}
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null) {
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
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.svg', '.avif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i])) { // validate photo link, again
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.svg\`, \`.avif\`, \`.webp\`.`,
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
						.setTitle('A new Property Repossession has been completed!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Repossession Date:`, value: `${repoDate}` },
							{ name: `Previous Owner Information:`, value: `${prevOwner}` },
							{ name: `Lot Number:`, value: `${lotNum}` },
							{ name: `Reason for Repossession:`, value: `${repoReason}` },
							{ name: `Notes:`, value: `${notes}` }
						)
						.setColor('FFD447')];
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
						.setColor('FFD447')];
				}

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('FFD447').setURL('https://echorp.net/').setImage(x));

				embeds = embeds.concat(photosEmbed);

				await interaction.client.channels.cache.get(process.env.PROPERTY_REPOS_CHANNEL_ID).send({ embeds: embeds });
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null) {
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
					var allowedValues = ['.png', '.jpg', '.jpeg', '.gif', '.apng', '.svg', '.avif', '.webp'];
					if (!RegExp(allowedValues.join('|')).test(photos[i])) { // validate photo link, again
						await interaction.reply({
							content: `:exclamation: \`${photos[i].trimStart().trimEnd()}\` is not a valid picture URL, please be sure to enter a URL that includes one of the following: \`.png\`, \`.jpg\`, \`.jpeg\`, \`.gif\`, \`.apng\`, \`.svg\`, \`.avif\`, \`.webp\`.`,
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
						.setColor('FFE878')];
				} else {
					var embeds = [new EmbedBuilder()
						.setTitle('A new Train Activity Check request has been submitted!')
						.addFields(
							{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
							{ name: `Request Date:`, value: `${reqDate}` },
							{ name: `Owner Information:`, value: `${ownerInfo}` },
							{ name: `Lot Number:`, value: `${lotNum}` },
						)
						.setColor('FFE878')];
				}

				var photosEmbed = photos.map(x => new EmbedBuilder().setColor('FFE878').setURL('https://echorp.net/').setImage(x));

				embeds = embeds.concat(photosEmbed);

				await interaction.client.channels.cache.get(process.env.TRAIN_ACTIVITY_CHECKS_CHANNEL_ID).send({ embeds: embeds });
				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countTrainActivitiesChecked");
				await editEmbed.editEmbed(interaction.client);
				await dbCmds.addOnePersStat(interaction.member.user.id, "activityChecks");
				await personnelCmds.sendOrUpdateEmbed(interaction.client, interaction.member.user.id);
				var newTrainActivyChecksTotal = await dbCmds.readSummValue("countTrainActivitiesChecked");
				await interaction.reply({ content: `Successfully added \`1\` to the \`Train Activities\` counter - the new total is \`${newTrainActivyChecksTotal}\`.`, ephemeral: true });
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


