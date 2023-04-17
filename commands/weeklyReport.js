var { PermissionsBitField } = require('discord.js');
var commissionCmds = require('../commissionCmds.js');

module.exports = {
	name: 'weeklyreport',
	description: 'Manually runs the weekly commission report for Management',
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			commissionCmds.weeklyReport(interaction.client);
			await interaction.reply({ content: `Successfully ran the weekly report.`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};