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
			],
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		let discordId = interaction.member.id;
		let settingChoice = interaction.options.getString('setting');

		let currentSettingOption = dbCmds.readPersSetting(discordId, settingChoice);

		if (settingChoice == 'settingQuotePing') {
			if (currentSettingOption) {
				dbCmds.setPersSetting(discordId, settingChoice, false);
				await interaction.reply({ content: `Successfully toggled the \`Quote Ping\` setting to \`off\`.`, ephemeral: true });

			} else {
				dbCmds.setPersSetting(discordId, settingChoice, true);
				await interaction.reply({ content: `Successfully toggled the \`Quote Ping\` setting to \`on\`.`, ephemeral: true });
			}
		} else {
			if (currentSettingOption) {
				dbCmds.setPersSetting(discordId, settingChoice, false);
				await interaction.reply({ content: `Successfully toggled the \`unknown name\` setting to \`off\`.`, ephemeral: true });

			} else {
				dbCmds.setPersSetting(discordId, settingChoice, true);
				await interaction.reply({ content: `Successfully toggled the \`unknown name\` setting to \`on\`.`, ephemeral: true });
			}
		}

	},
};