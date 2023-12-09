let moment = require('moment');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.checkOverduePayments = async (client) => {
	try {
		let logTime = moment().format('MMMM Do YYYY, h:mm:ss a');
		console.log(`Checking for overdue payments on ${logTime}`);

		let channel = await client.channels.fetch(process.env.FINANCING_AGREEMENTS_CHANNEL_ID);

		let sum_messages = [];
		let last_id;

		while (true) {
			const options = { limit: 100 };
			if (last_id) {
				options.before = last_id;
			}

			let messages = await channel.messages.fetch(options);
			sum_messages.push(...messages.values());
			last_id = messages.last().id;

			if (messages.size != 100 || sum_messages >= options.limit) {
				break;
			}
		}

		let now = Math.floor(new Date().getTime() / 1000.0);

		sum_messages.forEach(async (message) => {
			if (message.embeds[0]) {
				let embedTitle = message.embeds[0].data.title;
				if (embedTitle === 'A new Financing Agreement has been submitted!') {
					let msgPaymentDueDate = message.embeds[0].data.fields[2].value;
					let paidOffDueDateStr = msgPaymentDueDate.substring(0, msgPaymentDueDate.indexOf(' ('))
					let paidOffDueDate = Number(paidOffDueDateStr.replaceAll('<t:', '').replaceAll(':d>', ''));

					if (now == now /*>= paidOffDueDate*/) { // overdue payments
						if (message.components.length == 0) {
							let msgPaymentDueDate = message.embeds[0].data.fields[2].value;
							let msgFinanceNum = message.embeds[0].data.fields[3].value;
							let msgClientName = message.embeds[0].data.fields[4].value;
							let msgClientInfo = message.embeds[0].data.fields[5].value;
							let msgClientContact = message.embeds[0].data.fields[6].value;
							let msgStreetAddr = message.embeds[0].data.fields[7].value;
							let msgAmtOwed = message.embeds[0].data.fields[10].value;
							let msgFinancingAgreement = message.embeds[0].data.fields[11].value;

							let overdueBtnRows = addOverdueBtnRows();
							await message.edit({ embeds: message.embeds, components: overdueBtnRows });

							// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

							let overdueEmbed = new EmbedBuilder()
								.setTitle('A Financing Agreement has a past due date!')
								.addFields(
									{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
									{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
									{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
									{ name: `Paid Off Payment Date:`, value: `${msgPaymentDueDate}` },
									{ name: `Financing ID Number:`, value: `${msgFinanceNum}`, inline: true },
									{ name: `Street Address:`, value: `${msgStreetAddr}`, inline: true },
									{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
									{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
									{ name: `Message Link:`, value: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` },
								)
								.setColor('FFA630');

							await client.channels.cache.get(process.env.FINANCING_ALERTS_CHANNEL_ID).send({ embeds: [overdueEmbed] });
						} else if (message.components[0].components.length == 3 && message.components[0].components[2].data.disabled == true) {
							if (now == now/*>= (paidOffDueDate + (86400 * 3))*/) { // eviction ready

								let msgPaymentDueDate = message.embeds[0].data.fields[2].value;
								let msgFinanceNum = message.embeds[0].data.fields[3].value;
								let msgClientName = message.embeds[0].data.fields[4].value;
								let msgClientInfo = message.embeds[0].data.fields[5].value;
								let msgClientContact = message.embeds[0].data.fields[6].value;
								let msgStreetAddr = message.embeds[0].data.fields[7].value;
								let msgAmtOwed = message.embeds[0].data.fields[10].value;
								let msgFinancingAgreement = message.embeds[0].data.fields[11].value;

								let evictionBtnRows = addEvictionBtnRows();
								await message.edit({ embeds: message.embeds, components: evictionBtnRows });

								// success/failure color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

								let evictionEmbed = new EmbedBuilder()
									.setTitle('A Financing Agreement is ready for eviction!')
									.addFields(
										{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
										{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
										{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
										{ name: `Paid Off Payment Date:`, value: `${msgPaymentDueDate}` },
										{ name: `Financing ID Number:`, value: `${msgFinanceNum}`, inline: true },
										{ name: `Street Address:`, value: `${msgStreetAddr}`, inline: true },
										{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
										{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
										{ name: `Message Link:`, value: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` },
									)
									.setColor('B80600');

								await client.channels.cache.get(process.env.FINANCING_ALERTS_CHANNEL_ID).send({ embeds: [evictionEmbed] });
							}
						}
					}
				}
			}
		});
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

			await client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};

function addOverdueBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('markPaymentsComplete')
			.setLabel('Mark as Completed')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('createEvictionNotice')
			.setLabel('Create an Eviction Notice')
			.setStyle(ButtonStyle.Primary),
	);

	let rows = [row1];
	return rows;
};

function addEvictionBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('markPaymentsComplete')
			.setLabel('Mark as Completed')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(true),

		new ButtonBuilder()
			.setCustomId('createEvictionNotice')
			.setLabel('Create an Eviction Notice')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true),

		new ButtonBuilder()
			.setCustomId('addNoticeSentProof')
			.setLabel('Add Proof of Eviction Sent')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true),

		new ButtonBuilder()
			.setCustomId('completeEviction')
			.setLabel('Mark Eviction as Complete')
			.setStyle(ButtonStyle.Danger),
	);

	let rows = [row1];
	return rows;
};