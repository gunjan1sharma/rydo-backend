var { db, models } = require("../../Config/dbIndex.js");
const userRequestRatings = require("../../Models/userRequestRatings.js");
const generalController = require("../Driver/generalController.js");
const { Op } = require("sequelize");
const moment = require("moment");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const AdminTable = models.Admins;
const DriverTable = models.Providers;
const UserTable = models.Users;
const DriverDistanceTable = models.Admins;
const PoiConstantsTable = models.Admins;
const UserRequestTable = models.UserRequests;
const ProviderServiceTable = models.ProviderServices;
const UserRequestPaymentsTable = models.UserRequestPayments;
const SettingsTable = models.Settings;
const UserRequestRatingsTable = models.UserRequestRatings;
const ServiceTypeTable = models.ServiceTypes;
const ProviderVouch = models.ProviderVouch;
const VouchDueAmount = models.VouchDueAmounts;
require("dotenv").config();
const ProjectStaticUtils = require("../../Utils/ProjectStaticUtils.js");
// const providerVouch = require("../../Models/providerVouch.js");

const _axios = axios.create({
  baseURL: "https://sim.iamvouched.com",
  headers: { apikey: process.env.VOUCH_SAMPLE_API_KEY },
});

const checkDriverEscrowBalance = async (req, res, next) => {
  const URL = `/v1/escrow/fetch_escrow_account_balance`;
  var data = { escrow_id: "Rydo-Esc-101" };

  try {
    const balanceResponse = await _axios.post(URL, data);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Vouch Account Balance Successfully..",
      balanceData: balanceResponse.data,
      staticBalance: await ProjectStaticUtils.fetchDriverEscrowBalance(
        data.escrow_id
      ),
    });
  } catch (error) {
    console.log(`Error Occured While Checking Account Balance : ${error}`);
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Something Went Wrong While Fetching Vouch Account Balance!!!",
      error: error,
    });
  }
};

const fetchDriverEscrowBalance = async (escrow_id) => {
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

const generateFixedAmountPayableLink = async (req, res, next) => {
  const URL = `/v1/escrow/generate_collect_link`;
  var data = { escrow_id: "rydo-test-01" };

  try {
    const collectResponse = await _axios.post(URL, data);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Vouch Account Balance Successfully..",
      balanceData: balanceResponse.data,
    });
  } catch (error) {
    console.log(`Error Occured While Checking Account Balance : ${error}`);
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Something Went Wrong While Fetching Vouch Account Balance!!!",
      error: error,
    });
  }
};

const checkCollectLinkStatus = async (req, res, next) => {
  const URL = `/v1/escrow/generate_collect_link`;
  var data = { escrow_id: "rydo-test-01" };

  try {
    const collectStatusResponse = await _axios.post(URL, data);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Vouch Account Balance Successfully..",
      balanceData: balanceResponse.data,
    });
  } catch (error) {
    console.log(`Error Occured While Checking Account Balance : ${error}`);
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Something Went Wrong While Fetching Vouch Account Balance!!!",
      error: error,
    });
  }
};

const escrowToEscrowTransfer = async (req, res, next) => {
  const URL = `/v1/escrow/transfer_to_different_escrow`;
  //amount, source_escrow, target_escrow
  var data = {
    source_escrow_id: "Rydo-Esc-101",
    source_user_ref: "Rydo-Esc-101",
    target_escrow_id: "Rydo-Esc-Rydo",
    target_user_ref: "Rydo-Esc-Rydo",
    user_authorization_received: true,
    amount: 1.0,
    key_values: {
      reason: "charging driver subscription+convience fees daily",
    },
  };

  var signedPayload = ProjectStaticUtils.generateSignatureFromPayload(data);
  data.timestamp = signedPayload.get("timestamp");
  data.signature = signedPayload.get("signature");
  console.log(`data : ${JSON.stringify(data)}`);

  try {
    const transferResponse = await _axios.post(URL, data);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Vouch Account Balance Transfer Successfull..",

      source_escrow: data.source_escrow_id,
      target_escrow: data.target_escrow_id,
      source_remaning_balance: await fetchDriverEscrowBalance(
        data.source_escrow_id
      ),
      target_latest_balance: await fetchDriverEscrowBalance(
        data.target_escrow_id
      ),
      balanceData: transferResponse.data,
    });
  } catch (error) {
    console.log(`Error Occured While Transfering Account Balance : ${error}`);
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message:
        "Something Went Wrong While Transfering Vouch Account Balance!!!",
      error: error,
    });
  }
};

var initEscrowTransfer = async (source_escrow_id, amount) => {
  console.log("Escrow to Escrow entry");
  const URL = `/v1/escrow/transfer_to_different_escrow`;
  var data = {
    source_escrow_id: source_escrow_id,
    source_user_ref: source_escrow_id,
    target_escrow_id: "Rydo-Esc-Rydo",
    target_user_ref: "Rydo-Esc-Rydo",
    user_authorization_received: true,
    amount: amount,
    key_values: {
      reason: "charging driver subscription+convience fees daily",
    },
  };

  var signedPayload = ProjectStaticUtils.generateSignatureFromPayload(data);
  data.timestamp = signedPayload.get("timestamp");
  data.signature = signedPayload.get("signature");
  console.log(`data : ${JSON.stringify(data)}`);

  try {
    const transferResponse = await _axios.post(URL, data);
    var resArray = {
      statusCode: 200,
      status: "success",
      message: "Vouch Account Balance Transfer Successfull..",
      source_escrow: data.source_escrow_id,
      target_escrow: data.target_escrow_id,
      source_remaning_balance: await fetchDriverEscrowBalance(
        data.source_escrow_id
      ),
      target_latest_balance: await fetchDriverEscrowBalance(
        data.target_escrow_id
      ),
      balanceData: transferResponse.data,
    };

    return resArray;
  } catch (error) {
    console.log(`Error Occured While Transfering Account Balance : ${error}`);
    var errRes = {
      statusCode: 500,
      status: "failed",
      message:
        "Something Went Wrong While Transfering Vouch Account Balance!!!",
      error: error,
    };
    return errRes;
  }
};

const initNotEnoughAmountAction = async (currentProvider, amount) => {
 
  console.log("Send payment link entry");
  const URL = `/v1/escrow/get_collect_link_status`;

  var data = {
    escrow_id: currentProvider,
    redirect_url: "https://www.iamvouched.com/",
    collects: [
      {
        collect_ref: "",
        collect_modes: ["UPI", "VIRTUAL_ACCOUNT", "NET_BANKING"],
        amount: amount,
        transaction_note: "",
        payer: {
          user_ref: currentProvider,
          company_name: "",
          user_name: "",
          user_mobile_number: "9449741722"
        },
        virtual_account_no: "",
        ifsc: "ICIC0000104"
      }
    ],
  };

  var signedPayload = ProjectStaticUtils.generateSignatureFromPayload(data);
  data.timestamp = signedPayload.get("timestamp");
  data.signature = signedPayload.get("signature");
  console.log(`data : ${JSON.stringify(data)}`);

  try {
    const LinkStatus = await _axios.post(URL, data);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "",
    });
  } catch (error) {

    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message:
        "Something Went Wrong ",
      error: error,
    });
  }
};

const paymentSuccessCallback = async (req, res, next) => { };

var getProviderCompletedRidesOfToday = async (provider_id) => {
  var d_start =
    moment().subtract(1, "days").format("YYYY-MM-DD") + " 23:59:59 GMT";
  var d_closing =
    moment().add(1, "days").format("YYYY-MM-DD") + " 00:00:00 GMT";

  var userRequestResult = await UserRequestTable.findAll({
    where: {
      [Op.and]: [{ provider_id: provider_id }, { status: "COMPLETED" }],
      started_at: {
        [Op.between]: [d_start, d_closing],
      },
    },
    include: {
      model: DriverTable,
      as: "provider",
    },
  });

  var resultArray = {
    d_start: d_start,
    d_closing: d_closing,
    ride_count: userRequestResult.length,
    ride_data: userRequestResult,
  };

  return resultArray;
};

var getFeeAmountFromServiceTypeId = async (service_type_id) => {
  const serviceTypeResult = await ServiceTypeTable.findOne({
    where: { id: 5 },
  });

  var resultArray = {
    user_convenience_fee: serviceTypeResult.user_convenience_fee,
    provider_subscription_fee: serviceTypeResult.provider_subscription_fee,
  };
  return resultArray;
};

const deductScheduledPaymentFromDriversToRydoEscrow = async (
  req,
  res,
  next
) => {
  var successPromises = {};
  var errorPromises = {};

  //Fetching all the active driver in our DB
  try {
    var activeDrivers = await DriverTable.findAll({
      where: { status: "onboarding" },
    });
    console.log(`activeDrivers : ${activeDrivers}`);
    successPromises.activeDrivers = activeDrivers;
  } catch (error) {
    errorPromises.activeDriversErr = error;
    console.log(`activeDrivers errors : ${error}`);
    // continue;
  }


  //For each driver calclulate total completed ride and then multiply with Per Ride fee
  //Convienece Fee is not static like DAILY_SUBSCRIPTION_FEE

  //Iterating all driver one by one to perform operations
  var calculated_fees = {};

  for (let i = 0; i < activeDrivers.length; i++) {
    const element = activeDrivers[i];
    // var provider_vouch = element.id;
    var providerId = element.id;
    var providerName = element.first_name;

    //check escrow account exists in vouch or not
    const checkescrow = await checkEscrow(providerId);
    console.log("Check Escrow");
    console.log(checkescrow);
    if (checkescrow.status == 0) {
      await openEscrow(providerId, providerName);
    } else if (checkescrow.status == 1) {
      const checkProviderVouch = await ProviderVouch.findAll({ where: { provider_id: providerId } });
      if (checkProviderVouch.length == 0) {
        //create a row in provider_vouch table in case it has not created before

        try {
          var vouchObj = {
            provider_id: providerId,
            escrow_id: checkescrow.escrwoId,
            user_ref: checkescrow.escrwoId,
            vouch_status: "NEW",
          }
          const newProviderVouch = await ProviderVouch.create(vouchObj);
          console.log(newProviderVouch);
        } catch (error) {
          console.log(error);

        }

      }
    }

    const vouchStatus = await ProviderVouch.findOne({ where: { provider_id: providerId } });
    if (vouchStatus.vouch_status !== "DUES_NOT_PAID") {
      //Fetching Today's all completed rides of this driver, if any
      var rides = await getProviderCompletedRidesOfToday(
        activeDrivers[i].id
      );
      console.log(`rides : ${rides}`);
      //override?
      successPromises.rides = rides;

      //Fetching the CONVIENCE_FEE_TOTAL and SUBSCRIPTION_FEE_DAILY by this ServiceTypeId For particluar Ride
      try {
        var fees = await getFeeAmountFromServiceTypeId(
          rides.ride_data.service_type_id
        );
        console.log(`fees : ${fees}`);
        successPromises.fees = fees;
      } catch (error) {
        errorPromises.feesErr = error;
        console.error(`fees error : ${error}`);
        continue;
      }

      //Procedding with the Amount deduction if this driver completed atleast one Ride on Given day
      var SUBSCRIPTION_FEE_DAILY = parseFloat(fees.provider_subscription_fee);
      console.log(typeof (SUBSCRIPTION_FEE_DAILY));
      var CONVIENCE_FEE_TOTAL = 0.0;
      var TOTAL_AMOUNT_DEDUCTABLE = 0.0;
      if (rides.ride_count !== 0) {
        CONVIENCE_FEE_TOTAL = rides.ride_count * fees.user_convenience_fee;
        console.log("CONVIENCE_FEE_TOTAL: ")
        console.log(CONVIENCE_FEE_TOTAL);


        TOTAL_AMOUNT_DEDUCTABLE =
          CONVIENCE_FEE_TOTAL + SUBSCRIPTION_FEE_DAILY;

        console.log("TOTAL_AMOUNT_DEDUCTABLE");
        console.log(TOTAL_AMOUNT_DEDUCTABLE);

        calculated_fees.CONVIENCE_FEE_TOTAL = CONVIENCE_FEE_TOTAL;
        calculated_fees.SUBSCRIPTION_FEE_DAILY = SUBSCRIPTION_FEE_DAILY;
        calculated_fees.TOTAL_AMOUNT_DEDUCTABLE = TOTAL_AMOUNT_DEDUCTABLE;

        console.log(`CONVIENCE_FEE_TOTAL : ${CONVIENCE_FEE_TOTAL}`);
        console.log(`SUBSCRIPTION_FEE_DAILY : ${SUBSCRIPTION_FEE_DAILY}`);
        console.log(`TOTAL_AMOUNT_DEDUCTABLE : ${TOTAL_AMOUNT_DEDUCTABLE}`);
        console.log(`calculated_fees : ${calculated_fees}`);
        successPromises.calculated_fees = calculated_fees;

      } else {
        TOTAL_AMOUNT_DEDUCTABLE = SUBSCRIPTION_FEE_DAILY;

        console.log(
          `Provider(${activeDrivers[i].id}) Have not Completed Any Rides Today[${rides.d_start}] Between ${rides.d_closing}`
        );
      }

      //create a new row in vouch_due_amounts table
      const vouchDueObj = {
        provider_id: providerId,
        convenience_fee: CONVIENCE_FEE_TOTAL,
        subscription_fee: SUBSCRIPTION_FEE_DAILY,
        due_for_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
      }
      console.log("Vouch Dues object");
      console.log(vouchDueObj);
      const vouchDues = await VouchDueAmount.create(vouchDueObj);

      //calculate new total value
      const vocuhProvider = await ProviderVouch.findOne({ where: { provider_id: providerId } });
      const oldDue = vocuhProvider.total_amt_due;
      console.log("Old Due");
      console.log(oldDue);


      const newTotal = parseFloat(oldDue) + TOTAL_AMOUNT_DEDUCTABLE;
      console.log("new Due");
      console.log(TOTAL_AMOUNT_DEDUCTABLE);

      console.log("Updated total")
      console.log(newTotal);

      //update the total amount in provider_vouch table
      const total = {
        total_amt_due: newTotal
      }
      await ProviderVouch.update(total, { where: { provider_id: providerId } },);

      //Now fetching this driver escrow balance to see if required balance is available or not
      var currentProvidervouch = await ProviderVouch.findOne({ where: { provider_id: providerId } });
      var currentDriverEscrowId = currentProvidervouch.escrow_id;

      try {
        var balance = await fetchDriverEscrowBalance(currentDriverEscrowId);
        successPromises.balance = balance;
        console.log(`balance : ${balance}`);
      } catch (error) {
        errorPromises.balanceErr = error;
        console.error(`balance error : ${error}`);
        continue;
      }

      //Driver escrow balance should be >= our getting charged fee
      //If driver is having required balance then we are transfering the amount to Rydo Escrow[Rydo-Esc-Rydo]
      if (balance.data.balance >= calculated_fees.TOTAL_AMOUNT_DEDUCTABLE) {
        console.log("Balance is sufficient");
        try {
          var transferResult = await initEscrowTransfer(
            currentDriverEscrowId,
            calculated_fees.TOTAL_AMOUNT_DEDUCTABLE
          );
          successPromises.transferResult = transferResult;
          console.log(`transferResult : ${transferResult}`);
        } catch (error) {
          errorPromises.transferResultErr = transferResult;
          console.error(`transferResult error : ${transferResult}`);
          continue;
        }

        //Verifying that escrow has recieved the amount
        // if (transferResult.balanceData.status === 200) {
        //   //Notifying the driver about successful deduction
        // }
      } else {
        //This Driver activeDrivers[i] is not having Enough Money in his escrow Account
        try {
          var notEnoughAmountResult = await initNotEnoughAmountAction(
            currentDriverEscrowId, calculated_fees.TOTAL_AMOUNT_DEDUCTABLE
          );
          successPromises.notEnoughAmountResult = notEnoughAmountResult;
          console.log(`notEnoughAmountResult : ${notEnoughAmountResult}`);
        } catch (error) {
          errorPromises.notEnoughAmountResultErr = notEnoughAmountResult;
          console.error(`notEnoughAmountResult error : ${notEnoughAmountResult}`);
          continue;
        }
      }
    }
  }

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "Vouch Account Balance Successfully..",
    successPromises: successPromises,
    errorPromises: errorPromises,
    activeProviers: activeDrivers,
  });
};

const isRequiredEscrowBalanceAvailableForDriver = async (req, res, next) => {
  const { provider_id } = req.body;
  const requiredAmount = 100;

  const URL = `/v1/escrow/fetch_escrow_account_balance`;
  var data = { escrow_id: "rydo-test-01" };

  try {
    const balanceResponse = await _axios.post(URL, data);
    if (balanceResponse.data.data.balance >= requiredAmount) {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message:
          "This Driver is having required Balance Amount in his Escrow Account",
        availableBalance: balanceResponse.data.data.balance,
        requiredBalance: requiredAmount,
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        status: "Failed",
        message:
          "This Driver is Not Having required Balance Amount in his Escrow Account!!",
        availableBalance: balanceResponse.data.data.balance,
        requiredBalance: requiredAmount,
      });
    }
  } catch (error) {
    console.log(`Error Occured While Checking Account Balance : ${error}`);
    return res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Something Went Wrong While Fetching Vouch Account Balance!!!",
      error: error,
    });
  }
};

const getEscrowAccountTransactionForDriver = async (req, res, next) => { };

const driverEarningsHistory = async (req, res, next) => { };

// const runTrasnferScheduler = () => {
//   //Running transfer scheduler on every 85400 seconds(24 Hour)
//   setInterval(deductScheduledPaymentFromDriversToRydoEscrow, 85000000);
// };

const vouchTesting = async (req, res, next) => {
  const closing_time = "2023-02-18 00:00:00 GMT"; //12 AM Night
  const starting_time = "2023-02-16 23:59:59 GMT"; //11:59 PM Night [24 Hour Clock Fromat]

  var d_start =
    moment().subtract(1, "days").format("YYYY-MM-DD") + " 23:59:59 GMT";
  var d_closing =
    moment().add(1, "days").format("YYYY-MM-DD") + " 00:00:00 GMT";

  var userRequestResult = await UserRequestTable.findAll({
    where: {
      [Op.and]: [{ provider_id: 106 }, { status: "COMPLETED" }],
      started_at: {
        [Op.between]: [d_start, d_closing],
      },
    },
    include: {
      model: DriverTable,
      as: "provider",
    },
  });

  console.log("");
  console.log("");
  console.log(`starting date : ${d_start}`);
  console.log(`closing date : ${d_closing}`);
  console.log("");
  console.log("");

  const serviceTypeResult = await ServiceTypeTable.findOne({
    where: { id: 5 },
  });
  console.log(`serviceTypeResult : ${serviceTypeResult}`);

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "Test API Ran Successfully..",
    // serviceTypeResult: serviceTypeResult,
    // user_convenience_fee: serviceTypeResult.user_convenience_fee,
    // provider_subscription_fee: serviceTypeResult.provider_subscription_fee,
    d_start: d_start,
    d_closing: d_closing,
    ride_count: userRequestResult.length,
    ride_data: userRequestResult,
  });
};

const checkEscrow = async (providerId) => {
  const vouchResponse = {};
  const escrwoId = "RYDOPROVIDER-R-" + providerId;

  checkEscowIdExist = await ProjectStaticUtils.fetchDriverEscrowBalance(escrwoId);
  if (checkEscowIdExist.data !== undefined) {
    console.log(checkEscowIdExist.data.balance);
    console.log("Account already Exist");
    vouchResponse.message = "Escrow account exists already";
    vouchResponse.status = 1;
    vouchResponse.escrwoId = escrwoId;

  } else if (checkEscowIdExist.response !== undefined) {
    console.log("No account exist")
    vouchResponse.message = "No escrow account exist for this provider";
    vouchResponse.status = 0;

  }
  return vouchResponse;
}
const openEscrow = async (providerId, providerName) => {
  const vouchResponse = {};
  const escrwoId = "RYDOPROVIDER-R-" + providerId;
  const escrowName = providerName;
  console.log("ESCROW ID: " + escrwoId)

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
        var vouchObj = {
          provider_id: providerId,
          escrow_id: escrwoId,
          user_ref: escrwoId,
          vouch_status: "NEW",
        }
        const newProviderVouch = await ProviderVouch.create(vouchObj);
        console.log(newProviderVouch);
      } catch (error) {
        console.log(error);
      }

    } else if (escrowResult.data.status == 401) {
      vouchResponse.status = escrowResult.data.status;
      // vouchResponse.data = escrowResult.data.data;
      vouchResponse.message = escrowResult.data.message;
    }
  } catch (error) {
    console.log(error);
    vouchResponse.message = error.message;
  }

  return vouchResponse;
}

module.exports = {
  checkDriverEscrowBalance,
  generateFixedAmountPayableLink,
  checkCollectLinkStatus,
  deductScheduledPaymentFromDriversToRydoEscrow,
  escrowToEscrowTransfer,
  vouchTesting,
  openEscrow
};
