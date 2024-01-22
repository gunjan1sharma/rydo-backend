const admin = require("firebase-admin");
const { models } = require("../../Config/dbIndex.js");
const { Op } = require("sequelize");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios").default;
const mapsdk = require("mapmyindia-sdk-nodejs");
var nodeUrl = require("url");
const UserTable = models.Users;
const ProviderTable = models.Providers;
const ProviderDevicesTable = models.ProviderDevices;
const ProviderProfileTable = models.ProviderProfiles;
const ProviderDocumentsTable = models.ProviderDocuments;
const DocumentsTable = models.Documents;
const ProviderServiceTable = models.ProviderServices;
const ServiceTypesTable = models.ServiceTypes;
require("dotenv").config();
const moment = require("moment");
const AWS = require("aws-sdk");
const fs = require("fs");
const multer = require("multer");
const NodeCache = require("node-cache");
const { cachedToken } = require("../../index.js");
const myCache = new NodeCache({
  stdTTL: 0,
  checkperiod: 0,
  maxKeys: -1,
  deleteOnExpire: false,
  useClones: true,
});

const _axios_second = axios.create({
  baseURL: "https://outpost.mapmyindia.com/api/",
  headers: { "content-type": "application/x-www-form-urlencoded" },
});

//Logic and Functions for scheduling MMI Auth Token Generation on every 86400 seconds(24 Hour)
var mmiAuthTokenGeneration = async () => {
  //Making the MMI api call to generate the Auth Token
  var authToken = "";
  _axios_second
    .post(`security/oauth/token`, {
      grant_type: "client_credentials",
      client_id: process.env.MMI_CLIENT_ID,
      client_secret: process.env.MMI_SECRET_KEY,
    })
    .then(function (response) {
      console.log("from profileController : ", response.data);
      mmiAuthTokenAutoCaching(response.data.access_token);
      authToken = response.data.access_token;
      return response.data.access_token;
    })
    .catch(function (error) {
      console.log(error);
    });
  return authToken;
};

const mmiAuthTokenAutoCaching = (token) => {
  //After generating the Token we are caching it in our memory to use it everytime
  var cacheStatus = myCache.set("mmiAuthTokenKey", token);
  console.log("cacheStatus : ", cacheStatus);
};

const mmiAuthTokenAutoScheduling = () => {
  //Generating MMIAuth token and saving it in cache on every 85400 seconds(24 Hour)
  setInterval(mmiAuthTokenGeneration, 85000000);
};

const createFolderInOs = (pathToCreateFolder) => {
  // const provider_id = req.params.provider_id;
  // const path = `${process.env.UPLOAD_FILE_PATH}/${provider_id}`;

  fs.access(pathToCreateFolder, (error) => {
    // To check if the given directory
    // already exists or not
    if (error) {
      // If current directory does not exist
      // then create it
      fs.mkdir(pathToCreateFolder, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("directory path : ", path);
          console.log("New Directory created successfully !!");
        }
      });
    } else {
      console.log("Given Directory already exists !!");
    }
  });
};

const createUserProfile = async () => {
  await UserTable.create(passengerBody)
    .then(async (result) => {
      //Now we are creating folder for this passenger for storing documents and profile pictures
      const path = `${process.env.UPLOAD_FILE_PATH_Passenger}/${result.id}`;
      createFolderInOs(path);

      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "User Profile Created Successfully",
        updateProfile: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `User Profile Creation Failed!!`,
        err: err,
      });
    });
};

const createProviderProfile = async () => {
  //Finally Creating Provider Profile
  await ProviderTable.create(providerBody)
    .then(async (result) => {
      //Now we are creating folder for this provider for storing documents and profile pictures
      const path = `${process.env.UPLOAD_FILE_PATH}/${result.id}`;
      createFolderInOs(path);

      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Driver Profile Updated Successfully",
        createdProfile: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Driver Profile Creation Failed!!`,
        err: err,
      });
    });
};

const createUserOrDriverProfile = async (req, res, next) => {
  //Validation of UserType
  if (
    req.body.userType === "" ||
    req.body.userType === undefined ||
    req.body.userType === null
  ) {
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: `Valid UserType(USER|DRIVER) is Required In Request Body`,
      currentUserType: req.body.userType,
      expectedUserType: "USER|DRIVER",
    });
  }

  //Request body for provider
  var providerBody = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userType: req.body.userType,
    payment_mode: req.body.payment_mode,
    email: req.body.email,
    gender: req.body.gender,
    mobile: req.body.mobile,
    status: req.body.status,
    fleet: req.body.fleet,
    password: req.body.password,
    avatar: req.body.avatar,
    device_token: req.body.device_token,
    device_id: req.body.device_id,
    device_type: req.body.device_type,
    login_by: req.body.login_by,
    social_unique_id: req.body.social_unique_id,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    stripe_acc_id: req.body.stripe_cust_id,
    availability_status: req.body.availability_status,
    location_timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    connection_status: req.body.connection_status,
    stripe_cust_id: req.body.stripe_cust_id,
    wallet_balance: req.body.wallet_balance,
    rating: req.body.rating,
    otp: req.body.otp,
    language: req.body.language,
    remember_token: req.body.remember_token,
    country_code: req.body.country_code,
  };

  //Request body for passenger
  var passengerBody = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userType: req.body.userType,
    payment_mode: req.body.payment_mode,
    email: req.body.email,
    gender: req.body.gender,
    mobile: req.body.mobile,
    password: req.body.password,
    picture: req.body.picture,
    device_token: req.body.device_token,
    device_id: req.body.device_id,
    device_type: req.body.device_type,
    login_by: req.body.login_by,
    social_unique_id: req.body.social_unique_id,
    latitude: req.body.latitude,
    longitude: req.body.longitude,

    stripe_cust_id: req.body.stripe_cust_id,
    wallet_balance: req.body.wallet_balance,
    rating: req.body.rating,
    otp: req.body.otp,
    language: req.body.language,
    remember_token: req.body.remember_token,
    country_code: req.body.country_code,
  };

  //Now finally creating the User/Provider
  switch (req.body.userType) {
    case "USER":
      //Checking if request body is having Image file|Multipart data along with other fields
      //if yes then 1st ulloading the image and getting URL to put in next update/create operation

      var downloadPath = "";
      if (req.file !== null && req.file !== undefined) {
        downloadPath = `${process.env.DOWNLOAD_FILE_PATH_Passenger}/${id}/${req.file.filename}`;
        passengerBody.picture = downloadPath;
        console.log(req.file);
      }

      //2.Checking upload/update status
      // if (req.file !== null && req.file !== undefined) {
      //   console.log("Updating profile with profile Image..");
      //   if (userResult.picture === "" || userResult.picture === null) {
      //     console.log("Updating profile image for 1st time");
      //   } else {
      //     //8.Now updation done, so deleting the old document file after successfully uploading and updating the doc path
      //     //Here we are building the file saved path dynamically because for deleting we need full path
      //     if (userResult.picture !== undefined && userResult.picture !== null) {
      //       const fileSavedPath = `${
      //         process.env.UPLOAD_FILE_PATH_Passenger
      //       }/${id}/${path.basename(userResult.picture)}`;
      //       console.log("constructed savedPath : ", fileSavedPath);
      //       deleteExistingDocFile(fileSavedPath);
      //     }

      //     console.log(
      //       "Provider is uploading/updating profile image for 2nd time",
      //       providerResult.picture
      //     );
      //   }
      // } else {
      //   console.log("Updating profile without profile Image..");
      // }

      await UserTable.create(passengerBody)
        .then(async (result) => {
          return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "User Profile Created Successfully",
            updateProfile: await UserTable.findOne({ where: { id: id } }),
          });
        })
        .catch((err) => {
          return res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: `User Profile Creation Failed!!`,
            err: err,
          });
        });
      break;

    case "DRIVER":
      //Checking if request body is having Image file|Multipart data along with other fields
      //if yes then 1st ulloading the image and getting URL to put in next update/create operation

      var downloadPath = "";
      if (req.file !== null && req.file !== undefined) {
        downloadPath = `${process.env.DOWNLOAD_FILE_PATH}/${id}/${req.file.filename}`;
        providerBody.avatar = downloadPath;
        console.log(req.file);
      }

      //2.Checking upload/update status
      // if (req.file !== null && req.file !== undefined) {
      //   console.log("Updating profile with profile Image..");
      //   if (providerResult.avatar === "" || providerResult.avatar === null) {
      //     console.log("Updating profile image for 1st time");
      //   } else {
      //     //8.Now updation done, so deleting the old document file after successfully uploading and updating the doc path
      //     //Here we are building the file saved path dynamically because for deleting we need full path
      //     const fileSavedPath = `${
      //       process.env.UPLOAD_FILE_PATH
      //     }/${id}/${path.basename(providerResult.avatar)}`;
      //     console.log("constructed savedPath : ", fileSavedPath);
      //     deleteExistingDocFile(fileSavedPath);

      //     console.log(
      //       "Provider is uploading/updating profile image for 2nd time",
      //       providerResult.avatar
      //     );
      //   }
      // } else {
      //   console.log("Updating profile without profile Image..");
      // }

      //Finally updating the profile with or without profile Image
      await ProviderTable.create(providerBody)
        .then(async (result) => {
          return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Driver Profile Created Successfully",
            updatedProfile: await ProviderTable.findOne({ where: { id: id } }),
          });
        })
        .catch((err) => {
          return res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: `Driver Profile Creation Failed!!`,
            err: err,
          });
        });
      break;
  }
};

const updateUserOrProviderProfileById = async (req, res, next) => {
  const id = req.params.id;

  //Validating UserType(UserType is required)
  if (
    req.body.userType === "" ||
    req.body.userType === undefined ||
    req.body.userType === null
  ) {
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: `Valid UserType(USER|DRIVER) is Required In Request Body`,
      currentUserType: req.body.userType,
      expectedUserType: "USER|DRIVER",
    });
  }

  //Provider body to populate creation of profile
  var providerBody = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userType: req.body.userType,
    payment_mode: req.body.payment_mode,
    email: req.body.email,
    gender: req.body.gender,
    mobile: req.body.mobile,
    status: req.body.status,
    fleet: req.body.fleet,
    password: req.body.password,
    avatar: req.body.avatar,
    device_token: req.body.device_token,
    device_id: req.body.device_id,
    device_type: req.body.device_type,
    login_by: req.body.login_by,
    social_unique_id: req.body.social_unique_id,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    stripe_acc_id: req.body.stripe_cust_id,
    availability_status: req.body.availability_status,
    location_timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    connection_status: req.body.connection_status,
    stripe_cust_id: req.body.stripe_cust_id,
    wallet_balance: req.body.wallet_balance,
    rating: req.body.rating,
    otp: req.body.otp,
    language: req.body.language,
    remember_token: req.body.remember_token,
    country_code: req.body.country_code,
  };

  //Passenger body to populate creation of profile
  var passengerBody = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userType: req.body.userType,
    payment_mode: req.body.payment_mode,
    email: req.body.email,
    gender: req.body.gender,
    mobile: req.body.mobile,
    password: req.body.password,
    picture: req.body.picture,
    device_token: req.body.device_token,
    device_id: req.body.device_id,
    device_type: req.body.device_type,
    login_by: req.body.login_by,
    social_unique_id: req.body.social_unique_id,
    latitude: req.body.latitude,
    longitude: req.body.longitude,

    stripe_cust_id: req.body.stripe_cust_id,
    wallet_balance: req.body.wallet_balance,
    rating: req.body.rating,
    otp: req.body.otp,
    language: req.body.language,
    remember_token: req.body.remember_token,
    country_code: req.body.country_code,
  };

  //Before updating, checking this User/Provider exists in our DB or not
  var userResult = [];
  var providerResult = [];
  switch (req.body.userType) {
    case "USER":
      userResult = await UserTable.findOne({ where: { id: id } });

      if (userResult === null || userResult === undefined) {
        return res.status(500).json({
          statusCode: 500,
          status: "failed",
          message: `User With ID(${id}) does not exist in our DB!!`,
        });
      }
      break;
    case "DRIVER":
      providerResult = await ProviderTable.findOne({ where: { id: id } });
      if (providerResult === null || providerResult === undefined) {
        return res.status(500).json({
          statusCode: 500,
          status: "failed",
          message: `Provider With ID(${id}) does not exist in our DB!!`,
        });
      }
      break;
  }

  //Now actually updating the User/Provider respectievly
  switch (req.body.userType) {
    case "USER":
      //Checking if request body is having Image file|Multipart data along with other fields
      //if yes then 1st ulloading the image and getting URL to put in next update/create operation

      var downloadPath = "";
      if (req.file !== null && req.file !== undefined) {
        downloadPath = `${process.env.DOWNLOAD_FILE_PATH_Passenger}/${id}/${req.file.filename}`;
        passengerBody.picture = downloadPath;
        console.log(req.file);
      }

      //2.Checking upload/update status
      if (req.file !== null && req.file !== undefined) {
        console.log("Updating profile with profile Image..");
        if (userResult.picture === "" || userResult.picture === null) {
          console.log("Updating profile image for 1st time");
        } else {
          //8.Now updation done, so deleting the old document file after successfully uploading and updating the doc path
          //Here we are building the file saved path dynamically because for deleting we need full path
          if (userResult.picture !== undefined && userResult.picture !== null) {
            const fileSavedPath = `${
              process.env.UPLOAD_FILE_PATH_Passenger
            }/${id}/${path.basename(userResult.picture)}`;
            console.log("constructed savedPath : ", fileSavedPath);
            deleteExistingDocFile(fileSavedPath);
          }

          console.log(
            "Provider is uploading/updating profile image for 2nd time",
            providerResult.picture
          );
        }
      } else {
        console.log("Updating profile without profile Image..");
      }

      await UserTable.update(passengerBody, { where: { id: id } })
        .then(async (result) => {
          return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "User Profile Updated Successfully",
            updateProfile: await UserTable.findOne({ where: { id: id } }),
          });
        })
        .catch((err) => {
          return res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: `User Profile Updating Failed!!`,
            err: err,
          });
        });
      break;

    case "DRIVER":
      //Checking if request body is having Image file|Multipart data along with other fields
      //if yes then 1st ulloading the image and getting URL to put in next update/create operation

      var downloadPath = "";
      if (req.file !== null && req.file !== undefined) {
        downloadPath = `${process.env.DOWNLOAD_FILE_PATH}/${id}/${req.file.filename}`;
        providerBody.avatar = downloadPath;
        console.log(req.file);
      }

      //2.Checking upload/update status
      if (req.file !== null && req.file !== undefined) {
        console.log("Updating profile with profile Image..");
        if (providerResult.avatar === "" || providerResult.avatar === null) {
          console.log("Updating profile image for 1st time");
        } else {
          //8.Now updation done, so deleting the old document file after successfully uploading and updating the doc path
          //Here we are building the file saved path dynamically because for deleting we need full path
          const fileSavedPath = `${
            process.env.UPLOAD_FILE_PATH
          }/${id}/${path.basename(providerResult.avatar)}`;
          console.log("constructed savedPath : ", fileSavedPath);
          deleteExistingDocFile(fileSavedPath);

          console.log(
            "Provider is uploading/updating profile image for 2nd time",
            providerResult.avatar
          );
        }
      } else {
        console.log("Updating profile without profile Image..");
      }

      //Finally updating the profile with or without profile Image
      await ProviderTable.update(providerBody, { where: { id: id } })
        .then(async (result) => {
          return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Driver Profile Updated Successfully",
            updatedProfile: await ProviderTable.findOne({ where: { id: id } }),
            // documentFullPath: req.file !== null ? downloadPath : "",
            // documentKey: req.file !== null ? req.file.filename : "",
            // output: req.file !== null ? req.file : "",
          });
        })
        .catch((err) => {
          return res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: `Driver Profile Updating Failed!!`,
            err: err,
          });
        });
      break;
  }
};

const updatePassengerProfileById = async (req, res, next) => {
  const { user_id, firebase_user_id } = req.body;
  var id = "";
  var whereClause = [];

  //Accepting dynamic ID(provider_id or firebase_user_id) to Update ProviderProfile
  if (
    user_id === "null" ||
    user_id === "NULL" ||
    user_id === undefined ||
    user_id === null
  ) {
    id = firebase_user_id;
    whereClause = { firebase_user_id: firebase_user_id };
  } else if (
    firebase_user_id === "null" ||
    firebase_user_id === "NULL" ||
    firebase_user_id === undefined ||
    firebase_user_id === null
  ) {
    id = user_id;
    whereClause = { id: user_id };
  }

  //Passenger body to populate creation of profile
  var passengerBody = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userType: req.body.userType,
    payment_mode: req.body.payment_mode,
    email: req.body.email,
    gender: req.body.gender,
    mobile: req.body.mobile,
    password: req.body.password,
    picture: req.body.picture,
    device_token: req.body.device_token,
    device_id: req.body.device_id,
    device_type: req.body.device_type,
    login_by: req.body.login_by,
    social_unique_id: req.body.social_unique_id,
    latitude: req.body.latitude,
    longitude: req.body.longitude,

    stripe_cust_id: req.body.stripe_cust_id,
    wallet_balance: req.body.wallet_balance,
    rating: req.body.rating,
    otp: req.body.otp,
    language: req.body.language,
    remember_token: req.body.remember_token,
    country_code: req.body.country_code,
  };

  //Catching the server crash due to undefined ID
  if (id === null || id === undefined || id === "") {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Are Not Able to Form ID With Given Identifiers!!`,
    });
  }

  //Before updating, checking this User/Provider exists in our DB or not
  var userResult = [];
  userResult = await UserTable.findOne({ where: whereClause });
  if (userResult === null || userResult === undefined) {
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: `User With ID(${id}) does not exist in our DB!!`,
    });
  }

  //Checking if request body is having Image file|Multipart data along with other fields
  //if yes then 1st ulloading the image and getting URL to put in next update/create operation
  var downloadPath = "";
  if (req.file !== null && req.file !== undefined) {
    downloadPath = `${process.env.DOWNLOAD_FILE_PATH_Passenger}/${req.params.id}/${req.file.filename}`;
    passengerBody.picture = downloadPath;
    req.body.picture = downloadPath;
    console.log(req.file);
  }

  //2.Checking upload/update status
  if (req.file !== null && req.file !== undefined) {
    console.log("Updating profile with profile Image..");
    if (userResult.picture === "" || userResult.picture === null) {
      console.log("Updating profile image for 1st time");
    } else {
      //8.Now updation done, so deleting the old document file after successfully uploading and updating the doc path
      //Here we are building the file saved path dynamically because for deleting we need full path
      if (userResult.picture !== undefined && userResult.picture !== null) {
        const fileSavedPath = `${process.env.UPLOAD_FILE_PATH_Passenger}/${
          req.params.id
        }/${path.basename(userResult.picture)}`;
        console.log("constructed savedPath : ", fileSavedPath);
        //Only deleting existing document when File and File path is valid and ready to be deleted
        if (
          userResult.picture !== null &&
          userResult.picture !== "" &&
          userResult.picture !== undefined &&
          userResult.picture.startsWith(
            process.env.UPLOAD_FILE_PATH_Passenger
          ) === true
        ) {
          deleteExistingDocFile(fileSavedPath);
        } else {
          console.log(
            "Unable to delete Existing Image due to inconsistencies in FilePath"
          );
        }
      }

      console.log(
        "Provider is uploading/updating profile image for 2nd time",
        userResult.picture
      );
    }
  } else {
    console.log("Updating profile without profile Image..");
  }

  //Finally updating the User and returning rsponse
  UserTable.update(req.body, { where: whereClause })
    .then(async (result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "User Profile Updated Successfully",
        updateStatus: result,
        updatedProfile: await UserTable.findOne({ where: whereClause }),
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `User Profile Updating Failed!!`,
        err: err,
      });
    });
};

var updateProviderProfileTable = async (
  providerResult,
  language,
  address,
  city,
  pincode
) => {
  console.log(
    `providerResult : ${providerResult}, providerId : ${providerResult.id}`
  );
  // //First checking this provider already exists or not before updating
  const providerProfileResult = await ProviderProfileTable.findOne({
    where: { provider_id: providerResult.id },
  });
  console.log("providerProfile : ", providerProfileResult);
  var updatedProviderProfile = [];
  if (providerProfileResult === null || providerProfileResult === undefined) {
    //We have to create new entry in this case
    var creatables = {
      provider_id: providerResult.id,
      language: language,
      address: address,
      city: city,
      postal_code: pincode,
      country: "IN",
    };
    updatedProviderProfile = await ProviderProfileTable.create(creatables);
    console.log(`updatedProviderProfile : ${updatedProviderProfile}`);
  } else {
    //We have to update existing entry in this case
    var updatables = {
      language:
        language === null || language === undefined
          ? providerProfileResult.language
          : language,
      address:
        address === null || address === undefined
          ? providerProfileResult.address
          : address,
      city:
        city === null || city === undefined ? providerProfileResult.city : city,
      postal_code:
        pincode === null || pincode === undefined
          ? providerProfileResult.postal_code
          : pincode,
      country: "IN",
    };
    updatedProviderProfile = await ProviderProfileTable.update(updatables, {
      where: { provider_id: providerResult.id },
    });
    console.log(`updatedProviderProfile : ${updatedProviderProfile}`);
  }

  return updatedProviderProfile;
};

const updateOrCreateProviderDevicesTable = async (body) => {
  console.log(body);
  console.log(`bodyData : ${body.toString()}`);

  //Only update if client passed device_token in the request body
  if (body.device_token === null || body.device_token === undefined) {
    console.log(`Request body is not having device_token paramater!!`);
    return;
  }

  const providerDevicesResult = await ProviderDevicesTable.findOne({
    where: { provider_id: body.provider_id },
  });
  console.log(`providerDevicesResult : ${providerDevicesResult}`);

  var updatables = {
    udid: uuidv4().toString(),
    token: body.device_token,
    sns_arn: "",
    type: "android",
  };

  let updatedResult;
  if (providerDevicesResult === null || providerDevicesResult === undefined) {
    updatables.provider_id = body.provider_id;
    updatedResult = await ProviderDevicesTable.create(updatables);
    console.log(`updatedResult : ${updatedResult}`);
  } else {
    updatedResult = await ProviderDevicesTable.update(updatables, {
      where: { provider_id: body.provider_id },
    });
    console.log(`updatedResult : ${updatedResult}`);
  }
};

const updateProviderProfileById = async (req, res, next) => {
  const { provider_id, firebase_user_id } = req.body;
  var id = "";
  var whereClause = [];

  //Accepting dynamic ID(provider_id or firebase_user_id) to Update ProviderProfile
  if (
    provider_id === "null" ||
    provider_id === "NULL" ||
    provider_id === undefined ||
    provider_id === null
  ) {
    id = firebase_user_id;
    whereClause = { firebase_user_id: firebase_user_id };
  } else if (
    firebase_user_id === "null" ||
    firebase_user_id === "NULL" ||
    firebase_user_id === undefined ||
    firebase_user_id === null
  ) {
    id = provider_id;
    whereClause = { id: provider_id };
  }

  //Provider body to populate creation of profile
  var providerBody = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userType: req.body.userType,
    payment_mode: req.body.payment_mode,
    email: req.body.email,
    gender: req.body.gender,
    mobile: req.body.mobile,
    status: req.body.status,
    fleet: req.body.fleet,
    password: req.body.password,
    avatar: req.body.avatar,
    device_token: req.body.device_token,
    device_id: req.body.device_id,
    device_type: req.body.device_type,
    login_by: req.body.login_by,
    social_unique_id: req.body.social_unique_id,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    stripe_acc_id: req.body.stripe_cust_id,
    availability_status: req.body.availability_status,
    location_timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    connection_status: req.body.connection_status,
    stripe_cust_id: req.body.stripe_cust_id,
    wallet_balance: req.body.wallet_balance,
    rating: req.body.rating,
    otp: req.body.otp,
    language: req.body.language,
    remember_token: req.body.remember_token,
    country_code: req.body.country_code,
  };

  var deviceTokenArray = {
    device_token:
      req.body.device_token === undefined ||
      (req.body.device_token === undefined) === null
        ? null
        : req.body.device_token,
    provider_id: provider_id,
  };

  //Before updating, checking this User/Provider exists in our DB or not

  var providerResult = [];
  providerResult = await ProviderTable.findOne({ where: whereClause });
  if (providerResult === null || providerResult === undefined) {
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: `Provider With ID(${id}) does not exist in our DB!!`,
    });
  }

  //Checking if request body is having Image file|Multipart data along with other fields
  //if yes then 1st ulloading the image and getting URL to put in next update/create operation

  var downloadPath = "";
  if (req.file !== null && req.file !== undefined) {
    downloadPath = `${process.env.DOWNLOAD_FILE_PATH}/${req.params.provider_id}/${req.file.filename}`;
    providerBody.avatar = downloadPath;
    req.body.avatar = downloadPath;
    console.log(req.file);
  }

  //2.Checking upload/update status
  if (req.file !== null && req.file !== undefined) {
    console.log("Updating profile with profile Image..");
    if (providerResult.avatar === "" || providerResult.avatar === null) {
      console.log("Updating profile image for 1st time");
    } else {
      //8.Now updation done, so deleting the old document file after successfully uploading and updating the doc path
      //Here we are building the file saved path dynamically because for deleting we need full path
      const fileSavedPath = `${process.env.UPLOAD_FILE_PATH}/${
        req.params.provider_id
      }/${path.basename(providerResult.avatar)}`;
      console.log("constructed savedPath : ", fileSavedPath);
      //Only deleting existing document when File and File path is valid and ready to be deleted
      if (
        providerResult.avatar !== null &&
        providerResult.avatar !== "" &&
        providerResult.avatar !== undefined &&
        providerResult.avatar.startsWith(process.env.UPLOAD_FILE_PATH) === true
      ) {
        deleteExistingDocFile(fileSavedPath);
      } else {
        console.log(
          "Unable to delete Existing Image due to inconsistencies in FilePath"
        );
      }

      console.log(
        "Provider is uploading/updating profile image for 2nd time",
        providerResult.avatar
      );
    }
  } else {
    console.log("Updating Provider Profile without profile Image..");
  }

  //Finally updating the profile with or without profile Image
  ProviderTable.update(req.body, { where: whereClause })
    .then(async (result) => {
      //Creating/Updating ProviderProfile Row For this Provider
      var updatedProfileTable = updateProviderProfileTable(
        providerResult,
        req.body.language,
        req.body.address,
        req.body.city,
        req.body.pincode
      );
      console.log(`updatedProfileTable : ${updatedProfileTable}`);

      //Creating/Updating ProviderDevices Row For this Provider
      var updatedDeviceTable =
        updateOrCreateProviderDevicesTable(deviceTokenArray);
      console.log(`updatedDeviceTable : ${updatedDeviceTable}`);

      //Returning Multi-Join Tables With ProviderTable + ProviderDevicesTable + ProviderProfileTable As OuterJoin

      const updatedProfileData = await ProviderTable.findOne({
        where: whereClause,
        include: [
          {
            model: ProviderProfileTable,
            as: "provider_profiles",
          },
          {
            model: ProviderDevicesTable,
            as: "provider_devices",
          },
        ],
      });

      console.log(`updatedProfileData : ${updatedProfileData}`);

      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Driver Profile Updated Successfully",
        updated_profile_data: updatedProfileData,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Driver Profile Updating Failed!!`,
        err: err,
      });
    });
};

const getUserProfileById = async (req, res, next) => {
  const id = req.params.id;

  UserTable.findOne({ where: { id: id } })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "User Profile Fetched Successfully",
        profile: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `User Profile Fetching Failed!!`,
        err: err,
      });
    });
};

const getProviderProfileById = async (req, res, next) => {
  const id = req.params.id;

  ProviderTable.findOne({ where: { id: id } })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Provider Profile Fetched Successfully",
        profile: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Provider Profile Fetching Failed!!`,
        err: err,
      });
    });
};

const getProviderProfileByMobileNumber = async (req, res, next) => {
  const id = req.params.mobile_number;

  try {
    //Returning Multi-Join Tables With ProviderTable + ProviderDevicesTable + ProviderProfileTable As OuterJoin
    var mobileNumber = id;
    // if (mobileNumber.startsWith("+91")) {
    //   mobileNumber.replace("+91", "");
    // }

    const updatedProfileData = await ProviderTable.findOne({
      where: { mobile: mobileNumber },
      include: [
        {
          model: ProviderProfileTable,
          as: "provider_profiles",
        },
        {
          model: ProviderDevicesTable,
          as: "provider_devices",
        },
        {
          model: ProviderServiceTable,
          as: "provider_services",
        },
      ],
    });
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Provider Profile By Mobile Number Fetched Successfully",
      userType: "DRIVER",
      profileData: updatedProfileData,
    });
  } catch (error) {
    console.log(
      "Error Occured While Fetching ProviderProfile By Mobile Number!!"
    );
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: `Provider Profile Fetching By Mobile Number Failed!!`,
      error: error,
    });
  }
};

const getPassengerProfileByMobileNumber = async (req, res, next) => {
  const id = req.params.mobile_number;

  var userProfile = [];
  try {
    userProfile = await UserTable.findOne({
      where: { mobile: `+91${id}` },
    });

    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "User Profile By Mobile Number Fetched Successfully",
      userType: "PASSENGER",
      profileData: userProfile,
    });
  } catch (error) {
    console.log("Error Occured While Fetching UserProfile By Mobile Number!!");
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: `User Profile Fetching By Mobile Number Failed!!`,
      error: error,
    });
  }
};

const generateOTPByPhoneNumber = async (req, res, next) => {};

const verifyPhoneNumberByOtp = async (req, res, next) => {};

const updateKycDetails = async (req, res, next) => {};

const updateVehicleDetails = async (req, res, next) => {};

const saveProviderDocumentFullPath = async ({
  docFullUrl,
  provider_id,
  document_id,
  unique_id,
  expires_at,
}) => {
  await ProviderDocumentsTable.create({
    url: docFullUrl,
    provider_id: provider_id,
    documment_id: document_id,
    status: "ASSESSING",
    unique_id: unique_id,
    expires_at: expires_at,
  })
    .then((result) => {
      console.log(
        "Provider Uploaded Document Path added successfully in Table..",
        result
      );
    })
    .catch((err) => {
      console.log(
        "Something went wrong while saving uploaded document path in ProviderDocumentTable!!!",
        err
      );
    });
};

const fetchProviderALLDocuments = async (req, res, next) => {
  const { provider_id } = req.params;

  //1.Checking if we have registered provider with given Id or not
  const providerResult = await ProviderTable.findOne({
    where: { id: provider_id },
  });

  if (providerResult === null || providerResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${provider_id})!!`,
    });
  }

  //2.Fetching ProviderDocumentsTable and DocumentsTable as JOIN Operation get documents and docType results
  const jR = await ProviderDocumentsTable.findAll({
    where: { provider_id: provider_id },
    include: {
      model: DocumentsTable,
      as: "document_details",
    },
  });

  //3.Handling if this provider is not having any documents yet
  if (jR === null || jR.length === 0 || jR === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `Provider(${provider_id}) is not having any documents yet!!`,
      totalDocuments: 0,
      providerAllDocuments: [],
    });
  }

  //4.Finally returning the response having all the information about documents
  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: `All Documets of Provider(${provider_id}) Fetched Successfully`,
    totalDocuments: jR.length,
    providerAllDocuments: jR,
  });
};

const updateProviderDeviceToken = async (req, res, next) => {
  const provider_id = req.params.provider_id;
  const device_token = req.body.device_token;

  console.log(`provider_id : ${provider_id}`);
  console.log(`device_token : ${device_token}`);

  const providerResults = await ProviderTable.findOne({
    where: { id: provider_id },
  });
  if (providerResults === null || providerResults === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${provider_id})!!`,
    });
  }

  const providerDevicesResults = await ProviderDevicesTable.findOne({
    where: { provider_id: provider_id },
  });
  if (providerDevicesResults === null || providerDevicesResults === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any Driver Devices Column in our DB With Given id(${provider_id})!!`,
    });
  }

  try {
    const updatedResult = await ProviderDevicesTable.update(
      { token: device_token },
      { where: { provider_id: provider_id } }
    );
    console.log(`Provider Device Token Updated Successfully`);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: `Provider Device Token Updated Successfully`,
      updatedData: await ProviderDevicesTable.findOne({
        where: { provider_id: provider_id },
      }),
    });
  } catch (error) {
    console.log(
      `Something Went Wrong While Updating Provider Device Token : ${error}`
    );
    return res.status(404).json({
      statusCode: 404,
      status: "update failed",
      message: `Something Went Wrong While Updating Provider Device Token : ${error}`,
    });
  }
};

const deleteExistingDocFile = (fullFilePath) => {
  fs.unlink(fullFilePath, function (err) {
    if (err) {
      console.log("Error occured while deleting the file!!", err);
      throw err;
    } else {
      console.log(`Successfully deleted the file ${fullFilePath}`);
    }
  });
};

const updateOrCreateProviderServices = async (req, res, next) => {
  const { provider_id } = req.params;
  const { service_number, service_model, service_type_id } = req.body;

  console.log("Inside updateOrCreateProviderServices");

  //1.Without servive_number|service_model|service_type_id we will not let provider upload any documents
  if (
    service_number === null ||
    service_number === undefined ||
    service_model === null ||
    service_model === undefined ||
    service_type_id === null ||
    service_type_id === undefined
  ) {
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      tt: req.body.document_id,
      message: `Valid service_number|service_model|service_type_id from client we must need to update|save ProviderService Data!!`,
    });
  }

  //2.Checking if we have registered provider with given Id or not
  const providerResult = await ProviderTable.findOne({
    where: { id: provider_id },
  });

  if (providerResult === null || providerResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${provider_id})!!`,
    });
  }

  //3.Checking our DB has requested service or not
  const serviceTypeResult = await ServiceTypesTable.findOne({
    where: { id: service_type_id },
  });

  if (serviceTypeResult === null || serviceTypeResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found given ServiceType(${service_type_id}) in our DB!!`,
    });
  }

  //4.Now checking ProviderServiceTable we have to update or create
  const providerServiceResult = await ProviderServiceTable.findOne({
    where: { provider_id: provider_id },
  });

  if (providerServiceResult === null || providerServiceResult === undefined) {
    console.log("Inside ProviderService Table is New..");
    //create new entry
    ProviderServiceTable.create({
      provider_id: provider_id,
      service_type_id: service_type_id,
      status: "offline",
      service_number: service_number,
      service_model: service_model,
    })
      .then(async (result) => {
        console.log("Inside ProviderService Table Create is Result..");
        return res.status(200).json({
          statusCode: 200,
          status: "success",
          message: `ProviderService Table Created Successfully`,
          data: await ProviderServiceTable.findOne({
            where: { provider_id: provider_id },
          }),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          statusCode: 500,
          status: "failed",
          message: `ProviderServiceTable Creation Failed!!`,
          error: err,
        });
      });
  } else {
    //update existing one
    console.log("Inside ProviderService Table is Updated..");
    await ProviderServiceTable.update(
      {
        service_type_id: service_type_id,
        service_number: service_number,
        service_model: service_model,
      },
      { where: { provider_id: provider_id } }
    )
      .then(async (result) => {
        console.log("Inside ProviderService Table is Updated Result..");
        return res.status(200).json({
          statusCode: 200,
          status: "success",
          message: `ProviderService Table Updated Successfully`,
          data: await ProviderServiceTable.findOne({
            where: { provider_id: provider_id },
          }),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          statusCode: 500,
          status: "failed",
          message: `ProviderServiceTable Updation Failed!!`,
          error: err,
        });
      });
  }
};

const uploadDocuments = async (req, res, next) => {
  const { unique_id, expires_at, document_id } = req.body;
  const { provider_id } = req.params;
  const downloadPath = `${process.env.DOWNLOAD_FILE_PATH}/${provider_id}/${req.file.filename}`;

  console.log(req.body);
  console.log(req.file);

  // if (req.file === null && req.file === undefined) {
  //   return res.status(500).json({
  //     statusCode: 500,
  //     status: "failed",
  //     message: `Document Upload Failed!!`,
  //   });
  // }
  // if (req.file !== null && req.file !== undefined) {
  //   const downloadPath = `${process.env.DOWNLOAD_FILE_PATH}/${provider_id}/${req.file.filename}`;
  // }

  //3.Without documentID|unique_id|expires_at we will not let provider upload any documents
  // if (
  //   document_id === null ||
  //   document_id === undefined ||
  //   unique_id === null ||
  //   unique_id === undefined ||
  //   expires_at === null ||
  //   expires_at === undefined
  // ) {
  //   //Valid document_id from client we must need to save image information
  //   return res.status(500).json({
  //     statusCode: 500,
  //     status: "failed",
  //     message: `Valid documentID|unique_id|expires_at from client we must need to save image information`,
  //   });
  // }

  //1.Deleting previously uploaded document while updating
  const providerDocumetsResult = await ProviderDocumentsTable.findOne({
    where: {
      [Op.and]: [{ provider_id: provider_id }, { document_id: document_id }],
    },
  });

  //2.Checking upload/update status
  if (
    providerDocumetsResult === null ||
    providerDocumetsResult === undefined ||
    providerDocumetsResult.length === 0
  ) {
    console.log("User is uploading this document for 1st time");
  } else {
    console.log(
      "Provider is uploading/updating this document for 2nd time",
      providerDocumetsResult
    );
  }

  //4.Checking if we have registered provider with given Id or not
  const providerResult = await ProviderTable.findOne({
    where: { id: provider_id },
  });

  //Checking if provided document_id exists in our DB or not
  const documentResult = await DocumentsTable.findOne({
    where: { id: document_id },
  });

  if (documentResult === null || documentResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${provider_id})!!`,
    });
  }

  if (providerResult === null || providerResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${provider_id})!!`,
    });
  }

  //5.Now if that documentID is not present then we will create it otherwise we will simply update the path
  if (
    providerDocumetsResult === null ||
    providerDocumetsResult === undefined ||
    providerDocumetsResult.length === 0
  ) {
    //6.Save path for 1st time
    await ProviderDocumentsTable.create({
      url: downloadPath,
      provider_id: provider_id,
      document_id: document_id,
      status: "ASSESSING",
      unique_id: unique_id === null ? "" : unique_id,
      expires_at: expires_at === null ? "" : expires_at,
    })
      .then((result) => {
        console.log(
          "Provider Uploaded Document Path added successfully in Table..",
          result
        );
      })
      .catch((err) => {
        console.log(
          "Something went wrong while saving uploaded document path in ProviderDocumentTable!!!",
          err
        );
      });
  } else {
    //7.Simply update path when 2nd time uploading the doc
    await ProviderDocumentsTable.update(
      {
        url: downloadPath,
        unique_id: unique_id === null ? "" : unique_id,
        expires_at: expires_at === null ? "" : expires_at,
      },
      { where: { id: providerDocumetsResult.id } }
    )
      .then((result) => {
        console.log(
          "Provider Uploaded Document Path updated successfully in Table..",
          result
        );
        //8.Now updation done, so deleting the old document file after successfully uploading and updating the doc path
        //Here we are building the file saved path dynamically because for deleting we need full path
        const fileSavedPath = `${process.env.UPLOAD_FILE_PATH}/${
          req.params.provider_id
        }/${path.basename(providerDocumetsResult.url)}`;
        console.log("constructed savedPath : ", fileSavedPath);

        //Only deleting existing document when File and File path is valid and ready to be deleted
        if (
          providerDocumetsResult.url !== null &&
          providerDocumetsResult.url !== "" &&
          providerDocumetsResult.url !== undefined &&
          providerDocumetsResult.url.startsWith(
            process.env.UPLOAD_FILE_PATH
          ) === true
        ) {
          const providerDocDirectory = `${process.env.UPLOAD_FILE_PATH}/${req.params.provider_id}`;
          console.log(`providerDocDirectory : ${providerDocDirectory}`);

          //Only attempting to delete the File if providerFolder is not empty
          fs.readdir(providerDocDirectory, (err, files) => {
            console.log(`Files Length : ${files.length}`);
            if (files.length !== 0) {
              deleteExistingDocFile(fileSavedPath);
            } else {
              console.log(
                "Unable to delete Existing Image due to inconsistencies in FilePath"
              );
            }
          });

          // deleteExistingDocFile(fileSavedPath);
        } else {
          console.log(
            "Unable to delete Existing Image due to inconsistencies in FilePath"
          );
        }
      })
      .catch((err) => {
        console.log(
          "Something went wrong while updating uploaded document path in ProviderDocumentTable!!!",
          err
        );
      });
  }

  //10.Finally returning the response
  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "File Uploded Successfully",
    unique_id: unique_id,
    expires_at: expires_at,
    documentFullPath: downloadPath,
    documentKey: req.file.filename,
    documentTypeData: await DocumentsTable.findOne({
      where: { id: document_id },
    }),
    output: req.file,
  });
};

const fetchDocumentsByKey = async (req, res, next) => {
  const { provider_id, document_id } = req.params;

  //1.Checking this Provider in our DB exists or not
  const providerResult = await ProviderTable.findOne({
    where: { id: provider_id },
  });

  if (providerResult === null || providerResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${provider_id})!!`,
    });
  }

  //2.Checking this document_id exists in our DB or not
  const documentResult = await DocumentsTable.findOne({
    where: { id: document_id },
  });

  if (documentResult === null || documentResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any Document Column in our DB With Given id(${document_id})!!`,
    });
  }

  //3.Fetching Documents by performing Join Operation
  const jR = await ProviderDocumentsTable.findOne({
    where: {
      [Op.and]: [{ provider_id: provider_id }, { document_id: document_id }],
    },
    include: {
      model: DocumentsTable,
      as: "document_details",
    },
  });

  //4.Handling if this provider is not having any documents yet
  if (jR === null || jR.length === 0 || jR === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `Provider(${provider_id}) is not having any documents yet with given Document ID(${document_id})!!`,
    });
  }

  //5.Finally returning the appropriate response
  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: `Document(${document_id}) Fetched Successfully..`,
    documentURL: jR.url,
    documentInfo: jR,
  });
};

const createProviderDocSubFolder = async (req, res, next) => {
  const provider_id = req.params.provider_id;
  const path = `${process.env.UPLOAD_FILE_PATH}/${provider_id}`;

  fs.access(path, (error) => {
    // To check if the given directory
    // already exists or not
    if (error) {
      // If current directory does not exist
      // then create it
      fs.mkdir(path, (error) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: "Folder Creation Failed!!",
          });
        } else {
          console.log("directory path : ", path);
          console.log("New Directory created successfully !!");
          return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Provider Document Folder Creation Successful..",
            path: path,
          });
        }
      });
    } else {
      console.log("Given Directory already exists !!");
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: "Given Directory already exists !!",
      });
    }
  });
};

const hitRadisCache = async (req, res, next) => {
  const { id, name, email, address } = req.body;

  var info = { id: id, name: name, email: email, add: address, frequency: 0 };

  var cacheStatus = "";
  if (!myCache.has("name1")) {
    cacheStatus = myCache.set("name1", info);
  } else {
    var cValue = myCache.get("name1");
    var i = cValue.frequency;

    info.frequency = i + 1;
    myCache.set("name1", info);
  }
  console.log("cacheStatus : ", cacheStatus);

  var cacheValue = myCache.get("name1");
  console.log("cacheValue ", cacheValue);

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "Radis Operation API Called Successfully..",
    name: name,
    email: email,
    address: address,
    fromCache: myCache.get("name1"),
  });
};

const getNearBySearchSuggestion = async (req, res, next) => {
  const { query, location } = req.query;
  var fromCache = false;
  const threesoldToCachePlaceData = 3;

  //Axios instance building
  var cachedToken = myCache.get("mmiAuthTokenKey");
  const _axios = axios.create({
    baseURL: "https://atlas.mapmyindia.com/api/",
    headers: { Authorization: `Bearer ${cachedToken}` },
  });

  //Query and Location params is required
  if (
    query === null ||
    query === undefined ||
    location === null ||
    location === undefined
  ) {
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: `To Fetch Search Suggestions query(${query}) and location(${location}) is required!!`,
    });
  }

  //Logic for Hitting and Missing the Caching data using Node-Cache
  //Making fresh API call only after missing the cache for this ${query}
  if (myCache.has(`mmi${query}`)) {
    var cache = myCache.get(`mmi${query}`);
    if (cache.frequency >= threesoldToCachePlaceData + 1) {
      fromCache = true;
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Autosuggestion From Query Fetched Successfully..`,
        query: req.query.query,
        fromCache: fromCache,
        data: myCache.get(`mmi${query}`).data,
        data2: cache,
      });
    }
  }

  //Making the MapMyIndia API call using Axios
  _axios
    .get(`places/search/json?query=${query}&filter=pin:560068`)
    .then(function (response) {
      // handle success
      console.log(response.data);
      fromCache = false;

      //Performing caching mechenism to save our server bandwidth using node-cache
      var cacheData = { searchQuery: query, frequency: 1, data: [] };

      var cacheStatus = "";
      if (!myCache.has(`mmi${query}`)) {
        cacheStatus = myCache.set(`mmi${query}`, cacheData);
      } else {
        var cValue = myCache.get(`mmi${query}`);
        var i = cValue.frequency;

        cacheData.frequency = i + 1;
        //If thressold value of query count exceed then we are caching the results in memory
        if (i >= threesoldToCachePlaceData) {
          console.log("condition to add cache MMI data matched..", i);
          cacheData.data = response.data;
        }
        myCache.set(`mmi${query}`, cacheData);
      }
      console.log("cacheStatus : ", cacheStatus);

      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Autosuggestion From Query Fetched Successfully..`,
        query: req.query.query,
        fromCache: fromCache,
        cache: myCache.get(`mmi${query}`),
        length: response.data.suggestedLocations.length,
        allCachedKeys: myCache.keys(),
        cacheStats: myCache.getStats(),
        data: response.data,
      });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Autosuggestion From Query Failed!!!`,
        error: error,
      });
    })
    .then(function () {
      // always executed
    });
};

module.exports = {
  updateUserOrProviderProfileById,
  getUserProfileById,
  updatePassengerProfileById,
  updateProviderProfileById,
  getProviderProfileById,
  getProviderProfileByMobileNumber,
  getPassengerProfileByMobileNumber,
  generateOTPByPhoneNumber,
  verifyPhoneNumberByOtp,
  updateKycDetails,
  updateVehicleDetails,
  uploadDocuments,
  fetchDocumentsByKey,
  fetchProviderALLDocuments,
  createProviderDocSubFolder,
  updateOrCreateProviderServices,
  getNearBySearchSuggestion,
  hitRadisCache,
  mmiAuthTokenGeneration,
  mmiAuthTokenAutoScheduling,
  mmiAuthTokenAutoCaching,
  updateProviderDeviceToken,
};
