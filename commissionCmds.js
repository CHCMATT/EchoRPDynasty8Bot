let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let { EmbedBuilder } = require('discord.js');

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
		console.log(`Running ${commandType} Commission Report on ${logTime}`);

		if (lastRepDiff == null || isNaN(lastRepDiff) || lastRepDiff <= 172800) {
			console.log(`${commandType} Commission report skipped at ${dateTime} (lastRepDiff: ${lastRepDiff}).`)
			return "fail";
		} else {

			let peopleArray = await dbCmds.commissionRep();

			peopleArray.sort((a, b) => {
				return b.currentCommission - a.currentCommission;
			});

			let commissionDescList = '';

			for (i = 0; i < peopleArray.length; i++) {
				commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}** (\`${peopleArray[i].bankAccount}\`): ${formatter.format(peopleArray[i].currentCommission)}\n`);
				await dbCmds.resetCommission(peopleArray[i].discordId);
			}

			if (commissionDescList == '') {
				commissionDescList = "There is no commission to pay this week."
			}

			if (lastRep == null || lastRep.includes("Value not found")) {
				let nowMinus7 = now - 604800;
				lastRep = `<t:${nowMinus7}:d>`
			}

			let embed = new EmbedBuilder()
				.setTitle(`Commission Report for ${lastRep} through ${today}:`)
				.setDescription(commissionDescList)
				.setColor('EDC531');
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [embed] });

			// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
			await dbCmds.setRepDate("lastCommissionReportDate", today);

			let reason = `Commission Report triggered on ${today}`
			let notificationEmbed = new EmbedBuilder()
				.setTitle('Commission Modified Automatically:')
				.setDescription(`\`System\` reset all realtor's commissions to \`$0\`.\n\n**Reason:** ${reason}.`)
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
			let formattedAssetCost = formatter.format(assetCost);

			await dbCmds.addCommission(discordId, assetCost);

			var currCommission = await dbCmds.readCommission(discordId);
			let formattedCurrCommission = formatter.format(currCommission);

			let reason = `Weekly asset reimbursement for \`${assetName}\` on ${today}`;

			// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
			let notificationEmbed = new EmbedBuilder()
				.setTitle('Commission Modified Automatically:')
				.setDescription(`\`System\` added \`${formattedAssetCost}\` to <@${discordId}>'s current commission for a new total of \`${formattedCurrCommission}\`.\n\n**Reason:** ${reason}.`)
				.setColor('1EC276');
			await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
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