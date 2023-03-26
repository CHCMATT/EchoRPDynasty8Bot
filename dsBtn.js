const dbCmds = require('./dbCmds.js');
const editEmbed = require('./editEmbed.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		const buttonID = interaction.customId;
		switch (buttonID) {
			case 'addSW':
				await dbCmds.addOne("countSearchWarrants");
				const newSearchWarrantsTotal = await dbCmds.readValue("countSearchWarrants");
				await editEmbed.editEmbed(interaction.client);
				await interaction.reply({ content: `Successfully added \`1\` to the \`Search Warrants\` counter - the new total is \`${newSearchWarrantsTotal}\`.`, ephemeral: true });
				await interaction.client.channels.cache.get(process.env.AUDIT_CHANNEL_ID).send(`:white_check_mark: \`${interaction.member.nickname}\` (\`${interaction.member.user.username}\`) added \`1\` to the \`Search Warrants\` counter for a new total of \`${newSearchWarrantsTotal}\`.`)
				break;
			case 'addSubpoenas':
				await dbCmds.addOne("countSubpoenas");
				const newSubpoenasTotal = await dbCmds.readValue("countSubpoenas");
				await editEmbed.editEmbed(interaction.client);
				await interaction.reply({ content: `Successfully added \`1\` to the \`Subpoenas\` counter - the new total is \`${newSubpoenasTotal}\`.`, ephemeral: true });
				await interaction.client.channels.cache.get(process.env.AUDIT_CHANNEL_ID).send(`:white_check_mark: \`${interaction.member.nickname}\` (\`${interaction.member.user.username}\`) added \`1\` to the \`Subpoenas\` counter for a new total of \`${newSubpoenasTotal}\`.`)
				break;
			case 'addCall':
				const addCallsModal = new ModalBuilder()
					.setCustomId('callsAttendedModal')
					.setTitle('Add a call that you attended');
				const callsAttendedReportNumInput = new TextInputBuilder()
					.setCustomId('callsAttendedReportNumInput')
					.setLabel("What is the MDT report #? (if applicable)")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('12345')
					.setRequired(false);
				const callsAttendedNotesInput = new TextInputBuilder()
					.setCustomId('callsAttendedNotesInput')
					.setLabel("Is there anything to note? (if applicable)")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('There was a piece of pie found on scene.')
					.setRequired(false);
				const callsAttendedAddtlOffcInput = new TextInputBuilder()
					.setCustomId('callsAttendedAddtlOffcInput')
					.setLabel("Any attl. CID members on the call with you?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('501, 314, etc...')
					.setRequired(false);
				const callsAttendedReportNumInputRow = new ActionRowBuilder().addComponents(callsAttendedReportNumInput);
				const callsAttendedNotesInputRow = new ActionRowBuilder().addComponents(callsAttendedNotesInput);
				const callsAttendedAddtlOffcInputRow = new ActionRowBuilder().addComponents(callsAttendedAddtlOffcInput);
				addCallsModal.addComponents(callsAttendedReportNumInputRow, callsAttendedNotesInputRow, callsAttendedAddtlOffcInputRow);
				await interaction.showModal(addCallsModal);
				break;
			case 'addMoney':
				const addMoneyModal = new ModalBuilder()
					.setCustomId('moneySeizedModal')
					.setTitle('Add a quantity of money seized');
				const moneySeizedInput = new TextInputBuilder()
					.setCustomId('moneySeizedInput')
					.setLabel("How much money did you seize?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('100')
					.setRequired(true);
				const moneyCaseNumInput = new TextInputBuilder()
					.setCustomId('moneyCaseNumInput')
					.setLabel("What is the MDT report # attached to this?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('12345')
					.setRequired(true);
				const moneyCaseFileLinkInput = new TextInputBuilder()
					.setCustomId('moneyCaseFileLinkInput')
					.setLabel("What is the link to the case file on this?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('https://docs.google.com/')
					.setRequired(true);
				const moneySeizedInputRow = new ActionRowBuilder().addComponents(moneySeizedInput);
				const moneyCaseNumInputRow = new ActionRowBuilder().addComponents(moneyCaseNumInput);
				const moneyCaseFileLinkInputRow = new ActionRowBuilder().addComponents(moneyCaseFileLinkInput);
				addMoneyModal.addComponents(moneySeizedInputRow, moneyCaseNumInputRow, moneyCaseFileLinkInputRow);
				await interaction.showModal(addMoneyModal);
				break;
			case 'addGuns':
				const addGunsModal = new ModalBuilder()
					.setCustomId('gunsSeizedModal')
					.setTitle('Add a quantity of guns seized');
				const gunsSeizedInput = new TextInputBuilder()
					.setCustomId('gunsSeizedInput')
					.setLabel("How many guns did you seize?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('25')
					.setRequired(true);
				const gunsLocationInput = new TextInputBuilder()
					.setCustomId('gunsLocationInput')
					.setLabel("Where did you seize these guns from?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Ava Lee search warrant')
					.setRequired(true);
				const gunsSeizedInputRow = new ActionRowBuilder().addComponents(gunsSeizedInput);
				const gunsLocationInputRow = new ActionRowBuilder().addComponents(gunsLocationInput);
				addGunsModal.addComponents(gunsSeizedInputRow, gunsLocationInputRow);
				await interaction.showModal(addGunsModal);
				break;
			case 'addDrugs':
				const addDrugsModal = new ModalBuilder()
					.setCustomId('drugsSeizedModal')
					.setTitle('Add a quantity of drugs seized');
				const drugsSeizedInput = new TextInputBuilder()
					.setCustomId('drugsSeizedInput')
					.setLabel("How many drugs did you seize?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('15')
					.setRequired(true);
				const drugsSeizedInputRow = new ActionRowBuilder().addComponents(drugsSeizedInput);
				addDrugsModal.addComponents(drugsSeizedInputRow);
				await interaction.showModal(addDrugsModal);
				break;
			default:
				await interaction.reply({ content: `I\'m not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
	}
	catch (error) {
		console.log(`Error in button press!`);
		console.error(error);
	}
};