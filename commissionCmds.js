var { EmbedBuilder } = require('discord.js');
var dbCmds = require('./dbCmds.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.weeklyReport = async (client) => {
	var now = Math.floor(new Date().getTime() / 1000.0);
	var nowMinus7 = now - 604800;
	var today = `<t:${now}:d>`;
	var lastweek = `<t:${nowMinus7}:d>`;

	var peopleArray = await dbCmds.weeklyCommissionRep();
	var commissionDescList = '';

	for (i = 0; i < peopleArray.length; i++) {
		commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}**: ${formatter.format(peopleArray[i].currentCommission)}\n`);
		await dbCmds.resetCommission(peopleArray[i].discordId);
	}

	if (commissionDescList == '') {
		commissionDescList = "There is no commission to pay this week."
	}

	var embed = new EmbedBuilder()
		.setTitle(`Weekly commission report for ${lastweek} through ${today}:`)
		.setDescription(commissionDescList)
		.setColor('EDC531');

	await client.channels.cache.get(process.env.COMMISSION_REPORT_CHANNEL_ID).send({ embeds: [embed] });
};