var checkPayments = require('../checkPayments.js');
var { PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'checkpayments',
	description: 'Checks to see if there are any overdue payments at this time',
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			await checkPayments.checkPayments(interaction.client);
			await interaction.reply({ content: `Initiated a check for $0 and overdue payments! *(this process will take about 45 seconds)*`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};