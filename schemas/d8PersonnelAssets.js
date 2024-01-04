let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let d8PersonnelAssetsSchema = new Schema({
	uniqueId: reqString,
	assetName: reqString,
	discordId: reqString,
	assetCost: reqNum,
});

module.exports = models['d8PersonnelAssets'] || model('d8PersonnelAssets', d8PersonnelAssetsSchema);