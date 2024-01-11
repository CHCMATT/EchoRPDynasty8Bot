let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let { v4: uuidv4 } = require('uuid');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'addweeklyasset',
	description: 'Adds an asset to be reimbursed weekly to the specified user',
	options: [
		{
			name: 'assetowner',
			description: 'The owner of the asset that will be reimbursed weekly',
			type: 6,
			required: true,
		},
		{
			name: 'assetname',
			description: 'The name of the asset that will be reimbursed weekly',
			type: 3,
			required: true,
		},
		{
			name: 'assetcost',
			description: 'The cost of the asset that will be reimbursed weekly',
			type: 4,
			required: true,
		},
	],
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let assetOwner = interaction.options.getUser('assetowner');
				let assetCost = Math.abs(interaction.options.getInteger('assetcost'));
				let assetName = interaction.options.getString('assetname');
				let assetUuid = uuidv4();

				await dbCmds.addPersonnelAsset(assetUuid, assetOwner, assetName, assetCost);

				let formattedAssetCost = formatter.format(assetCost);

				await interaction.editReply({ content: `Successfully added the \`${assetName}\` asset with a weekly cost \`${formattedAssetCost}\` to ${assetOwner}. This will be automatically added to their weekly commission for reimbursement.`, ephemeral: true });
			} else {
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