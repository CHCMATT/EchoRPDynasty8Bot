let moment = require('moment');
var dbCmds = require('./dbCmds.js');
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

				await client.channels.cache.get(process.env.TRAIN_ACTIVITY_CHANNEL_ID).send({ embeds: [alertEmbed] });

				await dbCmds.removeRepoRecheck(uniqueId);
			}
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

			await client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};

function addOverdueBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('markPaymentsComplete')
			.setLabel('Mark as Completed')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('createEvictionNotice')
			.setLabel('Create an Eviction Notice')
			.setStyle(ButtonStyle.Primary),
	);

	let rows = [row1];
	return rows;
};

function addEvictionBtnRows() {
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
			.setCustomId('completeEviction')
			.setLabel('Mark Eviction as Complete')
			.setStyle(ButtonStyle.Danger),
	);

	let rows = [row1];
	return rows;
};