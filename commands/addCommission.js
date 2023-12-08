let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let personnelCmds = require('../personnelCmds.js');
let commissionCmds = require('../commissionCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
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
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let user = interaction.options.getUser('user');
				if (interaction.user.id == user.id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

					let personnelStats = await dbCmds.readPersStats(user.id);
					if (personnelStats == null || personnelStats.charName == null) {
						await personnelCmds.initPersonnel(interaction.client, user.id);
					}

					let amount = Math.abs(interaction.options.getInteger('amount'));
					let reason = interaction.options.getString('reason');
					let newCommission = await commissionCmds.addCommission(interaction.client, `<@${interaction.user.id}>`, amount, user.id, reason);
					let formattedAmt = formatter.format(amount);

					await interaction.editReply({ content: `Successfully added \`${formattedAmt}\` to <@${user.id}>'s current commission for a new total of \`${newCommission}\`.`, ephemeral: true });
				} else {
					await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
			} else {
				await interaction.editReply({ content: `:x: You must have the \`Full-Time\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				console.error(error);
			} else {
				console.error(error);

				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.log(`An error occured at ${errTime} at file ${fileName}!`);

				let errString = error.toString();

				if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.') {
					try {
						await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					} catch {
						await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					}
				}

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${errString}\`\`\``)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	},
};