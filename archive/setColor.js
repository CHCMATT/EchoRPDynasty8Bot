let dbCmds = require('../dbCmds.js');
const editEmbed = require('../editEmbed.js');
let { PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'setcolor',
	description: 'Sets the color of the Discord embed for the specified user',
	options: [
		{
			name: 'user',
			description: 'The user you\'d like to set the color for',
			type: 6,
			required: true,
		},
		{
			name: 'hexcolor',
			description: 'The new 6 digit HTML hex color code that you\'d like to set the color to',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			let user = interaction.options.getUser('user');
			let newHex = interaction.options.getString('hexcolor');
			if (newHex == "random") {
				let randomColor = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
				await dbCmds.setPersColor(user.id, randomColor);

				let charName = interaction.guild.members.cache.get(user.id).displayName;

				await editEmbed.editEmbed(interaction.client);

				await interaction.reply({ content: `Successfully changed the Discord embed color for \`${charName}\` to \`${randomColor}\`.`, ephemeral: true });

			} else {
				if (newHex.charAt(0) == "#") {
					newHex = newHex.slice(1)
				}

				if (isHexColor(newHex)) {
					await dbCmds.setPersColor(user.id, newHex);

					await editEmbed.editEmbed(interaction.client);

					let charName = interaction.guild.members.cache.get(user.id).displayName;
					await interaction.reply({ content: `Successfully changed the Discord embed color for \`${charName}\` to \`${newHex}\`.`, ephemeral: true });

				} else {
					await interaction.reply({ content: `:exclamation: \`${newHex}\` is not a valid HTML hex code, please be sure to enter only 6 numbers and letters (ex: DB4C2E) or the word "random" to generate a random new color code. You can use <https://htmlcolorcodes.com/> to pick a hex code.`, ephemeral: true });
				}
			}
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};

function isHexColor(hex) {
	return typeof hex === 'string'
		&& hex.length === 6
		&& !isNaN(Number('0x' + hex))
}
