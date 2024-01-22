const util = require("util");
const moment = require("moment");
const { MongoClient } = require("mongodb");

const userController = require("../../Controllers/User/userController.js");
const calculateDurationAndFare = require("../../Utils/Beckn/calculateDistanceandFareUtil.js");
const {
  ACKResponse,
  NACKResponse,
  ErrResponse,
} = require("../../Utils/Beckn/becknResponse.js");

const initRequest = async (req, res) => {
  try {
    console.log("Signature: ", req.headers["authorization"]);
    console.log("Init request: ", util.inspect(req.body, false, null, true));

    const context = req.body.context;
    const order = req.body.message.order;

    var prop1 = "items";
    var prop2 = "gps";
    console.log(order.hasOwnProperty(prop1), order.hasOwnProperty(prop2));

    if (!order.hasOwnProperty(prop1)) {
      console.log("need item");
      return res.status(404).json({
        message: {
          description: "No Item found",
          status: "NACK",
        },
        error: {
          description: "No Item found",
          type: "JSON_SCHEMA_ERROR",
          code: 30004,
        },
      });
    }

    if (
      !order.fulfillment.stops[
        order.fulfillment.stops.length - 1
      ].location.hasOwnProperty(prop2)
    ) {
      console.log("need end gps cordinates");
      return res.status(404).json({
        context: context,
        message: {
          description: "Fulfillment unavialable",
          status: "NACK",
        },
        error: {
          description: "end cordinates unavailable",
          type: "JSON_SCHEMA_ERROR",
          code: 30008,
        },
      });
    }

    const itemId = order.items[0].hasOwnProperty("id") ? order.items[0].id : 5;

    //checking if a valid item has been selected.
    // const transaction = await fetchFromDb(
    //   { transaction_id: context.transaction_id, action: "on_select" },
    //   "bpp_responses"
    // );
    // var trx_item = transaction.message.order.items.filter(
    //   (item) => item.id == itemId
    // );
    // console.log(trx_item.length);
    // if (trx_item.length == 0) {
    //   console.log("Invalid Item");
    //   return "Invalid Item";
    // }

    //fetching the previous search responseBody to get initial search cordinates cached.
    // const resultFromDb = await fetchFromDb(
    //   { transaction_id: context.transaction_id, action: "select" },
    //   "bpp_requests"
    // );
    // if (!resultFromDb) {
    //   console.log("invalid request");
    //   return;
    // }

    //saving select request to db;
    await saveToDb(req.body, "bpp_requests");

    const start = order.fulfillment.stops[0].location.gps;
    const start_cordinates = start.toString().split(",");
    console.log(start_cordinates[0], start_cordinates[1]);

    const end =
      order.fulfillment.stops[order.fulfillment.stops.length - 1].location.gps;
    const end_cordinates = end.toString().split(",");
    console.log(end_cordinates[0], end_cordinates[1]);

    const fareAndDuration =
      await calculateDurationAndFare.calculateDurationAndFare(start, end);
    if (fareAndDuration[0] != 200) {
      return {
        statusCode: fareAndDuration[0],
        status: "failed",
        message: fareAndDuration[2],
      };
    }
    const est_fare = fareAndDuration[1].estimated_fare;
    const tax_price = fareAndDuration[1].tax_price;

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

    payment.type = "POST-FULFILLMENT";
    payment.collected_by = "BPP";
    payment.status = "NOT-PAID";

    order.payment = payment;

    const response = await generateOnInitResponse(context, order);
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
    return ErrResponse(error);
  }
};

const generateOnInitResponse = async (contxt, orderFromInit) => {
  console.log("oninitresponse");
  var context = {};
  context = contxt;
  context.action = "on_init";
  // context.ttl = moment.duration(Math.ceil(5), "minutes");
  console.log(orderFromInit);
  var onInitResponseBody;
  const order = {
    items: orderFromInit.items,
    billing: orderFromInit.billing,
    fulfillment: orderFromInit.fulfillment,
    quote: orderFromInit.quote,
    payment: orderFromInit.payment,
  };
  console.log("sending oninit");
  onInitResponseBody = {
    context: context,
    message: { order: order },
  };
  await saveToDb(onInitResponseBody, "bpp_responses");
  return {
    status: 200,
    message: onInitResponseBody,
  };
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
  } finally {
    await client.close();
    console.log("connection closed");
  }
};

module.exports = { initRequest };
