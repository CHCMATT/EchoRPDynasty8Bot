let checkPayments = require('../checkPayments.js');
let { PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'checkpayments',
	description: 'Checks to see if there are any overdue payments at this time',
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			await checkPayments.checkPayments(interaction.client);
			await interaction.reply({ content: `Checking for overdue on payment agreements and agreements ready for repossession! *(this process will take about 30 seconds)*`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};