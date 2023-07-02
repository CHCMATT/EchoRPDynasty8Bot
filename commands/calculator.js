let dbCmds = require('../dbCmds.js');
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
		if (interaction.member._roles.includes(process.env.REALTOR_ROLE_ID) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			let calctype = interaction.options.getString('calctype');
			let saleprice = interaction.options.getInteger('saleprice');

			if (calctype == 'regular') {
				let costPrice = (saleprice * 0.85);
				let d8Profit = saleprice - costPrice;
				let realtorCommission = (d8Profit * 0.20);

				let formattedPrice = formatter.format(saleprice);
				let formattedCostPrice = formatter.format(costPrice);
				let formattedD8Profit = formatter.format(d8Profit);
				let formattedRealtorCommission = formatter.format(realtorCommission);

				await interaction.reply({ content: `Regular Sale Calculator Results:\n> Sale Price: \`${formattedPrice}\`\n> Cost Price: \`${formattedCostPrice}\`\n> Dynasty 8 Profit: \`${formattedD8Profit}\`\n> Your Commission: \`${formattedRealtorCommission}\``, ephemeral: true });
			} else if (calctype == 'financing') {
				let downPayment = (saleprice * 0.3);
				let amountOwed = (saleprice - downPayment + ((saleprice - downPayment) * .14));

				let formattedPrice = formatter.format(saleprice);
				let formattedDownPayment = formatter.format(downPayment);
				let formattedAmountOwed = formatter.format(amountOwed);

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