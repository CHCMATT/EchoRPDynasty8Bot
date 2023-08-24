let dbCmds = require('../dbCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'checkfinancing',
	description: 'Check the current amount of Financing Agreements',
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let totalFinancialAgreements = await dbCmds.readSummValue('countFinancialAgreements');
				let totalFinancialPayments = await dbCmds.readSummValue('countFinancialPayments');

				let monthlyFinancialAgreements = await dbCmds.readSummValue('countMonthlyFinancialAgreements');
				let monthlyFinancialPayments = await dbCmds.readSummValue('countMonthlyFinancialPayments');

				let activeFinancialAgreements = await dbCmds.readSummValue('activeFinancialAgreements');
				let activeFinancialAmount = formatter.format(await dbCmds.readSummValue('activeFinancialAmount'));

				await interaction.reply({ content: `Overview of Dynasty 8's Financing Agreements:\n_Total_\n> ${totalFinancialAgreements} total agreements\n> ${totalFinancialPayments} total payments\n\n_Monthly_\n> ${monthlyFinancialAgreements} monthly agreements\n> ${monthlyFinancialPayments} monthly payments\n\n_Active_\n> ${activeFinancialAgreements} active agreements\n> ${activeFinancialAmount} outstanding debt`, ephemeral: true });
			}
			else {
				await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
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