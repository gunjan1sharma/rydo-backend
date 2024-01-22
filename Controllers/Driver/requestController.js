var { db, models } = require("../../Config/dbIndex.js");
const generalController = require("../Driver/generalController.js");
const { Op } = require("sequelize");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { sendAcceptedRide } = require("../Beckn/ridesContoller.js");
const DriverTable = models.Providers;
const UserTable = models.Users;
const DriverDistanceTable = models.DriverDistance;
const PoiConstantsTable = models.Admins;
const UserRequestPaymentsTable = models.UserRequestPayments;
const UserRequestTable = models.UserRequests;
const ProviderServiceTable = models.ProviderServices;
const RequestFilterTable = models.RequestFilters;
const UserRequestRatingsTable = models.UserRequestRatings;
const NotificationTable = models.Notification;
const NotificationMasterTable = models.NotificationMaster;
const ServiceTypesTable = models.ServiceTypes;
const SettingsTable = models.Settings;

const acceptRequest = async (req, res, next) => {
  const { request_id, driverId, a_latitude, a_longitude } = req.body;

  var updatedUserRequestTable;
  var updatedProviderTable;
  var updatedProviderServiceTable;

  //driverId and request_id should exist in our database, a_latitude and a_longitude cannot be NULL
  //Checking if provided request_id exixt in our DB
  const userRequestTable = await UserRequestTable.findOne({
    where: { id: request_id },
  });

  if (userRequestTable === undefined || userRequestTable === null) {
    return res.status(404).json({
      statusCode: 404,
      status: "Not Found",
      message: `Given request_id(${request_id}) does not exist in our DB!!`,
      request_id: request_id,
    });
  }

  //Checking if provided provider_id exixt in our DB
  const driverResult = await DriverTable.findOne({
    where: { id: driverId },
  });

  if (driverResult === undefined || driverResult === null) {
    return res.status(404).json({
      statusCode: 404,
      status: "Not Found",
      message: `Given provider_id(${driverId}) does not exist in our DB!!`,
      provider_id: driverId,
    });
  }

  //Latitudes and Longitudes cannot be NULL
  if (
    a_latitude === undefined ||
    a_latitude === null ||
    a_longitude === "" ||
    a_latitude === "" ||
    a_longitude === undefined ||
    a_longitude === null
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "Not Found",
      message: `a_latitude(${a_latitude}) and a_longitude(${a_longitude}) are required to Accept the Ride!!`,
    });
  }

  //If status of this request is something else than SEARCHING then we will not proceed further
  if (userRequestTable.status != "SEARCHING") {
    return res.status(200).json({
      statusCode: 404,
      status: "failed",
      message: `This Driver(${userRequestTable.provider_id}) is Already having the Ride In Progress With User(${userRequestTable.user_id})`,
      ride_status: userRequestTable.status,
    });
  }

  //Ride scheduling logic
  if (userRequestTable.schedule_at !== "") {
  }

  //Before Started set Accepeted Status 1st, Store the Lat and Long of the Driver
  //Updating UserRequestTable that Ride for this Provider and User has started
  //Earlier It was STARTED But let that status Provider update
  //Updating provider_id with this provider in UserRequestTable
  try {
    const updateData = {
      status: "ACCEPTED",
      provider_id: driverId,
      current_provider_id: driverId,
      a_latitude: a_latitude,
      a_longitude: a_longitude,
      booking_id: uuidv4().toString(),
    };
    updatedUserRequestTable = await UserRequestTable.update(updateData, {
      where: { id: request_id },
    });
    console.log(`Updated UserRequestTable : ${updatedUserRequestTable}`);
  } catch (error) {
    console.log(
      `Error Occured While Accepting the Ride!! request_id(${request_id} provider_id(${driverId})) `
    );
    return res.status(500).json({
      status: 500,
      message: `Error Occured While Updating UserRequestTable!!`,
      error: error,
    });
  }

  //Now updating Notification Table Ride_Status as accepted also
  try {
    //Before update, we have to insert providerID as well
    const updatedNotificationUser = await NotificationTable.update(
      { provider_id: driverId },
      { where: { user_request_id: request_id } }
    );
    console.log(`updatedNotificationUser : ${updatedNotificationUser}`);
    const updatedNotification = await NotificationTable.update(
      {
        ride_accept_status: "ACCEPTED",
        provider_id: driverId,
      },
      {
        where: {
          [Op.and]: [
            { provider_id: driverId },
            { user_request_id: request_id },
          ],
        },
      }
    );
    console.log(`updatedNotification : ${updatedNotification}`);
  } catch (error) {
    console.log(`Error While Updating Notification Table...`);
  }

  //Now insert the UserRequestPaymentTable Row with all available info

  //Updating DriverTable that this Provider got Hired
  try {
    updatedProviderTable = await DriverTable.update(
      { connection_status: "Hired" },
      { where: { id: driverId } }
    );
    console.log(`ProviderTable Updated Successfully : ${updatedProviderTable}`);
  } catch (error) {
    console.log(`Error Occured While Updating Driver : ${error}`);
    // return res.status(500).json({
    //   status: 500,
    //   message: `Error Occured While Updating ProviderTable!!`,
    //   error: error,
    // });
  }

  //Updating ProviderServiceTable that this driver status is riding
  try {
    updatedProviderServiceTable = await ProviderServiceTable.update(
      { status: "riding" },
      { where: { provider_id: driverId } }
    );
    console.log(
      `ProviderServiceTable Updated Successfully : ${updatedProviderServiceTable}`
    );
  } catch (error) {
    console.log(`Error Occured While Updating ProviderServiceTable`);
    // return res.status(500).json({
    //   status: 500,
    //   message: `Error Occured While Updating ProviderServiceTable!!`,
    //   error: error,
    // });
  }

  //sending on_confirm response to BAP if its a beckn request
  const userRequest = await UserRequestTable.findOne({
    where: { id: request_id },
  });
  console.log("");
  if (userRequest.transaction_id !== null) {
    console.log("sending on_confirm response to BAP");
    console.log(userRequest.transaction_id);
    await sendAcceptedRide(userRequest);
  }

  //Now all the acceptRide operations has performed, return proper response to client
  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: `Ride Accepted Successfully By Provider(${driverId}) For User (${userRequestTable.user_id})`,
    ride_status: userRequestTable.status,
  });
};

const rejectRequestV2 = async (req, res, next) => {
  const { request_id, driverId } = req.body;

  //Validating this Notification Exists in our DB or not
  const notificationResult = await NotificationTable.findOne({
    where: {
      [Op.and]: [{ provider_id: driverId }, { user_request_id: request_id }],
    },
  });

  if (notificationResult === null || notificationResult === undefined) {
    return res.status(404).json({
      status: "Not Found",
      message: `We are unable to find Notification By Given provider_id(${driverId}) and request_id(${request_id})`,
    });
  }

  //If status is already rejected then we are returning the info
  if (notificationResult.ride_accept_status === "REJECTED") {
    return res.status(200).json({
      statusCode: 404,
      status: "Repeat Action",
      message: `This Notification with ID(${notificationResult.id}) is Already Rejected!!`,
      notificationResult: notificationResult,
    });
  }

  try {
    //For rejecting ride we are updating the status in notification
    const notificationUpdate = await NotificationTable.update(
      { ride_accept_status: "REJECTED" },
      {
        where: {
          [Op.and]: [
            { provider_id: driverId },
            { user_request_id: request_id },
          ],
        },
      }
    );
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: `Ride Request(${request_id}) Rejected Successfully..`,
      notificationResult: await NotificationTable.findOne({
        where: {
          [Op.and]: [
            { provider_id: driverId },
            { user_request_id: request_id },
          ],
        },
      }),
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json({
      statusCode: 500,
      status: "error",
      message: "Some Error Occured While Rejected Ride!!",
      error: error,
    });
  }
};

const rejectRequest = async (req, res, next) => {
  const { request_id, provider_id } = req.body;

  const requestFilterTableResponse = await RequestFilterTable.findOne({
    where: {
      [Op.and]: [{ request_id: request_id }, { provider_id: provider_id }],
    },
  });

  console.log("reFT : ", requestFilterTableResponse);

  //Checking if this requestId associated with given provider exists in our requestFilterTable or not
  if (
    requestFilterTableResponse === undefined ||
    requestFilterTableResponse === null
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `There is no requestColumn having provided request_id(${request_id}) and driver_id(${provider_id})`,
      request_id: request_id,
      provider_id: provider_id,
    });
  }

  //Deleting the given requestId associted with this driver
  await RequestFilterTable.destroy({
    where: {
      [Op.and]: [{ request_id: request_id }, { provider_id: provider_id }],
    },
  })
    .then(async (result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Ride Request Rejected Successfully..`,
        request_id: request_id,
        provider_id: provider_id,
        updatedRequestFilterTable: await RequestFilterTable.findAll(),
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `Failure Occured While Rejecting Ride Request With provided request_id(${request_id}) and driver_id(${provider_id})`,
        request_id: request_id,
        provider_id: provider_id,
        error: err,
      });
    });
};

const driverDistanceJoinOperation = async (req, res, next) => {
  //3.Fetching Documents by performing Join Operation
  const jR = await DriverDistanceTable.findOne({
    where: { id: 56 },
    include: {
      model: ServiceTypesTable,
      as: "service_type_distancezz",
    },
  });

  return res.status(404).json({
    statusCode: 404,
    status: "success",
    jR: jR,
  });
};

const cancelRequest = async (req, res, next) => {
  const { cancel_reason, request_id } = req.body;

  //1.Cancel_Reason is required for driver to cancel the Ride
  if (
    cancel_reason === "" ||
    cancel_reason === undefined ||
    cancel_reason === null
  ) {
    return res.status(200).json({
      statusCode: 404,
      status: "failed",
      message: ` Valid cancel_reason is required!!`,
    });
  }

  //2.Getting the requestTable column having this providerId
  const userRequestTableResult = await UserRequestTable.findOne({
    where: { id: request_id },
  });

  //3.Checking that UserRequestTable Column having this provider_id exists or not
  if (userRequestTableResult === undefined || userRequestTableResult === null) {
    return res.status(200).json({
      statusCode: 404,
      status: "Not Found",
      message: `There is no data in UserRequestTable having request_id(${request_id})`,
    });
  }

  const cancellable_stage = [
    "SEARCHING",
    "ACCEPTED",
    "ARRIVED",
    "STARTED",
    "CREATED",
    "SCHEDULED",
  ];

  //4.Checking if ride is cancellable at this stage or not
  if (!cancellable_stage.includes(userRequestTableResult.status)) {
    return res.status(404).json({
      statusCode: 404,
      status: "Not Applicable",
      message: "Ride At this Stage cannot get Cancelled!!",
      current_status: userRequestTableResult.status,
      cancellable_stage: cancellable_stage,
    });
  }

  //Checking in requestFilterTable that column exists with this providerId or not
  // const requestFilterTableResult = await RequestFilterTable.findOne({
  //   where: { provider_id: provider_id },
  // });
  // if (
  //   requestFilterTableResult === undefined ||
  //   requestFilterTableResult === null
  // ) {
  //   return res.status(404).json({
  //     statusCode: 404,
  //     status: "failed",
  //     message: `There is no data in requestFilterTable having provider_id(${provider_id})`,
  //   });
  // }

  //5.Updating the UserRequest Table
  UserRequestTable.update(
    {
      status: "CANCELLED",
      cancel_reason: cancel_reason,
      cancelled_by: "PROVIDER",
    },
    {
      where: { id: request_id },
    }
  )
    .then(async (result) => {
      //6.After cancellation, change the status of this provider(driver)
      const pstUpdate = await ProviderServiceTable.update(
        { status: "active" },
        {
          where: { provider_id: userRequestTableResult.provider_id },
        }
      );
      console.log(`pstUpdate : + ${pstUpdate}`);

      //7.After Cancellation, deleting the column from requestFilterTable
      //RequestFilterTable.destroy({ where: { request_id: provider_id } });

      //  updatedUserRequest: await UserRequestTable.findOne({
      //     where: { id: request_id },
      //   }),

      //8.All operations done successfully, now returning the success response to client
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Ride Cancelled Successfully By Provider(${userRequestTableResult.provider_id})`,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: "While Cancelling Ride Some Error Occured!!",
        error: err,
      });
    });
};

const updateRequest = async (req, res, next) => {
  const { request_id, status, latitude, longitude, address } = req.body;

  //Validation for all fields
  if (
    request_id === undefined ||
    request_id === null ||
    request_id === "" ||
    status === undefined ||
    status === null ||
    status === "" ||
    latitude === undefined ||
    latitude === null ||
    latitude === "" ||
    longitude === undefined ||
    longitude === null ||
    longitude === "" ||
    address === undefined ||
    address === null ||
    address === ""
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "Not Found",
      message: `request_id(${request_id}), status(${status}), latitude(${latitude}), longitude(${longitude}), and address(${address}) are required!!`,
    });
  }

  //1.Status can only be updatable with these stages
  const updatableStatus = [
    "ACCEPTED",
    "STARTED",
    "ARRIVED",
    "PICKEDUP",
    "DROPPED",
    "PAYMENT",
    "COMPLETED",
  ];

  //2.Checking if ride is updatable at this stage or not
  if (!updatableStatus.includes(status)) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: "Ride At this Stage cannot get Updated!!",
      rideUpdatableOptions: updatableStatus,
    });
  }

  //3. Getting Column in UserRequestTable having this request_id
  const userRequestTable = await UserRequestTable.findOne({
    where: { id: request_id },
  });

  //4.Checking if we are having requested UserRequestTable or Not
  if (userRequestTable === null || userRequestTable === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found UserRequest Column in our DB With Given request_id(${request_id})`,
    });
  }

  // First Fetching Latest UserRequestPaymentsTable Having this request_id
  var userRequestPaymentResult = await UserRequestPaymentsTable.findOne({
    where: { request_id: request_id },
  });

  // 4.Checking if we are having requested UserRequestPaymentsTable or Not
  // if (
  //   userRequestPaymentResult === null ||
  //   userRequestPaymentResult === undefined
  // ) {
  //   return res.status(404).json({
  //     statusCode: 404,
  //     status: "failed",
  //     message: `We Have not found UserRequestPaymentResultTable Column in our DB With Given request_id(${request_id})`,
  //   });
  // }

  if (status === "STARTED") {
    const updatables = { status: status };
    const updatedRequest = await UserRequestTable.update(updatables, {
      where: { id: request_id },
    });
    console.log(`updatedRequest : ${updatedRequest}`);
  }

  if (status === "DROPPED" && userRequestTable.payment_mode !== "CASH") {
    const updatables = { status: "COMPLETED", paid: 1 };
    const whereClause = { id: request_id };

    const updateUserRequest = await UserRequestTable.update(updatables, {
      where: whereClause,
    });
    console.log(`updateUserRequest : ${updateUserRequest}`);

    //Sending push notification that Ride is COMPLETED
    generalController.sendPushNotification("COMPLETED");
  } else if (
    status === "COMPLETED" &&
    userRequestTable.payment_mode === "CASH"
  ) {
    if (userRequestTable.status === "COMPLETED") {
      //for off cross clicking on change payment issue on mobile
      // return true;
    }

    //Updating UserRequestTable
    const updatables = { status: "COMPLETED", paid: 1 };
    const whereClause = { id: request_id };

    const updateUserRequest = await UserRequestTable.update(updatables, {
      where: whereClause,
    });
    console.log(`updateUserRequest : ${updateUserRequest}`);

    //Now inseting the record into UserRequestPaymentsTable for Inovice generating
    // await getInoviceInternal(request_id);

    //Updating UserRequestPaymentsTable
    const paymentUpdates = {
      payment_mode: userRequestTable.payment_mode,
      cash: userRequestPaymentResult.payable,
      total: userRequestPaymentResult.payable,
    };
    const whereClausePayment = { request_id: request_id };
    const paymentUpdateRes = await UserRequestPaymentsTable.update(
      paymentUpdates,
      { where: whereClausePayment }
    );
    console.log(`paymentUpdateRes : ${paymentUpdateRes}`);

    //Sending push notification that Ride is COMPLETED
    generalController.sendPushNotification("COMPLETED");
  } else {
    if (status === "ARRIVED") {
      //Sending push Notification to driver and passenger about ARRIVED
      const updatedRequest = await UserRequestTable.update(
        { status: "ARRIVED" },
        { where: { id: request_id } }
      );
      console.log(`updatedRequest : ${updatedRequest}`);
    }
  }

  if (status === "PICKEDUP") {
    const requestRes = await UserRequestTable.findOne({
      where: { id: request_id },
    });
    if (requestRes.otp_verified === "FALSE") {
      return res.status(200).json({
        statusCode: 404,
        status: "failed",
        message: `OTP Verification is Required Before Making Ride PICKEDUP`,
        previous_status: userRequestTable.status,
        updated_status: status,
        updatedUserRequestTable: await UserRequestTable.findOne({
          where: { id: request_id },
        }),
      });
    }
    var updatables = {
      status: status,
      started_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    const whereClause = { id: request_id };

    if (userRequestTable.is_track === "YES") {
      updatables.distance = 0;
    }

    const updatedUserRequest = await UserRequestTable.update(updatables, {
      where: whereClause,
    });
    console.log(`updatedUserRequest : ${updatedUserRequest}`);
  }

  //Only I have to write this part and after that I have to do testing
  if (status === "DROPPED") {
    var updatables = { status: "DROPPED" };
    var whereClause = { id: request_id };

    if (userRequestTable.is_track === "YES") {
      updatables.d_latitude =
        latitude === undefined || latitude === ""
          ? userRequestTable.d_latitude
          : latitude;
      updatables.d_longitude =
        longitude === undefined || longitude === ""
          ? userRequestTable.d_longitude
          : longitude;
      updatables.d_address =
        address === undefined || address === ""
          ? userRequestTable.d_address
          : address;
    }

    //Calculating the Total Travelled Time
    let started_date = userRequestTable.started_at;
    let finished_date = moment().format("YYYY-MM-DD HH:mm:ss");
    let minute_difference = moment(finished_date).diff(
      moment(started_date),
      "minutes",
      true
    );
    console.log(
      `started_date : (${started_date}), finished_date : (${finished_date}), travel_time : (${minute_difference})`
    );

    updatables.finished_at = finished_date;
    updatables.travel_time = minute_difference;

    const updatedRequest = UserRequestTable.update(updatables, {
      where: whereClause,
    });
    console.log(`updatedRequest : ${updatedRequest}`);
    await getInoviceInternal(request_id);

    //Again Triggering Push Notification After Successful PickUp
    generalController.sendPushNotification(
      "user|driver",
      "User Dropped Successfully"
    );
  }

  //-------------------------------------

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: `Ride Status(${status}) Updated Successfully By Provider(${userRequestTable.provider_id})`,
    previous_status: userRequestTable.status,
    updated_status: status,
    updatedUserRequestTable: await UserRequestTable.findOne({
      where: { id: request_id },
    }),
  });
};

const verifyRideOtp = async (req, res, next) => {
  const { request_id, otp } = req.body;

  //1. Getting Column in UserRequestTable having this request_id
  const userRequestTable = await UserRequestTable.findOne({
    where: { id: request_id },
  });

  //2.Checking if we are having requested UserRequestTable or Not
  if (userRequestTable === null || userRequestTable === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found UserRequest Column in our DB With Given request_id(${request_id})`,
    });
  }

  //3.Checking if we are having requested UserRequestTable or Not
  if (
    request_id === null ||
    request_id === undefined ||
    otp === null ||
    otp === undefined
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `OTP and RequestId Field Cannot We Talk!!`,
    });
  }

  //Finally checking the OTP and returning proper response to client
  if (otp === userRequestTable.otp) {
    //Updating otp_verified as true
    const otpVerifiedResult = await UserRequestTable.update(
      { otp_verified: "TRUE" },
      { where: { id: request_id } }
    );
    console.log(`OTP Verified Result : ${otpVerifiedResult}`);

    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "OTP matched successfully",
      otpMatchStatus: true,
    });
  } else {
    //Updating otp_verified as false
    const otpVerifiedResult = await UserRequestTable.update(
      { otp_verified: "FALSE" },
      { where: { id: request_id } }
    );
    console.log(`OTP Verified Result : ${otpVerifiedResult}`);
    return res.status(200).json({
      statusCode: 404,
      status: "failed",
      otpMatchStatus: false,
      message: `Entered OTP(${otp}) does not matched!!`,
    });
  }
};

const getTrip = async (req, res, next) => {};

const getInoviceInternal = async (request_id) => {
  //Checking provided request_id exists in our DB or not
  const userRequestTableResult = await UserRequestTable.findOne({
    where: { id: request_id },
  });

  if (userRequestTableResult === undefined || userRequestTableResult === null) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `There is no request_id having provided request_id(${request_id})`,
    });
  }

  const assignedProvider = await DriverTable.findOne({
    where: { id: userRequestTableResult.provider_id },
  });
  console.log(`assignedProvider : ${assignedProvider}`);

  const settingsResult = await SettingsTable.findAll({});
  var tax_percentage = "";
  var commission_percentage = "";
  var provider_commission_percentage = "";
  for (let i = 0; i < settingsResult.length; i++) {
    switch (settingsResult[i].key) {
      case "tax_percentage":
        tax_percentage = settingsResult[i].value;
        break;
      case "commission_percentage":
        commission_percentage = settingsResult[i].value;
        break;
      case "provider_commission_percentage":
        provider_commission_percentage = settingsResult[i].value;
        break;
    }
  }
  console.log(`commission_percentage : ${commission_percentage}`);
  console.log(`tax_percentage : ${tax_percentage}`);
  console.log(
    `provider_commission_percentage : ${provider_commission_percentage}`
  );

  var Fixed = 0;
  var Distance = 0;
  var Discount = 0; // Promo Code discounts should be added here.
  var Wallet = 0;
  var Surge = 0;
  var ProviderCommission = 0;
  var ProviderPay = 0;
  var Distance_fare = 0;
  var Minute_fare = 0;
  var calculator = "DISTANCE";
  var discount_per = 0;

  //Now creating UserRequestPaymentsTable with all data
  let data = {
    request_id: request_id,
    user_id: userRequestTableResult.user_id,
    provider_id: userRequestTableResult.provider_id,
    fleet_id: assignedProvider.fleet,
    promocode_id: 1,
    fixed: Fixed,
    payment_id: uuidv4().toString(),
    distance: Distance_fare,
    minute: Minute_fare,
    paid: 1,
    status: "DROPPED",
    surge: Surge,
    provider_commission: commission_percentage,
    provider_pay: ProviderPay,
  };

  //If paymentsTable already exist then we will update it..
  const paymentsTableResult = await UserRequestPaymentsTable.findOne({
    where: { request_id: request_id },
  });

  if (paymentsTableResult === undefined || paymentsTableResult === null) {
    try {
      const createdUserPayments = await UserRequestPaymentsTable.create(data);
      console.log(`createdUserPayments : ${createdUserPayments}`);
      console.log("New Row in UserRequestPayments Inserted Successfully");
    } catch (error) {
      console.log(
        `Error while inserting new record in UserRequestPayments Table : ${error}`
      );
    }
  } else {
    try {
      const updatedUserPayments = await UserRequestPaymentsTable.update(data, {
        where: { id: paymentsTableResult.id },
      });
      console.log(`updatedUserPayments : ${updateRequest}`);
      console.log("New Row in UserRequestPayments Updated Successfully");
    } catch (error) {
      console.log(
        `Error while Updating record in UserRequestPayments Table : ${error}`
      );
    }
  }
};

const getInovice = async (req, res, next) => {
  const { request_id } = req.params;

  //Checking provided request_id exists in our DB or not
  const userRequestTableResult = await UserRequestTable.findOne({
    where: { id: request_id },
  });

  if (userRequestTableResult === undefined || userRequestTableResult === null) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `There is no request_id having provided request_id(${request_id})`,
    });
  }

  const assignedProvider = await DriverTable.findOne({
    where: { id: userRequestTableResult.provider_id },
  });

  const settingsResult = await SettingsTable.findAll({});
  var tax_percentage = "";
  var commission_percentage = "";
  var provider_commission_percentage = "";
  for (let i = 0; i < settingsResult.length; i++) {
    switch (settingsResult[i].key) {
      case "tax_percentage":
        tax_percentage = settingsResult[i].value;
        break;
      case "commission_percentage":
        commission_percentage = settingsResult[i].value;
        break;
      case "provider_commission_percentage":
        provider_commission_percentage = settingsResult[i].value;
        break;
    }
  }
  console.log(`commission_percentage : ${commission_percentage}`);
  console.log(`tax_percentage : ${tax_percentage}`);
  console.log(
    `provider_commission_percentage : ${provider_commission_percentage}`
  );

  var Fixed = 0;
  var Distance = 0;
  var Discount = 0; // Promo Code discounts should be added here.
  var Wallet = 0;
  var Surge = 0;
  var ProviderCommission = 0;
  var ProviderPay = 0;
  var Distance_fare = 0;
  var Minute_fare = 0;
  var calculator = "DISTANCE";
  var discount_per = 0;

  //Now creating UserRequestPaymentsTable with all data
  let data = {
    request_id: userRequestTableResult.id,
    user_id: userRequestTableResult.user_id,
    provider_id: userRequestTableResult.provider_id,
    fleet_id: assignedProvider.fleet,
    fixed: Fixed,
    distance: Distance_fare,
    minute: Minute_fare,
    paid: 1,
    status: "COMPLETED",
    surge: Surge,
    provider_commission: commission_percentage,
    provider_pay: ProviderPay,
  };

  //const createdUserPayments = await UserRequestPaymentsTable.create(data);
  //console.log(`createdUserPayments : ${createdUserPayments}`);

  //Fetching UserRequestPaymentsTable and checking this exist in our DB or not
  const userRequestPaymentTableResult = await UserRequestPaymentsTable.findOne({
    where: { request_id: request_id },
  });

  if (
    userRequestPaymentTableResult === undefined ||
    userRequestPaymentTableResult === null
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `There is no userRequestPaymentTableResult having provided request_id(${request_id})`,
    });
  }

  //Checking ride with request_id is completed or not
  if (userRequestTableResult.status !== "DROPPED") {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `Inovice is only available for [DROPPED] Rides!!`,
    });
  }

  //Preparing Inovice Data to send as response
  var inovice = {
    bookingId: userRequestTableResult.booking_id,
    distanceTravelled: userRequestTableResult.distance,
    timeTaken: userRequestTableResult.travel_time,
    baseFare: userRequestPaymentTableResult.fixed,
    tax: userRequestPaymentTableResult.tax,
    distance_fare: userRequestTableResult.estimated_fare,
    amount_payable: userRequestTableResult.estimated_fare,
    total: userRequestPaymentTableResult.total,
  };

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: `Inovice Loaded Successfully`,
    inoviceData: inovice,
  });
};

const createUserRequestTable = async (req, res, next) => {
  let info = {
    booking_id: "1276tf3",
    user_id: 102,
    provider_id: 106,
    current_provider_id: 106,
    service_type_id: 5,
    promocode_id: 1,
    rental_hours: 2,
    status: "COMPLETED",
    cancelled_by: "NONE",
    cancel_reason: "",
    payment_mode: "CASH",
    service_required: "none",
    paid: 0,
    is_track: "NO",
    distance: "25.0",
    travel_time: "",
    unit: "Kms",
    s_address: "",
    s_latitude: 13.376271170338239,
    s_longitude: 77.11683433119065,
    d_address: "",
    otp: "",
    d_latitude: 13.376271170338239,
    track_distance: 0.0,
    track_latitude: 0.0,
    track_longitude: 0.0,
    d_longitude: 77.11683433119065,
    is_scheduled: "NO",
    user_rated: 0,
    provider_rated: 0,
    use_wallet: 0,
    surge: 0,
    route_key: "routekey",
  };

  UserRequestTable.create(info)
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `UserRequestTable Created Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `UserRequestTable Creation Failed!!`,
        error: err,
      });
    });
};

const createRequestFilterTable = async (req, res, next) => {
  let info = {
    request_id: 2,
    provider_id: 104,
    status: 0,
  };

  RequestFilterTable.create(info)
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `RequestFilterTable Created Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `RequestFilterTable Creation Failed!!`,
        error: err,
      });
    });
};

const initTimeOperation = async (req, res, next) => {
  const startTime = "2022-12-10 16:53:41";
  const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
  const pastTime1 = "";
  const pastTime2 = "";

  const mt1 = "2022-12-10 15:13:24";
  const mt2 = "2022-12-10 15:53:41";
  const minuteDifference = moment(mt2).diff(moment(mt1), "minutes", true);

  const difference =
    new Date(currentTime).valueOf() - new Date(startTime).valueOf();

  //Difference b/w two timestamps, done!
  //This difference into hours and minutes, days, weeks and months, done!
  //While subtracting, subtract smaller from bigger to get positive result, done!

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    currentTime: currentTime,
    moment: moment(difference),
    fromDate: new Date(difference),
    difference: difference,
    momentDiff: moment(currentTime).diff(moment(startTime), "days"),
    minuteDifference: minuteDifference,
  });
};

const createUserPaymentRequestTable = async (req, res, next) => {
  UserRequestPaymentsTable.create(req.body)
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `UserRequestPaymentsTable Created Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `UserRequestPaymentsTable Creation Failed!!`,
        error: err,
      });
    });
};

const createUserRequestRatingsTable = async (req, res, next) => {
  let body = {
    request_id: 2,
    user_id: 105,
    provider_id: 103,
    user_rating: 3,
    provider_rating: 0,
  };

  await UserRequestRatingsTable.create(body)
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `UserRequestRatingsTable Created Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `UserRequestRatingsTable Creation Failed!!`,
        error: err,
      });
    });
};

const getRideRequestStatus = async (req, res, next) => {
  try {
    var userRequestResult = await UserRequestTable.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: DriverTable,
          as: "provider",
        },
      ],
    });

    //appending provider_services table in the result
    var provider_serviceResult = await ProviderServiceTable.findOne({
      where: { provider_id: userRequestResult.provider_id },
    });

    var result = {
      ride_data: userRequestResult,
      provider_services: provider_serviceResult,
      notification_data: await NotificationTable.findOne({
        where: { user_request_id: req.params.id },
      }),
    };

    console.log(`provider_serviceResult : ${provider_serviceResult}`);
    //userRequestResult.provider_services = provider_serviceResult;
    console.log(`userRequestResult : ${userRequestResult}`);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: `UserRequestTable Fetched Successfully`,
      data: result,
      //data: userRequestResult,
    });
  } catch (error) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `Something Went Wrong while fetching UserRequestTable!!!`,
      error: error,
    });
  }
};

module.exports = {
  acceptRequest,
  rejectRequest,
  rejectRequestV2,
  cancelRequest,
  updateRequest,
  createUserRequestTable,
  createRequestFilterTable,
  createUserPaymentRequestTable,
  createUserRequestRatingsTable,
  initTimeOperation,
  verifyRideOtp,
  getTrip,
  getInovice,
  driverDistanceJoinOperation,
  getRideRequestStatus,
};
