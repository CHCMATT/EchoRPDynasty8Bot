var dbCmds = require('../dbCmds.js');
var { PermissionsBitField } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'removecommission',
	description: 'Removes the specified amount from your current commission metrics',
	options: [
		{
			name: 'amount',
			description: 'The amount of commission you\'d like to remove',
			type: 4,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.user;
			var amount = interaction.options.getInteger('amount');
			var formattedAmt = formatter.format(amount);
			var personnelData = await dbCmds.readPersStats(user.id)
			if (personnelData !== null && personnelData.currentCommission > 1) {
				await dbCmds.subtractCommission(user.id, amount)
				var personnelData = await dbCmds.readPersStats(user.id)
				var newCommission = personnelData.currentCommission;
				var formattedNewCommission = formatter.format(newCommission);
				await interaction.reply({ content: `Successfully removed \`${formattedAmt}\` from your current commission for a new total of \`${formattedNewCommission}\`.`, ephemeral: true });
			}
			else {
				await interaction.reply({ content: `:exclamation: You do not have any commission to remove from.`, ephemeral: true });
			}
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};