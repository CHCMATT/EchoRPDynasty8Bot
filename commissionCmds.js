let dbCmds = require('./dbCmds.js');
let { EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.commissionReport = async (client) => {
	let lastRep = await dbCmds.readRepDate("lastCommissionReportDate");
	let lastRepDt = Number(lastRep.replaceAll('<t:', '').replaceAll(':d>', ''));
	let now = Math.floor(new Date().getTime() / 1000.0);
	let today = `<t:${now}:d>`;
	let dateTime = new Date().toString().slice(0, 24);
	let lastRepDiff = (now - lastRepDt);

	if (lastRepDiff == null || isNaN(lastRepDiff) || lastRepDiff <= 64800) {
		console.log(`Commission report skipped at ${dateTime} (lastRepDiff: ${lastRepDiff})`)
		return "fail";
	} else {

		let peopleArray = await dbCmds.commissionRep();
		peopleArray.sort((a, b) => {
			return b.currentCommission - a.currentCommission;
		});
		let commissionDescList = '';

		for (i = 0; i < peopleArray.length; i++) {
			commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}** (\`${peopleArray[i].bankAccount}\`): ${formatter.format(peopleArray[i].currentCommission)}\n`);
			await dbCmds.resetCommission(peopleArray[i].discordId);
		}

		if (commissionDescList == '') {
			commissionDescList = "There is no commission to pay this week."
		}

		if (lastRep == null || lastRep.includes("Value not found")) {
			let nowMinus7 = now - 604800;
			let lastRep = `<t:${nowMinus7}:d>`
		}

		let embed = new EmbedBuilder()
			.setTitle(`Weekly Commission Report for ${lastRep} through ${today}:`)
			.setDescription(commissionDescList)
			.setColor('EDC531');
		await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [embed] });

		// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630
		await dbCmds.setRepDate("lastCommissionReportDate", today);

		let reason = `Commission Report triggered on ${today}`
		let notificationEmbed = new EmbedBuilder()
			.setTitle('Commission Modified Automatically:')
			.setDescription(`\`System\` reset all realtor's commissions to \`$0\`.\n\n**Reason:** ${reason}.`)
			.setColor('#1EC276');
		await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
		return "success";
	}
};