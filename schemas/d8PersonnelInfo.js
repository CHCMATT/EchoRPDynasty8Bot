const { Schema, model, models } = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const reqNum = {
	type: Number,
	required: true,
};

const d8PersonnelInfoSchema = new Schema({
	discordID: reqString,
	charName: reqString,
	statName: reqString,
	value: reqNum,
});

module.exports = models['d8PersonnelInfo'] || model('d8PersonnelInfo', d8PersonnelInfoSchema);