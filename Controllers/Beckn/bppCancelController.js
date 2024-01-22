const util = require("util");
const moment = require("moment");
const { MongoClient } = require("mongodb");

const { models } = require("../../Config/dbIndex.js");
const {
  ACKResponse,
  NACKResponse,
  ErrResponse,
} = require("../../Utils/Beckn/becknResponse.js");

const UserRequests = models.UserRequests;
const ProviderServices = models.ProviderServices;
const Providers = models.Providers;
const ProviderDevices = models.ProviderDevices;
const notificationServices = require("../../Services/common/notification.js");
const Notification = models.Notification;

const cancelRequest = async (req, res) => {
  try {
    console.log("Signature: ", req.headers["authorization"]);
    console.log("Cancel request: ", util.inspect(req.body, false, null, true));

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
          code: 30010,
        },
      });
    }

    if (!order.hasOwnProperty("cancellation_reason_id")) {
      console.log("Invalid cancellation reason");
      context.action = "on_cancel";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Invalid cancellation reason",
          status: "NACK",
        },
        error: {
          description: "Invalid cancellation reason",
          type: "JSON_SCHEMA_ERROR",
          code: 30011,
        },
      };
      //});
    }

    const orderId = order.hasOwnProperty("order_id");
    console.log("orderid: " + orderId);

    //checking if a valid item has been initiated.
    if (orderId) {
      var confirmedOrder = await fetchFromDb(
        { transaction_id: context.transaction_id, action: "on_confirm" },
        "bpp_responses"
      );

      if (!confirmedOrder.message.order.id == orderId) {
        console.log("Invalid Order");
        return res.status(404).json({
          context: context,
          message: {
            description: "Order not found",
            status: "NACK",
          },
          error: {
            description: "Order not found",
            type: "JSON_SCHEMA_ERROR",
            code: 30010,
          },
        });
      }
      console.log("Valid order");
    }
    //saving cancel request to db;
    await saveToDb(req.body, "bpp_requests");

    var cancelOrder = {
      context: {},
      message: {},
    };
    cancelOrder.context = req.body.context;
    cancelOrder.message.order = confirmedOrder.message.order;
    cancelOrder.message.order.cancellation = { cancellation_reason_id: "" };
    cancelOrder.message.order.cancellation.cancellation_reason_id =
      req.body.message.cancellation_reason_id;

    console.log(
      "cancel order: " + util.inspect(cancelOrder, false, null, true)
    );

    var ride_status = await cancelRideRequest(cancelOrder);

    if (ride_status.statusCode != 200) {
      // return { message: {
      //     description: "Cancellation not possible,Please refer cancellation terms",
      //     status: "NACK",
      //   },
      //   error: {
      //     description: "Cancellation not possible",
      //     type: "JSON_SCHEMA_ERROR",
      //     code: 50001	,
      //   }
      // }
      context.action = "on_cancel";
      //return res.status(404).json({
      return {
        context: context,
        message: {
          order: {},
          description:
            "Cancellation not possible,Please refer cancellation terms",
          status: "NACK",
        },
        error: {
          description: "Cancellation not possible",
          type: "JSON_SCHEMA_ERROR",
          code: "50001",
        },
      };
      //});
    } else {
      response = await generateOnCancelResponse(cancelOrder);

      console.log(
        "Response: ",
        util.inspect(response.message, false, null, true)
      );

      return response.message;
      // var ACK = await ACKResponse(response);
      // return res.status(200).json({ ACK });
    }
  } catch (error) {
    console.log(error.response);
    var NACK = await ErrResponse(error);
    return res.status(error.response.status).json({ NACK });
  }
};

const generateOnCancelResponse = async (data) => {
  try {
    console.log("Data: ", data);
    var cancelOrder = data;
    cancelOrder.context.action = "on_cancel";

    var order_details = await UserRequests.findOne({
      where: { transaction_id: cancelOrder.context.transaction_id },
    });
    console.log(
      "order details: " + util.inspect(order_details, false, null, true)
    );

    cancelOrder.message.order.fulfillment.state = order_details.status;
    cancelOrder.message.order.status = "CANCELLED";
    cancelOrder.message.order.cancellation.cancelled_by = "CONSUMER";
    cancelOrder.message.order.updated_at = moment(new Date()).format(
      "YYYY-MM-DDTHH:mm:ssZ"
    );

    var onCancelResponseBody = cancelOrder;
    await saveToDb(onCancelResponseBody, "bpp_responses");

    return {
      status: 200,
      message: onCancelResponseBody,
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

const cancelRideRequest = async (cancelOrder) => {
  try {
    console.log(
      "cancel order: " + util.inspect(cancelOrder, false, null, true)
    );
    const notification_reason = "ride_cancelled_by_passenger";
    const title = "Ride Cancelled";
    const body = "Passenger cancelled this ride";
    const type = "ride";
    const stickey = true;
    var UserRequest = await UserRequests.findOne({
      where: { transaction_id: cancelOrder.context.transaction_id },
    });
    console.log(
      "userreq: " + util.inspect(UserRequest.dataValues, false, null, true)
    );
    if (UserRequest.status == "CANCELLED") {
      return {
        statusCode: 404,
        status: "cancelled",
        message: `Ride already cancelled`,
      };
    }

    if (UserRequest.status == "COMPLETED") {
      return {
        statusCode: 404,
        status: "cancelled",
        message: `Ride already completed`,
      };
    }

    console.log("user status: " + UserRequest.status);
    console.log(
      "reason: " + util.inspect(cancelOrder.message, false, null, true)
    );
    if (
      ["SEARCHING", "ARRIVED", "SCHEDULED", "ACCEPTED"].includes(
        UserRequest.status
      )
    ) {
      var cancel_reason =
        cancelOrder.message.order.cancellation.cancellation_reason_id;
      //var cancel_reason = "Ride cancelled,reason not known";
      console.log("cancel_reason: " + cancel_reason);
      response = await UserRequest.update(
        {
          status: "CANCELLED",
          cancel_reason: cancel_reason,
          cancelled_by: "USER",
        },
        { where: { id: UserRequest.id } }
      );
      console.log("response:" + response);
      await Notification.destroy({
        where: {
          user_request_id: UserRequest.id,
          user_id: UserRequest.user_id,
        },
      });

      if (UserRequest.status != "SCHEDULED") {
        if (UserRequest.provider_id != 0) {
          await ProviderServices.update(
            { status: "active" },
            { where: { provider_id: UserRequest.provider_id } }
          );
        }
      }

      if (UserRequest.provider_id != 0) {
        const provider_devices = await ProviderDevices.findOne({
          where: { provider_id: UserRequest.provider_id },
        });

        console.log("Device Token " + provider_devices.token);
        console.log("Title " + title);
        console.log("Body " + body);
        console.log("Reason " + notification_reason);
        console.log("Type " + type);
        console.log("Stickey " + stickey);
        console.log("User Id " + UserRequest.user_id);
        console.log("Provider id " + UserRequest.provider_id);
        console.log("Request Id " + UserRequest.id);
        var notification = await notificationServices.notifyDriver(
          provider_devices.token,
          title,
          body,
          UserRequest,
          notification_reason,
          type,
          stickey,
          UserRequest.user_id,
          UserRequest.provider_id,
          UserRequest.id
        );
      }
      return {
        statusCode: 200,
        status: "Cancelled",
        message: "Ride cancelled successfully",
      };
    } else {
      return {
        statusCode: 404,
        status: "cancelled",
        message: `Ride already cancelled`,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { cancelRequest };
