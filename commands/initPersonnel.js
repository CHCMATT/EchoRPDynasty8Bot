let moment = require('moment');
let dbCmds = require('../dbCmds.js');
let personnelCmds = require('../personnelCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'initpersonnel',
	description: 'Initializes a person in the database, if they don\'t already exist',
	options: [
		{
			name: 'user',
			description: 'The user you\'d like to initialize in the database',
			type: 6,
			required: true,
		},
	],
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let user = interaction.options.getUser('user');

				let personnelStats = await dbCmds.readPersStats(user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, user.id);
				}

				await interaction.editReply({ content: `Successfully initialized <@${user.id}> in the database.`, ephemeral: true });
			} else {
				await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
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