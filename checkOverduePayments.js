let moment = require('moment');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.checkOverduePayments = async (client) => {
	try {
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
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

			if (messages.size != 100 || sum_messages >= limit) {
				break;
			}
		}

		console.log(`Found ${sum_messages.length} financial agreements`);
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

function addBtnRows() {
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
