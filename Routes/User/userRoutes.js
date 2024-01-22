const userController = require("../../Controllers/User/userController.js");
const userRequestController = require("../../Controllers/User/userrequestController.js");
const requestController = require("../../Controllers/Driver/requestController.js");
const vouchController = require("../../Controllers/common/vouchController.js");
const authController = require("../../Controllers/Auth/authController.js");
const middleWareUser = require("../../Middleware/authMiddlewareUser.js");
const firebaseController = require("../../Controllers/Auth/firebaseSignin.js");
const providerController = require("../../Controllers/Driver/providerController.js");
const vouchPaymentController = require ("../../Controllers/Driver/vouchPaymentsController.js")
const router = require("express").Router();

router.post(
  "/auth/update/registration",
  middleWareUser.checkIfAuthenticated,
  authController.updateUserRegistration
);
router.post(
  "/estimatedfare/:userId",
  middleWareUser.checkIfAuthenticated,
  userController.getEstimatedFare
);
router.get(
  "/markers/:s_latitude/:s_longitude",
  middleWareUser.checkIfAuthenticated,
  userController.getMarkers
);
router.post(
  "/send/request/:userId",
  middleWareUser.checkIfAuthenticated,
  userController.sendRequest
);
router.post(
  "/fovorite/location/:userId",
  middleWareUser.checkIfAuthenticated,
  userController.addFavoriteLocation
);
router.post(
  "/delete/fovorite/location/:locationId/:userId",
  middleWareUser.checkIfAuthenticated,
  userController.deleteFavoriteLocation
);
router.get(
  "/fovorite/locations/:userId",
  middleWareUser.checkIfAuthenticated,
  userController.getFavoriteLocations
);
router.get(
  "/request/status/:requestId",
  middleWareUser.checkIfAuthenticated,
  userRequestController.getrequestStatus
);
router.post(
  "/cancel/request/:requestId/:userId",
  middleWareUser.checkIfAuthenticated,
  userRequestController.cancelRequest
);
router.post(
  "/rate/provider/",
  middleWareUser.checkIfAuthenticated,
  userRequestController.rateProvider
);
router.post(
  "/auth/payment/status/:providerId/:requestId",
  authController.checkEscrowBalance
);
router.post("/notification/passenger", userController.notifyPassenger);
router.post("/notification/provider", userController.notifyDriver);
router.get(
  "/getInovice/:request_id",
  middleWareUser.checkIfAuthenticated,
  requestController.getInovice
);

router.get(
  "/getPassengerCompletedRides/:id",
  providerController.getProviderCompletedTrips
);
router.get(
  "/getPassengerRides/:provider_id/:status/:pageNumber",
  providerController.getProviderRides
);
router.get(
  "/getPassengerrideDetails/:request_id",
  providerController.getProviderRidesDetails
);

router.get(
  "/fetchPassengerRides/:id/:status/:pageNumber",
  middleWareUser.checkIfAuthenticated,
  userController.fetchPassengerRides
);

//api to be called from cloud function on registering a new Passenger/Provider
router.post("/auth/signup/:userType", authController.registerUser);

//test api's
router.get("/auth/login", firebaseController.signinWithFirebase);
router.post("/register/firebaseuser", authController.registerFirebaseUser);
router.post("/generateHashedKey", vouchController.generateVouchSignature);
router.post("/testVouchEscrow", authController.testVouchEscrow);

//vocuh night scheduler 
router.post("/night/scheduler", vouchPaymentController.deductScheduledPaymentFromDriversToRydoEscrow)

module.exports = router;
