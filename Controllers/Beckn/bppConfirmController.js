const util = require("util");
const moment = require("moment");
const { MongoClient } = require("mongodb");
const calculateDurationAndFare = require("../../Utils/Beckn/calculateDistanceandFareUtil.js");
const userController = require("../../Controllers/User/userController.js");
const { models } = require("../../Config/dbIndex.js");
const notificationServices = require("../../Services/common/notification.js");
const {
  ACKResponse,
  NACKResponse,
  ErrResponse,
} = require("../../Utils/Beckn/becknResponse.js");

const Users = models.Users;
const UserRequests = models.UserRequests;
const ProviderDevices = models.ProviderDevices;

const confirmRequest = async (req, res) => {
  try {
    console.log("Signature: ", req.headers["authorization"]);
    console.log("Confirm request: ", util.inspect(req.body, false, null, true));

    const context = req.body.context;
    const order = req.body.message.order;
    const DISTANCE_RADIUS = 5;
    const DEFAULT_SERVICE_TYPE_ID = 5;

    //cheking if a confirm request has already been placed
    const resultFromDb = await fetchFromDb(
      { transaction_id: context.transaction_id, action: "on_confirm" },
      "bpp_responses"
    );
    if (resultFromDb.message.order.status == "COMPLETE") {
      console.log("Request has already been placed");
      context.action = "on_confirm";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Fulfillment unavialable",
          status: "NACK",
        },
        error: {
          description: "fulfillment already completed",
          type: "JSON_SCHEMA_ERROR",
          code: "30008",
        },
      };
      // });
    }

    if (
      resultFromDb.message.order.status == "ACTIVE" ||
      resultFromDb.message.order.status == "CANCELLED"
    ) {
      console.log("Request is in progress");
      context.action = "on_confirm";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          order: {},
          description: "Fulfillment unavialable",
          status: "NACK",
        },
        error: {
          description: "fulfillment in progress",
          type: "JSON_SCHEMA_ERROR",
          code: "30008",
        },
      };
      // });
    }

    var prop1 = "items";
    var prop2 = "gps";
    var prop3 = "phone";
    var prop4 = "quote";
    var prop5 = "payment";
    console.log(
      order.hasOwnProperty(prop1),
      order.hasOwnProperty(prop2),
      order.hasOwnProperty(prop3),
      order.hasOwnProperty(prop4),
      order.hasOwnProperty(prop5)
    );
    // if (!order.hasOwnProperty(prop1)) {
    //   console.log("need item");
    //   return res.status(404).json({
    //     context: context,
    //     message: {
    //       description: "No Item found",
    //       status: "NACK",
    //     },
    //     error: {
    //       description: "No Item found",
    //       type: "JSON_SCHEMA_ERROR",
    //       code: 30004,
    //     },
    //   });
    // }

    if (
      !order.fulfillment.stops[
        order.fulfillment.stops.length - 1
      ].location.hasOwnProperty(prop2)
    ) {
      console.log("need start and end gps cordinates");
      context.action = "on_confirm";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Fulfillment unavialable",
          status: "NACK",
        },
        error: {
          description: "end cordinates unavailable",
          type: "JSON_SCHEMA_ERROR",
          code: "30008",
        },
      };
      // });
    }

    if (!order.billing.hasOwnProperty(prop3)) {
      console.log("need customer phone");
      context.action = "on_confirm";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Customer contact unavailable",
          status: "NACK",
        },
        error: {
          description: "Customer contact unavailable",
          type: "JSON_SCHEMA_ERROR",
          code: "40003",
        },
      };
      //});
    }

    if (!order.hasOwnProperty(prop4)) {
      console.log("need quote");
      context.action = "on_confirm";
      // return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Quote unavailable",
          status: "NACK",
        },
        error: {
          description: "Quote unavailable",
          type: "JSON_SCHEMA_ERROR",
          code: "40003",
        },
      };
      //});
    }
    if (!order.hasOwnProperty(prop5)) {
      console.log("need payment");
      context.action = "on_confirm";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Payment not supported,Only cash mode",
          status: "NACK",
        },
        error: {
          description: "Payment not supported,only cash mode",
          type: "JSON_SCHEMA_ERROR",
          code: "40004",
        },
        //});
      };
    }

    if (order.fulfillment.stops.length < 2) {
      console.log("need both start and end gps cordinates");
      context.action = "on_confirm";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Fulfillment unavialable",
          status: "NACK",
        },
        error: {
          description: "start and end cordinates unavailable",
          type: "JSON_SCHEMA_ERROR",
          code: "30008",
        },
      };
      // });
    }

    const itemId = order.hasOwnProperty("items")
      ? order.items[0].hasOwnProperty("id")
        ? order.items[0].id
        : DEFAULT_SERVICE_TYPE_ID.toString()
      : DEFAULT_SERVICE_TYPE_ID.toString();
    console.log("itemId:" + itemId);

    //checking if a valid item has been initiated.
    // if (itemId) {
    //   const transaction = await fetchFromDb(
    //     { transaction_id: context.transaction_id, action: "on_init" },
    //     "bpp_responses"
    //   );
    //   var trx_item = transaction.message.order.items.filter(
    //     (item) => item.id == itemId
    //   );
    //   console.log(trx_item.length);
    //   if (trx_item.length == 0) {
    //     console.log("Invalid Item");
    //     return res.status(404).json({
    //       context: context,
    //       message: {
    //         description: "Item not found",
    //         status: "NACK",
    //       },
    //       error: {
    //         description: "Invalid item",
    //         type: "JSON_SCHEMA_ERROR",
    //         code: 40004,
    //       },
    //     });
    //   }
    // }

    //saving select request to db;
    await saveToDb(req.body, "bpp_requests");

    //create a beckn user in users table
    const becknUser = {};
    becknUser.first_name = order.billing.name || "Beckn Customer";
    becknUser.email = order.billing.email || "";
    becknUser.mobile = order.billing.phone;
    becknUser.user_source = "EXTERNAL";
    becknUser.latitude = order.fulfillment.stops[0].location.gps
      .toString()
      .split(",")[0];
    becknUser.longitude = order.fulfillment.stops[0].location.gps
      .toString()
      .split(",")[1];
    var where = { mobile: becknUser.mobile };
    const createdUser = await updateOrCreate(Users, where, becknUser);
    console.log(util.inspect(createdUser, false, null, true));
    if (createdUser) {
      var becknUserId = createdUser.item.id;
      console.log("beckn user created:", becknUserId);
    } else {
      console.log("something went wrong");
    }

    //creating a ride request for the ride in users request table
    const becknUserRequest = {};

    becknUserRequest.user_id = becknUserId;
    becknUserRequest.provider_id = 101;
    becknUserRequest.cancelled_by = "NONE";
    becknUserRequest.status = "SEARCHING";
    becknUserRequest.distance = 0;
    becknUserRequest.s_latitude = order.fulfillment.stops[0].location.gps
      .toString()
      .split(",")[0];
    becknUserRequest.s_longitude = order.fulfillment.stops[0].location.gps
      .toString()
      .split(",")[1];
    becknUserRequest.d_latitude = order.fulfillment.stops[
      order.fulfillment.stops.length - 1
    ].location.gps
      .toString()
      .split(",")[0];
    becknUserRequest.d_longitude = order.fulfillment.stops[
      order.fulfillment.stops.length - 1
    ].location.gps
      .toString()
      .split(",")[1];
    becknUserRequest.transaction_id = context.transaction_id;
    becknUserRequest.service_type_id =
      itemId !== "" || itemId !== NULL ? itemId : 5;
    becknUserRequest.payment_mode = "CASH";

    const start = order.fulfillment.stops[0].location.gps;
    const start_cordinates = start.toString().split(",");
    console.log(start_cordinates[0], start_cordinates[1]);

    const end =
      order.fulfillment.stops[order.fulfillment.stops.length - 1].location.gps;
    const end_cordinates = end.toString().split(",");
    console.log(end_cordinates[0], end_cordinates[1]);

    const saddress = await calculateDurationAndFare.calculateAddress(
      start_cordinates[0],
      start_cordinates[1]
    );

    const daddress = await calculateDurationAndFare.calculateAddress(
      end_cordinates[0],
      end_cordinates[1]
    );
    console.log("src add:" + util.inspect(saddress, true, null, false));
    console.log("dest add:" + util.inspect(daddress, true, null, false));
    becknUserRequest.s_address = saddress;
    becknUserRequest.d_address = daddress;

    var cancellation_terms = [
      {
        fulfillment_state: {
          name: "ACCEPTED",
          long_desc:
            "Ride can be cancelled after it is accepted,but not after the pick up.",
        },
        reason_required: true,
      },
      {
        fulfillment_state: {
          name: "ARRIVED",
          long_desc:
            "Ride can be cancelled until driver arrives,but not after the ride started.",
        },
        reason_required: true,
      },
    ];
    order.cancellation_terms = cancellation_terms;

    const fareAndDuration =
      await calculateDurationAndFare.calculateDurationAndFare(start, end);
    if (fareAndDuration[0] != 200) {
      return {
        statusCode: fareAndDuration[0],
        status: "failed",
        message: fareAndDuration[2],
      };
    }
    var est_fare = fareAndDuration[1].estimated_fare;
    var tax_price = fareAndDuration[1].tax_price;
    var distance = fareAndDuration[3];
    const ETA = fareAndDuration[2];
    const quote = {
      price: {},
      breakup: [],
    };
    quote.price.currency = "Rs. ";
    quote.price.value = est_fare.toString();
    const ride_fare = {
      title: "",
      price: {},
    };
    ride_fare.title = "Ride Fare";
    ride_fare.price.currency = "Rs. ";
    ride_fare.price.value = (est_fare - tax_price).toString();
    quote.breakup.push(ride_fare);

    const tax_fare = {
      title: "",
      price: {},
    };
    tax_fare.title = "Tax";
    tax_fare.price.currency = "Rs. ";
    tax_fare.price.value = tax_price.toString();
    quote.breakup.push(tax_fare);

    order.quote = quote;

    const payment = {};
    payment.id = "PAYMENTID";
    payment.collected_by = "BPP";
    payment.type = "POST-FULFILLMENT";
    payment.status = "NOT-PAID";

    order.payment = payment;

    const provider = {};
    provider.descriptor = { name: "Rydo India" };
    order.provider = provider;

    becknUserRequest.distance = distance;
    console.log("dis: ", becknUserRequest.distance);
    becknUserRequest.estimated_fare = est_fare;

    where = { transaction_id: becknUserRequest.transaction_id };
    const becknUserRequestItem = await updateOrCreate(
      UserRequests,
      where,
      becknUserRequest
    );
    console.log(becknUserRequestItem);
    if (becknUserRequestItem) {
      console.log("user req created", becknUserRequestItem.id);
    } else {
      console.log("something went wrong");
    }

    const becknuserDet = await UserRequests.findOne({
      where: { transaction_id: becknUserRequest.transaction_id },
    });
    console.log("orderid: ", becknuserDet.id);
    order.id = becknuserDet.id;
    order.payment.id = "PAYMENTID-" + becknuserDet.id;
    order.fulfillment.id = "FULFILLMENTID-" + becknuserDet.id;

    var source_cordinates = {
      s_latitude: start_cordinates[0],
      s_longitude: start_cordinates[1],
      service_type_id: becknuserDet.service_type_id,
    };
    console.log(
      "source_cordinates: " + util.inspect(source_cordinates, false, null, true)
    );

    //finding near by drivers
    const driversList = await userController.getdrivers(
      source_cordinates,
      DISTANCE_RADIUS
    );
    //var driversList = [1];
    if (driversList.length == 0) {
      console.log("no rides available");
      order.fulfillment.state = "NO_DRIVERS_FOUND";
      response = await generateOnConfirmResponse(context, order);
    } else {
      //notifying nearest drivers

      //await notifyDriver(driversList, becknUserId, becknUserRequestId);

      const notification_reason = "new_ride_request";
      const title = "New Ride Request";
      const body = "You got a new Ride request!!!";
      const type = "ride";
      const stickey = true;

      const provider_devices = await ProviderDevices.findOne({
        where: { provider_id: becknuserDet.provider_id },
      });

      console.log("Device Token " + provider_devices.token);
      console.log("Title " + title);
      console.log("Body " + body);
      console.log("Reason " + notification_reason);
      console.log("Type " + type);
      console.log("Stickey " + stickey);
      console.log("User Id " + becknuserDet.user_id);
      console.log("Provider id " + becknuserDet.provider_id);
      console.log("Request Id " + becknuserDet.id);
      var notification = await notificationServices.notifyDriver(
        provider_devices.token,
        title,
        body,
        becknuserDet,
        notification_reason,
        type,
        stickey,
        becknuserDet.user_id,
        becknuserDet.provider_id,
        becknuserDet.id
      );
      order.fulfillment.state = "SEARCHING";
      response = await generateOnConfirmResponse(context, order);
    }

    console.log(
      "Response: ",
      util.inspect(response.message, false, null, true)
    );
    return response.message;
    // if (response.status != 200) {
    //   var NACK = await NACKResponse(response);
    //   return res.status(response.status).json({ NACK });
    // }
    // var ACK = await ACKResponse(response);
    // return res.status(200).json({ ACK });
  } catch (error) {
    console.log(error.response);
    var NACK = await ErrResponse(error);
    return res.status(error.response.status).json({ NACK });
  }
};

const generateOnConfirmResponse = async (contxt, orderFromConfirm) => {
  try {
    var context = {};
    // context.domain = contxt.domain;
    // context.country = contxt.country;
    // context.city = contxt.city;
    // context.core_version = contxt.core_version;
    // context.transaction_id = contxt.transaction_id;
    // context.message_id = contxt.message_id;
    // context.bap_id = contxt.bap_id;
    // context.bap_uri = contxt.bap_uri;
    context = contxt;
    context.action = "on_confirm";

    var onConfirmResponseBody;
    const order = {
      id: "ORDER-" + orderFromConfirm.id,
      status: orderFromConfirm.status,
      provider: orderFromConfirm.provider,
      items: orderFromConfirm.items,
      billing: orderFromConfirm.billing,
      fulfillment: orderFromConfirm.fulfillment,
      cancellation_terms: orderFromConfirm.cancellation_terms,
      quote: orderFromConfirm.quote,
      payment: orderFromConfirm.payment,
      created_at: moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ"),
      updated_at: moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ"),
    };

    onConfirmResponseBody = {
      context: context,
      message: { order: order },
    };
    if (order.fulfillment.state == "NO_DRIVERS_FOUND") {
      await saveToDb(onConfirmResponseBody, "bpp_responses");
      console.log("saved ride to bpp_responses ");
    } else {
      await saveToDb(onConfirmResponseBody, "confirm_rides");
      console.log("saved ride to confirm_rides ");
    }

    return {
      status: 200,
      message: onConfirmResponseBody,
    };
  } catch (error) {
    console.log(error.response);
    var NACK = await ErrResponse(error);
    return res.status(error.response.status).json({ NACK });
  }
};

const updateOrCreate = async (model, whereparam, newItem) => {
  try {
    console.log(whereparam);
    // First try to find the record
    const foundItem = await model.findOne({ where: whereparam });
    if (!foundItem) {
      // Item not found, create a new one
      const item = await model.create(newItem);
      return { item, created: true };
    }
    // Found an item, update it
    var item = await model.update(newItem, { where: whereparam });
    item = await model.findOne({ where: whereparam });
    return { item, created: false };
  } catch (e) {
    console.error(e);
    return e;
  }
};
const saveToDb = async (data, collectionName) => {
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
    console.log(`New data created with the following id: ${result.upsertedId}`);
  } catch (e) {
    console.error(e);
    return e;
  } finally {
    await client.close();
    console.log("connection closed");
  }
};
const fetchFromDb = async (data, collectionName) => {
  console.log(data);
  const mongo_url =
    "mongodb://rydoadmin:321_db_odyR@35.174.145.56:27017/protocol_server.v2?authSource=admin";
  const client = new MongoClient(mongo_url);
  try {
    await client.connect();
    console.log("Mongo db connected.");

    //Fetching  data from db.
    const result = await client
      .db("protocol_server-v2")
      .collection(collectionName)
      .findOne({
        $and: [
          { "context.transaction_id": data.transaction_id },
          { "context.action": data.action },
        ],
      });
    console.log("Data: ", util.inspect(result, false, null, true));
    return result;
  } catch (e) {
    console.error(e);
    return e;
  } finally {
    await client.close();
    console.log("connection closed");
  }
};

module.exports = { confirmRequest };
