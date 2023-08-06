let dbCmds = require('../dbCmds.js');

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
			],
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		try {
			let discordId = interaction.member.id;
			let settingChoice = interaction.options.getString('setting');

			let currentSettingOption = await dbCmds.readPersSetting(discordId, settingChoice);

			if (settingChoice == 'settingQuotePing') {
				if (currentSettingOption) {
					dbCmds.setPersSetting(discordId, settingChoice, false);
					await interaction.reply({ content: `Successfully toggled the \`Quote Ping\` setting to \`off\`.`, ephemeral: true });
				} else {
					dbCmds.setPersSetting(discordId, settingChoice, true);
					await interaction.reply({ content: `Successfully toggled the \`Quote Ping\` setting to \`on\`.`, ephemeral: true });
				}
			} else if (settingChoice == 'settingReimbursementPing') {
				if (currentSettingOption) {
					dbCmds.setPersSetting(discordId, settingChoice, false);
					await interaction.reply({ content: `Successfully toggled the \`Reimbursement Ping\` setting to \`off\`.`, ephemeral: true });
				} else {
					dbCmds.setPersSetting(discordId, settingChoice, true);
					await interaction.reply({ content: `Successfully toggled the \`Reimbursement Ping\` setting to \`on\`.`, ephemeral: true });
				}
			} else {
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized setting to toggle: ${settingChoice}`);
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