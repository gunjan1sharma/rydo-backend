const router = require("express").Router();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const profileController = require("../../Controllers/common/profileController.js");
const middleWareUser = require("../../Middleware/authMiddlewareUser.js");
const multer = require("multer");
const middleWareDriver = require("../../Middleware/authMiddlewareDriver.js");

const upload = multer({
  dest: "provider/documents/",
  limits: { fileSize: 1000000 },
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${process.env.UPLOAD_FILE_PATH}/${req.params.provider_id}/`);
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const uploadDynamic = multer({
  storage: storage,
  limits: { fileSize: 3000000 },
  //fileFilter: function fileFilter(req, file, cb) {
  //const { unique_id, expires_at, document_id } = req.body;
  //.Without documentID|unique_id|expires_at we will not let provider upload any documents
  // if (
  //   document_id === null ||
  //   document_id === undefined ||
  //   unique_id === null ||
  //   unique_id === undefined ||
  //   expires_at === null ||
  //   expires_at === undefined
  // ) {
  //   //Notifying Multer Engine to reject the Image
  //   // cb(null, false);
  //   console.log(" inside document validation..");
  //   console.error(
  //     `Valid documentID|unique_id|expires_at from client we must need to save image information`
  //   );
  //   return;
  // }
  //},
});

const storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.userType === "DRIVER") {
      cb(null, `${process.env.UPLOAD_FILE_PATH}/${req.params.id}/`);
    } else {
      cb(null, `${process.env.UPLOAD_FILE_PATH_Passenger}/${req.params.id}/`);
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const uploadProfile = multer({
  storage: storageProfile,
  limits: { fileSize: 1000000 },
});

router.post(
  "/generateOTPByPhoneNumber",
  middleWareDriver.checkIfAuthenticated,
  profileController.generateOTPByPhoneNumber
);
router.post(
  "/verifyPhoneNumberByOtp",
  profileController.verifyPhoneNumberByOtp
);
router.put("/updateKycDetails", profileController.updateKycDetails);
router.put("/updateVehicleDetails", profileController.updateVehicleDetails);
// router.post(
//   "/uploadDocuments/:provider_id",
//   uploadDynamic.single("file"),
//   profileController.uploadDocuments
// );
router.post(
  "/uploadDocuments/:provider_id",
  middleWareDriver.checkIfAuthenticated,
  uploadDynamic.single("file"),
  profileController.uploadDocuments
);
router.get(
  "/fetchDocumentsByKey/:provider_id/:document_id",
  middleWareDriver.checkIfAuthenticated,
  profileController.fetchDocumentsByKey
);
router.get(
  "/fetchProviderALLDocuments/:provider_id",
  middleWareDriver.checkIfAuthenticated,
  profileController.fetchProviderALLDocuments
);
router.post(
  "/updateOrCreateProviderServices/:provider_id",
  middleWareDriver.checkIfAuthenticated,
  profileController.updateOrCreateProviderServices
);
router.post(
  "/createProviderDocSubFolder/:provider_id",
  profileController.createProviderDocSubFolder
);

router.put(
  "/updateProviderDeviceToken/:provider_id",
  middleWareDriver.checkIfAuthenticated,
  profileController.updateProviderDeviceToken
);

//updating user/provider profile having optional image file
// router.put(
//   "/auth/updateUserOrProviderById/:id",
//   uploadProfile.single("file"),
//   profileController.updateUserOrProviderProfileById
// );

//We had breaked this combine API into two seperate API
router.put(
  "/auth/updatePassengerProfileById/:id",
  middleWareDriver.checkIfAuthenticated,
  uploadProfile.single("file"),
  profileController.updatePassengerProfileById
);
router.put(
  "/auth/updateProviderProfileById/:provider_id",
  middleWareDriver.checkIfAuthenticated,
  uploadDynamic.single("file"),
  profileController.updateProviderProfileById
);

router.get(
  "/auth/getUserProfileById/:id",
  middleWareDriver.checkIfAuthenticated,
  profileController.getUserProfileById
);
router.get(
  "/auth/getProviderProfileById/:id",
  middleWareDriver.checkIfAuthenticated,
  profileController.getProviderProfileById
);
router.get(
  "/auth/getProviderProfileByMobileNumber/:mobile_number",
  middleWareDriver.checkIfAuthenticated,
  profileController.getProviderProfileByMobileNumber
);
router.get(
  "/auth/getPassengerProfileByMobileNumber/:mobile_number",
  middleWareDriver.checkIfAuthenticated,
  profileController.getPassengerProfileByMobileNumber
);

router.get(
  "/getNearBySearchSuggestion",
  middleWareDriver.checkIfAuthenticated,
  profileController.getNearBySearchSuggestion
);
router.get("/hitRadisCache", profileController.hitRadisCache);

/*added endpoints for users to reuse these apis*/
router.get(
  "/auth/user/getPassengerProfileByMobileNumber/:mobile_number",
  middleWareUser.checkIfAuthenticated,
  profileController.getPassengerProfileByMobileNumber
);

router.put(
  "/auth/user/updatePassengerProfileById/:id",
  middleWareUser.checkIfAuthenticated,
  uploadProfile.single("file"),
  profileController.updatePassengerProfileById
);

router.get(
  "/auth/user/getUserProfileById/:id",
  middleWareUser.checkIfAuthenticated,
  profileController.getUserProfileById
);
/*added endpoints for users to reuse these apis*/

module.exports = router;
