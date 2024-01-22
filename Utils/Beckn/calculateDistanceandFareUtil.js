const util = require("util");
const axios = require("axios");
const { models } = require("../../Config/dbIndex.js");
const moment = require("moment");

const Settings = models.Settings;
const ServiceType = models.ServiceTypes;
const NightFares = models.NightFares;

const calculateDurationAndFare = async (source, destination) => {
  const base_url = "https://apis.mapmyindia.com/advancedmaps/v1";
  const rest_key = "650450edaf48bec9e49c45f2baf31d7f";
  const resources = "distance_matrix";
  const profile = "driving";
  var geopositions = "";

  const src = source.toString().split(",");
  const src_cordinates = src[1] + "," + src[0];
  console.log("geosrc:", src_cordinates);

  const dest = destination.toString().split(",");
  const dest_cordinates = dest[1] + "," + dest[0];
  console.log("geodest:", dest_cordinates);

  geopositions = src_cordinates + ";" + dest_cordinates;

  const distan_matrix_url =
    base_url +
    "/" +
    rest_key +
    "/" +
    resources +
    "/" +
    profile +
    "/" +
    geopositions;
  console.log(distan_matrix_url);
  const response = await axios.get(distan_matrix_url);
  console.log("res_status:", response.status);
  if (response.status == 200) {
    console.log(
      util.inspect(response.data.results.distances[0][1], false, null, true)
    );
    const distance = response.data.results.distances[0][1] / 1000;
    const duration = response.data.results.durations[0][1] / 60;
    console.log(distance, duration);
    const fare = await getEstimatedFareDetails(duration, distance, 5);

    //const ETA = moment.duration(Math.ceil(duration), "minutes");
    const ETA = "PT" + Math.ceil(duration) + "M";

    return [response.status, fare, ETA, distance];
  } else if (response.status == 204) {
    return [204, "Failed", "DB Connection error"];
  } else if (response.status == 400) {
    return [400, "Failed", "Bad request"];
  } else if (response.status == 401) {
    return [401, "Failed", "API access denied"];
  } else if (response.status == 403) {
    return [403, "Failed", "Forbidden"];
  } else if (response.status == 412) {
    return [
      412,
      "Failed",
      "Precondition Failed, i.e. Some existing pre-condition in formulating a valid API request was not fulfilled.",
    ];
  } else if (response.status == 500) {
    return [500, "Failed", "Something went wrong"];
  } else if (response.status == 503) {
    return [503, "Failed", "Internal server error"];
  }
};

const getEstimatedFareDetails = async (
  durationMin,
  distance,
  service_type_id
) => {
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
  //const { durationMin, distance, service_type_id } = req.body;

  if (
    durationMin == undefined ||
    distance == undefined ||
    service_type_id == undefined
  ) {
    return "Please pass all the required values";
  }
  if (durationMin == "" || distance == "" || service_type_id == "") {
    return "Please pass valid input values";
  }
  console.log("Duration in minutes  " + durationMin);
  var duration = (durationMin % 3600) / 60;
  temp = { meter: distance, time: duration, seconds: duration };
  distance_response.push(temp);
  console.log("Distance Response");
  console.log(distance_response[0].meter);
  var settings = await Settings.findOne({ where: { key: "distance" } });
  // console.log(settings.data);

  if (settings.value == "Kms") {
    total_kilometer = Math.round(distance / 1000, 1);
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
  var price_response = await applyPriceLogicDetails(requestarr[0], flag);
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
    estimated_fare: total,
    distance_km: total_kilometer,
    time: duration,
    tax_price: tax_price,
    base_price: price_response.base_price,
    service_type_id: service_type_id,
  };
  return_data.push(temp);
  console.log(return_data);
  return return_data[0];
};
var applyPriceLogicDetails = async (request, flag) => {
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
  if (serviceTypes.calculator == "MIN") {
    //BP+(TM*PM)
    price = base_price + total_minutes * per_minute;
  } else if (serviceTypes.calculator == "HOUR") {
    //BP+(TH*PH)
    price = base_price + total_hours * per_hour;
  } else if (serviceTypes.calculator == "DISTANCE") {
    console.log("Distance type");
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

const calculateAddress = async (lat, long) => {
  const base_url = "https://apis.mapmyindia.com/advancedmaps/v1";
  const rest_key = "650450edaf48bec9e49c45f2baf31d7f";

  const reverse_geocode_url = base_url + "/" + rest_key + "/" + "rev_geocode";

  const response = await axios.get(reverse_geocode_url, {
    params: {
      lat: lat,
      lng: long,
      REST_KEY: rest_key,
    },
  });
  console.log("res_status:", response.status);
  if (response.status == 200) {
    console.log(
      util.inspect(response.data.results.formatted_address, false, null, true)
    );
    return response.data.results[0].formatted_address;
  }
  if (response.status == 204) {
    console.log("Not Found");
    return response;
  }
  if (response.status == 400) {
    console.log("Bad Request");
    return response;
  }
  if (response.status == 401) {
    console.log("Api access Denied");
    return response;
  }
  if (response.status == 403) {
    console.log("Forbidden");
    return response;
  }
  if (response.status == 500) {
    console.log("Something went wrong");
    return response;
  }
  if (response.status == 503) {
    console.log("Internal Server error");
    return response;
  }
};
const calculateETAandDistance = async (source, destination) => {
  const base_url = "https://apis.mapmyindia.com/advancedmaps/v1";
  const rest_key = "650450edaf48bec9e49c45f2baf31d7f";
  const resources = "distance_matrix";
  const profile = "driving";
  var geopositions = "";

  const src = source.toString().split(",");
  const src_cordinates = src[1] + "," + src[0];
  console.log("geosrc:", src_cordinates);

  const dest = destination.toString().split(",");
  const dest_cordinates = dest[1] + "," + dest[0];
  console.log("geodest:", dest_cordinates);

  geopositions = src_cordinates + ";" + dest_cordinates;

  const distan_matrix_url =
    base_url +
    "/" +
    rest_key +
    "/" +
    resources +
    "/" +
    profile +
    "/" +
    geopositions;
  console.log(distan_matrix_url);
  const response = await axios.get(distan_matrix_url);
  console.log("res_status:", response.status);
  if (response.status == 200) {
    console.log(
      util.inspect(response.data.results.distances[0][1], false, null, true)
    );
    const distance = response.data.results.distances[0][1] / 1000;
    const duration = response.data.results.durations[0][1] / 60;
    console.log(distance, duration);
    //const ETA = moment.duration(Math.ceil(duration), "minutes");
    const ETA = "PT" + Math.ceil(duration) + "M";

    return { status: response.status, ETA: ETA, distance: distance };
  } else if (response.status == 204) {
    return [204, "Failed", "DB Connection error"];
  } else if (response.status == 400) {
    return [400, "Failed", "Bad request"];
  } else if (response.status == 401) {
    return [401, "Failed", "API access denied"];
  } else if (response.status == 403) {
    return [403, "Failed", "Forbidden"];
  } else if (response.status == 412) {
    return [
      412,
      "Failed",
      "Precondition Failed, i.e. Some existing pre-condition in formulating a valid API request was not fulfilled.",
    ];
  } else if (response.status == 500) {
    return [500, "Failed", "Something went wrong"];
  } else if (response.status == 503) {
    return [503, "Failed", "Internal server error"];
  }
};

module.exports = {
  calculateDurationAndFare,
  getEstimatedFareDetails,
  applyPriceLogicDetails,
  calculateAddress,
  calculateETAandDistance,
};
