
var { models } = require("../Config/dbIndex.js");
const firebaseCheck = require("../Config/firebaseconfig.js");
var admin = require("firebase-admin");
var serviceAccountPassenger = require("../Config/dev-passenger-firebase-adminsdk-nvrgt-6c157d8d49.json");
const User = models.Users;


const checkIfAuthenticated = async (req, res, next) => {
  // firebaseCheck.firebaseConfig(1);
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'

  ) {
    req.authToken = req.headers.authorization.split(' ')[1];
  } else {

    req.authToken = null;
    return res.status(401).send({ error: 'ACCESS_TOKEN_NOT_PROVIDED' });
  }
  admin
    .auth()
    .verifyIdToken(req.authToken).then(async (result) => {
      // console.log(result.uid);
      // console.log(result);
      // console.log(Users);
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
module.exports = { checkIfAuthenticated }