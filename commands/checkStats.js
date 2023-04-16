var dbCmds = require('../dbCmds.js');
var { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'checkstats',
	description: 'Checks the statistics of the specific user',
	options: [
		{
			name: 'user',
			description: 'The user you\'d like to check statistics on',
			type: 6,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var user = interaction.options.getUser('user');
			var personnelData = await dbCmds.readPersStats(user.id)
			if (personnelData !== null) {

				var charName = personnelData.charName;
				var embedColor = personnelData.embedColor;
				var housesSold = personnelData.housesSold;
				var warehousesSold = personnelData.warehousesSold;
				var propertiesQuoted = personnelData.propertiesQuoted;
				var propertiesRepod = personnelData.propertiesRepod;
				var activityChecks = personnelData.activityChecks;

				var embedDesc =
					`
		• **Houses Sold:** ${housesSold}
		• **Warehouses Sold:** ${warehousesSold}
		• **Properties Quoted:** ${propertiesQuoted}
		• **Properties Repossessed:** ${propertiesRepod}
		• **Train Activities Checked:** ${activityChecks}
		`

				var personnelEmbed = new EmbedBuilder()
					.setTitle(`Dynasty 8 statistics for ${charName}:`)
					.setDescription(embedDesc)
					.setColor(embedColor);

				await interaction.reply({ embeds: [personnelEmbed], ephemeral: true });
			}
			else {
				await interaction.reply({ content: `:exclamation: <@${user.id}> does not have any statistics yet.`, ephemeral: true });

			}
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};