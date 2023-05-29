var dbCmds = require('../dbCmds.js');
var { PermissionsBitField, EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'financerepo',
	description: 'Archives the specified Financing Agreement to the completed channel',
	options: [
		{
			name: 'financingnumber',
			description: 'The unique H##### that is tied to the Financing Agreement that you\'d like to archive',
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || interaction.member.id == '220286286064386048') {
			var financingNum = interaction.options.getString('financingnumber').toUpperCase();

			var now = Math.floor(new Date().getTime() / 1000.0);
			var today = `<t:${now}:d>`
			var countFound = 0;

			var channel = await interaction.client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
			var messages = await channel.messages.fetch();

			messages.forEach(async (message) => {
				if (message.embeds[0]) {
					var embedTitle = message.embeds[0].data.title;
					if (embedTitle === 'A new Financing Agreement has been submitted!') {
						var msgRealtor = message.embeds[0].data.fields[0].value;
						var msgSaleDate = message.embeds[0].data.fields[1].value;
						var msgPaymentDate = message.embeds[0].data.fields[2].value;
						var msgNextPaymentDateString = message.embeds[0].data.fields[3].value;
						var msgFinanceNum = message.embeds[0].data.fields[4].value;
						var msgClientInfo = message.embeds[0].data.fields[5].value;
						var msgClientEmail = message.embeds[0].data.fields[6].value;
						var msgStreetAddress = message.embeds[0].data.fields[7].value;
						var msgSalePrice = message.embeds[0].data.fields[8].value;
						var msgDownPayment = message.embeds[0].data.fields[9].value;
						var msgAmtOwed = message.embeds[0].data.fields[10].value;
						var msgFinancingAgreement = message.embeds[0].data.fields[11].value;

						if (msgFinanceNum == financingNum) {
							countFound++;
							var embeds = [new EmbedBuilder()
								.setTitle('A Financing Agreement has been repossessed!')
								.addFields(
									{ name: `Realtor Name:`, value: `${msgRealtor}` },
									{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
									{ name: `Latest Payment:`, value: `${msgPaymentDate}`, inline: true },
									{ name: `Next Payment Due:`, value: `${msgNextPaymentDateString}`, inline: true },
									{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
									{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
									{ name: `Client Contact:`, value: `${msgClientEmail}`, inline: true },
									{ name: `Street Address:`, value: `${msgStreetAddress}` },
									{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
									{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
									{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
									{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
									{ name: `Notes:`, value: `- Property Repossession completed on ${today}.` },
								)
								.setColor('706677')];

							await interaction.client.channels.cache.get(process.env.COMPLETED_FINANCING_CHANNEL_ID).send({ embeds: embeds });

							await message.delete();

							await interaction.reply({ content: `Successfully marked property \`${financingNum}\` as repossessed!`, ephemeral: true });
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