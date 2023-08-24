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
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let lastRep = await dbCmds.readRepDate("lastCommissionReportDate");
				let now = Math.floor(new Date().getTime() / 1000.0);
				let today = `<t:${now}:d>`;

				let peopleArray = await dbCmds.commissionRep();

				peopleArray.sort((a, b) => {
					return b.currentCommission - a.currentCommission;
				});

				let commissionList = '';
				let totalCommission = 0;

				for (i = 0; i < peopleArray.length; i++) {
					commissionList = commissionList.concat(`> • ${peopleArray[i].charName}: ${formatter.format(peopleArray[i].currentCommission)}\n`);
					totalCommission = totalCommission + Number(peopleArray[i].currentCommission);
				}

				let formattedTotalCommission = formatter.format(totalCommission);

				if (commissionList == '') {
					commissionList = "There is no commission to pay yet this week.";
				}

				let commissionMsg = `Commission Report for ${lastRep} through ${today}:\n**Total Overall Commission**: ${formattedTotalCommission}\n` + commissionList;

				if (lastRep == null || lastRep.includes("Value not found")) {
					let nowMinus7 = now - 604800;
					lastRep = `<t:${nowMinus7}:d>`
				}

				await interaction.reply({ content: commissionMsg, ephemeral: true });

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