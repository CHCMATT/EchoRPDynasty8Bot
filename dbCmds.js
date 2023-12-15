let d8SummaryInfo = require('./schemas/d8SummaryInfo');
let d8RepoRechecks = require('./schemas/d8RepoRechecks');
let d8PersonnelInfo = require('./schemas/d8PersonnelInfo');
let d8PersonnelAssets = require('./schemas/d8PersonnelAssets');

module.exports.readSummValue = async (summaryName) => {
	let result = await d8SummaryInfo.findOne({ summaryName }, { value: 1, _id: 0 });
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

module.exports.addValueSumm = async (summaryName, value) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: value } }, { upsert: true });
};

module.exports.subtractValueSumm = async (summaryName, value) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: -value } }, { upsert: true });
};

module.exports.resetSummValue = async (summaryName) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { value: 0 }, { upsert: true });
};


// for finding and adding to the personnel's statistics
module.exports.initPersStats = async (discordId, discordNickname) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, {
		// personnel data
		discordId: discordId, charName: discordNickname,

		// overall data
		housesSold: 0, warehousesSold: 0, propertiesRepod: 0, propertiesQuoted: 0, activityChecks: 0, miscSales: 0, financialAgreements: 0, quotesReviewed: 0, contactRequests: 0,

		//pay data
		currentCommission: 0, monthlyCommission: 0, currentMiscPay: 0, bankAccount: 'n/a',

		// monthly data
		monthlyHousesSold: 0, monthlyWarehousesSold: 0, monthlyPropertiesRepod: 0, monthlyPropertiesQuoted: 0, monthlyActivityChecks: 0, monthlyMiscSales: 0, monthlyFinancialAgreements: 0, monthlyQuotesReviewed: 0, monthlyContactRequests: 0,

		// settings data
		settingQuotePing: true, settingReimbursementPing: true, settingRepossessionPing: true,

		//active user data
		active: true

	}, { upsert: true });
};

module.exports.readPersStats = async (discordId) => {
	let result = await d8PersonnelInfo.findOne({ discordId: discordId }, {
		// personnel data
		discordId: 1, charName: 1,

		// overall data
		housesSold: 1, warehousesSold: 1, propertiesRepod: 1, propertiesQuoted: 1, activityChecks: 1, miscSales: 1, financialAgreements: 1, quotesReviewed: 1, contactRequests: 1,

		//pay data
		currentCommission: 1, monthlyCommission: 1, currentMiscPay: 1, bankAccount: 1,

		// monthly data
		monthlyHousesSold: 1, monthlyWarehousesSold: 1, monthlyPropertiesRepod: 1, monthlyPropertiesQuoted: 1, monthlyActivityChecks: 1, monthlyMiscSales: 1, monthlyFinancialAgreements: 1, monthlyQuotesReviewed: 1, monthlyContactRequests: 1,

		//active user data
		active: 1,

		_id: 0
	});
	return result;
};

module.exports.addOnePersStat = async (discordId, statName) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: 1 } });
};

module.exports.subtractOnePersStat = async (discordId, statName) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: -1 } });
};

module.exports.readPersSetting = async (discordId, settingChoice) => {
	let result = await d8PersonnelInfo.findOne({ discordId: discordId }, { [settingChoice]: 1, _id: 0 });
	if (result[settingChoice] == null) {
		await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { [settingChoice]: true }, { upsert: true });
		return true;
	} else {
		return result[settingChoice];
	}
};

module.exports.setPersSetting = async (discordId, settingChoice, value) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { [settingChoice]: value });
};

module.exports.setBankAccount = async (discordId, bankNum) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { bankAccount: bankNum }, { upsert: true });
};

module.exports.setCharName = async (discordId, charName) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { charName: charName }, { upsert: true });
};

// monthly statistics report stuff
module.exports.monthlyRealtorStatsRep = async () => {
	let result = await d8PersonnelInfo.find({ charName: { $ne: null } }, { discordId: 1, charName: 1, monthlyHousesSold: 1, monthlyWarehousesSold: 1, monthlyPropertiesRepod: 1, monthlyPropertiesQuoted: 1, monthlyActivityChecks: 1, monthlyMiscSales: 1, monthlyFinancialAgreements: 1, monthlyQuotesReviewed: 1, monthlyContactRequests: 1, _id: 0 });
	return result;
};

module.exports.resetMonthlyRealtorStats = async (discordId) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { monthlyHousesSold: 0, monthlyWarehousesSold: 0, monthlyPropertiesRepod: 0, monthlyPropertiesQuoted: 0, monthlyActivityChecks: 0, monthlyMiscSales: 0, monthlyFinancialAgreements: 0, monthlyQuotesReviewed: 0, monthlyCommission: 0, monthlyContactRequests: 0, }, { upsert: true });
};


// commission stuff
module.exports.addCommission = async (discordId, commission) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: commission } }, { upsert: true });
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { monthlyCommission: commission } }, { upsert: true });
};

module.exports.removeCommission = async (discordId, commission) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: -commission } }, { upsert: true });
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { monthlyCommission: -commission } }, { upsert: true });

};

module.exports.addMiscPay = async (discordId, payAmt) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentMiscPay: payAmt } }, { upsert: true });
};

module.exports.removeMiscPay = async (discordId, payAmt) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { $inc: { currentMiscPay: -payAmt } }, { upsert: true });
};

module.exports.resetCurrPay = async (discordId) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { currentCommission: 0, currentMiscPay: 0 });
};

module.exports.readCurrentCommission = async (discordId) => {
	let result = await d8PersonnelInfo.findOne({ discordId: discordId }, { currentCommission: 1, _id: 0 });
	return result.currentCommission;
};

module.exports.readCurrentMiscPay = async (discordId) => {
	let result = await d8PersonnelInfo.findOne({ discordId: discordId }, { currentMiscPay: 1, _id: 0 });
	return result.currentMiscPay;
};

module.exports.readCurrentMiscPay = async (discordId) => {
	let result = await d8PersonnelInfo.findOne({ discordId: discordId }, { currentMiscPay: 1, _id: 0 });
	return result.currentMiscPay;
};

module.exports.readMonthlyCommission = async (discordId) => {
	let result = await d8PersonnelInfo.findOne({ discordId: discordId }, { monthlyCommission: 1, _id: 0 });
	return result.monthlyCommission;
};

module.exports.payReport = async () => {
	let result = await d8PersonnelInfo.find({ $or: [{ currentCommission: { $gt: 0 } }, { currentMiscPay: { $gt: 0 } }] }, { discordId: 1, bankAccount: 1, charName: 1, currentCommission: 1, currentMiscPay: 1, _id: 0 });
	return result;
};


// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await d8SummaryInfo.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true });
};

module.exports.readMsgId = async (summaryName) => {
	let result = await d8SummaryInfo.findOne({ summaryName }, { msgId: 1, _id: 0 });
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
	let result = await d8SummaryInfo.findOne({ summaryName }, { repDate: 1, _id: 0 });
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
	let result = await d8SummaryInfo.findOne({ summaryName }, { financeNum: 1, _id: 0 });
	if (result !== null) {
		return result.financeNum;
	}
	else {
		return `Value not found for ${summaryName}`;
	}
};


module.exports.currStats = async () => {
	let result = await d8PersonnelInfo.find({ $and: [{ charName: { $ne: null } }, { active: true }] }, {
		// personnel data
		discordId: 1, charName: 1,

		// overall data
		housesSold: 1, warehousesSold: 1, propertiesRepod: 1, propertiesQuoted: 1, activityChecks: 1, miscSales: 1, financialAgreements: 1, quotesReviewed: 1, contactRequests: 1,

		//pay data
		currentCommission: 1, monthlyCommission: 1, currentMiscPay: 1, bankAccount: 1,

		// monthly data
		monthlyHousesSold: 1, monthlyWarehousesSold: 1, monthlyPropertiesRepod: 1, monthlyPropertiesQuoted: 1, monthlyActivityChecks: 1, monthlyMiscSales: 1, monthlyFinancialAgreements: 1, monthlyQuotesReviewed: 1, monthlyContactRequests: 1,

		//active user data
		active: 1,

		_id: 0
	});
	return result;
};

module.exports.readPersonnelAssets = async () => {
	let result = await d8PersonnelAssets.find({ assetName: { $ne: null } }, { discordId: 1, assetName: 1, assetCost: 1, _id: 0 });
	return result;
};

module.exports.addPersonnelAsset = async (uniqueId, assetOwner, assetName, assetCost) => {
	await d8PersonnelAssets.findOneAndUpdate({ uniqueId: uniqueId }, { uniqueId: uniqueId, assetName: assetName, discordId: assetOwner, assetCost: assetCost }, { upsert: true });
};

module.exports.removePersonnelAsset = async (assetName) => {
	await d8PersonnelAssets.findOneAndDelete({ assetName: assetName });
};

module.exports.listPersonnelAssets = async (assetOwner) => {
	let result = await d8PersonnelAssets.find({ discordId: assetOwner }, { assetName: 1, assetCost: 1, _id: 0 });
	return result;
};


// repossession rechecks
module.exports.addRepoRecheck = async (uniqueId, owner, strAddr, recheckDt, origMsg) => {
	await d8RepoRechecks.findOneAndUpdate({ uniqueId: uniqueId }, { uniqueId: uniqueId, ownerName: owner, streetAddress: strAddr, recheckDate: recheckDt, originalMsg: origMsg }, { upsert: true });
};

module.exports.removeRepoRecheck = async (uniqueId) => {
	await d8RepoRechecks.findOneAndDelete({ uniqueId: uniqueId });
};

module.exports.readAllRechecks = async () => {
	let result = await d8RepoRechecks.find({ uniqueId: { $ne: null } }, { uniqueId: 1, ownerName: 1, streetAddress: 1, recheckDate: 1, originalMsg: 1, _id: 0 });
	return result;
};


// active status
module.exports.readActiveIndicator = async (discordId) => {
	let result = await d8PersonnelInfo.findOne({ discordId: discordId }, { active: 1, _id: 0 });
	return result.active;
};

module.exports.setActiveIndicator = async (discordId, value) => {
	await d8PersonnelInfo.findOneAndUpdate({ discordId: discordId }, { active: value });
};