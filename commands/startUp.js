let moment = require('moment');
let startUp = require('../startup.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'startup',
	description: 'Posts the embed to the specified channel',
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				const postOrEditMain = await startUp.mainStartUp(interaction.client);
				const postOrEditFrontDesk = await startUp.frontDeskStartUp(interaction.client);
				await interaction.editReply({ content: `Successfully ${postOrEditMain} the main embed in the <#${process.env.EMBED_CHANNEL_ID}> channel and ${postOrEditFrontDesk} the front desk embed in the <#${process.env.FRONT_DESK_CHANNEL_ID}>.`, ephemeral: true });
			}
			else {
				await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
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
	},
};