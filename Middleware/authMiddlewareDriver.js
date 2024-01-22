
var admin = require("firebase-admin");
const { getAuth } = require('firebase-admin/auth');
// const driverApp = require("../index.js")
const { initializeApp } = require("firebase-admin/app");
var serviceAccountDriver = require("../Config/dev-driver-8dfb0-firebase-adminsdk-49l20-6bf1bc9ed7.json");
var driverApp = initializeApp(
  {
    credential: admin.credential.cert(serviceAccountDriver),
  },
  "driver"
);

const checkIfAuthenticated = async (req, res, next) => {

  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'

  ) {
    req.authToken = req.headers.authorization.split(' ')[1];
  } else {
    req.authToken = null;
    return res.status(401).send({ error: 'ACCESS_TOKEN_NOT_PROVIDED' });
  }

  console.log(driverApp);
  var authObj = getAuth(driverApp);
  console.log(authObj)
   authObj.verifyIdToken(req.authToken).then((result) => {
    console.log(result);
    // res.locals.UID = result.uid;
    next();
    return;
  }).catch((error) => {
    return res.status(404).json({
      statusCode: 404,
      status: "INVALID_ACCESS_TOKEN",
      message: error.message,
    });
  });
};
module.exports = { checkIfAuthenticated, driverApp}