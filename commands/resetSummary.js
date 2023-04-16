var dbCmds = require('../dbCmds.js');
const editEmbed = require('../editEmbed.js');
var { PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'resetsummary',
	description: 'Resets the specific summary statistic to 0',
	options: [
		{
			name: 'summary',
			description: 'The name of the summary you are resetting to',
			choices: [{ name: 'Houses Sold', value: 'houses' }, { name: 'Warehouses Sold', value: 'warehouses' }, { name: 'Properties Quoted', value: 'quotes' }, { name: 'Properties Repossessed', value: 'repos' }, { name: 'Train Activities Checked', value: 'trains' }],
			type: 3,
			required: true,
		},
	],
	async execute(interaction) {
		const counterName = interaction.options.getString('summary').toLowerCase();

		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			if (counterName === "houses") {
				await dbCmds.resetSummValue("countHousesSold");
				var newValue = await dbCmds.readSummValue("countHousesSold");
				var fixedName = "Houses Sold";
			} else if (counterName === "warehouses") {
				await dbCmds.resetSummValue("countWarehousesSold");
				var newValue = await dbCmds.readSummValue("countWarehousesSold");
				var fixedName = "Warehouses Sold";
			} else if (counterName === "quotes") {
				await dbCmds.resetSummValue("countPropertiesQuoted");
				var newValue = await dbCmds.readSummValue("countPropertiesQuoted");
				var fixedName = "Properties Quoted";
			} else if (counterName === "repos") {
				await dbCmds.resetSummValue("countPropertiesRepod");
				var newValue = await dbCmds.readSummValue("countPropertiesRepod");
				var fixedName = "Properties Repossessed";
			} else if (counterName === "trains") {
				await dbCmds.resetSummValue("countTrainActivitiesChecked");
				var newValue = await dbCmds.readSummValue("countTrainActivitiesChecked");
				var fixedName = "Train Activities Checked";
			}

			await editEmbed.editEmbed(interaction.client);
			await interaction.reply({ content: `Successfully reset the value for the \`${fixedName}\` counter to \`${newValue}\`.`, ephemeral: true });

		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};