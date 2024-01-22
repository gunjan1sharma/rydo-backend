const dotenv = require("dotenv");

dotenv.config({ path: __dirname + `/../../.env.${process.env.NODE_ENV}` }); // change according to your need

const config = {
  port: process.env.APPLICATION_PORT,
  dbUrl: process.env.DB_URL,
  dbPassword: process.env.DB_PASSWORD,
};

export default config;
