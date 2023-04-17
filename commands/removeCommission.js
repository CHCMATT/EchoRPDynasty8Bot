var dbCmds = require('../dbCmds.js');
var { PermissionsBitField, EmbedBuilder } = require('discord.js');

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
			name: 'user',
			description: 'The user you\'d like to modify commission on',
			type: 6,
			required: true,
		},
		{
			name: 'amount',
			description: 'The amount of commission you\'d like to remove',
			type: 4,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.options.getUser('user');
			if (interaction.user.id == user.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				var amount = interaction.options.getInteger('amount');
				var formattedAmt = formatter.format(amount);
				var personnelData = await dbCmds.readPersStats(user.id)
				await dbCmds.removeCommission(user.id, amount)
				var personnelData = await dbCmds.readPersStats(user.id)
				var newCommission = personnelData.currentCommission;
				var formattedNewCommission = formatter.format(newCommission);
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified:')
					.setDescription(`<@${interaction.user.id}> removed \`${formattedAmt}\` from <@${user.id}>'s current commission for a new total of \`${formattedNewCommission}\`.`)
					.setColor('#FFE169');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				await interaction.reply({ content: `Successfully removed \`${formattedAmt}\` from <@${user.id}>'s current commission for a new total of \`${formattedNewCommission}\`.`, ephemeral: true });
			} else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};