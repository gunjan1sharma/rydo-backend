var { db, models } = require("../../Config/dbIndex.js");
const AdminTable = models.Admins;
const DriverTable = models.Providers;
const UserTable = models.Users;
const DriverDistanceTable = models.Admins;
const PoiConstantsTable = models.Admins;

const requestAmount = async (req, res, next) => {};

const getWalletTransaction = async (req, res, next) => {};

const removeRequestAmount = async (req, res, next) => {};

module.exports = { requestAmount, getWalletTransaction, removeRequestAmount };
