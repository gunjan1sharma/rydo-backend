const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
require("dotenv").config();
const _axios = axios.create({
  baseURL: "https://sim.iamvouched.com",
  headers: { apikey: process.env.VOUCH_SAMPLE_API_KEY },
});

class ProjectStaticUtils {
  static generateSignatureFromPayload = (payload) => {
    let resultMap = new Map();
    const signature_algorithm = "SHA256";
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    payload.timestamp = timestamp;
    const privateKey = fs.readFileSync(
      path.join(__dirname, "../Config/rydo.key"),
      "utf8"
    );

    console.log(`Recieved Payload : ${payload}`);
    //console.log("Private Key " + privateKey);

    var binaryData = Buffer.from(JSON.stringify(payload));
    var signature = crypto
      .sign(signature_algorithm, binaryData, privateKey)
      .toString("base64");

    resultMap.set("timestamp", timestamp);
    resultMap.set("signature", signature);

    return resultMap;
  };

  static fetchDriverEscrowBalance = async (escrow_id) => {
    const URL = `/v1/escrow/fetch_escrow_account_balance`;
    var data = { escrow_id: escrow_id };

    try {
      const balanceResponse = await _axios.post(URL, data);
      return balanceResponse.data;
    } catch (error) {
      console.log(`Error Occured While Checking Account Balance : ${error}`);
      return error;
    }
  };
}

module.exports = ProjectStaticUtils;
