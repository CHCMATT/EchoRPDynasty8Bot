var dbCmds = require('../dbCmds.js');
var { PermissionsBitField, EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
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
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			var calctype = interaction.options.getString('calctype');
			var saleprice = interaction.options.getInteger('saleprice');

			if (calctype == 'regular') {
				var costPrice = (saleprice * 0.70);
				var d8Profit = saleprice - costPrice;
				var realtorCommission = (d8Profit * 0.20);

				var formattedPrice = formatter.format(saleprice);
				var formattedCostPrice = formatter.format(costPrice);
				var formattedD8Profit = formatter.format(d8Profit);
				var formattedRealtorCommission = formatter.format(realtorCommission);

				await interaction.reply({ content: `Regular Sale Calculator Results:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\``, ephemeral: true });
			} else if (calctype == 'financing') {
				var downPayment = (saleprice * 0.3);
				var amountOwed = (saleprice - downPayment + ((saleprice - downPayment) * .14));

				var formattedPrice = formatter.format(saleprice);
				var formattedDownPayment = formatter.format(downPayment);
				var formattedAmountOwed = formatter.format(amountOwed);

				await interaction.reply({ content: `Financing Sale Calculator Results:\n> Sale Price: \`${formattedPrice}\`\n> Down Payment: \`${formattedDownPayment}\`\n> Amount Owed Remaining: \`${formattedAmountOwed}\`.`, ephemeral: true });

			} else {
				console.log(`Error: Unrecognized calculator type:  ${calctype}`)
				await interaction.reply({ content: `:exclamation: I don't recognize this calculator type. Please try again with a proper calculator type.`, ephemeral: true });
			}
		} else {
			await interaction.reply({ content: `:x: You must have the \`Realtor\` role or the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};