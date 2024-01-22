const haversine = require("haversine-distance");
const { models } = require("../../Config/dbIndex.js");
const notifications = require("../../Services/common/firebaseNotification.js");
const notificationServices = require("../../Services/common/notification.js");
const util = require("util");
const { Op } = require("sequelize");
const moment = require("moment");
const Joi = require("joi");
const otpGenerator = require("otp-generator");
const PoiConstants = models.PoiConstants;
const DriverDistance = models.DriverDistance;
const Provider = models.Providers;
const User = models.Users;
const UserRequests = models.UserRequests;
const Settings = models.Settings;
const ServiceType = models.ServiceTypes;
const NightFares = models.NightFares;
const RequestFilters = models.RequestFilters;
const Favoritelocations = models.FavouriteLocations;
const ProviderServices = models.ProviderServices;
const NotificationMaster = models.NotificationMaster;
const Notification = models.Notification;
const ProviderDevices = models.ProviderDevices;
const UserRequestRatings = models.UserRequestRatings;
const UserRequestPayments = models.UserRequestPayments;

var SEARCH_ATTEMPTS = 4;
var WAITING_TIME = 30000; //mili seconds
var MAX_DAYS = 90; //for getting passenger rides not less than max_days

const getEstimatedFare = async (req, res) => {
  //commented the code for user authorization on 15-03-2023
  // console.log("FIREBASE UID: " + res.locals.UID);
  // const firebaseUID = res.locals.UID;
  // const userId = req.params.userId;
  // const Users = await User.findOne({ where: { id: userId } });
  // if (Users.firebase_user_id !== firebaseUID) {
  //   return res.status(400).json({
  //     statusCode: 400,
  //     status: "USER_MIS_MATCH",
  //     message: `Access token does not belong to this user`,
  //   });
  // }
  var distance_response = [];
  var requestarr = [];
  var return_data = [];
  var temp = {};
  var total = "";
  var tax_price = "";
  var Price = 0;
  var Fixed = 0;
  var flag = 0;
  var total_kilometer;
  const { durationMin, distance, service_type_id } = req.body;

  if (
    durationMin == undefined ||
    distance == undefined ||
    service_type_id == undefined
  ) {
    return res.status(400).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: `Please pass all the required values`,
    });
  }
  if (durationMin == "" || distance == "" || service_type_id == "") {
    return res.status(400).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: `Please pass valid input values`,
    });
  }
  console.log("Duration in minutes  " + durationMin);
  var duration = ((durationMin % 3600) / 60).toFixed(2);
  console.log("Duration");
  console.log(duration);
  temp = { meter: distance, time: duration, seconds: duration };
  distance_response.push(temp);
  console.log("Distance Response");
  console.log(distance_response[0].meter);
  var settings = await Settings.findOne({ where: { key: "distance" } });
  // console.log(settings.data);

  if (settings.value == "Kms") {
    total_kilometer = distance / 1000;
  } else {
    total_kilometer = Math.round(distance / 1609.344, 1);
  }

  temp = {
    meter: total_kilometer,
    time: distance_response[0].time,
    seconds: distance_response[0].seconds,
    kilometer: 0,
    minutes: 0,
    service_type_id: service_type_id,
  };
  requestarr.push(temp);
  console.log("temp");
  console.log(temp);
  var tax_percentage_response = await Settings.findOne({
    where: { key: "tax_percentage" },
  });
  var tax_percentage = tax_percentage_response.value;

  console.log("Tax");
  console.log(tax_percentage);
  console.log("Request body");
  console.log(requestarr);
  // var commission_percentage = await Settings.findOne({ where: { key: "commission_percentage" } });
  // var surge_trigger = await Settings.findOne({ where: { key: "surge_trigger" } });
  var price_response = await applyPriceLogic(requestarr[0], flag);
  console.log("Success");
  console.log(price_response);
  Price = price_response.price;
  console.log(Price);
  var Fixed = price_response.base_price;
  var Distance_fare = price_response.distance_fare;
  var Minute_fare = price_response.minute_fare;
  var Hour_fare = price_response.hour_fare;
  var calculator = price_response.calculator;
  var tax_price = Price * (tax_percentage / 100);
  console.log(tax_price);
  var total = Price + tax_price;
  console.log("Total");
  console.log(total);
  var current_time = moment(Date.now()).format("HH:mm");
  var night_fare = await NightFares.findAll();
  var fare = night_fare[0];
  console.log(fare[0]);
  if (fare) {
    var date2 = fare.to;
    var date3 = fare.from;
    console.log(date3);
    console.log(date2);
    console.log(current_time);
    if (current_time > date3 && current_time < date2) {
      console.log("Night fare");
      Price = Price * fare.extra_fee;
      Distance_fare = Distance_fare * fare.extra_fee;
      Minute_fare = Minute_fare * fare.extra_fee;
      Hour_fare = Hour_fare * fare.extra_fee;
      // total = Price + tax_price - Fixed;
      totalOne = Price + tax_price;
      //doubt
      total = Price + tax_price;
    }
  }

  temp = {
    estimated_fare: total.toFixed(2),
    distance_km: total_kilometer,
    time: duration,
    tax_price: tax_price.toFixed(2),
    base_price: price_response.base_price,
    service_type_id: service_type_id,
  };
  return_data.push(temp);
  console.log(return_data);
  return res.status(200).json({
    statusCode: 200,
    status: "ESTIMATED_FARE",
    message: `Estimated fare data fetched successfully`,
    Data: return_data,
  });
};
var applyPriceLogic = async (request, flag) => {
  var response = [];
  var price;
  var temp = {};
  const serviceTypes = await ServiceType.findOne({
    where: { id: request.service_type_id },
  });
  console.log(serviceTypes);
  console.log("Request");
  console.log(request);

  if (flag == 0) {
    //for estimated fare
    var total_kilometer = request.meter;
    var total_minutes = Math.round(request.seconds / 60);
    var total_hours = request.seconds / 60 / 60;
  } else {
    //for invoice fare
    var total_kilometer = request.kilometer;
    var total_minutes = request.minutes;
    var total_hours = request.minutes / 60;
  }

  var per_minute = serviceTypes.minute; //PM
  var per_hour = serviceTypes.hour; //PH
  var per_kilometer = serviceTypes.price; //PKM
  var base_distance = serviceTypes.distance; //BD
  var base_price = serviceTypes.fixed; //BP
  console.log("Base Distance");
  console.log(base_distance);
  if (serviceTypes.calculator == "MIN") {
    //BP+(TM*PM)
    price = base_price + total_minutes * per_minute;
  } else if (serviceTypes.calculator == "HOUR") {
    //BP+(TH*PH)
    price = base_price + total_hours * per_hour;
  } else if (serviceTypes.calculator == "DISTANCE") {
    console.log("Distance type");
    console.log("Total km");
    console.log(total_kilometer);
    //BP+((TKM-BD)*PKM)
    if (base_distance > total_kilometer) {
      price = base_price;
    } else {
      price = base_price + (total_kilometer - base_distance) * per_kilometer;
    }
  } else if (serviceTypes.calculator == "DISTANCEMIN") {
    //BP+((TKM-BD)*PKM)+(TM*PM)
    if (base_distance > total_kilometer) {
      price = base_price + total_minutes * per_minute;
    } else {
      price =
        base_price +
        ((total_kilometer - base_distance) * per_kilometer +
          total_minutes * per_minute);
    }
  } else if (serviceTypes.calculator == "DISTANCEHOUR") {
    //BP+((TKM-BD)*PKM)+(TH*PH)
    if (base_distance > total_kilometer) {
      price = base_price + total_hours * per_hour;
    } else {
      price =
        base_price +
        ((total_kilometer - base_distance) * per_kilometer +
          total_hours * per_hour);
    }
  } else {
    //by default set Ditance price BP+((TKM-BD)*PKM)
    price = base_price + (total_kilometer - base_distance) * per_kilometer;
  }
  temp = { price: price, base_price: base_price };
  response.push(temp);
  // response.price = price;
  // response.base_price = base_price;
  if (base_distance > total_kilometer) {
    response[{ distance_fare: 0 }];
  } else {
    response[
      { distance_fare: (total_kilometer - base_distance) * per_kilometer }
    ];
    // response.distance_fare = (total_kilometer - base_distance) * per_kilometer;
  }
  temp = {
    minute_fare: total_minutes * per_minute,
    hour_fare: total_hours * per_hour,
    calculator: serviceTypes.calculator,
  };
  response.push(temp);
  console.log(response);
  return response[0];
};

const sendRequest = async (req, res) => {
  const radius = 5.0;
  const type = "ride";
  const notification_reason = "new_ride_request";
  const userId = parseInt(req.params.userId);
  const s_address = req.body.s_address;
  const d_address = req.body.d_address;
  const s_latitude = req.body.s_latitude;
  const s_longitude = req.body.s_longitude;
  const d_latitude = req.body.d_latitude;
  const d_longitude = req.body.d_longitude;
  const d_eloc = req.body.d_eloc;
  const service_type_id = req.body.service_type_id;
  const estimated_fare = req.body.estimated_fare;
  const distance = req.body.distance;

  if (
    userId == undefined ||
    s_address == undefined ||
    d_address == undefined ||
    s_latitude == undefined ||
    s_longitude == undefined ||
    d_latitude == undefined ||
    d_longitude == undefined ||
    service_type_id == undefined ||
    estimated_fare == undefined
  ) {
    return res.status(400).json({
      statusCode: 400,
      status: "NUMBER_OF_INPUT_VALUES_NOT_MATCHING",
      message: `Please pass all the required input values`,
    });
  }
  if (
    userId == "" ||
    s_address == "" ||
    d_address == "" ||
    s_latitude == "" ||
    s_longitude == "" ||
    service_type_id == "" ||
    estimated_fare == "" ||
    distance == undefined ||
    d_eloc == undefined
  ) {
    return res.status(400).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: `Please pass appropriate valid input values`,
    });
  }
  // const otpGenerated = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
  // console.log("OTP Generated " + otpGenerated);
  var otpGenerated = Math.floor(1000 + Math.random() * 9000);

  // const otp = parseInt(otpGenerated);
  const otp = otpGenerated;
  // console.log("Converted OTP " + otp);

  var info = {
    user_id: userId,
    status: "SEARCHING",
    s_address: s_address,
    s_latitude: s_latitude,
    s_longitude: s_longitude,
    d_address: d_address,
    d_latitude: d_latitude,
    d_longitude: d_longitude,
    d_eloc: d_eloc,
    service_type_id: service_type_id,
    cancelled_by: "NONE",
    payment_mode: "CASH",
    service_required: "none",
    distance: 0.0,
    route_key: "testkey",
    is_scheduled: "NO",
    otp_verified: "FALSE",
    estimated_fare: estimated_fare,
    otp: otp,
    distance: distance,
  };

  //Fetch nearby drivers to users source location (first time)
  var driversList = await getdrivers(req.body, radius);

  //if no drivers found at first attempt function re attempts to call getdrivers after waiting time
  //modified on 14-march-2023
  for (var i = 0; i < SEARCH_ATTEMPTS; i++) {
    if (driversList.length == 0) {
      console.log("Out side set time out");
      await sleep(WAITING_TIME, "WAIT");
      console.log("Attempt: " + (i + 1));
      driversList = await getdrivers(req.body, radius);
    } else {
      console.log("Else");
      await sleep(0, "STOP");
      break;
    }
  }

  // console.log("Driver List");
  //console.log(driversList);
  try {
    const userRequest = await UserRequests.create(info);

    //modified on march 14th
    //if no drivers available update the status her eonly
    if (driversList.length == 0) {
      //update status to "NO_DRIVERS_FOUND"
      var updateStatus = await UserRequests.update(
        { status: "NO_DRIVERS_FOUND" },
        { where: { id: userRequest.id } }
      );
      console.log(updateStatus);
      const updatedRequest = await UserRequests.findOne({
        where: { id: userRequest.id },
      });
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `User Request Added`,
        data: updatedRequest,
      });
    }

    //if atleast one driver available nearby
    //Send Push Notification to all nearby drivers if status is active
    await notificationServices.notifyAllDrivers(
      driversList,
      userRequest,
      userRequest.user_id,
      notification_reason,
      type
    );

    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: `User Request Added`,
      data: userRequest,
    });
  } catch (e) {
    console.log("Catch");
    return res.status(500).json({
      statusCode: 500,
      status: "INTERAL_SERVER_ERROR",
      error: e,
    });
  }
};

const getMarkers = async (req, res) => {
  var radius = 4.0;
  var obj = {};
  if (
    req.params.s_latitude == undefined &&
    req.params.s_longitude == undefined
  ) {
    return res.status(400).json({
      statusCode: 400,
      status: "NUMBER_OF_INPUT_VALUES_NOT_MATCHING",
      message: "please pass all the required input parameters",
    });
  }
  obj.s_latitude = req.params.s_latitude;
  obj.s_longitude = req.params.s_longitude;
  try {
    var markers = await getdrivers(obj, radius);
    console.log("Markers");
    console.log(markers);
    if (markers.length == 0) {
      return res.status(400).json({
        statusCode: 400,
        status: "NO_MARKERS",
        message: "No Markers Found at this time",
        data: markers,
      });
    } else if (markers.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        status: "MARKERS",
        message: "List of markers near to passengers location",
        data: markers,
      });
    }
  } catch (e) {
    return res.status(500).json({
      statusCode: 500,
      status: "INTERNAL_SERVER_ERROR",
      err: e,
    });
  }
};
const getdrivers = async (req, radius) => {
  var userLocation = {};
  var pointOfInt = [];
  var userDistances = [];
  var drivers = [];
  var emptyList = [];
  var nearByDrivers = [];
  var tempByDrivers = [];
  var userLat = req.s_latitude;
  var userLong = req.s_longitude;
  var service_type_id = req.service_type_id;
  userLocation.latitude = userLat;
  userLocation.longitude = userLong;

  //get all point of interests
  const poi_constants = await PoiConstants.findAll();
  //get list of points with in the radius range
  for (var i = 0; i < poi_constants.length; i++) {
    pointOfInt.push({
      latitude: poi_constants[i].latitude,
      longitude: poi_constants[i].longitude,
    });
    const distance = (haversine(userLocation, pointOfInt[i]) / 1000).toFixed(2);
    // console.log("Distance: "+distance);
    if (distance <= radius) {
      userDistances.push({ distance: distance, id: poi_constants[i].id });
    }
  }
  // console.log("User Distances:  ");
  // console.log(userDistances);
  const condition2 = {
    distance: { [Op.lt]: radius },
  };
  var condition3 = {
    service_type_id: service_type_id,
  };

  if (service_type_id == undefined) {
    console.log("Request from get markers");
    var query = condition2;
    console.log(query);
  } else if (service_type_id !== undefined) {
    var query = {
      ...condition2,
      ...condition3,
    };
  }

  //get list of drivers near to above list of points
  for (var i = 0; i < userDistances.length; i++) {
    var driverDistance = await DriverDistance.findAll({
      where: {
        [Op.and]: [{ poiID: userDistances[i].id }, query],
      },
      include: [
        {
          model: ProviderServices,
          as: "provider_services",
          where: { status: "active" },
          required: true,
          include: [
            {
              model: Provider,
              as: "provider",
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email",
                "status",
                "latitude",
                "longitude",
                "remember_token",
                "created_at",
                "updated_at",
                "availability_status",
                "location_timestamp",
                "connection_status",
              ],
              required: true,
            },
          ],
        },
      ],
    });
    drivers.push(driverDistance);
  }
  // console.log("Drivers");
  // console.log(drivers.length);
  // console.log(drivers);
  if (drivers.length > 0) {
    var tempDrivers = drivers.flat(1);
    tempByDrivers = [
      ...new Map(
        tempDrivers.map((item) => [item["driverID"], item.provider_services])
      ).values(),
    ];
    for (var i = 0; i < tempByDrivers.length; i++) {
      var temp = {};
      const distance = (
        haversine(userLocation, {
          latitude: tempByDrivers[i].provider.latitude,
          longitude: tempByDrivers[i].provider.longitude,
        }) / 1000
      ).toFixed(2);
      temp.provider_services = tempByDrivers[i];
      temp.distance = distance;
      nearByDrivers.push(temp);
    }
    return nearByDrivers;
  } else {
    console.log("No Data Found");
    return emptyList;
  }
};

const notifyPassenger = async (req, res) => {
  const requestId = null;

  var notification = await notificationServices.notifyPassenger(
    req.body.regToken,
    req.body.title,
    req.body.body,
    req.body.payload,
    req.body.notification_reason,
    req.body.type,
    req.body.stickey,
    req.body.userId,
    req.body.providerId,
    requestId
  );
  if (notification[0].status == "SENT") {
    return res.status(200).json({
      statusCode: 200,
      status: "Success",
      message: "Notification Sent",
      data: notification,
    });
  } else if (notification[0].status == "NOT_SENT") {
    return res.status(500).json({
      statusCode: 500,
      status: "Failed",
      error: "Notification Not Sent",
      data: notification,
    });
  }
};
const notifyDriver = async (req, res) => {
  const requestId = null;
  var notification = await notificationServices.notifyDriver(
    req.body.regToken,
    req.body.title,
    req.body.body,
    req.body.payload,
    req.body.notification_reason,
    req.body.type,
    req.body.stickey,
    req.body.userId,
    req.body.providerId,
    requestId
  );
  console.log(req.body.stickey);
  console.log("From Controller");
  console.log(notification);

  if (notification[0].status == "SENT") {
    return res.status(200).json({
      statusCode: 200,
      status: "Success",
      message: "Notification Sent",
      data: notification,
    });
  } else if (notification[0].status == "NOT_SENT") {
    return res.status(500).json({
      statusCode: 500,
      status: "Failed",
      error: "Notification Not Sent",
      data: notification,
    });
  }
};
const addFavoriteLocation = async (req, res) => {
  const userId = req.params.userId;

  if (userId == undefined || userId == "") {
    return res.status(200).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: "Please provide all the input values",
    });
  }

  const { address, latitude, longitude, type, eloc } = req.body;
  const favLocation = await Favoritelocations.findAll({
    where: { user_id: userId, type: type },
  });
  if (favLocation.length > 0) {
    if (type !== "others") {
      var updateLocation = {
        address: address,
        latitude: latitude,
        longitude: longitude,
        eloc: eloc,
      };
      Favoritelocations.update(updateLocation, {
        where: { user_id: userId, type: type },
      });
      return res.status(200).json({
        statusCode: 200,
        status: "FAVORITE_LOCATION_UPDATED",
        message: `Passenger Favorite location updated successfully`,
        data: newFavoritelocation,
      });
    } else {
      try {
        var newFavoritelocation = await Favoritelocations.create({
          user_id: userId,
          address: address,
          latitude: latitude,
          longitude: longitude,
          type: type,
          eloc: eloc,
        });
        return res.status(200).json({
          statusCode: 200,
          status: "FAVORITE_LOCATION_SAVED",
          message: `Passenger Favorite location added successfully`,
          data: newFavoritelocation,
        });
      } catch (e) {
        return res.status(500).json({
          statusCode: 500,
          status: "INTERNAL_SERVER_ERROR",
          err: e,
        });
      }
    }
  } else {
    try {
      var newFavoritelocation = await Favoritelocations.create({
        user_id: userId,
        address: address,
        latitude: latitude,
        longitude: longitude,
        type: type,
        eloc: eloc,
      });
      return res.status(200).json({
        statusCode: 200,
        status: "FAVORITE_LOCATION_SAVED",
        message: `Passenger Favorite location added successfully`,
        data: newFavoritelocation,
      });
    } catch (e) {
      return res.status(500).json({
        statusCode: 500,
        status: "INTERNAL_SERVER_ERROR",
        err: e,
      });
    }
  }
};
const deleteFavoriteLocation = async (req, res) => {
  var locationId = req.params.locationId;
  var userId = req.params.userId;
  console.log(locationId);
  console.log(userId);
  if (locationId == "" || locationId == undefined) {
    return res.status(400).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: "Please provide valid location id",
    });
  }
  if (userId == "" || userId == undefined) {
    return res.status(400).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: "Please provide valid user id",
    });
  }

  try {
    const favoriteLocation = await Favoritelocations.findAll({
      where: { id: locationId, user_id: userId },
    });
    console.log(favoriteLocation);
    if (favoriteLocation.length > 0) {
      console.log(favoriteLocation.length);
      try {
        const deleteFavoritelocation = await Favoritelocations.destroy({
          where: { id: locationId, user_id: userId },
        });
        return res.status(200).json({
          statusCode: 200,
          status: "FAVORITE_LOCATION_Deleted",
          message: "Passenger favourite location deleted successfully",
        });
      } catch (e) {
        return res.status(500).json({
          statusCode: 500,
          status: "INTERNAL_SERVER_ERROR",
          message: e,
        });
      }
    } else if (favoriteLocation.length == 0) {
      return res.status(400).json({
        statusCode: 400,
        status: "LOCATION_DOES_NOT_EXIST",
        message: "Favourite location trying to delete does not exists",
      });
    }
  } catch (e) {
    return res.status(500).json({
      statusCode: 500,
      status: "INTERNAL_SERVER_ERROR",
      error: e,
    });
  }
};
const getFavoriteLocations = async (req, res) => {
  const userId = req.params.userId;

  if (userId == undefined || userId == "") {
    return res.status(200).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: "Please provide valid user id",
    });
  }
  try {
    var favLocations = await Favoritelocations.findAll({
      where: { user_id: userId },
    });
    if (favLocations.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        status: "PASSENGER_FAVORITE_LOCATIONS",
        data: favLocations,
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        status: "NO_FAVORITE_LOCATIONS_FOUND",
        message: "No favorite locations found for this user",
      });
    }
  } catch (e) {
    return res.status(500).json({
      statusCode: 500,
      status: "INTERNAL_SERVER_ERROR",
      error: e,
    });
  }
};
const updatePassengerDeviceToken = async (req, res) => {
  var userId = req.params.id;
  deviceToken = req.body.deviceToken;
  if (userId == undefined && deviceToken == undefined) {
    return res.status(400).json({
      statusCode: 400,
      status: "INVALID_INPUT_VALUES",
      message: `please provide both user id and device token`,
    });
  }
  var updateInfo = {
    device_id: deviceToken,
  };
  try {
    var userToken = await User.update(updateInfo, { where: { id: userId } });
    if (userToken[1] == 1) {
      return res.status(200).json({
        statusCode: 200,
        status: "DEVICE_TOKEN_UPDATED",
      });
    }
  } catch (e) {
    return res.status(500).json({
      statusCode: 500,
      status: "INTERNAL_SERVER_ERROR",
      err: e,
    });
  }
};

const fetchPassengerRides = async (req, res) => {
  try {
    console.log("params:");
    console.log(req.params);
    // const { userId, status, pageNumber } = req.params;
    const userId = req.params.id;
    const status = req.params.status;
    const pageNumber = parseInt(req.params.pageNumber);
    var limit = 5;
    var offset = pageNumber * limit;
    if (
      userId == "" ||
      userId == undefined ||
      status == "" ||
      status == undefined ||
      !["ACCEPTED", "COMPLETED", "CANCELLED"].includes(status)
    ) {
      return res.status(200).json({
        statusCode: 400,
        status: "INVALID_INPUT_VALUES",
        message: "Please provide all the input values",
      });
    }

    if (pageNumber < 0 || pageNumber > 99999) {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message:
          "Needs Valid PageNumber, [pageNumber > 0 && pageNumber <= 99999]",
      });
    }
    var user = await User.findOne({ where: { id: userId } });
    console.log(user);
    if (user === null || user === undefined) {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `No user found with id:  (${req.params.id})!!`,
      });
    } else {
      var userRides = await UserRequests.findAll({
        where: {
          user_id: userId,
          status: status,
          updated_at: { [Op.lt]: moment().add(MAX_DAYS, "days").toISOString() },
        },
        offset: offset,
        limit: limit,
        include: [
          {
            model: Provider,
            as: "provider",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "status",
              "latitude",
              "longitude",
              "remember_token",
              "created_at",
              "updated_at",
              "availability_status",
              "location_timestamp",
              "connection_status",
            ],
            required: true,
            include: [
              {
                model: ProviderServices,
                as: "provider_services",
              },
            ],
          },
          {
            model: UserRequestRatings,
            as: "user_request_ratings",
          },
          {
            model: UserRequestPayments,
            as: "user_request_payments",
          },
        ],

        order: [["created_at", "DESC"]],
      });
      // console.log("user rides: " + util.inspect(userRides, false, null, true));
      if (userRides.length > 0) {
        return res.status(200).json({
          statusCode: 200,
          status: "PASSENGER RIDES",
          totalRides: userRides.length,
          data: userRides,
        });
      } else {
        return res.status(200).json({
          statusCode: 200,
          status: "NO PASSENGER RIDES",
          data: userRides,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statusCode: 500,
      status: "INTERAL_SERVER_ERROR",
      error: error,
    });
  }
};

function sleep(ms, flag) {
  var timerId;
  if (flag == "WAIT") {
    return new Promise((resolve) => {
      timerId = setTimeout(resolve, ms);
    });
  } else if (flag == "STOP") {
    console.log("Clearing");
    clearTimeout(timerId);
    console.log("Cleared");
  }
}
module.exports = {
  getEstimatedFare,
  getMarkers,
  sendRequest,
  notifyDriver,
  notifyPassenger,
  addFavoriteLocation,
  deleteFavoriteLocation,
  getFavoriteLocations,
  updatePassengerDeviceToken,
  getdrivers,
  fetchPassengerRides,
};
