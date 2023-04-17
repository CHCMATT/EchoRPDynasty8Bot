var { Schema, model, models } = require('mongoose');

var reqString = {
	type: String,
	required: true,
};

var reqNum = {
	type: Number,
	required: true,
};

var d8PersonnelInfoSchema = new Schema({
	discordId: reqString,
	charName: reqString,
	housesSold: reqNum,
	warehousesSold: reqNum,
	propertiesRepod: reqNum,
	propertiesQuoted: reqNum,
	activityChecks: reqNum,
	miscSales: reqNum,
	embedColor: reqString,
	embedMsgId: reqString,
	currentCommission: reqNum,
	bankAccount: reqString,
});

module.exports = models['d8PersonnelInfo'] || model('d8PersonnelInfo', d8PersonnelInfoSchema);