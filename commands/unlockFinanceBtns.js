let moment = require('moment');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'unlockfinancingbtns',
	description: 'Unlocks any previously locked buttons on the specified Finance Agreement',
	options: [
		{
			name: 'financingnumber',
			description: 'The unique H##### that is tied to the Financing Agreement that you\'d like to adjust',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let financingNum = interaction.options.getString('financingnumber').toUpperCase();
				let countFound = 0;

				let channel = await interaction.client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);

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

				sum_messages.forEach(async (message) => {
					if (message.embeds[0]) {
						if (message.embeds[0].data.title === 'A new Financing Agreement has been submitted!') {
							let msgFinanceNum = message.embeds[0].data.fields[3].value;

							if (msgFinanceNum == financingNum) {
								countFound++;

								let msgBtnRow = message.components[0];
								let msgBtns = msgBtnRow.components;
								let btnsModified = 0;

								for (let i = 0; i < (msgBtns.length - 1); i++) {
									if (msgBtnRow.components[i].data.disabled == true) {
										btnsModified = btnsModified + 1;
										msgBtnRow.components[i].data.disabled = false;
									}
								}

								await message.edit({ embeds: message.embeds, components: [msgBtnRow] })

								await interaction.reply({ content: `Successfully modified \`${btnsModified}\` buttons on the \`${financingNum}\` financing agreement.`, ephemeral: true });
							}
						}
					}
				})

				if (countFound < 1) {
					await interaction.reply({ content: `:exclamation: Unable to find a Financing Agreement # of \`${financingNum}\` Please check to make sure you have the right number and try again.`, ephemeral: true });
				}

			} else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
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
	},
};