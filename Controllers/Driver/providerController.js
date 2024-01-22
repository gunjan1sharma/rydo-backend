var { db, models } = require("../../Config/dbIndex.js");
const userRequestRatings = require("../../Models/userRequestRatings.js");
const generalController = require("../Driver/generalController.js");
const { Op } = require("sequelize");
const moment = require("moment");
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

const getProviderCompletedTrips = async (req, res, next) => {
  //Checking if we have registered provider with given Id or not
  const providerResult = await DriverTable.findOne({
    where: { id: req.params.id },
  });

  if (providerResult === null || providerResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${req.params.id})!!`,
    });
  }

  const completedRides = await UserRequestTable.findAll({
    where: {
      [Op.and]: [{ provider_id: req.params.id }, { status: "COMPLETED" }],
    },
    order: [["created_at", "DESC"]],
  });

  //Returning the result now
  if (
    completedRides.length === 0 ||
    completedRides === undefined ||
    completedRides == null
  ) {
    return res.status(500).json({
      statusCode: 404,
      status: "Not Any Completed Trips/Rides",
      message: `This Provider Has Not Completed Any Trips Yet!!`,
    });
  } else {
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Providers All Completed Trips Fetched Successfully",
      providerID: req.params.id,
      totalCompletedTrips: completedRides.length,
      data: completedRides,
    });
  }
};

const getProviderPastTripDetails = async (req, res, next) => {};

const getProviderUpcomingTrips = async (req, res, next) => {
  const providerAllUpcomingTrips = await UserRequestTable.findAll({
    where: {
      [Op.and]: [{ provider_id: provider_id }, { is_scheduled: "YES" }],
    },
    order: [["created_at", "DESC"]],
  })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Providers All Upcoming Trips Fetched Successfully",
        data: result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Provider Upcoming Trips Fetching Failed!!`,
        err: err,
      });
    });
};

const getProviderUpcomingTripDetails = async (req, res, next) => {};

const timeDiffUtil = (toDate, unit, exactValue) => {
  var timeDifference = moment(moment().format("YYYY-MM-DD HH:mm:ss")).diff(
    moment(toDate),
    unit,
    exactValue
  );

  return timeDifference;
};

const getProviderEarnings = async (req, res, next) => {
  const { provider_id } = req.params;

  let todayTotalEarnings = [];
  let weeklyTotalEarnings = [];
  let monthlyTotalEarnings = [];

  let totalCancelledRidesTodayData = [];
  var totalCancelledRidesToday = 0;

  var sumTodayEarnings = 0;
  var sumWeeklyEarnings = 0;
  var sumMonthlyEarnings = 0;
  var sumTotalEarnings = 0;

  //1.Finding the specified provider from our DB
  const providerResult = await DriverTable.findOne({
    where: { id: provider_id },
  });

  //2.Checking if we have registered provider with given Id or not
  if (providerResult === null || providerResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider in our DB With Given id(${provider_id})!!`,
    });
  }

  //3.Here we are performing JOIN operation with UserRequestTable and UserRequestPaymentsTable and finding ALL Tables
  const jR = await UserRequestTable.findAll({
    where: {
      [Op.and]: [
        { provider_id: provider_id },
        { status: "COMPLETED" },
        { paid: 1 },
      ],
    },
    include: {
      model: UserRequestPaymentsTable,
      as: "user_request_payments",
    },
  });

  //Here we are calling UserRequestTable again for filtering CancelledRides Data
  const crr = await UserRequestTable.findAll({
    where: {
      [Op.and]: [{ provider_id: provider_id }, { status: "CANCELLED" }],
    },
    include: {
      model: UserRequestPaymentsTable,
      as: "user_request_payments",
    },
  });

  //5.We are checking if JOIN Query is having some data or not
  if (jR.length === 0 || jR === undefined || jR === null) {
    return res.status(200).json({
      statusCode: 404,
      status: "failed",
      message: `There is currently no Earning Records for Given Driver(${provider_id})!!`,
    });
  }

  //Filtering cancelledRides based on timestamp difference using momentJs Lib
  if (crr.length !== 0 || crr !== undefined || crr !== null) {
    for (let index = 0; index < crr.length; index++) {
      //finding sumTotal today calcellation
      if (timeDiffUtil(crr[index].created_at, "days", false) === 0) {
        if (crr[index].status === "CANCELLED") {
          totalCancelledRidesTodayData.push(crr[index]);
          console.log(
            "todaycrr",
            timeDiffUtil(crr[index].created_at, "days", false)
          );
        }
      }
    }
  }

  //4.Here performing timestamp filteration based on daily/weekly/monthly/lifetime UserRequestPaymentsTable Results
  for (let index = 0; index < jR.length; index++) {
    //finding sumTotal weekly earnings
    if (timeDiffUtil(jR[index].created_at, "days", false) >= 7) {
      weeklyTotalEarnings.push(jR[index]);
      sumWeeklyEarnings += jR[index].user_request_payments[0].provider_pay;
      console.log(timeDiffUtil(jR[index].created_at, "days", false));
    }

    //finding sumTotal today earnings
    if (timeDiffUtil(jR[index].created_at, "days", false) === 0) {
      todayTotalEarnings.push(jR[index]);
      console.log(timeDiffUtil(jR[index].created_at, "days", false));
      // sumTodayEarnings += jR[index].user_request_payments[0].provider_pay;
      sumTodayEarnings += jR[index].user_request_payments[0].cash;
    }

    //finding sumTotal monthly earnings
    if (timeDiffUtil(jR[index].created_at, "days", false) >= 30) {
      monthlyTotalEarnings.push(jR[index]);
      sumMonthlyEarnings += jR[index].user_request_payments[0].provider_pay;
      console.log(timeDiffUtil(jR[index].created_at, "days", false));
    }

    //finding lifetime(total) earnings
    sumTotalEarnings += jR[index].user_request_payments[0].provider_pay;
    console.log(timeDiffUtil(jR[index].created_at, "days", false));
  }

  // //5.We are checking if JOIN Query is having some data or not
  // if (jR.length === 0 || jR === undefined || jR === null) {
  //   return res.status(200).json({
  //     statusCode: 404,
  //     status: "failed",
  //     message: `There is currently no Earning Records for Given Driver(${provider_id})!!`,
  //   });
  // }

  //6.Finally we are returning all the response
  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "Provider Earnings Calculated Successfully",
    sumTodayEarnings: sumTodayEarnings,
    sumWeeklyEarnings: sumWeeklyEarnings,
    sumMonthlyEarnings: sumMonthlyEarnings,
    sumTotalEarnings: sumTodayEarnings + sumWeeklyEarnings + sumMonthlyEarnings,
    todayTotalRides: todayTotalEarnings.length,
    todayEarninngsData: todayTotalEarnings,
    weeklyTotalRides: weeklyTotalEarnings.length,
    weeklyEarningsData: weeklyTotalEarnings,
    monthlyTotalRides: monthlyTotalEarnings.length,
    monthlyEarningsData: monthlyTotalEarnings,
    totalRidesCancelledToday: totalCancelledRidesTodayData.length,
    todayCancelledRidesData: totalCancelledRidesTodayData,
  });
};

const getProviderHelp = async (req, res, next) => {
  SettingsTable.findAll()
    .then((result) => {
      let contact_number = "";
      let sos_number = "";
      let contact_email = "";
      for (let i = 0; i < result.length; i++) {
        switch (result[i].key) {
          case "sos_number":
            sos_number = result[i].value;
            break;
          case "contact_number":
            contact_number = result[i].value;
            break;
          case "contact_email":
            contact_email = result[i].value;
            break;
        }
      }
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Provider|Passenger Help Details Fetched Successfully`,
        sos_number: sos_number,
        contact_number: contact_number,
        contact_email: contact_email,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Provider|Passenger Help Details Fetching Failed!!`,
        error: err,
      });
    });
};

const getProviderRides = async (req, res, next) => {
  const { provider_id, status, pageNumber } = req.params;
  var limit = 5;
  var offset = pageNumber * limit;

  //1.Checking for valid status response
  const validStatus = ["CANCELLED", "COMPLETED", "SCHEDULED", "ALL"];
  if (!validStatus.includes(status)) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message:
        "Needs Valid Ride Status, [CANCELLED, COMPLETED, SCHEDULED, ALL]",
    });
  }

  //2.Checking if pageNumber is valid number
  if (pageNumber < 0 || pageNumber > 99999) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message:
        "Needs Valid PageNumber, [pageNumber > 0 && pageNumber <= 99999]",
    });
  }

  //3.Checking if we have registered provider with given Id or not
  const providerResult = await DriverTable.findOne({
    where: { id: provider_id },
  });

  if (providerResult === null || providerResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found any provider Column in our DB With Given id(${provider_id})!!`,
    });
  }

  //If status type is ALL then sending all results
  let providerRides;
  if (status === "ALL") {
    providerRides = await UserRequestTable.findAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.and]: [{ provider_id: provider_id }],
      },
      order: [["created_at", "DESC"]],
    });
  }

  //This should be only called if status Type is not ALL
  if (status !== "ALL") {
    providerRides = await UserRequestTable.findAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.and]: [{ provider_id: provider_id }, { status: status }],
      },
      order: [["created_at", "DESC"]],
    });
  }

  //Returning the result now
  if (
    providerRides.length === 0 ||
    providerRides === undefined ||
    providerRides == null
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: `Not Any ${status} Trips/Rides`,
      message: `This Provider Has Not ${status} Any Trips Yet!!`,
    });
  } else {
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: `Providers All ${status} Trips Fetched Successfully`,
      providerID: req.params.id,
      totalTrips: providerRides.length,
      data: providerRides,
    });
  }
};

const getProviderRidesDetails = async (req, res, next) => {
  const { request_id } = req.params;

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

  //3.Fetching User Table
  const userResult = await UserTable.findOne({
    where: { id: userRequestTable.user_id },
  });

  //4.Checking if we are having requested Provider or Not
  if (userResult === null || userResult === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found this User in our DB With Given provider_id(${userRequestTable.provider_id})`,
    });
  }

  //5.Fetching UserRequestRating Table
  const userRequestRatingResult = await UserRequestRatingsTable.findOne({
    where: { request_id: request_id },
  });
  // const userRequestRatingResult = await UserRequestRatingsTable.findOne({
  //   where: {
  //     [Op.and]: [
  //       { provider_id: userRequestTable.provider_id },
  //       { user_id: userRequestTable.user_id },
  //     ],
  //   },
  // });

  //6.Checking if we are having requested UserRequestRatingTable or Not
  if (
    userRequestRatingResult === null ||
    userRequestRatingResult === undefined
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found UserRequestRating Column in our DB With Given provider_id(${userRequestTable.provider_id}) and user_id(${userRequestTable.user_id})`,
    });
  }

  //7.Fetching UserRequestPayments Table
  const userRequestPaymentsTableResult = await UserRequestPaymentsTable.findOne(
    {
      where: { request_id: request_id },
    }
  );

  //8.Checking if we are having requested UserRequestTable or Not
  if (
    userRequestPaymentsTableResult === null ||
    userRequestPaymentsTableResult === undefined
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found userRequestPaymentsTableResult Column in our DB With Given request_id(${request_id})`,
    });
  }

  //9.Fetching ServiceTypeTable
  const serviceTypeTableResult = await ServiceTypeTable.findOne({
    where: { id: userRequestTable.service_type_id },
  });

  //10.Checking if we are having requested UserRequestTable or Not
  if (ServiceTypeTable === null || ServiceTypeTable === undefined) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `We Have not found ServiceTypeTable Column in our DB With Given service_type_id(${userRequestTable.service_type_id})`,
    });
  }

  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: `Provider Ride Details Fetched Successfully`,
    rideRequestData: userRequestTable,
    userProfileData: userResult,
    rideRatingData: userRequestRatingResult,
    ridePaymentsData: userRequestPaymentsTableResult,
    serviceTypesData: serviceTypeTableResult,
  });
};

module.exports = {
  getProviderCompletedTrips,
  getProviderPastTripDetails,
  getProviderUpcomingTrips,
  getProviderUpcomingTripDetails,
  getProviderEarnings,
  getProviderHelp,
  getProviderRides,
  getProviderRidesDetails,
};
