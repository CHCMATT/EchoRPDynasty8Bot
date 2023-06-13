let { PermissionsBitField } = require('discord.js');
let statsReport = require('../statsReport.js');

module.exports = {
	name: 'statsreport',
	description: 'Manually runs the commission report for the Management team',
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			await statsReport.statsReport(interaction.client);
			await interaction.reply({ content: `Successfully ran the statistics report.`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};