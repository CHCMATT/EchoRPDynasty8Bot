let { PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'randomcolors',
	description: 'Random colors!',
	options: [
		{
			name: 'amount',
			description: 'The amount of random colors you\'d like to generate',
			type: 4,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			let amount = interaction.options.getInteger('amount');
			let randomColors = [];
			for (i = 0; i <= amount; i++) {
				randomColors.push("#" + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'));
			}
			await interaction.reply({ content: `Successfully generated \`${amount}\` random colors: \`\`\`${randomColors.join(', ')}\`\`\``, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};
