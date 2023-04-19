var { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		var buttonID = interaction.customId;
		switch (buttonID) {
			case 'addHouseSold':
				var addHouseSoldModal = new ModalBuilder()
					.setCustomId('addHouseSoldModal')
					.setTitle('Log a house that you sold');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel("Who did you sell the house to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Rick Grimes')
					.setRequired(true);
				var lotNumInput = new TextInputBuilder()
					.setCustomId('lotNumInput')
					.setLabel("What is the house lot number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('4567')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('150000')
					.setRequired(true);
				var locNotesInput = new TextInputBuilder()
					.setCustomId('locNotesInput')
					.setLabel("What is the locat. and notes about the sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Baytree Canyon Rd, provided smart locks')
					.setRequired(true);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel("Include photos of GPS & front of house")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/wgJiq13.jpg, https://i.imgur.com/hv6jVYT.jpg')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var lotNumInputRow = new ActionRowBuilder().addComponents(lotNumInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var locNotesInputRow = new ActionRowBuilder().addComponents(locNotesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addHouseSoldModal.addComponents(soldToInputRow, lotNumInputRow, priceInputRow, locNotesInputRow, photosInputRow);

				await interaction.showModal(addHouseSoldModal);
				break;
			case 'addWarehouseSold':
				var addWarehouseSoldModal = new ModalBuilder()
					.setCustomId('addWarehouseSoldModal')
					.setTitle('Log a warehouse that you sold');
				var soldToInput = new TextInputBuilder()
					.setCustomId('soldToInput')
					.setLabel("Who did you sell the warehouse to?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Chi Chi Kinsley')
					.setRequired(true);
				var lotNumInput = new TextInputBuilder()
					.setCustomId('lotNumInput')
					.setLabel("What is the warehouse lot number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('5678')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the final sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('250000')
					.setRequired(true);
				var locNotesInput = new TextInputBuilder()
					.setCustomId('locNotesInput')
					.setLabel("What is the locat. and notes about the sale?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Capital Blvd, upgraded to 5 car garage')
					.setRequired(true);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel("Include photos of GPS & front of warehouse")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/TBj8voN.jpg, https://i.imgur.com/gLGae7c.jpg')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				var soldToInputRow = new ActionRowBuilder().addComponents(soldToInput);
				var lotNumInputRow = new ActionRowBuilder().addComponents(lotNumInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var locNotesInputRow = new ActionRowBuilder().addComponents(locNotesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addWarehouseSoldModal.addComponents(soldToInputRow, lotNumInputRow, priceInputRow, locNotesInputRow, photosInputRow);

				await interaction.showModal(addWarehouseSoldModal);
				break;
			case 'addPropQuoted':
				var addPropertyQuoteModal = new ModalBuilder()
					.setCustomId('addPropertyQuoteModal')
					.setTitle('Request a quote for a property');
				var clientInfoInput = new TextInputBuilder()
					.setCustomId('clientInfoInput')
					.setLabel("What is the name and phone # of the client?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Dex Bishop - 323-869-5309')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What is the price you estimate it will be?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('850000')
					.setRequired(true);
				var intTypeInput = new TextInputBuilder()
					.setCustomId('intTypeInput')
					.setLabel("What is the requested interior type?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('HighEndV2')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes about the requested quote?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('House with a view on Rich Bitch Avenue, Vibes like Malibu')
					.setRequired(false);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel("Include photos of GPS & front of house")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/9ZMbCsA.jpg, https://i.imgur.com/ztKYnMn.jpg')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				var clientInfoInputRow = new ActionRowBuilder().addComponents(clientInfoInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var intTypeInputRow = new ActionRowBuilder().addComponents(intTypeInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addPropertyQuoteModal.addComponents(clientInfoInputRow, priceInputRow, intTypeInputRow, notesInputRow, photosInputRow);

				await interaction.showModal(addPropertyQuoteModal);
				break;
			case 'addPropRepod':
				var addPropertyRepodModal = new ModalBuilder()
					.setCustomId('addPropertyRepodModal')
					.setTitle('Log a property that you repossessed');
				var prevOwnerInput = new TextInputBuilder()
					.setCustomId('prevOwnerInput')
					.setLabel("What is the name & CID of the previous owner?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Jay Wild - 11870')
					.setRequired(true);
				var lotNumInput = new TextInputBuilder()
					.setCustomId('lotNumInput')
					.setLabel("What is the property lot number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('2345')
					.setRequired(true);
				var repoReasonInput = new TextInputBuilder()
					.setCustomId('repoReasonInput')
					.setLabel("What was the reason for the repossession?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Foreclosure')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes about the repossession?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Foreclosure, failure to pay')
					.setRequired(false);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel("Include photos of GPS & front of property")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/tnLaQWD.jpg, https://i.imgur.com/EZ81DMA.jpg')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				var prevOwnerInputRow = new ActionRowBuilder().addComponents(prevOwnerInput);
				var lotNumInputRow = new ActionRowBuilder().addComponents(lotNumInput);
				var repoReasonInputRow = new ActionRowBuilder().addComponents(repoReasonInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addPropertyRepodModal.addComponents(prevOwnerInputRow, lotNumInputRow, repoReasonInputRow, notesInputRow, photosInputRow);

				await interaction.showModal(addPropertyRepodModal);
				break;
			case 'addTrainCheck':
				var addTrainCheckModal = new ModalBuilder()
					.setCustomId('addTrainCheckModal')
					.setTitle('Request a train activity check');
				var currentOwnerInput = new TextInputBuilder()
					.setCustomId('currentOwnerInput')
					.setLabel("What is the name & CID of the current owner?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Astrid Dangle - 1007')
					.setRequired(true);
				var lotNumInput = new TextInputBuilder()
					.setCustomId('lotNumInput')
					.setLabel("What is the property lot number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('7890')
					.setRequired(true);
				var notesInput = new TextInputBuilder()
					.setCustomId('notesInput')
					.setLabel("Any notes about the train activity check?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Neighbor stated saw the owner with a moving truck')
					.setRequired(false);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel("Include 1 photo of GPS & front of house")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/D0IUm1C.jpg, https://i.imgur.com/Qo10LVH.jpg')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				var currentOwnerInputRow = new ActionRowBuilder().addComponents(currentOwnerInput);
				var lotNumInputRow = new ActionRowBuilder().addComponents(lotNumInput);
				var notesInputRow = new ActionRowBuilder().addComponents(notesInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);
				addTrainCheckModal.addComponents(currentOwnerInputRow, lotNumInputRow, notesInputRow, photosInputRow);
				await interaction.showModal(addTrainCheckModal);
				break;
			case 'addMiscSale':
				var addMiscSaleModal = new ModalBuilder()
					.setCustomId('addMiscSaleModal')
					.setTitle('Add a Miscellaneous Sale');
				var itemsSoldInput = new TextInputBuilder()
					.setCustomId('itemsSoldInput')
					.setLabel("What did you sell?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('3x Garage Slots')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the total sale price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('15000')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				var itemsSoldInputRow = new ActionRowBuilder().addComponents(itemsSoldInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				addMiscSaleModal.addComponents(itemsSoldInputRow, priceInputRow);
				await interaction.showModal(addMiscSaleModal);
				break;
			case 'addRemodelUpgrade':
				var addRemodelUpgradeModal = new ModalBuilder()
					.setCustomId('addRemodelUpgradeModal')
					.setTitle('Log an upgrade/remodel that you completed');
				var remodelForInput = new TextInputBuilder()
					.setCustomId('remodelForInput')
					.setLabel("Who did you remodel the house for?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Zhang Chin')
					.setRequired(true);
				var oldLotNumInput = new TextInputBuilder()
					.setCustomId('oldLotNumInput')
					.setLabel("What is the old lot number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('3456')
					.setRequired(true);
				var newLotNumNotesInput = new TextInputBuilder()
					.setCustomId('newLotNumNotesInput')
					.setLabel("What is the new lot number, and any notes?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('6789, upgraded to HighEndV3')
					.setRequired(true);
				var priceInput = new TextInputBuilder()
					.setCustomId('priceInput')
					.setLabel("What was the remodel/upgrade price?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('35000')
					.setRequired(true);
				var photosInput = new TextInputBuilder()
					.setCustomId('photosInput')
					.setLabel("Include photos of GPS & front of house")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('https://i.imgur.com/qTL6xiG.jpg, https://i.imgur.com/jMYxD9d.jpg')
					.setRequired(true);

				// meme gallery: https://imgur.com/gallery/Et0Qm

				var remodelForInputRow = new ActionRowBuilder().addComponents(remodelForInput);
				var oldLotNumInputRow = new ActionRowBuilder().addComponents(oldLotNumInput);
				var newLotNumNotesInputRow = new ActionRowBuilder().addComponents(newLotNumNotesInput);
				var priceInputRow = new ActionRowBuilder().addComponents(priceInput);
				var photosInputRow = new ActionRowBuilder().addComponents(photosInput);

				addRemodelUpgradeModal.addComponents(remodelForInputRow, oldLotNumInputRow, newLotNumNotesInputRow, priceInputRow, photosInputRow);
				await interaction.showModal(addRemodelUpgradeModal);
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