let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'checkcommissions',
	description: 'Shows a list of current commissions without resetting anyone\'s commission',
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let lastRep = await dbCmds.readRepDate("lastCommissionReportDate");
				let now = Math.floor(new Date().getTime() / 1000.0);
				let today = `<t:${now}:d>`;

				let peopleArray = await dbCmds.payReport();

				peopleArray.sort((a, b) => {
					return b.currentCommission - a.currentCommission;
				});

				let commissionList = '';
				let miscPayList = '';
				let totalCommission = 0;
				let totalMiscPay = 0;

				for (i = 0; i < peopleArray.length; i++) {
					if (peopleArray[i].currentCommission > 0) {
						commissionList = commissionList.concat(`> • ${peopleArray[i].charName}: ${formatter.format(peopleArray[i].currentCommission)}\n`);
						totalCommission = totalCommission + Number(peopleArray[i].currentCommission);
					}
				}

				for (i = 0; i < peopleArray.length; i++) {
					if (peopleArray[i].currentMiscPay > 0) {
						miscPayList = miscPayList.concat(`> • ${peopleArray[i].charName}: ${formatter.format(peopleArray[i].currentMiscPay)}\n`);
						totalMiscPay = totalMiscPay + Number(peopleArray[i].currentMiscPay);
					}
				}

				let formattedTotalCommission = formatter.format(totalCommission);
				let formattedTotalMiscPay = formatter.format(totalMiscPay);

				if (commissionList == '') {
					commissionList = "There is no commission pay so far this week.";
				}

				if (miscPayList == '') {
					miscPayList = "There is no miscellaneous pay so far this week.";
				}

				let commissionMsg = `Commission Report for ${lastRep} through ${today}:\n\n**Total Overall Commission**: ${formattedTotalCommission}\n` + commissionList + `\n\n**Total Overall Misc. Pay**: ${formattedTotalMiscPay}\n` + miscPayList;

				if (lastRep == null || lastRep.includes("Value not found")) {
					let nowMinus7 = now - 604800;
					lastRep = `<t:${nowMinus7}:d>`
				}

				await interaction.editReply({ content: commissionMsg, ephemeral: true });

			}
			else {
				await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.error(errTime, fileName, error);
			} else {
				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];
				console.error(errTime, fileName, error);

				console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

				let errString = error.toString();
				let errHandled = false;

				if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
					try {
						await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					} catch {
						await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					}
					errHandled = true;
				}

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${errString}\`\`\``)
					.addFields(
						{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
						{ name: `Error handled?`, value: `${errHandled}`, inline: true },
					)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	},
};