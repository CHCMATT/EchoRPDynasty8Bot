let dbCmds = require('../dbCmds.js');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'removeeviction',
	description: 'Removes the Eviction Notice and overdue payment fee on the specified Financing Agreement',
	options: [
		{
			name: 'financingnumber',
			description: 'The unique H##### that is tied to the Financing Agreement that you\'d like to archive',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			let financingNum = interaction.options.getString('financingnumber').toUpperCase();

			let now = Math.floor(new Date().getTime() / 1000.0);
			let today = `<t:${now}:d>`
			let countFound = 0;

			let channel = await interaction.client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
			let messages = await channel.messages.fetch();

			messages.forEach(async (message) => {
				if (message.embeds[0]) {
					let embedTitle = message.embeds[0].data.title;
					if (embedTitle === 'A new Financing Agreement has been submitted!') {
						let msgRealtor = message.embeds[0].data.fields[0].value;
						let msgSaleDate = message.embeds[0].data.fields[1].value;
						let msgPaymentDate = message.embeds[0].data.fields[2].value;
						let msgNextPaymentDate = message.embeds[0].data.fields[3].value;
						let msgFinanceNum = message.embeds[0].data.fields[4].value;
						let msgClientName = message.embeds[0].data.fields[5].value;
						let msgClientInfo = message.embeds[0].data.fields[6].value;
						let msgClientContact = message.embeds[0].data.fields[7].value;
						let msgStreetAddress = message.embeds[0].data.fields[8].value;
						let msgSalePrice = message.embeds[0].data.fields[9].value;
						let msgDownPayment = message.embeds[0].data.fields[10].value;
						let msgAmtOwed = message.embeds[0].data.fields[11].value;
						let msgFinancingAgreement = message.embeds[0].data.fields[12].value;

						let amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''));
						let newAmtOwed = amtOwed - 10000;
						let formattedNewAmtOwed = formatter.format(newAmtOwed);

						if (msgFinanceNum == financingNum) {
							countFound++;
							if (message.embeds[0].data.fields[13]) {
								let msgNotes = message.embeds[0].data.fields[13].value;
								let agreementEmbed = [new EmbedBuilder()
									.setTitle('A new Financing Agreement has been submitted!')
									.addFields(
										{ name: `Realtor Name:`, value: `${msgRealtor}` },
										{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
										{ name: `Latest Payment:`, value: `${msgPaymentDate}`, inline: true },
										{ name: `Next Payment Due:`, value: `${msgNextPaymentDate}`, inline: true },
										{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
										{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
										{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
										{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
										{ name: `Street Address:`, value: `${msgStreetAddress}` },
										{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
										{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
										{ name: `Amount Owed:`, value: `${formattedNewAmtOwed}`, inline: true },
										{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
										{ name: `Notes:`, value: `${msgNotes}\n- Eviction Notice removed by <@${interaction.user.id}> on ${today}.` }
									)
									.setColor('FAD643')];

								await message.edit({ embeds: agreementEmbed, components: [] });

							} else {
								let agreementEmbed = [new EmbedBuilder()
									.setTitle('A new Financing Agreement has been submitted!')
									.addFields(
										{ name: `Realtor Name:`, value: `${msgRealtor}` },
										{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
										{ name: `Latest Payment:`, value: `${msgPaymentDate}`, inline: true },
										{ name: `Next Payment Due:`, value: `${msgNextPaymentDate}`, inline: true },
										{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
										{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
										{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
										{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
										{ name: `Street Address:`, value: `${msgStreetAddress}` },
										{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
										{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
										{ name: `Amount Owed:`, value: `${formattedNewAmtOwed}`, inline: true },
										{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
										{ name: `Notes:`, value: `- Eviction Notice removed by <@${interaction.user.id}> on ${today}.` }
									)
									.setColor('FAD643')];

								await message.edit({ embeds: agreementEmbed, components: [] });
							}

							await interaction.reply({ content: `Successfully removed Eviction Notice and Late Fee from \`${financingNum}\`!`, ephemeral: true });
						}
					}
				}
			})

			if (countFound < 1) {
				await interaction.reply({ content: `:exclamation: Unable to find a Financing Agreement # of \`${financingNum}\` Please check to make sure you have the right number and try again.`, ephemeral: true });
			}

		} else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};