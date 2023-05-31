let moment = require('moment');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.checkPayments = async (client) => {
	// check for $0 due payments
	let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
	console.log(`Checking for $0 due payments on ${logTime}`);

	var now = Math.floor(new Date().getTime() / 1000.0);

	var channel = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
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
				var msgClientName = message.embeds[0].data.fields[5].value;
				var msgClientInfo = message.embeds[0].data.fields[6].value;
				var msgclientContact = message.embeds[0].data.fields[7].value;
				var msgStreetAddress = message.embeds[0].data.fields[8].value;
				var msgSalePrice = message.embeds[0].data.fields[9].value;
				var msgDownPayment = message.embeds[0].data.fields[10].value;
				var msgAmtOwed = message.embeds[0].data.fields[11].value;
				var msgFinancingAgreement = message.embeds[0].data.fields[12].value;
				if (message.embeds[0].data.fields[13]) {
					var msgNotes = message.embeds[0].data.fields[13].value;
				} else {
					var msgNotes = 'N/A'
				}

				var amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''));

				if (amtOwed <= 0) {
					var embeds = new EmbedBuilder()
						.setTitle('A Financing Agreement has been completed!')
						.addFields(
							{ name: `Realtor Name:`, value: `${msgRealtor}` },
							{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
							{ name: `Latest Payment:`, value: `${msgPaymentDate}`, inline: true },
							{ name: `Next Payment Due:`, value: `${msgNextPaymentDateString}`, inline: true },
							{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
							{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
							{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
							{ name: `Client Contact:`, value: `${msgclientContact}`, inline: true },
							{ name: `Street Address:`, value: `${msgStreetAddress}` },
							{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
							{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
							{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
							{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
							{ name: `Notes:`, value: `${msgNotes}` },
						)
						.setColor('1EC276');

					await client.channels.cache.get(process.env.COMPLETED_FINANCING_CHANNEL_ID).send({ embeds: [embeds] });

					await message.delete();
				}
			}
		}
	})

	setTimeout(async () => {
		// check for overdue payments
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		console.log(`Checking for overdue payments on ${logTime}`);

		var channelAfter = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
		var messagesAfter = await channelAfter.messages.fetch();

		var paymentOverdueDate = (now - (86400 * 14)); // 86400 seconds in a day times 14 days

		messagesAfter.forEach(async (messageAfter) => {
			if (messageAfter.embeds[0]) {
				var embedTitle = messageAfter.embeds[0].data.title;
				if (embedTitle === 'A new Financing Agreement has been submitted!' && messageAfter.components.length == 0) {
					var msgPaymentDate = messageAfter.embeds[0].data.fields[2].value;
					var lastPaymentDate = Number(msgPaymentDate.replaceAll('<t:', '').replaceAll(':d>', ''));

					if (lastPaymentDate <= paymentOverdueDate) {
						var msgRealtor = messageAfter.embeds[0].data.fields[0].value;
						var msgSaleDate = messageAfter.embeds[0].data.fields[1].value;
						var msgPaymentDate = messageAfter.embeds[0].data.fields[2].value;
						var msgNextPaymentDateString = messageAfter.embeds[0].data.fields[3].value;
						var msgFinanceNum = messageAfter.embeds[0].data.fields[4].value;
						var msgClientName = messageAfter.embeds[0].data.fields[5].value;
						var msgClientInfo = messageAfter.embeds[0].data.fields[6].value;
						var msgclientContact = messageAfter.embeds[0].data.fields[7].value;
						var msgStreetAddress = messageAfter.embeds[0].data.fields[8].value;
						var msgSalePrice = messageAfter.embeds[0].data.fields[9].value;
						var msgDownPayment = messageAfter.embeds[0].data.fields[10].value;
						var msgAmtOwed = messageAfter.embeds[0].data.fields[11].value;
						var msgFinancingAgreement = messageAfter.embeds[0].data.fields[12].value;
						if (messageAfter.embeds[0].data.fields[13]) {
							var msgNotes = messageAfter.embeds[0].data.fields[13].value;
						}

						let amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''))
						amtOwed = amtOwed + 10000;

						let newAmtOwed = formatter.format(amtOwed);

						var now = Math.floor(new Date().getTime() / 1000.0);
						var evictionAvailDate = `<t:${now}:d>`;

						if (messageAfter.embeds[0].data.fields[13]) {
							var currentEmbed = new EmbedBuilder()
								.setTitle('A new Financing Agreement has been submitted!')
								.addFields(
									{ name: `Realtor Name:`, value: `${msgRealtor}` },
									{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
									{ name: `Latest Payment:`, value: `${msgPaymentDate}`, inline: true },
									{ name: `Next Payment Due:`, value: `${msgNextPaymentDateString}`, inline: true },
									{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
									{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
									{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
									{ name: `Client Contact:`, value: `${msgclientContact}`, inline: true },
									{ name: `Street Address:`, value: `${msgStreetAddress}` },
									{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
									{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
									{ name: `Amount Owed:`, value: `${newAmtOwed}`, inline: true },
									{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
									{ name: `Notes:`, value: `${msgNotes}\n- $10,000 Late Fee added on ${evictionAvailDate}.\n- Eviction Notice available on ${evictionAvailDate}.` },
								)
								.setColor('FAD643');
						} else {
							var currentEmbed = new EmbedBuilder()
								.setTitle('A new Financing Agreement has been submitted!')
								.addFields(
									{ name: `Realtor Name:`, value: `${msgRealtor}` },
									{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
									{ name: `Latest Payment:`, value: `${msgPaymentDate}`, inline: true },
									{ name: `Next Payment Due:`, value: `${msgNextPaymentDateString}`, inline: true },
									{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
									{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
									{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
									{ name: `Client Contact:`, value: `${msgclientContact}`, inline: true },
									{ name: `Street Address:`, value: `${msgStreetAddress}` },
									{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
									{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
									{ name: `Amount Owed:`, value: `${newAmtOwed}`, inline: true },
									{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
									{ name: `Notes:`, value: `- $10,000 Late Fee added on ${evictionAvailDate}.\n- Eviction Notice available on ${evictionAvailDate}.` },
								)
								.setColor('FAD643');
						}

						let btnRows = addBtnRows();
						await messageAfter.edit({ embeds: [currentEmbed], components: btnRows });

						var overdueEmbed = new EmbedBuilder()
							.setTitle('A Financing Agreement has overdue payments!')
							.addFields(
								{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
								{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
								{ name: `Client Contact:`, value: `${msgclientContact}`, inline: true },
								{ name: `Last Payment Date:`, value: `${msgPaymentDate} (<t:${lastPaymentDate}:R>)` },
								{ name: `Financing ID Number:`, value: `${msgFinanceNum}`, inline: true },
								{ name: `Amount Still Owed:`, value: `${msgAmtOwed}`, inline: true },
								{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
								{ name: `Message Link:`, value: `https://discord.com/channels/${messageAfter.guildId}/${messageAfter.channelId}/${messageAfter.id}` },
							)
							.setColor('B80600');

						await client.channels.cache.get(process.env.PAYMENTS_OVERDUE_CHANNEL_ID).send({ embeds: [overdueEmbed] });
					}
				}
			}
		})
	}, (0.25 * 60000))
}; // 0.25 minute times 60000ms


function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('createEvictionNotice')
			.setLabel('Create an Eviction Notice')
			.setStyle(ButtonStyle.Secondary),
	);

	let rows = [row1];
	return rows;
};