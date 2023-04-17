var dbCmds = require('../dbCmds.js');
var { PermissionsBitField } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'checkcommission',
	description: 'Checks your current commission metrics',
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.user;
			var personnelData = await dbCmds.readPersStats(user.id)
			if (personnelData !== null && personnelData.currentCommission > 1) {
				var currentCommission = personnelData.currentCommission;
				var formattedCommission = formatter.format(currentCommission);

				await interaction.reply({ content: `Your current commission is: \`${formattedCommission}\`.`, ephemeral: true });
			}
			else {
				await interaction.reply({ content: `:exclamation: You do not have any commission to report yet.`, ephemeral: true });

			}
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};