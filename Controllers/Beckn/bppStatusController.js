const util = require("util");
const moment = require("moment");
const { MongoClient } = require("mongodb");
const {
  calculateETAandDistance,
} = require("../../Utils/Beckn/calculateDistanceandFareUtil.js");

const { models } = require("../../Config/dbIndex.js");
const {
  ACKResponse,
  NACKResponse,
  ErrResponse,
} = require("../../Utils/Beckn/becknResponse.js");

const UserRequests = models.UserRequests;
const Providers = models.Providers;

const statusRequest = async (req, res) => {
  try {
    console.log("Signature: ", req.headers["authorization"]);
    console.log("Status request: ", util.inspect(req.body, false, null, true));

    const context = req.body.context;
    const order = req.body.message;

    var prop1 = "order_id";

    console.log(order.hasOwnProperty(prop1));
    if (!order.hasOwnProperty(prop1)) {
      console.log("need order id");
      return res.status(404).json({
        context: context,
        message: {
          description: "No Order ID",
          status: "NACK",
        },
        error: {
          description: "No Order ID found",
          type: "JSON_SCHEMA_ERROR",
          code: 30004,
        },
      });
    }

    const orderId = order.hasOwnProperty("order_id");

    //checking if a valid item has been initiated.
    if (orderId) {
      const confirmedOrder = await fetchFromDb(
        { transaction_id: context.transaction_id, action: "on_confirm" },
        "bpp_responses"
      );
      var order_item = (confirmedOrder.message.order.id = orderId);
      console.log(order_item.length);
      if (order_item.length == 0) {
        console.log("Invalid Item");
        return res.status(404).json({
          context: context,
          message: {
            description: "Item not found",
            status: "NACK",
          },
          error: {
            description: "Invalid item",
            type: "JSON_SCHEMA_ERROR",
            code: 40004,
          },
        });
      }
    }

    //saving select request to db;
    await saveToDb(req.body, "bpp_requests");
    response = await generateOnStatusResponse(req.body);

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

const generateOnStatusResponse = async (data) => {
  try {
    console.log("Data: ", data);
    var context = {};
    context = data.context;
    context.action = "on_status";

    var onStatusResponseBody;
    var confirmedOrder = await fetchFromDb(context, "bpp_responses");

    var order_details = await UserRequests.findOne({
      where: { transaction_id: context.transaction_id },
    });
    console.log(
      "order details: " + util.inspect(order_details, false, null, true)
    );
    confirmedOrder.message.order.fulfillment.state = order_details.status;
    confirmedOrder.message.order.status = "ACTIVE";

    if (order_details.status == "COMPLETED" && order_details.paid == 1) {
      confirmedOrder.message.order.status = "COMPLETE";
      confirmedOrder.message.order.payment.status = "PAID";
    }

    /*calculating ETA-begin*/
    // var provider = await Providers.findOne({
    //   where: {
    //     id: order_details.provider_id,
    //   },
    // });
    // var source = provider.latitude + "," + provider.longitude;
    // var destination =
    //   confirmedOrder.message.order.fulfillment.stops[0].location.gps;
    // console.log(source, destination);

    // ETA_result = await calculateETAandDistance(source, destination);
    // if (ETA_result.status != 200) {
    //   console.log("ETA error");
    // } else {
    //   var ETA = ETA_result.ETA;
    //   var time = {};
    //   console.log(ETA_result);
    //   time.label = "Driver ETA";
    //   time.duration = ETA;
    //   confirmedOrder.message.order.fulfillment.time = time;
    // }
    /*calculating ETA -end*/

    onStatusResponseBody = {
      context: context,
      message: { order: confirmedOrder.message.order },
    };

    await saveToDb(onStatusResponseBody, "bpp_responses");

    return {
      status: 200,
      message: onStatusResponseBody,
    };
  } catch (error) {
    console.log(error.response);
    var NACK = await ErrResponse(error);
    return res.status(error.response.status).json({ NACK });
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
          { "context.action": "on_confirm" },
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

module.exports = { statusRequest };
