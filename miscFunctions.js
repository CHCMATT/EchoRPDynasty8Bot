let moment = require('moment');
var dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.checkRepoRechecks = async (client) => {
	try {
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');
		console.log(`Checking for repossession rechecks on ${logTime}`);

		let allRechecks = await dbCmds.readAllRechecks();
		let now = Math.floor(new Date().getTime() / 1000.0);

		for (let i = 0; i < allRechecks.length; i++) {
			let uniqueId = allRechecks[i].uniqueId;
			let ownerName = allRechecks[i].ownerName;
			let streetAddress = allRechecks[i].streetAddress;
			let recheckDate = allRechecks[i].recheckDate;
			let originalMsg = allRechecks[i].originalMsg;

			if (now >= recheckDate) {
				let alertEmbed = new EmbedBuilder()
					.setTitle('A property is ready for a repo recheck!')
					.addFields(
						{ name: `Property Owner:`, value: `${ownerName}`, inline: true },
						{ name: `Street Address:`, value: `${streetAddress}`, inline: true },
						{ name: `Recheck Available:`, value: `<t:${recheckDate}:d>` },
						{ name: `Original Activity Check:`, value: `${originalMsg}` },
					)
					.setColor('1CA3C4');

				await client.channels.cache.get(process.env.REPO_REQUEST_CHANNEL_ID).send({ embeds: [alertEmbed] });

				await dbCmds.removeRepoRecheck(uniqueId);
			}
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

module.exports.clearOldWatchlists = async (client) => {
	try {
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');
		console.log(`Checking for expired watchlists on ${logTime}`);

		let channel = await client.channels.fetch(process.env.WATCHLIST_CHANNEL_ID);

		let sum_messages = [];
		let last_id;

		while (true) {
			const options = { limit: 100 };
			if (last_id) {
				options.before = last_id;
			}

			let messages = await channel.messages.fetch(options);
			sum_messages.push(...messages.values());
			last_id = messages.last().id;

			if (messages.size != 100 || sum_messages >= options.limit) {
				break;
			}
		}

		let now = Math.floor(new Date().getTime() / 1000.0);

		sum_messages.forEach(async (message) => {
			if (message.embeds[0] && message.embeds[0].data.title === "A new person has been added to the watchlist!") {
				let watchlistExpire = message.embeds[0].data.fields[3].value;
				let watchlistExpireSeconds = watchlistExpire.replaceAll('<t:', '').replaceAll(':R>', '');
				if (now >= watchlistExpireSeconds) {
					await message.delete();
				}
			}
		});

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

module.exports.initPersonnel = async (client, userId) => {
	try {
		let guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
		let user = await guild.members.fetch(userId);
		var initCharName;

		if (user.nickname) {
			initCharName = user.nickname;
		} else {
			initCharName = user.user.username;
		}

		await dbCmds.initPersStats(userId, initCharName);

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

module.exports.runStatsReport = async (client, commandType) => {
	try {
		let lastRep = await dbCmds.readRepDate("lastRealtorStatsReportDate");
		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		console.log(`Running ${commandType} Statistics Report on ${logTime}`);

		let employeeStats = await dbCmds.monthlyRealtorStatsRep();
		let realtorStatsDescList = '';

		for (let i = 0; i < employeeStats.length; i++) {
			if (employeeStats[i].monthlyHousesSold > 0 ||
				employeeStats[i].monthlyWarehousesSold > 0 ||
				employeeStats[i].monthlyPropertiesQuoted > 0 ||
				employeeStats[i].monthlyPropertiesRepod > 0 ||
				employeeStats[i].monthlyActivityChecks > 0 ||
				employeeStats[i].monthlyMiscSales > 0 ||
				employeeStats[i].monthlyFinancialAgreements > 0 ||
				employeeStats[i].monthlyQuotesReviewed > 0) {

				realtorStatsDescList = realtorStatsDescList.concat(`\n\n<@${employeeStats[i].discordId}>`);

				if (employeeStats[i].monthlyHousesSold >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Houses Sold:** ${employeeStats[i].monthlyHousesSold}`);
				}
				if (employeeStats[i].monthlyWarehousesSold >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Warehouses Sold:** ${employeeStats[i].monthlyWarehousesSold}`);
				}
				if (employeeStats[i].monthlyPropertiesQuoted >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Properties Quoted:** ${employeeStats[i].monthlyPropertiesQuoted}`);
				}
				if (employeeStats[i].monthlyPropertiesRepod >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Properties Repossessed:** ${employeeStats[i].monthlyPropertiesRepod}`);
				}
				if (employeeStats[i].monthlyActivityChecks >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Train Activities Checked:** ${employeeStats[i].monthlyActivityChecks}`);
				}
				if (employeeStats[i].monthlyMiscSales >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Misc. Sales Completed:** ${employeeStats[i].monthlyMiscSales}`);
				}
				if (employeeStats[i].monthlyFinancialAgreements >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Financial Agreements Filed:** ${employeeStats[i].monthlyFinancialAgreements}`);
				}
				if (employeeStats[i].monthlyQuotesReviewed >= 1) {
					realtorStatsDescList = realtorStatsDescList.concat(`\n• **Quotes Reviewed:** ${employeeStats[i].monthlyQuotesReviewed}`);
				}
			}
			await dbCmds.resetMonthlyRealtorStats(employeeStats[i].discordId);
		}

		await editEmbed.editMainEmbed(client);

		if (lastRep == null || lastRep.includes("Value not found")) {
			let nowMinus7 = now - 604800;
			lastRep = `<t:${nowMinus7}:d>`
		}

		if (realtorStatsDescList == '') {
			realtorStatsDescList = "There is no realtor data to display for this time period."
		}

		let countMonthlyHousesSold = await dbCmds.readSummValue("countMonthlyHousesSold");
		let countMonthlyWarehousesSold = await dbCmds.readSummValue("countMonthlyWarehousesSold");
		let countMonthlyPropertiesQuoted = await dbCmds.readSummValue("countMonthlyPropertiesQuoted");
		let countMonthlyPropertiesRepod = await dbCmds.readSummValue("countMonthlyPropertiesRepod");
		let countMonthlyTrainActivitiesChecked = await dbCmds.readSummValue("countMonthlyTrainActivitiesChecked");
		let countMonthlyMiscSales = await dbCmds.readSummValue("countMonthlyMiscSales");
		let countMonthlyFinancialAgreements = await dbCmds.readSummValue("countMonthlyFinancialAgreements");

		await dbCmds.resetSummValue("countMonthlyHousesSold");
		await dbCmds.resetSummValue("countMonthlyWarehousesSold");
		await dbCmds.resetSummValue("countMonthlyPropertiesQuoted");
		await dbCmds.resetSummValue("countMonthlyPropertiesRepod");
		await dbCmds.resetSummValue("countMonthlyTrainActivitiesChecked");
		await dbCmds.resetSummValue("countMonthlyMiscSales");
		await dbCmds.resetSummValue("countMonthlyFinancialAgreements");

		// theme color palette: https://coolors.co/palette/ffe169-fad643-edc531-dbb42c-c9a227-b69121-a47e1b-926c15-805b10-76520e

		let mainFields = [];

		if (countMonthlyHousesSold >= 1) {
			countMonthlyHousesSold = countMonthlyHousesSold.toString();
			mainFields.push({ name: `Houses Sold: `, value: `${countMonthlyHousesSold}` });
		}
		if (countMonthlyWarehousesSold >= 1) {
			countMonthlyWarehousesSold = countMonthlyWarehousesSold.toString();
			mainFields.push({ name: `Warehouses Sold:`, value: `${countMonthlyWarehousesSold}` });
		}
		if (countMonthlyPropertiesQuoted >= 1) {
			countMonthlyPropertiesQuoted = countMonthlyPropertiesQuoted.toString();
			mainFields.push({ name: `Properties Quoted:`, value: `${countMonthlyPropertiesQuoted}` });
		}
		if (countMonthlyPropertiesRepod >= 1) {
			countMonthlyPropertiesRepod = countMonthlyPropertiesRepod.toString();
			mainFields.push({ name: `Properties Repossessed:`, value: `${countMonthlyPropertiesRepod}` });
		}
		if (countMonthlyTrainActivitiesChecked >= 1) {
			countMonthlyTrainActivitiesChecked = countMonthlyTrainActivitiesChecked.toString();
			mainFields.push({ name: `Train Activities Checked:`, value: `${countMonthlyTrainActivitiesChecked}` });
		}
		if (countMonthlyMiscSales >= 1) {
			countMonthlyMiscSales = countMonthlyMiscSales.toString();
			mainFields.push({ name: `Misc. Sales Completed:`, value: `${countMonthlyMiscSales}` });
		}
		if (countMonthlyFinancialAgreements >= 1) {
			countMonthlyFinancialAgreements = countMonthlyFinancialAgreements.toString();
			mainFields.push({ name: `Financial Agreements Filed:`, value: `${countMonthlyFinancialAgreements}` });
		}

		let overallStatsEmbed = new EmbedBuilder()
			.setTitle(`Monthly Dynasty 8 Stats Report for ${lastRep} through ${today}:`)
			.addFields(mainFields)
			.setColor('DBB42C');

		let realtorStatsEmbed = new EmbedBuilder()
			.setTitle(`Monthly Realtor Stats Report for ${lastRep} through ${today}:`)
			.setDescription(realtorStatsDescList)
			.setColor('EDC531');
		await client.channels.cache.get(process.env.EMAIL_INBOX_CHANNEL_ID).send({ embeds: [overallStatsEmbed, realtorStatsEmbed] });

		// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
		await dbCmds.setRepDate("lastRealtorStatsReportDate", today);

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

module.exports.checkOverduePayments = async (client) => {
	try {
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');
		console.log(`Checking for overdue payments on ${logTime}`);

		let channel = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);

		let sum_messages = [];
		let last_id;

		while (true) {
			const options = { limit: 100 };
			if (last_id) {
				options.before = last_id;
			}

			let messages = await channel.messages.fetch(options);
			sum_messages.push(...messages.values());
			last_id = messages.last().id;

			if (messages.size != 100 || sum_messages >= options.limit) {
				break;
			}
		}

		let now = Math.floor(new Date().getTime() / 1000.0);

		sum_messages.forEach(async (message) => {
			if (message.embeds[0]) {
				let embedTitle = message.embeds[0].data.title;
				if (embedTitle === 'A new Financing Agreement has been submitted!') {
					let msgPaymentDueDate = message.embeds[0].data.fields[2].value;
					let paidOffDueDateStr = msgPaymentDueDate.substring(0, msgPaymentDueDate.indexOf(' ('))
					let paidOffDueDate = Number(paidOffDueDateStr.replaceAll('<t:', '').replaceAll(':d>', ''));

					if (now >= paidOffDueDate) { // overdue payments
						if (message.components.length == 0) {
							let msgPaymentDueDate = message.embeds[0].data.fields[2].value;
							let msgFinanceNum = message.embeds[0].data.fields[3].value;
							let msgClientName = message.embeds[0].data.fields[4].value;
							let msgClientInfo = message.embeds[0].data.fields[5].value;
							let msgClientContact = message.embeds[0].data.fields[6].value;
							let msgStreetAddr = message.embeds[0].data.fields[7].value;
							let msgAmtOwed = message.embeds[0].data.fields[10].value;
							let msgFinancingAgreement = message.embeds[0].data.fields[11].value;

							let overdueBtnRows = [new ActionRowBuilder().addComponents(
								new ButtonBuilder()
									.setCustomId('markPaymentsComplete')
									.setLabel('Mark as Completed')
									.setStyle(ButtonStyle.Success),

								new ButtonBuilder()
									.setCustomId('createEvictionNotice')
									.setLabel('Create an Eviction Notice')
									.setStyle(ButtonStyle.Primary),
							)];
							await message.edit({ embeds: message.embeds, components: overdueBtnRows });

							// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

							let overdueEmbed = new EmbedBuilder()
								.setTitle('A Financing Agreement has a past due date!')
								.addFields(
									{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
									{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
									{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
									{ name: `Paid Off Payment Date:`, value: `${msgPaymentDueDate}` },
									{ name: `Financing ID Number:`, value: `${msgFinanceNum}`, inline: true },
									{ name: `Street Address:`, value: `${msgStreetAddr}`, inline: true },
									{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
									{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
									{ name: `Message Link:`, value: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` },
								)
								.setColor('FFA630');

							await client.channels.cache.get(process.env.FINANCING_ALERTS_CHANNEL_ID).send({ embeds: [overdueEmbed] });
						} else if (message.components[0].components.length == 3 && message.components[0].components[2].data.disabled == true) {
							if (now >= (paidOffDueDate + (86400 * 3))) { // eviction ready

								let msgPaymentDueDate = message.embeds[0].data.fields[2].value;
								let msgFinanceNum = message.embeds[0].data.fields[3].value;
								let msgClientName = message.embeds[0].data.fields[4].value;
								let msgClientInfo = message.embeds[0].data.fields[5].value;
								let msgClientContact = message.embeds[0].data.fields[6].value;
								let msgStreetAddr = message.embeds[0].data.fields[7].value;
								let msgAmtOwed = message.embeds[0].data.fields[10].value;
								let msgFinancingAgreement = message.embeds[0].data.fields[11].value;

								let evictionBtnRows = [new ActionRowBuilder().addComponents(
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
										.setStyle(ButtonStyle.Danger),
								)];
								await message.edit({ embeds: message.embeds, components: evictionBtnRows });

								// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

								let evictionEmbed = new EmbedBuilder()
									.setTitle('A Financing Agreement is ready for eviction!')
									.addFields(
										{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
										{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
										{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
										{ name: `Paid Off Payment Date:`, value: `${msgPaymentDueDate}` },
										{ name: `Financing ID Number:`, value: `${msgFinanceNum}`, inline: true },
										{ name: `Street Address:`, value: `${msgStreetAddr}`, inline: true },
										{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
										{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
										{ name: `Message Link:`, value: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` },
									)
									.setColor('B80600');

								await client.channels.cache.get(process.env.FINANCING_ALERTS_CHANNEL_ID).send({ embeds: [evictionEmbed] });
							}
						}
					}
				}
			}
		});
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