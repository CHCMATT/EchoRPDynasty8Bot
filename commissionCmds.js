let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let { EmbedBuilder } = require('discord.js');
let commissionCmds = require('./commissionCmds.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.commissionReport = async (client, commandType) => {
	try {
		let lastRep;
		lastRep = await dbCmds.readRepDate("lastCommissionReportDate");
		let lastRepDt = Number(lastRep.replaceAll('<t:', '').replaceAll(':d>', ''));
		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;
		let dateTime = new Date().toString().slice(0, 24);
		let lastRepDiff = (now - lastRepDt);

		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		console.log(`Running ${commandType} Pay Report on ${logTime}`);

		if (lastRepDiff == null || isNaN(lastRepDiff) || lastRepDiff <= 172800) {
			console.log(`${commandType} Pay report skipped at ${dateTime} (lastRepDiff: ${lastRepDiff}).`)
			return "fail";
		} else {

			let peopleArray = await dbCmds.payReport();

			peopleArray.sort((a, b) => {
				return b.currentCommission - a.currentCommission;
			});

			let commissionDescList = '';

			for (i = 0; i < peopleArray.length; i++) {

				if (peopleArray[i].currentCommission == null) {
					peopleArray[i].currentCommission = 0
				}
				if (peopleArray[i].currentMiscPay == null) {
					peopleArray[i].currentMiscPay = 0
				}

				commissionDescList = commissionDescList.concat(`<@${peopleArray[i].discordId}> (\`${peopleArray[i].bankAccount}\`):\n> **Commission:** ${formatter.format(peopleArray[i].currentCommission)}\n> **Misc:** ${formatter.format(peopleArray[i].currentMiscPay)}\n\n`);
				await dbCmds.resetCurrPay(peopleArray[i].discordId);
			}

			if (commissionDescList == '') {
				commissionDescList = "There is nothing to pay this week."
			}

			if (lastRep == null || lastRep.includes("Value not found")) {
				let nowMinus7 = now - 604800;
				lastRep = `<t:${nowMinus7}:d>`
			}

			let embed = new EmbedBuilder()
				.setTitle(`Pay Report for ${lastRep} through ${today}:`)
				.setDescription(commissionDescList)
				.setColor('EDC531');
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [embed] });

			// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
			await dbCmds.setRepDate("lastCommissionReportDate", today);

			let reason = `Pay Report triggered on ${today}`
			let notificationEmbed = new EmbedBuilder()
				.setTitle('Pay Modified Automatically:')
				.setDescription(`\`System\` reset all realtor's pay to \`$0\`.\n\n**Reason:** ${reason}.`)
				.setColor('1EC276');
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
			return "success";
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

module.exports.addWeeklyAssets = async (client) => {
	try {
		let now = Math.floor(new Date().getTime() / 1000.0);
		let today = `<t:${now}:d>`;

		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		console.log(`Adding Weekly Assets on ${logTime}`);

		let assetsArray = await dbCmds.readPersonnelAssets();

		assetsArray.sort((a, b) => {
			let fa = a.assetName.toLowerCase(),
				fb = b.assetName.toLowerCase();
			if (fa < fb) { return -1; }
			if (fa > fb) { return 1; }
			return 0;
		});

		for (i = 0; i < assetsArray.length; i++) {
			let assetCost = assetsArray[i].assetCost;
			let assetName = assetsArray[i].assetName;
			let discordId = assetsArray[i].discordId;

			let reason = `Weekly asset reimbursement for \`${assetName}\` on ${today}`;
			await commissionCmds.addMiscPay(client, 'System', assetCost, discordId, reason);
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

module.exports.addCommission = async (client, from, addAmount, userId, reason) => {
	try {
		let currCommission = formatter.format(await dbCmds.readCurrentCommission(userId));

		if (addAmount > 0) {
			await dbCmds.addCommission(userId, addAmount);
			currCommission = formatter.format(await dbCmds.readCurrentCommission(userId));
			let monthlyCommission = await dbCmds.readMonthlyCommission(userId);
			let currMonthlyCommission = formatter.format(monthlyCommission);

			if (monthlyCommission >= 300000) {
				let commissionCapEmbed = new EmbedBuilder()
					.setTitle(`A realtor has surpassed their commission cap for this month!`)
					.addFields(
						{ name: `Realtor Name:`, value: `<@${userId}>`, inline: true },
						{ name: `Currently Monthly Commission:`, value: `${currMonthlyCommission}`, inline: true },
					)
					.setColor('B80600');

				await client.channels.cache.get(process.env.EMAIL_INBOX_CHANNEL_ID).send({ embeds: [commissionCapEmbed] });
			}

			let formattedCommission = formatter.format(addAmount);
			// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

			let notificationEmbed;
			if (from == 'System') {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedCommission}\` to <@${userId}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('1EC276');
			} else {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Manually:')
					.setDescription(`${from} added \`${formattedCommission}\` to <@${userId}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('FFA630');
			}
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
		}
		return currCommission;

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

module.exports.removeCommission = async (client, from, removeAmount, userId, reason) => {
	try {
		let currCommission = formatter.format(await dbCmds.readCurrentCommission(userId));

		if (removeAmount > 0) {
			await dbCmds.removeCommission(userId, removeAmount);
			currCommission = formatter.format(await dbCmds.readCurrentCommission(userId));
			let formattedCommission = formatter.format(removeAmount);

			let notificationEmbed;

			// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

			if (from == 'System') {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Automatically:')
					.setDescription(`\`System\` removed \`${formattedCommission}\` to <@${userId}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('1EC276');
			} else {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Manually:')
					.setDescription(`${from} removed \`${formattedCommission}\` to <@${userId}>'s current commission for a new total of \`${currCommission}\`.\n\n**Reason:** ${reason}.`)
					.setColor('FFA630');
			}
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
		}
		return currCommission;

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

module.exports.addMiscPay = async (client, from, addAmount, userId, reason) => {
	try {
		let currentMiscPay = formatter.format(await dbCmds.readCurrentMiscPay(userId));

		if (addAmount > 0) {
			await dbCmds.addMiscPay(userId, addAmount);
			currentMiscPay = formatter.format(await dbCmds.readCurrentMiscPay(userId));

			let formattedMiscPay = formatter.format(addAmount);
			// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

			let notificationEmbed;
			if (from == 'System') {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Misc. Pay Modified Automatically:')
					.setDescription(`\`System\` added \`${formattedMiscPay}\` to <@${userId}>'s current miscellaneous pay for a new total of \`${currentMiscPay}\`.\n\n**Reason:** ${reason}.`)
					.setColor('1EC276');
			} else {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Misc. Pay Modified Manually:')
					.setDescription(`${from} added \`${formattedMiscPay}\` to <@${userId}>'s current miscellaneous pay for a new total of \`${currentMiscPay}\`.\n\n**Reason:** ${reason}.`)
					.setColor('FFA630');
			}
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
		}
		return currentMiscPay;

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

module.exports.removeMiscPay = async (client, from, removeAmount, userId, reason) => {
	try {
		let currentMiscPay = formatter.format(await dbCmds.readCurrentMiscPay(userId));

		if (removeAmount > 0) {
			await dbCmds.removeMiscPay(userId, removeAmount);
			currentMiscPay = formatter.format(await dbCmds.readCurrentMiscPay(userId));
			let formattedMiscPay = formatter.format(removeAmount);

			let notificationEmbed;

			// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

			if (from == 'System') {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Misc. Pay Modified Automatically:')
					.setDescription(`\`System\` removed \`${formattedMiscPay}\` to <@${userId}>'s current miscellaneous pay for a new total of \`${currentMiscPay}\`.\n\n**Reason:** ${reason}.`)
					.setColor('1EC276');
			} else {
				notificationEmbed = new EmbedBuilder()
					.setTitle('Misc. Pay Modified Manually:')
					.setDescription(`${from} removed \`${formattedMiscPay}\` to <@${userId}>'s current miscellaneous pay for a new total of \`${currentMiscPay}\`.\n\n**Reason:** ${reason}.`)
					.setColor('FFA630');
			}
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
		}
		return currentMiscPay;

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