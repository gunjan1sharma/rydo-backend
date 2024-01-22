const bppSearchController = require("../../Controllers/Beckn/bppSearchController.js");
const bppSelectController = require("../../Controllers/Beckn/bppSelectController.js");
const bppInitController = require("../../Controllers/Beckn/bppInitController.js");
const bppConfirmController = require("../../Controllers/Beckn/bppConfirmController.js");
const bppStatusController = require("../../Controllers/Beckn/bppStatusController.js");
const bppCancelController = require("../../Controllers/Beckn/bppCancelController.js");
const bppRateController = require("../../Controllers/Beckn/bppRateController.js");

const bppActionHandler = async (req, res) => {
  const action = req.body.context.action;
  var response;
  switch (action) {
    case "search":
      console.log("calling search");
      response = await bppSearchController.searchRequest(req, res);
      break;
    case "select":
      console.log("select");
      response = await bppSelectController.selectRequest(req, res);
      break;
    case "init":
      console.log("init");
      response = await bppInitController.initRequest(req, res);
      break;
    case "confirm":
      console.log("confirm");
      response = await bppConfirmController.confirmRequest(req, res);
      break;
    case "status":
      console.log("status");
      response = await bppStatusController.statusRequest(req, res);
      break;
    case "cancel":
      console.log("cancel");
      response = await bppCancelController.cancelRequest(req, res);
      break;
    case "rating":
      console.log("rating");
      response = await bppRateController.rateRequest(req, res);
      break;
  }
  return response;
};

module.exports = { bppActionHandler };
