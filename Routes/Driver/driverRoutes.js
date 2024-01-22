const sampleController = require("../../Controllers/Driver/smapleController.js");
const generalController = require("../../Controllers/Driver/generalController.js");
const providerController = require("../../Controllers/Driver/providerController.js");
const requestController = require("../../Controllers/Driver/requestController.js");
const tripController = require("../../Controllers/Driver/tripController.js");
const walletController = require("../../Controllers/Driver/walletController.js");
const statusController = require("../../Controllers/Driver/statusController.js");
const vouchPaymentsController = require("../../Controllers/Driver/vouchPaymentsController.js");
const middleWareDriver = require("../../Middleware/authMiddlewareDriver.js");
const router = require("express").Router();

router.post("/createAdmin", sampleController.createAdmin);
router.get("/getAdmins", sampleController.readAllAdmins);
router.get("/getAdmin/:id", sampleController.readAdmin);
router.put("/updateAdmin/:id", sampleController.updateAdmin);
router.delete("/deleteAdmin/:id", sampleController.deleteAdmin);

router.post("/createpoi", generalController.addPOIConstantData);
router.get("/readpois", generalController.readPOIConstantDatas);
router.put("/updatepoi/:id", generalController.updatePOIConstantData);
router.delete("/deletepoi/:id", generalController.deletePOIConstantSingle);
router.get("/readpoi/:id", generalController.readPOIConstantSingle);
router.delete("/deletepois", generalController.deletePOIConstantAll);
router.post("/sendPushNotification", generalController.sendPushNotification);

router.put(
  "/setDriverStatus/:id",
  middleWareDriver.checkIfAuthenticated,
  statusController.setDriverStatus
);
router.get(
  "/checkDriverStatus/:id",
  middleWareDriver.checkIfAuthenticated,
  statusController.checkDriverStatus
);
router.post(
  "/setDriverLatestLocation/:id",
  middleWareDriver.checkIfAuthenticated,
  statusController.setDriverLatestLocation
);

router.post(
  "/acceptRequest",
  middleWareDriver.checkIfAuthenticated,
  requestController.acceptRequest
);
router.post(
  "/rejectRequest",
  middleWareDriver.checkIfAuthenticated,
  requestController.rejectRequestV2
);
router.post(
  "/cancelRequest",
  middleWareDriver.checkIfAuthenticated,
  requestController.cancelRequest
);
router.post(
  "/updateRequest",
  middleWareDriver.checkIfAuthenticated,
  requestController.updateRequest
);
router.post(
  "/verifyRideOtp",
  middleWareDriver.checkIfAuthenticated,
  requestController.verifyRideOtp
);

router.get(
  "/getProviderCompletedTrips/:id",
  middleWareDriver.checkIfAuthenticated,
  providerController.getProviderCompletedTrips
);
router.get(
  "/getProviderRides/:provider_id/:status/:pageNumber",
  middleWareDriver.checkIfAuthenticated,
  providerController.getProviderRides
);
router.get(
  "/getProviderRidesDetails/:request_id",
  middleWareDriver.checkIfAuthenticated,
  providerController.getProviderRidesDetails
);
router.get(
  "/getProviderEarnings/:provider_id",
  middleWareDriver.checkIfAuthenticated,
  providerController.getProviderEarnings
);
router.get(
  "/getHelp",
  middleWareDriver.checkIfAuthenticated,
  providerController.getProviderHelp
);

router.get(
  "/getTrip",
  middleWareDriver.checkIfAuthenticated,
  tripController.getTrip
);
router.get(
  "/getInovice/:request_id",
  middleWareDriver.checkIfAuthenticated,
  requestController.getInovice
);
router.post(
  "/ratePassenger",
  middleWareDriver.checkIfAuthenticated,
  tripController.ratePassenger
);

router.get("/requestAmount", walletController.requestAmount);
router.get("/getWalletTransction", walletController.getWalletTransaction);
router.delete("/removeRequestAmount", walletController.removeRequestAmount);

router.post("/createRequestTable", requestController.createUserRequestTable);
router.post(
  "/createRequestFilterTable",
  requestController.createRequestFilterTable
);
router.post(
  "/createUserPaymentRequestTable",
  requestController.createUserPaymentRequestTable
);
router.post(
  "/createUserRequestRatingsTable",
  requestController.createUserRequestRatingsTable
);
router.get("/gettime", requestController.initTimeOperation);
router.get("/generateHashedKey", generalController.generateHashedKey);
router.get(
  "/driverDistanceJoinOperationzz",
  requestController.driverDistanceJoinOperation
);

//vouchPaymentsController Routes
router.get(
  "/checkDriverEscrowBalance/:driverId",
  vouchPaymentsController.checkDriverEscrowBalance
);
router.get(
  "/generateFixedAmountPayableLink",
  vouchPaymentsController.generateFixedAmountPayableLink
);
router.get(
  "/checkCollectLinkStatus",
  vouchPaymentsController.checkCollectLinkStatus
);

router.get(
  "/deductScheduledPaymentFromDriversToRydoEscrow",
  vouchPaymentsController.deductScheduledPaymentFromDriversToRydoEscrow
);

router.post(
  "/escrowToEscrowTransfer",
  vouchPaymentsController.escrowToEscrowTransfer
);

router.get("/vouchTesting", vouchPaymentsController.vouchTesting);
router.get("/getRideRequestStatus/:id", requestController.getRideRequestStatus);

module.exports = router;
