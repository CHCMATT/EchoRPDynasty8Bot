let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'togglesetting',
	description: 'Toggles the specified setting to on or off',
	options: [
		{
			name: 'setting',
			description: 'The setting of which you\'d like to toggle',
			choices: [
				{ name: 'Quote Ping', value: 'settingQuotePing' },
				{ name: 'Reimbursement Ping', value: 'settingReimbursementPing' },
				{ name: 'Repossession Ping', value: 'settingRepossessionPing' },
			],
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			let discordId = interaction.member.id;
			let settingChoice = interaction.options.getString('setting');

			let currentSettingOption = await dbCmds.readPersSetting(discordId, settingChoice);

			if (settingChoice == 'settingQuotePing') {
				if (currentSettingOption) {
					dbCmds.setPersSetting(discordId, settingChoice, false);
					await interaction.editReply({ content: `Successfully toggled the \`Quote Ping\` setting to \`off\`.`, ephemeral: true });
				} else {
					dbCmds.setPersSetting(discordId, settingChoice, true);
					await interaction.editReply({ content: `Successfully toggled the \`Quote Ping\` setting to \`on\`.`, ephemeral: true });
				}
			} else if (settingChoice == 'settingReimbursementPing') {
				if (currentSettingOption) {
					dbCmds.setPersSetting(discordId, settingChoice, false);
					await interaction.editReply({ content: `Successfully toggled the \`Reimbursement Ping\` setting to \`off\`.`, ephemeral: true });
				} else {
					dbCmds.setPersSetting(discordId, settingChoice, true);
					await interaction.editReply({ content: `Successfully toggled the \`Reimbursement Ping\` setting to \`on\`.`, ephemeral: true });
				}
			} else if (settingChoice == 'settingRepossessionPing') {
				if (currentSettingOption) {
					dbCmds.setPersSetting(discordId, settingChoice, false);
					await interaction.editReply({ content: `Successfully toggled the \`Repossession Ping\` setting to \`off\`.`, ephemeral: true });
				} else {
					dbCmds.setPersSetting(discordId, settingChoice, true);
					await interaction.editReply({ content: `Successfully toggled the \`Repossession Ping\` setting to \`on\`.`, ephemeral: true });
				}
			} else {
				await interaction.editReply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized setting to toggle: ${settingChoice}`);
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