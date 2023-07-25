let dbCmds = require('../dbCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'splitcommission',
	description: 'Divides the amount by 50%, removes it from the 1st user, and adds to the 2nd user\'s commission',
	options: [
		{
			name: 'fromuser',
			description: 'The user you\'d like to remove commission from',
			type: 6,
			required: true,
		},
		{
			name: 'touser',
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
		try {
			if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let fromuser = interaction.options.getUser('fromuser');
				let touser = interaction.options.getUser('touser');
				if (interaction.user.id == fromuser.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let amount = Math.abs(interaction.options.getInteger('amount'));
					let splitAmount = (amount * 0.50);
					let reason = interaction.options.getString('reason');
					let formattedSplitAmount = formatter.format(splitAmount);
					let fromuserPersonnelData = await dbCmds.readPersStats(fromuser.id);
					if (fromuserPersonnelData.currentCommission != null && fromuserPersonnelData.currentCommission > 0) {
						await dbCmds.removeCommission(fromuser.id, splitAmount);
						await dbCmds.addCommission(touser.id, splitAmount);
						let fromuserPersonnelData = await dbCmds.readPersStats(fromuser.id);
						let touserPersonnelData = await dbCmds.readPersStats(touser.id);
						let fromuserNewCommission = fromuserPersonnelData.currentCommission;
						let touserNewCommission = touserPersonnelData.currentCommission;
						let formattedfromuserNewCommission = formatter.format(fromuserNewCommission);
						let formattedtouserNewCommission = formatter.format(touserNewCommission);
						// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
						let notificationEmbed1 = new EmbedBuilder()
							.setTitle('Commission Modified Manually:')
							.setDescription(`<@${interaction.user.id}> removed \`${formattedSplitAmount}\` from <@${fromuser.id}>'s current commission for a new total of \`${formattedfromuserNewCommission}\`.\n\n**Reason:** \`${reason}\`.`)
							.setColor('FFA630');

						let notificationEmbed2 = new EmbedBuilder()
							.setTitle('Commission Modified Manually:')
							.setDescription(`<@${interaction.user.id}> added \`${formattedSplitAmount}\` to <@${touser.id}>'s current commission for a new total of \`${formattedtouserNewCommission}\`.\n\n**Reason:** \`${reason}\`.`)
							.setColor('FFA630');

						await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed1] });
						await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed2] });

						await interaction.reply({ content: `Successfully swapped \`${formattedSplitAmount}\` from <@${fromuser.id}> to <@${touser.id}>'s current commission.`, ephemeral: true });
					} else {
						await interaction.reply({ content: `:exclamation: <@${fromuser.id}> doesn't have any commission to swap, yet.`, ephemeral: true });
					}
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
			} else {
				await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				console.error(error);
			} else {
				console.error(error);

				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.log(`Error occured at ${errTime} at file ${fileName}!`);

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	},
};