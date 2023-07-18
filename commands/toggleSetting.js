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
		try {
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

		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				console.error(error);
			} else {
				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

				console.log(`Error occured at ${errTime} at file ${fileName}!`);
				console.error(error);
			}
		}
	},
};