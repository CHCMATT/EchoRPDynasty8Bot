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
				const locationInput = new TextInputBuilder()
					.setCustomId('locationInput')
					.setLabel("Where was the house located?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Baytree Canyon Road')
					.setRequired(true);
				const priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('150000')
					.setRequired(true);
				const saleDateInput = new TextInputBuilder()
					.setCustomId('saleDateInput')
					.setLabel("What was date of sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('01/31/2023')
					.setRequired(true);
				const photo1Input = new TextInputBuilder()
					.setCustomId('photo1Input')
					.setLabel("What is your first photo of the house?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://i.imgur.com/laI8KzQ.jpeg')
					.setRequired(true);
				const photo2Input = new TextInputBuilder()
					.setCustomId('photo2Input')
					.setLabel("What is your second photo of the house?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://i.imgur.com/N0yFI2K.png')
					.setRequired(true);
				const photo3Input = new TextInputBuilder()
					.setCustomId('photo3Input')
					.setLabel("What is your third photo of the house?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://i.imgur.com/hv6jVYT.jpeg')
					.setRequired(true);
				const photo4Input = new TextInputBuilder()
					.setCustomId('photo4Input')
					.setLabel("What is your fourth photo of the house?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://i.imgur.com/wgJiq13.jpeg')
					.setRequired(true);
				const notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes to include?")
					.setStyle(TextInputStyle.Paragraph);

				const soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				const locationInputRow = new ActionRowBuilder().addComponents(locationInput);
				const priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				const saleDateInputRow = new ActionRowBuilder().addComponents(saleDateInput);
				const photo1InputRow = new ActionRowBuilder().addComponents(photo1Input);

				/*const photo2InputRow = new ActionRowBuilder().addComponents(photo2Input);
				const photo3InputRow = new ActionRowBuilder().addComponents(photo3Input);
				const photo4InputRow = new ActionRowBuilder().addComponents(photo4Input);
				const notesInputRow = new ActionRowBuilder().addComponents(notesInput);*/

				addHouseSoldModal.addComponents(soldToInputRow, locationInputRow, priceInputRow, saleDateInputRow, photo1InputRow);

				addHouseSoldModal.addComponents(soldToInputRow, locationInputRow, priceInputRow, saleDateInputRow, photo1InputRow, photo2InputRow, photo3InputRow, photo4InputRow, notesInputRow);

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