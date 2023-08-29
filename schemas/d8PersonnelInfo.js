let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let d8PersonnelInfoSchema = new Schema({
	discordId: reqString,
	charName: reqString,
	housesSold: reqNum,
	warehousesSold: reqNum,
	propertiesRepod: reqNum,
	propertiesQuoted: reqNum,
	activityChecks: reqNum,
	miscSales: reqNum,
	financialAgreements: reqNum,
	quotesReviewed: reqNum,
	currentCommission: reqNum,
	bankAccount: reqString,
	monthlyHousesSold: reqNum,
	monthlyWarehousesSold: reqNum,
	monthlyPropertiesRepod: reqNum,
	monthlyPropertiesQuoted: reqNum,
	monthlyActivityChecks: reqNum,
	monthlyMiscSales: reqNum,
	monthlyFinancialAgreements: reqNum,
	monthlyQuotesReviewed: reqNum,
	settingQuotePing: Boolean,
	settingReimbursementPing: Boolean,
	settingRepossessionPing: Boolean,
});

module.exports = models['d8PersonnelInfo'] || model('d8PersonnelInfo', d8PersonnelInfoSchema);