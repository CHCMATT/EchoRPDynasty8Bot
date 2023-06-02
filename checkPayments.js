let moment = require('moment');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.checkPayments = async (client) => {
	// check for $0 due payments
	let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
	console.log(`Checking for $0 due payments on ${logTime}`);

	let now = Math.floor(new Date().getTime() / 1000.0);

	let channel = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
	let messages = await channel.messages.fetch();

	messages.forEach(async (message) => {
		if (message.embeds[0]) {
			let embedTitle = message.embeds[0].data.title;
			if (embedTitle === 'A new Financing Agreement has been submitted!') {
				let msgRealtor = message.embeds[0].data.fields[0].value;
				let msgSaleDate = message.embeds[0].data.fields[1].value;
				let msgPaymentDate = message.embeds[0].data.fields[2].value;
				let msgNextPaymentDateString = message.embeds[0].data.fields[3].value;
				let msgFinanceNum = message.embeds[0].data.fields[4].value;
				let msgClientName = message.embeds[0].data.fields[5].value;
				let msgClientInfo = message.embeds[0].data.fields[6].value;
				let msgclientContact = message.embeds[0].data.fields[7].value;
				let msgStreetAddress = message.embeds[0].data.fields[8].value;
				let msgSalePrice = message.embeds[0].data.fields[9].value;
				let msgDownPayment = message.embeds[0].data.fields[10].value;
				let msgAmtOwed = message.embeds[0].data.fields[11].value;
				let msgFinancingAgreement = message.embeds[0].data.fields[12].value;
				if (message.embeds[0].data.fields[13]) {
					let msgNotes = message.embeds[0].data.fields[13].value;
				} else {
					let msgNotes = 'N/A'
				}

				let amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''));

				if (amtOwed <= 0) {
					let embeds = new EmbedBuilder()
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

		let channelAfter = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
		let messagesAfter = await channelAfter.messages.fetch();

		let paymentOverdueDate = (now - (86400 * 14)); // 86400 seconds in a day times 14 days

		messagesAfter.forEach(async (messageAfter) => {
			if (messageAfter.embeds[0]) {
				let embedTitle = messageAfter.embeds[0].data.title;
				if (embedTitle === 'A new Financing Agreement has been submitted!' && messageAfter.components.length == 0) {
					let msgPaymentDate = messageAfter.embeds[0].data.fields[2].value;
					let lastPaymentDate = Number(msgPaymentDate.replaceAll('<t:', '').replaceAll(':d>', ''));

					if (lastPaymentDate <= paymentOverdueDate) {
						let msgRealtor = messageAfter.embeds[0].data.fields[0].value;
						let msgSaleDate = messageAfter.embeds[0].data.fields[1].value;
						let msgPaymentDate = messageAfter.embeds[0].data.fields[2].value;
						let msgNextPaymentDateString = messageAfter.embeds[0].data.fields[3].value;
						let msgFinanceNum = messageAfter.embeds[0].data.fields[4].value;
						let msgClientName = messageAfter.embeds[0].data.fields[5].value;
						let msgClientInfo = messageAfter.embeds[0].data.fields[6].value;
						let msgclientContact = messageAfter.embeds[0].data.fields[7].value;
						let msgStreetAddress = messageAfter.embeds[0].data.fields[8].value;
						let msgSalePrice = messageAfter.embeds[0].data.fields[9].value;
						let msgDownPayment = messageAfter.embeds[0].data.fields[10].value;
						let msgAmtOwed = messageAfter.embeds[0].data.fields[11].value;
						let msgFinancingAgreement = messageAfter.embeds[0].data.fields[12].value;
						if (messageAfter.embeds[0].data.fields[13]) {
							let msgNotes = messageAfter.embeds[0].data.fields[13].value;
						}

						let amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''))
						amtOwed = amtOwed + 10000;

						let newAmtOwed = formatter.format(amtOwed);

						let now = Math.floor(new Date().getTime() / 1000.0);
						let evictionAvailDate = `<t:${now}:d>`;

						if (messageAfter.embeds[0].data.fields[13]) {
							let currentEmbed = new EmbedBuilder()
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
							let currentEmbed = new EmbedBuilder()
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

						let overdueEmbed = new EmbedBuilder()
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
	}, (0.25 * 60000)) // 0.25 minute times 60000ms

	setTimeout(async () => {
		// check for overdue payments
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		console.log(`Checking for overdue agreements with no payments after 3 days on ${logTime}`);

		let channelAfter = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
		let messagesAfter = await channelAfter.messages.fetch();

		let overdueNoPaymentsDate = (now - (86400 * 18)); // 86400 seconds in a day times 18 days

		messagesAfter.forEach(async (messageAfter) => {
			if (messageAfter.embeds[0]) {
				let embedTitle = messageAfter.embeds[0].data.title;
				if (embedTitle === 'A new Financing Agreement has been submitted!' && messageAfter.components.length == 0) {
					let msgPaymentDate = messageAfter.embeds[0].data.fields[2].value;
					let lastPaymentDate = Number(msgPaymentDate.replaceAll('<t:', '').replaceAll(':d>', ''));

					if (lastPaymentDate <= overdueNoPaymentsDate) {
						let msgRealtor = messageAfter.embeds[0].data.fields[0].value;
						let msgSaleDate = messageAfter.embeds[0].data.fields[1].value;
						let msgPaymentDate = messageAfter.embeds[0].data.fields[2].value;
						let msgNextPaymentDateString = messageAfter.embeds[0].data.fields[3].value;
						let msgFinanceNum = messageAfter.embeds[0].data.fields[4].value;
						let msgClientName = messageAfter.embeds[0].data.fields[5].value;
						let msgClientInfo = messageAfter.embeds[0].data.fields[6].value;
						let msgclientContact = messageAfter.embeds[0].data.fields[7].value;
						let msgStreetAddress = messageAfter.embeds[0].data.fields[8].value;
						let msgSalePrice = messageAfter.embeds[0].data.fields[9].value;
						let msgDownPayment = messageAfter.embeds[0].data.fields[10].value;
						let msgAmtOwed = messageAfter.embeds[0].data.fields[11].value;
						let msgFinancingAgreement = messageAfter.embeds[0].data.fields[12].value;
						if (messageAfter.embeds[0].data.fields[13]) {
							let msgNotes = messageAfter.embeds[0].data.fields[13].value;
						}

						let amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''))
						amtOwed = amtOwed + 10000;

						let newAmtOwed = formatter.format(amtOwed);

						let now = Math.floor(new Date().getTime() / 1000.0);
						let evictionAvailDate = `<t:${now}:d>`;

						if (messageAfter.embeds[0].data.fields[13]) {
							let currentEmbed = new EmbedBuilder()
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
							let currentEmbed = new EmbedBuilder()
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

						let overdueEmbed = new EmbedBuilder()
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
	}, (0.50 * 60000)) // 0.50 minute times 60000ms
};


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