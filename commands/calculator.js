let moment = require('moment');
let { PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports = {
	name: 'calculator',
	description: 'Adds the specified amount to the specified user\'s current commission metrics',
	options: [
		{
			name: 'calctype',
			description: 'The type of calculator you\'d like',
			choices: [{ name: 'Regular Sale', value: 'regular' }, { name: 'Financing Sale', value: 'financing' }],
			type: 3,
			required: true,
		},
		{
			name: 'saleprice',
			description: 'The final price of the sale you\'d like to calculate',
			type: 4,
			required: true,
		},
	],
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		try {
			if (interaction.member._roles.includes(process.env.FULL_TIME_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				let calcType = interaction.options.getString('calctype');
				let salePrice = interaction.options.getInteger('saleprice');

				if (calcType == 'regular') {
					let costPrice = (salePrice * 0.85);
					let taxPrice = Math.round((salePrice * 0.052));
					let totalPrice = (salePrice + taxPrice);
					let d8Profit = salePrice - costPrice;
					let realtorCommission = (d8Profit * 0.30);
					let assetFees = (salePrice * 0.01);

					let formattedSalePrice = formatter.format(salePrice);
					let formattedTotalPrice = formatter.format(totalPrice);
					let formattedTaxPrice = formatter.format(taxPrice);
					let formattedRealtorCommission = formatter.format(realtorCommission);
					let formattedAssetFees = formatter.format(assetFees);

					await interaction.editReply({ content: `Regular Sale Calculator Results:\n> Total Price: \`${formattedTotalPrice}\` (\`${formattedSalePrice}\` sale + \`${formattedTaxPrice}\` tax)\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Your Commission: \`${formattedRealtorCommission}\``, ephemeral: true });
				} else if (calcType == 'financing') {
					let salePrice = interaction.options.getInteger('saleprice');

					let costPrice = (salePrice * 0.85);
					let d8Profit = salePrice - costPrice;
					let downPayment = (salePrice * 0.1);
					let taxPrice = Math.round((salePrice * 0.052));
					let interestPrice = Math.round(((salePrice - downPayment) * 0.1));
					let totalPrice = (salePrice + taxPrice + interestPrice);
					let amountOwed = (totalPrice - downPayment);
					let realtorCommission = (d8Profit * 0.30);
					let assetFees = (salePrice * 0.01);

					let formattedSalePrice = formatter.format(salePrice);
					let formattedTotalPrice = formatter.format(totalPrice);
					let formattedTaxPrice = formatter.format(taxPrice);
					let formattedInterestPrice = formatter.format(interestPrice);
					let formattedDownPayment = formatter.format(downPayment);
					let formattedAmountOwed = formatter.format(amountOwed);
					let formattedAssetFees = formatter.format(assetFees);
					let formattedRealtorCommission = formatter.format(realtorCommission);

					await interaction.editReply({ content: `Financing Sale Calculator Results:\n> Total Price: \`${formattedTotalPrice}\` (\`${formattedSalePrice}\` sale + \`${formattedTaxPrice}\` tax + \`${formattedInterestPrice}\` interest)\n> Down Payment: \`${formattedDownPayment}\`\n> Amount Owed Remaining: \`${formattedAmountOwed}\`\n> Weekly Asset Fees: \`${formattedAssetFees}\`\n> Your Commission: \`${formattedRealtorCommission}\``, ephemeral: true });

				} else {
					console.log(`Error: Unrecognized calculator type:  ${calctype}`)
					await interaction.editReply({ content: `:exclamation: I don't recognize this calculator type. Please try again with a proper calculator type.`, ephemeral: true });
				}
			} else {
				await interaction.editReply({ content: `:x: You must have either the \`Assistant\` or \`Full-Time\` or \`PD Full-Time\` role, or the \`Administrator\` permission to use this function.`, ephemeral: true });
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
						{ name: `Server name:`, value: `${interaction.member.guild.name}`, inline: true },
					)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	},
};