const dbCmds = require('./dbCmds.js');
const editEmbed = require('./editEmbed.js');

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

function isValidUrl(string) {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

module.exports.modalSubmit = async (interaction) => {
	try {
		const modalID = interaction.customId;
		switch (modalID) {
			case 'houseSoldModal':
				await dbCmds.addOneSumm("countHousesSold");
				const newHousesSoldTotal = await dbCmds.readValue("countHousesSold");
				await editEmbed.editEmbed(interaction.client);
				await interaction.reply({ content: `Successfully added \`1\` to the \`Houses Sold\` counter - the new total is \`${newHousesSoldTotal}\`.`, ephemeral: true });
				await interaction.client.channels.cache.get(process.env.AUDIT_CHANNEL_ID).send(`:white_check_mark: \`${interaction.member.nickname}\` (\`${interaction.member.user.username}\`) added \`1\` to the \`Search Warrants\` counter for a new total of \`${newSearchWarrantsTotal}\`.`)
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		console.log(`Error in modal popup!`);
		console.error(error);
	}
};


