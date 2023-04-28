var d8SummaryInfo = require('./schemas/d8SummaryInfo');
var d8PersonnelInfo = require('./schemas/d8PersonnelInfo');

module.exports.readSummValue = async (summaryName) => {
	var result = await d8SummaryInfo.findOne({ summaryName }, { value: 1, _id: 0 });
	if (result !== null) {
		return result.value;
	}
	else {
		return `Value not found for ${summaryName}.`;
	}
};

module.exports.addOneSumm = async (summaryName) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: 1 } }, { upsert: true });
};

module.exports.subtractOneSumm = async (summaryName) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: -1 } }, { upsert: true });
};

module.exports.setSummValue = async (summaryName, newValue) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { value: newValue }, { upsert: true });
};

module.exports.resetSummValue = async (summaryName) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { value: 0 }, { upsert: true });
};



// for finding and adding to the personnel's statistics
module.exports.initPersStats = async (discordId, discordNickname, embedColor, embedMsgId) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { discordId: discordId, charName: discordNickname, embedColor: embedColor, embedMsgId: embedMsgId, housesSold: 0, warehousesSold: 0, propertiesRepod: 0, propertiesQuoted: 0, activityChecks: 0, miscSales: 0, currentCommission: 0, monthlyHousesSold: 0, monthlyWarehousesSold: 0, monthlyPropertiesRepod: 0, monthlyPropertiesQuoted: 0, monthlyActivityChecks: 0, monthlyMiscSales: 0 }, { upsert: true });
};

module.exports.resetPersStats = async (discordId) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { housesSold: 0, warehousesSold: 0, propertiesRepod: 0, propertiesQuoted: 0, activityChecks: 0, currentCommission: 0 }, { upsert: true });
};

module.exports.resetMonthlyPersStats = async (discordId) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { monthlyHousesSold: 0, monthlyWarehousesSold: 0, monthlyPropertiesRepod: 0, monthlyPropertiesQuoted: 0, monthlyActivityChecks: 0, monthlyMiscSales: 0 }, { upsert: true });
};

module.exports.readPersStats = async (discordId) => {
	var result = await d8PersonnelInfo.findOne({ discordId: discordId }, { discordId: 1, charName: 1, housesSold: 1, embedMsgId: 1, embedColor: 1, warehousesSold: 1, propertiesRepod: 1, propertiesQuoted: 1, activityChecks: 1, miscSales: 1, currentCommission: 1, bankAccount: 1, _id: 0 });
	return result;
};

module.exports.setPersColor = async (discordId, embedColor) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { embedColor: embedColor }, { upsert: true });
};

module.exports.addOnePersStat = async (discordId, statName) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: 1 } });
};

module.exports.subtractOnePersStat = async (discordId, statName) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: -1 } });
};

module.exports.setBankAccount = async (discordId, bankNum) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { bankAccount: bankNum }, { upsert: true });
};


//personnel message id stuff
module.exports.setPersonnelMsgId = async (discordId, embedId) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { embedMsgId: embedId }, { upsert: true });
};

module.exports.readPersonnelMsgId = async (discordId) => {
	var result = await d8PersonnelInfo.findOne({ discordId: discordId }, { embedMsgId: 1, _id: 0 });
	return result.embedMsgId;
};


// commission stuff
module.exports.addCommission = async (discordId, commission) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: commission } }, { upsert: true });
};

module.exports.removeCommission = async (discordId, commission) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: -commission } }, { upsert: true });
};

module.exports.resetCommission = async (discordId) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { currentCommission: 0 });
};

module.exports.readCommission = async (discordId) => {
	var result = await d8PersonnelInfo.findOne({ discordId: discordId }, { currentCommission: 1, _id: 0 });
	return result.currentCommission;
};

module.exports.commissionRep = async () => {
	var result = await d8PersonnelInfo.find({ currentCommission: { $gt: 1 } }, { discordId: 1, bankAccount: 1, charName: 1, currentCommission: 1, _id: 0 });
	return result;
};


// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true });
};

module.exports.readMsgId = async (summaryName) => {
	var result = await d8SummaryInfo.findOne({ summaryName }, { msgId: 1, _id: 0 });
	if (result !== null) {
		return result.msgId;
	}
	else {
		return `Value not found for ${summaryName}.`;
	}
};

// for setting string of latest commission report date
module.exports.setRepDate = async (summaryName, newValue) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { repDate: newValue }, { upsert: true });
};

module.exports.readRepDate = async (summaryName) => {
	var result = await d8SummaryInfo.findOne({ summaryName }, { repDate: 1, _id: 0 });
	if (result !== null) {
		return result.repDate;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};

// for setting string of latest commission report date
module.exports.setFinanceNum = async (summaryName, newValue) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { financeNum: newValue }, { upsert: true });
};

module.exports.readFinanceNum = async (summaryName) => {
	var result = await d8SummaryInfo.findOne({ summaryName }, { financeNum: 1, _id: 0 });
	if (result !== null) {
		return result.financeNum;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};

module.exports.statsRep = async () => {
	var result = await d8PersonnelInfo.find({ charName: { $ne: null } }, { discordId: 1, charName: 1, embedColor: 1, housesSold: 1, warehousesSold: 1, propertiesRepod: 1, propertiesQuoted: 1, activityChecks: 1, miscSales: 1, monthlyHousesSold: 1, monthlyWarehousesSold: 1, monthlyPropertiesRepod: 1, monthlyPropertiesQuoted: 1, monthlyActivityChecks: 1, monthlyMiscSales: 1, _id: 0 });
	return result;
};

