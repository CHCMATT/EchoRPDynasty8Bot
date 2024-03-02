let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'deletethreads',
	description: 'Deletes any messages in the specified channel where the message is someone starting a thread',
	options: [
		{
			name: 'channel',
			description: 'The channel that you\'d like to delete messages from',
			type: 7,
			required: true,
		},
	],
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let channelSelection = interaction.options.getChannel('channel');
				let channel = await interaction.client.channels.fetch(channelSelection.id);

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

				let deletedMsgCnt = 0;

				sum_messages.forEach(async (message) => {
					if (message.author.bot == false && message.type == 18) {
						await message.delete();
						deletedMsgCnt++;
					}
				});

				await interaction.editReply({ content: `Successfully deleted \`${deletedMsgCnt}\` Thread Creation messages.`, ephemeral: true });
			}
			else {
				await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.error(errTime, fileName, error);
			} else {
				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];
				console.error(errTime, fileName, error);

				console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

				let errString = error.toString();
				let errHandled = false;

				if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
					try {
						await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					} catch {
						await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					}
					errHandled = true;
				}

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${errString}\`\`\``)
					.addFields(
						{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
						{ name: `Error handled?`, value: `${errHandled}`, inline: true },
						{ name: `Server name:`, value: `${interaction.member.guild.name}`, inline: true },
					)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	},
};