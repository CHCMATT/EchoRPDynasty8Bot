const { Schema, model, models } = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const reqNum = {
	type: Number,
	required: true,
};

const d8SummaryInfoSchema = new Schema({
	summaryName: reqString,
	value: reqNum,
	msgId: String
});

module.exports = models['d8SummaryInfo'] || model('d8SummaryInfo', d8SummaryInfoSchema);