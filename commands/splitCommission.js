let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let commissionCmds = require('../commissionCmds.js');
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
			description: 'The total amount of commission you\'d like to split (this number will be divided in half)',
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
			if (interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let fromUser = interaction.options.getUser('fromuser');
				let toUser = interaction.options.getUser('touser');
				if (interaction.user.id == fromUser.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					let amount = Math.abs(interaction.options.getInteger('amount'));
					let splitAmount = (amount * 0.50);
					let reason = interaction.options.getString('reason');
					let formattedSplitAmount = formatter.format(splitAmount);
					let fromUserPersonnelData = await dbCmds.readPersStats(fromUser.id);
					if (fromUserPersonnelData.currentCommission != null && fromUserPersonnelData.currentCommission > 0) {

						await commissionCmds.removeCommission(interaction.client, `<@${interaction.user.id}>`, splitAmount, fromUser.id, reason);
						await commissionCmds.addCommission(interaction.client, `<@${interaction.user.id}>`, splitAmount, toUser.id, reason);

						await interaction.reply({ content: `Successfully swapped \`${formattedSplitAmount}\` from <@${fromUser.id}> to <@${toUser.id}>'s current commission.`, ephemeral: true });
					} else {
						await interaction.reply({ content: `:exclamation: <@${fromUser.id}> doesn't have any commission to swap, yet.`, ephemeral: true });
					}
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
			} else {
				await interaction.reply({ content: `:x: You must have the \`Full-Time\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
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