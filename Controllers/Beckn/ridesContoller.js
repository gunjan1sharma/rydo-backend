const util = require("util");
const moment = require("moment");
const { Op } = require("sequelize");
const { MongoClient } = require("mongodb");
const { models } = require("../../Config/dbIndex.js");
const axios = require("axios");
const {
  ACKResponse,
  NACKResponse,
  ErrResponse,
} = require("../../Utils/Beckn/becknResponse.js");

const UserRequests = models.UserRequests;
const Providers = models.Providers;
const ProviderServices = models.ProviderServices;
const ServiceTypes = models.ServiceTypes;

const checkRidesScheduler = async () => {
  try {
    var acceptedRides = await fetchConfirmedRides("ALL", "confirm_rides");
    console.log("ride det: ", acceptedRides);

    if (acceptedRides.length > 0) {
      for (var i = 0; i < acceptedRides.length; i++) {
        var ride = acceptedRides[i];
        var order = ride.message.order;
        var transaction_id = ride.context.transaction_id;
        var prop = "ttl";
        if (ride.context.hasOwnProperty(prop)) {
          // var ttl_value = ride.context.ttl.split("T")[1];
          // var time_to_expire = ttl_value.split(
          //   ttl_value.charAt(ttl_value.length - 1)
          // );
          // var units = ttl_value.charAt(ttl_value.length - 1);
          // console.log("time_to_expire(TTL): " + time_to_expire);
          // console.log("units: " + units);
          // if (units == "H") {
          //   units = "hours";
          // } else if (units == "M") {
          //   units = "minutes";
          // } else units = "seconds";
          var time_to_expire = moment.duration(ride.context.ttl).get("minutes");
          var units = "minutes";
          var prop1 = "timestamp";
          if (ride.context.hasOwnProperty(prop1)) {
            var created_time = moment(
              ride.context.timestamp,
              "YYYY-MM-DD HH:mm:ss"
            ).format("YYYY-MM-DD HH:mm:ss");
          } else {
            var created_time = moment(
              ride.message.order.created_at,
              "YYYY-MM-DD HH:mm:ss"
            ).format("YYYY-MM-DD HH:mm:ss");
          }
        } else {
          var time_to_expire = "2";
          var units = "minutes";
          console.log(
            "time_to_expire(OUR TIMEOUT): " + time_to_expire + " " + units
          );
          var created_time = moment(
            ride.message.order.updated_at,
            "YYYY-MM-DD HH:mm:ss"
          ).format("YYYY-MM-DD HH:mm:ss");
        }

        time_to_expire = parseInt(time_to_expire);
        var expiry_time_val = moment(created_time).add(time_to_expire, units);
        var expiry_time = moment(expiry_time_val).format("YYYY-MM-DD HH:mm:ss");
        console.log("created time: " + created_time);
        console.log("expiry time: " + expiry_time);

        var current_time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
        console.log("current time: " + current_time);

        var isValid = moment(expiry_time).isAfter(current_time);
        console.log("isValid: " + isValid);

        if (!isValid) {
          order.updated_at = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          console.log("check1");
          if (ride.context.hasOwnProperty(prop)) {
            console.log("check2");
            order.fulfillment.state = "REQUEST_TIMEOUT";
            console.log("check2a");
            var ride_status = { status: "NO_DRIVER_ACCEPTED" };
            var rideDet = await UserRequests.update(ride_status, {
              where: { transaction_id: transaction_id },
            });
            console.log("updated ride status: " + rideDet);
            console.log("check3");
            const res = await saveToDb(ride, "bpp_responses");

            console.log("check4");
            await deleteFromDb(ride.context.transaction_id, "confirm_rides");
            console.log("deleting timeout reqs from confirm rides");
            console.log("check5");
            return;
          } else {
            order.fulfillment.state = "NO_DRIVER_ACCEPTED";
            order.status = "NOT FULFILLED";
            var ride_status = { status: "NO_DRIVER_ACCEPTED" };
            console.log(transaction_id);
            var rideDet = await UserRequests.update(ride_status, {
              where: { transaction_id: transaction_id },
            });
            console.log("updated ride status: " + rideDet);
            var res = await sendOnConfirmResponse(ride);
            console.log("onsendconfirm:", res.statusCode);
            if (res.statusCode == 200) {
              //if(res.status==200){
              await deleteFromDb(ride.context.transaction_id, "confirm_rides");
              console.log("deleting expired reqs from confirm rides");
              return;
            } else {
              console.log("sendin error");
              return;
            }
          }
        }

        // var acceptedRide = await UserRequests.findOne({
        //   where: { transaction_id: ride.context.transaction_id },
        // });
        // console.log("status: ", acceptedRide.status);
        // if (acceptedRide.status == "ACCEPTED") {
        //   //order = ride.message.order;

        //   order.fulfillment.agent = {};
        //   order.fulfillment.vehicle = {};
        //   const driver = await Providers.findOne({
        //     where: { id: acceptedRide.provider_id },
        //   });
        //   console.log(driver);
        //   const vehicle = await ProviderServices.findOne({
        //     where: { provider_id: driver.id },
        //   });
        //   const category = await ServiceTypes.findOne({
        //     where: { id: vehicle.service_type_id },
        //   });
        //   console.log("catgry: ", category);
        //   order.fulfillment.agent.description = "Driver Details";
        //   order.fulfillment.agent.phone = driver.mobile;
        //   order.fulfillment.agent.email = driver.email;
        //   order.fulfillment.agent.gender = driver.gender;

        //   order.fulfillment.vehicle.description = "Vehicle Details";
        //   order.fulfillment.vehicle.model = vehicle.model;
        //   order.fulfillment.vehicle.registration = vehicle.service_number;
        //   order.fulfillment.vehicle.category = category.name;
        //   order.fulfillment.vehicle.capacity = category.capacity;

        //   order.fulfillment.state = acceptedRide.status;
        //   order.status = "ACTIVE";
        //   order.updated_at = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        //   var res = await sendOnConfirmResponse(ride);
        //   console.log("onsendconfirm:", res.statusCode);
        //   if (res.statusCode == 200) {
        //     //if (res.status == 200) {

        //     await deleteFromDb(ride.context.transaction_id, "confirm_rides");
        //     console.log("deleted from confirm rides");
        //     return res;
        //   } else {
        //     console.log("sendin error");
        //   }
        // }
      }
    } else {
      console.log("no rides");
      // order.status = "No rides available now";
      // order.fulfillment.agent = {};
      // order.fulfillment.vehicle = {};
      //await sendOnConfirmResponse(ride);
    }
  } catch (error) {
    console.log(error.response);
    var res = await ErrResponse(err);
    return res;
  }
};

const fetchConfirmedRides = async (transaction_id, collectionName) => {
  const mongo_url =
    "mongodb://rydoadmin:321_db_odyR@35.174.145.56:27017/protocol_server.v2?authSource=admin";
  const client = new MongoClient(mongo_url);
  try {
    await client.connect();
    console.log("Mongo db connected.");
    var result;

    //Fetching all  data from db.
    if (transaction_id == "ALL") {
      result = await client
        .db("protocol_server-v2")
        .collection(collectionName)
        .find()
        .toArray();
    }

    //fetching a particular ride based on transaction_id;
    else {
      result = await client
        .db("protocol_server-v2")
        .collection(collectionName)
        .findOne({ "context.transaction_id": transaction_id });
    }

    if (result.length > 0)
      console.log("Data: ", util.inspect(result, false, null, true));
    else console.log(result);
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    console.log("connection closed");
  }
};

const deleteFromDb = async (transaction_id, collectionName) => {
  console.log("delete:", transaction_id);
  const mongo_url =
    "mongodb://rydoadmin:321_db_odyR@35.174.145.56:27017/protocol_server.v2?authSource=admin";
  const client = new MongoClient(mongo_url);
  try {
    await client.connect();
    console.log("Mongo db connected.");

    //deleting  data from db.
    const result = await client
      .db("protocol_server-v2")
      .collection(collectionName)
      .deleteOne({
        $and: [
          { "context.transaction_id": transaction_id },
          { "context.action": "on_confirm" },
        ],
      });
    console.log("Data deleted: ", util.inspect(result, false, null, true));
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    console.log("connection closed");
  }
};

const saveToDb = async (data, collectionName) => {
  console.log("saving to db");
  const mongo_url =
    "mongodb://rydoadmin:321_db_odyR@35.174.145.56:27017/protocol_server.v2?authSource=admin";
  const client = new MongoClient(mongo_url);
  try {
    await client.connect();
    console.log("Mongo db connected.");

    //Inserting data to db.
    const result = await client
      .db("protocol_server-v2")
      .collection(collectionName)
      .replaceOne(
        {
          $and: [
            {
              "context.transaction_id": data.context.transaction_id,
              "context.message_id": data.context.message_id,
              "context.action": data.context.action,
            },
          ],
        },
        data,
        { upsert: true }
      );
    //console.log(`New data created with the following id: ${result.upsertedId}`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    console.log("connection closed");
  }
};

const sendOnConfirmResponse = async (onConfirmResponseBody) => {
  try {
    await saveToDb(onConfirmResponseBody, "bpp_responses");
    // const res = {
    //   statusCode: 200,
    //   status: "success",
    //   data: onConfirmResponseBody,
    // };
    // return res;
    const action = onConfirmResponseBody.context.action;
    console.log("calling webhook at http://35.174.145.56:3001/" + action);
    const result = await axios.post(
      "http://35.174.145.56:3001/" + action,
      onConfirmResponseBody
    );
    console.log(util.inspect(result, false, null, true));
    return result;
  } catch (error) {
    console.log(error.response);
    return ErrResponse(error);
  }
};

const sendAcceptedRide = async (accpt_ride) => {
  try {
    console.log("accpt_ride: " + accpt_ride.transaction_id);
    var acceptedRide_det = await fetchConfirmedRides(
      accpt_ride.transaction_id,
      "confirm_rides"
    );
    console.log("ride det: ", acceptedRide_det);
    if (Object.keys(acceptedRide_det)) {
      var ride = acceptedRide_det;
      var order = ride.message.order;
      var transaction_id = ride.context.transaction_id;
      var prop = "ttl";
      if (ride.context.hasOwnProperty(prop)) {
        // var ttl_value = ride.context.ttl.split("T")[1];
        // var time_to_expire = ttl_value.split(
        //   ttl_value.charAt(ttl_value.length - 1)
        // );
        // var units = ttl_value.charAt(ttl_value.length - 1);
        // console.log("time_to_expire(TTL): " + time_to_expire);
        // console.log("units: " + units);
        // if (units == "H") {
        //   units = "hours";
        // } else if (units == "M") {
        //   units = "minutes";
        // } else units = "seconds";
        var time_to_expire = moment.duration(ride.context.ttl).get("minutes");
        var units = "minutes";
        var prop1 = "timestamp";
        if (ride.context.hasOwnProperty(prop1)) {
          var created_time = moment(
            ride.context.timestamp,
            "YYYY-MM-DD HH:mm:ss"
          ).format("YYYY-MM-DD HH:mm:ss");
        } else {
          var created_time = moment(
            ride.message.order.created_at,
            "YYYY-MM-DD HH:mm:ss"
          ).format("YYYY-MM-DD HH:mm:ss");
        }
      } else {
        var time_to_expire = "2";
        var units = "minutes";
        console.log(
          "time_to_expire(OUR TIMEOUT): " + time_to_expire + " " + units
        );
        var created_time = moment(
          ride.message.order.updated_at,
          "YYYY-MM-DD HH:mm:ss"
        ).format("YYYY-MM-DD HH:mm:ss");
      }

      time_to_expire = parseInt(time_to_expire);
      var expiry_time_val = moment(created_time).add(time_to_expire, units);
      var expiry_time = moment(expiry_time_val).format("YYYY-MM-DD HH:mm:ss");
      console.log("created time: " + created_time);
      console.log("expiry time: " + expiry_time);

      var current_time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
      console.log("current time: " + current_time);

      var isValid = moment(expiry_time).isAfter(current_time);
      console.log("isValid: " + isValid);

      if (!isValid) {
        order.updated_at = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        if (ride.context.hasOwnProperty(prop)) {
          order.fulfillment.state = "REQUEST_TIMEOUT";
          var ride_status = { status: "NO_DRIVER_ACCEPTED" };
          var rideDet = await UserRequests.update(ride_status, {
            where: { transaction_id: transaction_id },
          });
          console.log("updated ride status: " + rideDet);
          const res = await saveToDb(ride, "bpp_responses");

          await deleteFromDb(ride.context.transaction_id, "confirm_rides");
          console.log("deleting timeout reqs from confirm rides");
          return;
        } else {
          order.fulfillment.state = "NO_DRIVER_ACCEPTED";
          order.status = "CANCELLED";
          var ride_status = { status: "NO_DRIVER_ACCEPTED" };
          console.log(transaction_id);
          var rideDet = await UserRequests.update(ride_status, {
            where: { transaction_id: transaction_id },
          });
          console.log("updated ride status: " + rideDet);
          var res = await sendOnConfirmResponse(ride);
          console.log("onsendconfirm:", res.statusCode);
          // if (res.statusCode == 200) {
          if (res.status == 200) {
            await deleteFromDb(ride.context.transaction_id, "confirm_rides");
            console.log("deleting expired reqs from confirm rides");
            return;
          } else {
            console.log("sendin error");
            return;
          }
        }
      }

      //order = ride.message.order;
      if ((accpt_ride.status = "ACCEPTED")) {
        order.fulfillment.agent = {};
        order.fulfillment.vehicle = {};
        const driver = await Providers.findOne({
          where: { id: accpt_ride.provider_id },
        });
        console.log(driver);
        const vehicle = await ProviderServices.findOne({
          where: { provider_id: driver.id },
        });
        const category = await ServiceTypes.findOne({
          where: { id: vehicle.service_type_id },
        });
        console.log("catgry: ", category);
        order.fulfillment.agent.description = "Driver Details";
        order.fulfillment.agent.phone = driver.mobile;
        order.fulfillment.agent.email = driver.email;
        order.fulfillment.agent.gender = driver.gender;

        order.fulfillment.vehicle.description = "Vehicle Details";
        order.fulfillment.vehicle.model = vehicle.model;
        order.fulfillment.vehicle.registration = vehicle.service_number;
        order.fulfillment.vehicle.category = category.name;
        order.fulfillment.vehicle.capacity = category.capacity;

        order.fulfillment.state = accpt_ride.status;
        order.status = "ACTIVE";
        order.updated_at = moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ");
      } else if ((accpt_ride.status = "NO_DRIVER_ACCEPTED")) {
        order.fulfillment.state = accpt_ride.status;
        order.status = "COMPLETED";
        order.updated_at = moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ");
      }

      var res = await sendOnConfirmResponse(ride);
      console.log("onsendconfirm:", res.statusCode);
      // if (res.statusCode == 200) {
      if (res.status == 202) {
        await deleteFromDb(ride.context.transaction_id, "confirm_rides");
        console.log("deleted from confirm rides");
        return res;
      } else {
        console.log("sendin error");
      }
    }
  } catch (error) {
    console.log(error.response);
    var res = await ErrResponse(err);
    return res;
  }
};
module.exports = { checkRidesScheduler, sendAcceptedRide };
