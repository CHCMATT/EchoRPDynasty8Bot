let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let d8RepoRechecksSchema = new Schema({
	uniqueId: reqString,
	ownerName: reqString,
	streetAddress: reqString,
	originalMsg: reqString,
	recheckDate: reqNum,
});

module.exports = models['d8RepoRechecks'] || model('d8RepoRechecks', d8RepoRechecksSchema);