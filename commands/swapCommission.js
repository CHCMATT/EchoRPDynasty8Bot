let dbCmds = require('../dbCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'swapcommission',
	description: 'Swaps the specified amount from the 1st specified user to the 2nd specified user\'s commission',
	options: [
		{
			name: 'removeuser',
			description: 'The user you\'d like to remove commission from',
			type: 6,
			required: true,
		},
		{
			name: 'adduser',
			description: 'The user you\'d like to add commission to',
			type: 6,
			required: true,
		},
		{
			name: 'amount',
			description: 'The amount of commission you\'d like to remove',
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
			let removeUser = interaction.options.getUser('removeuser');
			let addUser = interaction.options.getUser('adduser');
			if (interaction.user.id == removeUser.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let amount = Math.abs(interaction.options.getInteger('amount'));
				let reason = interaction.options.getString('reason');
				let formattedAmt = formatter.format(amount);
				let removeUserPersonnelData = await dbCmds.readPersStats(removeUser.id);
				if (removeUserPersonnelData.currentCommission != null && removeUserPersonnelData.currentCommission > 0) {
					await dbCmds.removeCommission(removeUser.id, amount)
					await dbCmds.addCommission(addUser.id, amount)
					let removeUserPersonnelData = await dbCmds.readPersStats(removeUser.id)
					let addUserPersonnelData = await dbCmds.readPersStats(addUser.id)
					let removeUserNewCommission = removeUserPersonnelData.currentCommission;
					let addUserNewCommission = addUserPersonnelData.currentCommission;
					let formattedRemoveUserNewCommission = formatter.format(removeUserNewCommission);
					let formattedAddUserNewCommission = formatter.format(addUserNewCommission);
					// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
					let notificationEmbed1 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> removed \`${formattedAmt}\` from <@${removeUser.id}>'s current commission for a new total of \`${formattedRemoveUserNewCommission}\`.\n\n**Reason:** \`${reason}\`.`)
						.setColor('FFA630');

					let notificationEmbed2 = new EmbedBuilder()
						.setTitle('Commission Modified Manually:')
						.setDescription(`<@${interaction.user.id}> added \`${formattedAmt}\` to <@${addUser.id}>'s current commission for a new total of \`${formattedAddUserNewCommission}\`.\n\n**Reason:** \`${reason}\`.`)
						.setColor('FFA630');

					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed1] });
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed2] });

					await interaction.reply({ content: `Successfully swapped \`${formattedAmt}\` from <@${removeUser.id}> to <@${addUser.id}>'s current commission.`, ephemeral: true });
				} else {
					await interaction.reply({ content: `:exclamation: <@${removeUser.id}> doesn't have any commission to swap, yet.`, ephemeral: true });
				}
			} else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};