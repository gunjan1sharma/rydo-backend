const dbConfig = require("../Config/dbConfig.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  retry: {
    match: [
      Sequelize.ConnectionError,
      Sequelize.ConnectionTimedOutError,
      Sequelize.TimeoutError,
      /Deadlock/i,
      "SQLITE_BUSY",
    ],
    max: 3, // Maximum rety 3 times
    backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
    backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("connected with sequilize");
  })
  .catch((err) => {
    console.log("error " + err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

var initModels = require("../Models/init-models.js");
var models = initModels(sequelize);

db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync is done!");
});

module.exports = { db: sequelize, models: models };
