var dbCmds = require('../dbCmds.js');
var { PermissionsBitField, EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'addcommission',
	description: 'Adds the specified amount to the specified user\'s current commission metrics',
	options: [
		{
			name: 'user',
			description: 'The user you\'d like to modify commission on',
			type: 6,
			required: true,
		},
		{
			name: 'amount',
			description: 'The amount of commission you\'d like to add',
			type: 4,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason for modifying the commission',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.options.getUser('user');
			if (interaction.user.id == user.id || interaction.member.id == '220286286064386048' || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				var amount = Math.abs(interaction.options.getInteger('amount'));
				var reason = interaction.options.getString('reason');
				var formattedAmt = formatter.format(amount);
				var personnelData = await dbCmds.readPersStats(user.id)
				await dbCmds.addCommission(user.id, amount)
				var personnelData = await dbCmds.readPersStats(user.id)
				var newCommission = personnelData.currentCommission;
				var formattedNewCommission = formatter.format(newCommission);
				// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
				var notificationEmbed = new EmbedBuilder()
					.setTitle('Commission Modified Manually:')
					.setDescription(`<@${interaction.user.id}> added \`${formattedAmt}\` to <@${user.id}>'s current commission for a new total of \`${formattedNewCommission}\`.\n\n**Reason:** \`${reason}\`.`)
					.setColor('#FFA630');
				await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
				await interaction.reply({ content: `Successfully added \`${formattedAmt}\` to <@${user.id}>'s current commission for a new total of \`${formattedNewCommission}\`.`, ephemeral: true });
			} else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};