var { Schema, model, models } = require('mongoose');

var reqString = {
	type: String,
	required: true,
};

var reqNum = {
	type: Number,
	required: true,
};

var d8SummaryInfoSchema = new Schema({
	summaryName: reqString,
	value: reqNum,
	msgId: String,
	repDate: String,
	financeNum: Number
});

module.exports = models['d8SummaryInfo'] || model('d8SummaryInfo', d8SummaryInfoSchema);