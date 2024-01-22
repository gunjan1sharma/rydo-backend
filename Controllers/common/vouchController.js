const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
require("dotenv").config();
const ProjectStaticUtils = require("../../Utils/ProjectStaticUtils.js");
// const private_key_path = require("../../Config/rydo.key");

const generateSignatureFromPayload = (payload) => {
  let resultMap = new Map();
  const signature_algorithm = "SHA256";
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  payload.timestamp = timestamp;
  const privateKey = fs.readFileSync(
    path.join(__dirname, "../../Config/rydo.key"),
    "utf8"
  );

  console.log(`Recieved Payload : ${payload}`);
  console.log("Private Key " + privateKey);

  var binaryData = Buffer.from(JSON.stringify(payload));
  var signature = crypto
    .sign(signature_algorithm, binaryData, privateKey)
    .toString("base64");

  resultMap.set("timestamp", timestamp);
  resultMap.set("signature", signature);

  return resultMap;
};

const generateVouchSignature = async (req, res, next) => {
  console.log(__dirname);
  // console.log(privateKey);
  const signature_algorithm = "SHA256";
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const { escrow_id, escrow_name, terms_and_conditions, key_deliverables } =
    req.body;

  var payload = {
    escrow_id: escrow_id,
    escrow_name: escrow_name,
    terms_and_conditions: terms_and_conditions,
    key_deliverables: key_deliverables,
  };
  console.log(payload);
  const privateKey = fs.readFileSync(
    path.join(__dirname, "../../Config/rydo.key"),
    "utf8"
  );
  //console.log("Private Key " + privateKey);

  // var binaryData = Buffer.from(JSON.stringify(payload));
  // var signature = crypto
  //   .sign(signature_algorithm, binaryData, privateKey)
  //   .toString("base64");
  // console.log(signature);
  //payload.signature = signature;

  //Now Making Axios API call with signed payload to create new Escrow Account
  const _axios = axios.create({
    baseURL: "https://sim.iamvouched.com",
    headers: { apikey: process.env.VOUCH_SAMPLE_API_KEY },
  });

  var result = ProjectStaticUtils.generateSignatureFromPayload(payload);
  console.log(`timestamp : ${result.get("timestamp")}`);
  console.log(`signature : ${result.get("signature")}`);
  payload.timestamp = result.get("timestamp");
  payload.signature = result.get("signature");

  var createEscrowResponse = [];
  _axios
    .post("/v1/escrow/create_escrow", payload)
    .then(function (response) {
      console.log(response);
      console.log(response.data);
      createEscrowResponse = response.data;
      console.log("Response is successfull..");

      return res.status(200).json({
        statusCode: 200,
        message: `Vouch Signature generated`,
        createEscrowResponse: createEscrowResponse,
        signedData: payload,
      });
    })
    .catch(function (error) {
      console.log(error);
      console.log(`Axios Error : ${error}`);
    });
};
module.exports = {
  generateVouchSignature,
};
