const bcrypt = require("bcrypt")
var { models } = require("../../Config/dbIndex.js");
const fs = require("fs");
const User = models.Users;
const Provider = models.Providers;
const ProviderProfile = models.ProviderProfiles;
var admin = require("firebase-admin");
const axios = require('axios');
const { driverApp } = require("../../index.js");
const ProjectStaticUtils = require("../../Utils/ProjectStaticUtils.js");
const notificationServices = require("../../Services/common/notification.js");
const userRequests = require("../../Models/userRequests.js");

const registerUser = async (req, res) => {
    var response;
    userType = req.params.userType;
    console.log(userType);
    firebseUserId = req.body.uid;
    phoneNumber = req.body.phoneNumber;
    console.log(firebseUserId);
    if (userType == "PASSENGER") {
        const isUser = await User.findAll({ where: { mobile: phoneNumber } });
        if (isUser.length > 0) {
            return res.status(500).json({
                statusCode: 500,
                status: "Error",
                message: `User alredy registered with this phone number`,
            });
        } else {
            response = await User.create({ mobile: phoneNumber, firebase_user_id: firebseUserId });
            var userId = response.id;
            const path = `${process.env.UPLOAD_FILE_PATH_Passenger}/${userId}`;

            //create a new folder for storing image on each user

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
            return res.status(200).json({
                statusCode: 200,
                status: "success",
                message: `User created Successfully`,
                data: response,
            });
        }

    } else if (userType == "DRIVER") {
        var response = {};
        const isDriver = await Provider.findAll({ where: { mobile: phoneNumber } });
        console.log(isDriver.length);
        if (isDriver.length > 0) {
            return res.status(500).json({
                statusCode: 500,
                status: "Error",
                message: `Provider already registered`,
            });
        } else {
            const newDriver = await Provider.create({ firebase_user_id: firebseUserId, mobile: phoneNumber });
            console.log("New Provider")
            console.log(newDriver);

            const providerId = newDriver.id;
            const path = `${process.env.UPLOAD_FILE_PATH}/${providerId}`;

            //create new folder for each driver to store image

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
            // const providername = newDriver.first_name;
            // if (Object.keys(newDriver).length != 0) {
            //     var newEscrowUser = await openEscrow(providerId, providername);

            //     if (Object.keys(newEscrowUser).length != 0) {
            //         if (newEscrowUser.Escrow_Id !== undefined) {
            //             var escrow_info = {
            //                 escrow_id: newEscrowUser.Escrow_Id
            //             }

            //             // const ProviderInfo = await Provider.update(escrow_info, { returning: true, where: { id: providerId } });
            //             //update Provide table with created escrow_id
            //         }
            //         response.PROVIDER = await Provider.findOne({ where: { id: providerId } });
            //         response.ESCROW_RESPONSE = newEscrowUser;
            //         return res.status(200).json({
            //             statusCode: 200,
            //             status: "Success",
            //             data: response,
            //         });
            //     }
            // }
        }
    }
}

const updateUserRegistration = async (req, res) => {
    var userResponse;
    const { uid, userType } = req.body;
    console.log("UID");
    console.log(uid);

    if (userType == "PASSENGER") {
        var user = await User.findOne({ where: { firebase_user_id: uid } });
        console.log(user);
        const userId = user.id;
        const path = `${process.env.UPLOAD_FILE_PATH_Passenger}/${userId}`;
        // const path = `${process.env.UPLOAD_FILE_PATH_PassengerLocal}/${userId}`;
        var userInfo = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            device_id: req.body.device_id
        };
        const result = await User.update(userInfo, { returning: true, where: { firebase_user_id: uid } });
        console.log(result);
        if (result[1] == 1) {
            userResponse = await User.findOne({ where: { firebase_user_id: uid } });
        }
        console.log("Response ");
        // console.log(result);
        // console.log(result.data);
        // userResponse = res;
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
        console.log("User response");
        console.log(userResponse)
        return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: `Registration Successful`,
            data: await User.findOne({ where: { firebase_user_id: uid } }),
        });

    }
    if (userType == "DRIVER") {
        var provider = await Provider.findOne({ where: { firebase_user_id: uid } });
        console.log("Provider Details");
        console.log(provider);
        var providerId = provider.id;
        const path = `${process.env.UPLOAD_FILE_PATH}/${providerId}`;
        // const path = `${process.env.DOWNLOAD_FILE_PATHLocal}/${providerId}`;
        var providerInfo = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
        };
        var providerprofileinfo = {
            provider_id: provider.id,
            address: req.body.address,
            city: req.body.city,
            postal_code: req.body.postal_code,
        }
        const providerProfile = await ProviderProfile.create(providerprofileinfo);
        const result = await Provider.update(providerInfo, { where: { firebase_user_id: uid } })
        // userResponse = result;
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
        return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: `Registration Successful`,
            data: await Provider.findOne({ where: { firebase_user_id: uid } }),
        });
    }
};

//test api for testing open escrow account api
const testVouchEscrow = async (req, res) => {
    const providerId = 10002;
    const providername = "testname";
    const newEscrowUser = await openEscrow(providerId, providername);
    console.log("Escrow Response");
    console.log(newEscrowUser);
    return res.status(200).json({
        statusCode: 200,
        status: "Success",
        data: newEscrowUser
    });
}

//creating new escrow account when a new driver is registered
//this function is called from registerUser api
const openEscrow = async (providerId, providerName) => {
    const vouchResponse = {};
    const escrwoId = "RYDOPROVIDER" + providerId;
    const escrowName = providerName;
    var vouchObj = {
        provider_id: providerId,
        escrow_if: escrwoId,
        user_ref: escrwoId,
        vouch_status: "NEW"
    }
    console.log("ESCROW ID: " + escrwoId)
    checkEscowIdExist = await ProjectStaticUtils.fetchDriverEscrowBalance(escrwoId);
    console.log("Escow Account Status")
    // console.log(checkEscowIdExist);
    console.log("Message");
    // console.log(checkEscowIdExist.response.data.data.message);
    // console.log(checkEscowIdExist.data.balance);
    if (checkEscowIdExist.data !== undefined) {
        console.log(checkEscowIdExist.data.balance);
        console.log("Account already Exist");
        vouchResponse.message = "Escrow account exists already";

    } else if (checkEscowIdExist.response !== undefined) {
        console.log("No account exist")
        const payload = {
            escrow_id: escrwoId,
            escrow_name: escrowName,
            terms_and_conditions: "Collect fees from drivers",
            key_deliverables: "Release of funds at end of day",
        }
        var result = ProjectStaticUtils.generateSignatureFromPayload(payload);

        payload.timestamp = result.get("timestamp");
        payload.signature = result.get("signature");

        //create ESCROW account for new provider
        const VOUCHURL = "https://sim.iamvouched.com/v1";
        const uri = "/escrow/create_escrow";
        const URL = VOUCHURL + uri;
        const headers = {
            // 'Content-Type': 'application/json',
            'apikey': process.env.VOUCH_SAMPLE_API_KEY
        }
        try {
            var escrowResult = await axios.post(
                URL,
                payload,
                {
                    headers: headers
                });
            console.log("Escrow Response");
            console.log(escrowResult.data);
            if (escrowResult.data.status == 200) {
                vouchResponse.status = escrowResult.data.status;
                vouchResponse.message = escrowResult.data.message;
                vouchResponse.Escrow_Id = escrwoId;
                //Create new row in provider_vouch table after cretaing new escrow account for every new provder registered
                try {
                    const provider_vouch = await ProviderVouch.create(vouchObj);
                } catch (error) {

                }

            } else if (escrowResult.data.status == 401) {
                vouchResponse.status = escrowResult.data.status;
                // vouchResponse.data = escrowResult.data.data;
                vouchResponse.message = escrowResult.data.message;
            }
        } catch (error) {
            console.log("Catch");
            console.log(error);
            vouchResponse.message = error.message;
        }
    }
    return vouchResponse;
}


//Check escrow balance and notify driver after passenger completes payment
const checkEscrowBalance = async (req, res) => {
    const providerId = req.params.providerId;
    const requestId = req.params.requestId;
    const ProviderVouch = await ProviderVouch.findAll({ where: { provider_id: providerId } })
    const provider = await Provider.findAll({ where: { id: providerId } });
    const UserRequest = await userRequests.findOne({ where: { id: requestId } });
    var userId = UserRequest.user_id;
    if (provider) {
        var escrow_id = ProviderVouch.escrow_Id;
        var regToken = provider.device_id;
        var title = "Account Balance";
        var payload = {
            escrow_id: escrow_id
        };
        var notification_reason = "ride_completed_by_provider";
        var type = "ride";
        var stickey = true;
    }

    checkBalance = await ProjectStaticUtils.fetchDriverEscrowBalance(escrow_id);
    var body = "Current Balance: " + checkBalance.data.balance;

    var notification = await notificationServices.notifyDriver(regToken, title, body, payload, notification_reason, type, stickey, userId, providerId, requestId);

    return res.status(200).json({
        statusCode: 200,
        status: "Escrow Balance",
        data: checkBalance
    });
}

//test api creating a new user in firebase,
const registerFirebaseUser = async (req, res) => {
    const {
        email,
        phoneNumber,
        password,
        firstName,
        lastName,
        photoUrl
    } = req.body;
    await admin.auth(driverApp).createUser({
        email,
        phoneNumber,
        password,
        displayName: `${firstName} ${lastName}`,
        photoURL: photoUrl,
    }).then((user) => {
        console.log(user);
    })

}
//Not used
const forgotPassword = async (req, res) => {

}
//Not used
const resetPassword = async (req, res) => {
    var password = req.body.password;
    var userId = req.params.userId;
    // if(password && userId!=undefined){
    var user = await Users.findOne({ id: userId });
    if (user) {
        // var newPassword= bcrypt.hash(password);
        const newPassword = await bcrypt.hash(password, 10);
        console.log(newPassword);
        const updatedUser = await Users.update({ password: password }, { where: { id: userId } })
    }
    // }
}
module.exports = { resetPassword, updateUserRegistration, forgotPassword, registerUser, registerFirebaseUser, openEscrow, testVouchEscrow, checkEscrowBalance }