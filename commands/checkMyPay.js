let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let miscFunctions = require('../miscFunctions.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'checkmypay',
	description: 'Displays your current commission and pay information',
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member._roles.includes(process.env.ASSISTANT_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

				var personnelStats = await dbCmds.readPersStats(interaction.member.user.id);

				let currentCommission = 0;
				let monthlyCommission = 0;
				let currentMiscPay = 0;
				let bankAccount = 'n/a';

				if (!Object.is(personnelStats, null)) {
					currentCommission = personnelStats.currentCommission
					monthlyCommission = personnelStats.monthlyCommission
					currentMiscPay = personnelStats.currentMiscPay
					bankAccount = personnelStats.bankAccount
				}

				if (currentCommission == null) {
					currentCommission = 0;
				}
				if (monthlyCommission == null) {
					monthlyCommission = 0;
				}
				if (currentMiscPay == null) {
					currentMiscPay = 0;
				}
				if (bankAccount == null) {
					bankAccount = 'n/a';
				}

				let formattedCurrCommission = formatter.format(currentCommission);
				let formattedMonthlyCommission = formatter.format(monthlyCommission);
				let formattedCurrMiscPay = formatter.format(currentMiscPay);

				await interaction.editReply({ content: `Your current pay information:\n> Commission this pay period: \`${formattedCurrCommission}\`\n> Commission this month: \`${formattedMonthlyCommission}\`\n> Misc. pay this pay period: \`${formattedCurrMiscPay}\`\n> Your bank account number: \`${bankAccount}\``, ephemeral: true })

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