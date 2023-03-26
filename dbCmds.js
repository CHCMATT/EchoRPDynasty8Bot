const d8SummaryInfo = require('./schemas/d8SummaryInfo');
const d8PersonnelInfo = require('./schemas/d8PersonnelInfo');

module.exports.readSummValue = async (summaryName) => {
	const result = await d8SummaryInfo.findOne({ summaryName }, { value: 1, _id: 0 })
	if (result !== null) {
		return result.value;
	}
	else {
		return `Value not found for ${summaryName}.`;
	}
};

module.exports.setSummValue = async (summaryName, newValue) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { value: newValue }, { upsert: true })
};

module.exports.resetSummValue = async (summaryName) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { value: 0 }, { upsert: true })
};


// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true })
};

module.exports.readMsgId = async (summaryName) => {
	const result = await d8SummaryInfo.findOne({ summaryName }, { msgId: 1, _id: 0 })
	if (result !== null) {
		return result.msgId;
	}
	else {
		return `Value not found for ${summaryName}.`;
	}
};