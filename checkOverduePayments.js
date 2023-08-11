let moment = require('moment');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.checkOverduePayments = async (client) => {
	try {
		// check for overdue payments
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		console.log(`Checking for overdue payments on ${logTime}`);

		let channelAfter = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);
		let messages = await channelAfter.messages.fetch();

		let now = Math.floor(new Date().getTime() / 1000.0);
		let paymentOverdueDate = (now - (86400 * 14)); // 86400 seconds in a day times 14 days

		messages.forEach(async (message) => {
			if (message.embeds[0]) {
				let embedTitle = message.embeds[0].data.title;
				if (embedTitle === 'A new Financing Agreement has been submitted!' && message.components.length == 0) {
					let msgPaymentDate = message.embeds[0].data.fields[2].value;
					let lastPaymentDate = Number(msgPaymentDate.replaceAll('<t:', '').replaceAll(':d>', ''));

					if (lastPaymentDate <= paymentOverdueDate) {
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
							var msgNotes = message.embeds[0].data.fields[13].value;
						}

						let amtOwed = Number(msgAmtOwed.replaceAll('$', '').replaceAll(',', ''))
						amtOwed = amtOwed + 10000;

						let newAmtOwed = formatter.format(amtOwed);

						let now = Math.floor(new Date().getTime() / 1000.0);
						let evictionAvailDate = `<t:${now}:d>`;

						if (message.embeds[0].data.fields[13]) {
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

							let btnRows = addBtnRows();
							await message.edit({ embeds: [currentEmbed], components: btnRows });

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

							let btnRows = addBtnRows();
							await message.edit({ embeds: [currentEmbed], components: btnRows });
						}

						let overdueEmbed = new EmbedBuilder()
							.setTitle('A Financing Agreement has overdue payments!')
							.addFields(
								{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
								{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
								{ name: `Client Contact:`, value: `${msgclientContact}`, inline: true },
								{ name: `Last Payment Date:`, value: `${msgPaymentDate} (<t:${lastPaymentDate}:R>)` },
								{ name: `Financing ID Number:`, value: `${msgFinanceNum}`, inline: true },
								{ name: `Amount Still Owed:`, value: `${newAmtOwed}`, inline: true },
								{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
								{ name: `Message Link:`, value: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` },
							)
							.setColor('E85D04');

						await client.channels.cache.get(process.env.PAYMENTS_OVERDUE_CHANNEL_ID).send({ embeds: [overdueEmbed] });
					}
				}
			}
		})
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			console.error(error);

			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.log(`Error occured at ${errTime} at file ${fileName}!`);

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
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