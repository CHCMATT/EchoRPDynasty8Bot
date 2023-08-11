let dbCmds = require('../dbCmds.js');
let { v4: uuidv4 } = require('uuid');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'listweeklyassets',
	description: 'Lists all of the assets that are assigned to the specified user',
	options: [
		{
			name: 'assetowner',
			description: 'The owner of the assets',
			type: 6,
			required: true,
		},
	],
	async execute(interaction) {
		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let assetOwner = interaction.options.getUser('assetowner');
				let assetsArray = await dbCmds.listPersonnelAssets(assetOwner.id);

				if (assetsArray.length < 1) {
					await interaction.reply({ content: `${assetOwner} does not have any assigned assets yet.`, ephemeral: true });
				} else {
					let assetsList = '';
					for (let i = 0; i < assetsArray.length; i++) {
						assetsList = assetsList + `> \`${assetsArray[i].assetName}\`: ${formatter.format(assetsArray[i].assetCost)}\n`
					}
					await interaction.reply({ content: `${assetOwner} has the following asset(s):\n${assetsList}`, ephemeral: true });
				}

				//await interaction.reply({ content: `Successfully removed the \`${assetName}\` asset with a weekly cost \`${formattedAssetCost}\` to ${assetOwner}. This will be automatically added to their weekly commission for reimbursement.`, ephemeral: true });
			} else {
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