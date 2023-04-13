const dbCmds = require('./dbCmds.js');
const editEmbed = require('./editEmbed.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		const buttonID = interaction.customId;
		switch (buttonID) {
			case 'addHouseSold':
				const addHouseSoldModal = new ModalBuilder()
					.setCustomId('houseSoldModal')
					.setTitle('Add a house that you sold');
				const soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel("Who did you sell the house to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Rick Grimes')
					.setRequired(true);
				const lotNumInput = new TextInputBuilder()
					.setCustomId('lotNumInput')
					.setLabel("What is the house lot number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('4567')
					.setRequired(true);
				const priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('150000')
					.setRequired(true);
				const locNotesInput = new TextInputBuilder()
					.setCustomId('locNotesInput')
					.setLabel("What is the locat. and notes about the sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Baytree Canyon Rd, provided smart locks')
					.setRequired(true);
				const photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel("Include 1 photo of GPS & 1 of front of house")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/wgJiq13.jpg, https://i.imgur.com/hv6jVYT.jpg')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				const soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				const lotNumInputRow = new ActionRowBuilder().addComponents(lotNumInput);
				const priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				const locNotesInputRow = new ActionRowBuilder().addComponents(locNotesInput);
				const photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addHouseSoldModal.addComponents(soldToInputRow, lotNumInputRow, priceInputRow, locNotesInputRow, photosInputRow);

				await interaction.showModal(addHouseSoldModal);
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
	}
	catch (error) {
		console.log(`Error in button press!`);
		console.error(error);
	}
};