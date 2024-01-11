let moment = require('moment');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'adjustduedate',
	description: 'Adjust the due date of the specified Financing Agreement',
	options: [
		{
			name: 'financingnumber',
			description: 'The unique H##### that is tied to the Financing Agreement that you\'d like to adjust',
			type: 3,
			required: true,
		},
		{
			name: 'totaldays',
			description: 'The total # of days they should have to pay it off (from the sale date)',
			type: 4,
			required: true,
		},
	],
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let financingNum = interaction.options.getString('financingnumber').toUpperCase();
				let totalDays = Math.abs(interaction.options.getInteger('totaldays'));

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
							let msgPaidOffDueDate = message.embeds[0].data.fields[2].value;
							let msgFinanceNum = message.embeds[0].data.fields[3].value;
							let msgClientName = message.embeds[0].data.fields[4].value;
							let msgClientInfo = message.embeds[0].data.fields[5].value;
							let msgClientContact = message.embeds[0].data.fields[6].value;
							let msgStreetAddress = message.embeds[0].data.fields[7].value;
							let msgSalePrice = message.embeds[0].data.fields[8].value;
							let msgDownPayment = message.embeds[0].data.fields[9].value;
							let msgAmtOwed = message.embeds[0].data.fields[10].value;
							let msgFinancingAgreement = message.embeds[0].data.fields[11].value;

							let origSaleDate = Number(msgSaleDate.replaceAll('<t:', '').replaceAll(':d>', ''));
							let newSaleDate = origSaleDate + (86400 * totalDays);
							let newSaleDateStr = `<t:${newSaleDate}:d>`;
							let newSaleDateRel = `<t:${newSaleDate}:R>`;

							if (msgFinanceNum == financingNum) {
								countFound++;
								let embeds = [];

								if (message.embeds[0].data.fields[12]) {
									let msgNotes = message.embeds[0].data.fields[12].value;

									embeds = new EmbedBuilder()
										.setTitle('A new Financing Agreement has been submitted!')
										.addFields(
											{ name: `Realtor Name:`, value: `${msgRealtor}` },
											{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
											{ name: `Paid Off Due Date:`, value: `${newSaleDateStr} (${newSaleDateRel})`, inline: true },
											{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
											{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
											{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
											{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
											{ name: `Street Address:`, value: `${msgStreetAddress}` },
											{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
											{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
											{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
											{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
											{ name: `Notes:`, value: `${msgNotes}\n- Due date adjusted to ${newSaleDateStr} by <@${interaction.user.id}> on ${today}.` }
										)
										.setColor('FAD643');
								} else {
									embeds = new EmbedBuilder()
										.setTitle('A new Financing Agreement has been submitted!')
										.addFields(
											{ name: `Realtor Name:`, value: `${msgRealtor}` },
											{ name: `Sale Date:`, value: `${msgSaleDate}`, inline: true },
											{ name: `Paid Off Due Date:`, value: `${newSaleDateStr} (${newSaleDateRel})`, inline: true },
											{ name: `Financing ID Number:`, value: `${msgFinanceNum}` },
											{ name: `Client Name:`, value: `${msgClientName}`, inline: true },
											{ name: `Client Info:`, value: `${msgClientInfo}`, inline: true },
											{ name: `Client Contact:`, value: `${msgClientContact}`, inline: true },
											{ name: `Street Address:`, value: `${msgStreetAddress}` },
											{ name: `Sale Price:`, value: `${msgSalePrice}`, inline: true },
											{ name: `Down Payment:`, value: `${msgDownPayment}`, inline: true },
											{ name: `Amount Owed:`, value: `${msgAmtOwed}`, inline: true },
											{ name: `Financing Agreement:`, value: `${msgFinancingAgreement}` },
											{ name: `Notes:`, value: `- Due date adjusted to ${newSaleDateStr} by <@${interaction.user.id}> on ${today}.` }
										)
										.setColor('FAD643');
								}

								await message.edit({ embeds: [embeds] })

								await interaction.editReply({ content: `Successfully adjusted the due date of property \`${financingNum}\` to ${newSaleDateStr}.`, ephemeral: true });
							}
						}
					}
				})

				if (countFound < 1) {
					await interaction.editReply({ content: `:exclamation: Unable to find a Financing Agreement # of \`${financingNum}\` Please check to make sure you have the right number and try again.`, ephemeral: true });
				}

			} else {
				await interaction.editReply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.error(errTime, fileName, error);
			} else {
				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];
				console.error(errTime, fileName, error);

				console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

				let errString = error.toString();
				let errHandled = false;

				if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
					try {
						await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					} catch {
						await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
					}
					errHandled = true;
				}

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${errString}\`\`\``)
					.addFields(
						{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
						{ name: `Error handled?`, value: `${errHandled}`, inline: true },
					)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	},
};