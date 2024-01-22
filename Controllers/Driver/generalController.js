var { db, models } = require("../../Config/dbIndex.js");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const buffer = require("buffer");
const AdminTable = models.Admins;
const DriverTable = models.Providers;
const UserTable = models.Users;
const DriverDistanceTable = models.Admins;
const PoiConstantsTable = models.PoiConstants;
const axios = require("axios");
require("dotenv").config();
//const keyPath = require("../../Utils/rydo_key.key");
const newTables = require("../../Utils/requestFormat.js");

const sendPushNotification = async (sendTo, mesaage) => {};

const addPOIConstantData = async (req, res, next) => {
  let requestBody = {
    name: req.body.name,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    zone: req.body.zone,
  };

  const createdPoiConstant = PoiConstantsTable.create(requestBody)
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `PoI ${requestBody.name} ${result.id} Created Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `POI ${requestBody.name} ${createdPoiConstant.id} Creation Failed!!`,
        error: err,
      });
    });
};

const readPOIConstantDatas = async (req, res, next) => {
  const readAllPois = PoiConstantsTable.findAll()
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `All POI Constants Fetched Successfully`,
        totalPoiConstants: result.length,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `POI Constants Fetching Failed!!`,
        error: err,
      });
    });
};

const updatePOIConstantData = async (req, res, next) => {
  let id = req.params.id;

  const updatedPOI = PoiConstantsTable.update(
    { name: req.body.name },
    { where: { id: id } }
  )
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `POI Table ${result.id} Updated Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `POI ${id} Updation Failed!!`,
        error: err,
      });
    });
};

const readPOIConstantSingle = async (req, res, next) => {
  let id = req.params.id;

  PoiConstantsTable.findOne({ where: { id: id } })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `POI Table Fetched Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `POI Column Fetching Failed!!`,
        error: err,
      });
    });
};

const deletePOIConstantSingle = async (req, res, next) => {
  let id = req.params.id;

  PoiConstantsTable.destroy({ where: { id: id } })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `POI Table ${result.id} Deleted Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `POI ${id} Deletion Failed!!`,
        error: err,
      });
    });
};

const deletePOIConstantAll = async (req, res, next) => {
  let id = req.params.id;

  const updatedPOI = PoiConstantsTable.destroy()
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `POI Table ${result.id} Updated Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `POI ${id} Updation Failed!!`,
        error: err,
      });
    });
};

const hashNode = (val) =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve(crypto.createHash("RSA-SHA256").update(val).digest("hex")),
      0
    )
  );

const generateHashedKey = async (req, res, next) => {
  const {
    escrow_id,
    escrow_name,
    terms_and_conditions,
    key_deliverables,
    timestamp,
  } = req.body;

  var time = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  var requestBodyArray = {
    escrow_id: escrow_id,
    escrow_name: escrow_name,
    terms_and_conditions: terms_and_conditions,
    key_deliverables: key_deliverables,
  };

  console.log(requestBodyArray);

  // Create a private key
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const apiPrivateKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJlZTU2OGUwMS1iOGJhLTQxZTQtYTg2MS1jNGJhZDk2NjBmYmIiLCJuYW1lIjoiUGFyaXBhbGFuYSBBc3NvY2lhdGVzIFByaXZhdGUgTGltaXRlZCIsInJlZyI6IkIweTJ4RkZtRHVCUVRveVdZUkhSIiwiY29uZmlnIjoiUnlkbyIsImlhdCI6MTY3MjY0MzU3NX0.QAMaTDa10f8GLut1NZCkcINSl2kt5_kTDEcS1nC-bHs`;
  //console.log(`generatedPrivateKey : ${Buffer.from(privateKey)}`);
  // Convert string to buffer
  const data = Buffer.from(JSON.stringify(requestBodyArray));
  const privateKeyGen = fs.readFileSync(
    path.join(__dirname, "../../Utils/rydo_key.key"),
    "utf8"
  );
  // console.log("From KeyFile : ", privateKey2);

  // Sign the data and returned signature in buffer
  const sign = crypto.sign("SHA256", data, privateKeyGen);
  console.log(sign);

  // Convert returned buffer to base64
  const signature = sign.toString("base64");

  // Printing the signature
  console.log(`Signature:\n\n ${signature}`);

  requestBodyArray.timestamp = time;
  requestBodyArray.signature = signature;
  var requestBody = JSON.stringify(requestBodyArray);
  console.log(requestBodyArray);

  var config = {
    url: "https://sim.iamvouched.com/v1/escrow/create_escrow",
    headers: { apikey: process.env.VOUCH_SAMPLE_API_KEY },
    data: requestBody,
  };

  axios
    .post(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: `RSA-SHA256 Hashing successfull..`,
    signedKey: signature,
    signedData: requestBodyArray,
  });
};

module.exports = {
  sendPushNotification,
  addPOIConstantData,
  readPOIConstantDatas,
  updatePOIConstantData,
  readPOIConstantSingle,
  deletePOIConstantSingle,
  deletePOIConstantAll,
  generateHashedKey,
};
