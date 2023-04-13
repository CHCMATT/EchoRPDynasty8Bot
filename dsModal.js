const dbCmds = require('./dbCmds.js');
const editEmbed = require('./editEmbed.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, EmbedBuilder } = require('discord.js');

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

function isValidUrl(string) {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

module.exports.modalSubmit = async (interaction) => {
	try {
		const modalID = interaction.customId;
		switch (modalID) {
			case 'houseSoldModal':
				try {
					var realtorName;
					if (interaction.member.nickname) {
						realtorName = interaction.member.nickname;
					} else {
						realtorName = interaction.member.user.username;
					}

					const now = Math.floor(new Date().getTime() / 1000.0);
					const saleDate = `<t:${now}:d>`;

					const soldTo = interaction.fields.getTextInputValue('soldToInput').trimEnd().trimStart();
					const lotNum = interaction.fields.getTextInputValue('lotNumInput').trimEnd().trimStart();
					const price = Math.abs(Number(interaction.fields.getTextInputValue('priceInput').trimEnd().trimStart()));
					const formattedPrice = formatter.format(price);
					const locationNotes = interaction.fields.getTextInputValue('locNotesInput').trimEnd().trimStart();
					const photosString = interaction.fields.getTextInputValue('photosInput').trimEnd().trimStart();

					if (isNaN(price)) { // validate quantity of money
						await interaction.reply({
							content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers (no $ or commas or periods).`,
							ephemeral: true
						});
					}
					else {
						var photos;
						if (photosString.includes(",")) {
							photos = photosString.split(",")
						} else if (photosString.includes(";")) {
							photos = photosString.split(";")
						} else if (photosString.includes(" ")) {
							photos = photosString.split(" ")
						} else if (photosString.includes("|")) {
							photos = photosString.split("|")
						} else {
							photos = `default: ${photosString}`
							await interaction.reply({
								content: `:exclamation: The photos you linked are not separated properly. Please be sure to use commas, semicolons, vertical pipes, or spaces to separate your links.`,
								ephemeral: true
							});
							return;
						}

						await dbCmds.addOneSumm("countHousesSold");
						const newHousesSoldTotal = await dbCmds.readSummValue("countHousesSold");
						await editEmbed.editEmbed(interaction.client);

						const houseSoldEmbed = new EmbedBuilder()
							.setTitle('A new house has been sold!')
							.addFields(
								{ name: `Realtor Name:`, value: `${realtorName}` },
								{ name: `Sale Date:`, value: `${saleDate}` },
								{ name: `Lot Number:`, value: `${lotNum}` },
								{ name: `Final Sale Price:`, value: `${formattedPrice}` },
								{ name: `House Sold To:`, value: `${soldTo}` },
								{ name: `Location/Notes:`, value: `${locationNotes}` }
							)
							.setColor('A67C00');
						const photo1Embed = new EmbedBuilder()
							.setColor('A67C00')
							.setURL('https://echorp.net/')
							.setImage(photos[0]);
						const photo2Embed = new EmbedBuilder()
							.setColor('A67C00')
							.setURL('https://echorp.net/')
							.setImage(photos[1]);

						await interaction.client.channels.cache.get(process.env.HOUSE_SALES_ID).send({ embeds: [houseSoldEmbed, photo1Embed, photo2Embed] });
					}

					await interaction.reply({ content: `Successfully added \`1\` to the \`Houses Sold\` counter - the new total is \`${newHousesSoldTotal}\`.`, ephemeral: true });
				}
				catch (error) {
					await interaction.reply({
						content: `:exclamation: An error occured - likely with the links you entered. Check your photo links and try again!`,
						ephemeral: true
					});
					return;
				}
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		console.log(`Error in modal popup!`);
		console.error(error);
	}
};


