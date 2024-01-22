const util = require("util");

const { MongoClient } = require("mongodb");
const calculateDurationAndFare = require("../../Utils/Beckn/calculateDistanceandFareUtil.js");
const userController = require("../../Controllers/User/userController.js");
const { ErrResponse } = require("../../Utils/Beckn/becknResponse.js");

const selectRequest = async (req, res) => {
  try {
    console.log("Signature: ", req.headers["authorization"]);
    console.log("Select request: ", util.inspect(req.body, false, null, true));

    const context = req.body.context;
    var order = req.body.message.order;

    var prop = "items";
    console.log(order.hasOwnProperty(prop));
    if (!order.hasOwnProperty(prop)) {
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

    const itemId = order.items[0].id;

    //checking of a valid item has been selected.
    const transaction = await fetchFromDb(
      { transaction_id: context.transaction_id, action: "on_search" },
      "bpp_responses"
    );

    if (transaction.message.catalog.providers[0].items[0].id !== itemId) {
      console.log("Invalid Item");
      return "Invalid Item";
    }

    // fetching the previous search responseBody to get initial search cordinates cached.
    const resultFromDb = await fetchFromDb(
      { transaction_id: context.transaction_id, action: "search" },
      "bpp_requests"
    );
    if (!resultFromDb) {
      console.log("invalid request");
      return;
    }

    //saving select request to db;
    await saveToDb(req.body, "bpp_requests");

    console.log(
      "source: ",
      resultFromDb.message.intent.fulfillment.stops[0].location.gps
    );
    console.log(
      "destination: ",
      resultFromDb.message.intent.fulfillment.stops[
        resultFromDb.message.intent.fulfillment.stops.length - 1
      ].location.gps
    );

    const start = resultFromDb.message.intent.fulfillment.stops[0].location.gps;
    const start_cordinates = start.toString().split(",");
    console.log(start_cordinates[0], start_cordinates[1]);
    const source = {
      s_latitude: start_cordinates[0],
      s_longitude: start_cordinates[1],
    };
    const end =
      resultFromDb.message.intent.fulfillment.stops[
        resultFromDb.message.intent.fulfillment.stops.length - 1
      ].location.gps;
    const end_cordinates = end.toString().split(",");
    console.log(end_cordinates[0], end_cordinates[1]);
    const destination = {
      d_latitude: end_cordinates[0],
      d_longitude: end_cordinates[1],
    };

    await saveToDb(req.body, "bpp_requests");
    console.log("saving to bpp_requests db");
    var distance_radius = 5;
    const driversList = await userController.getdrivers(
      source,
      distance_radius
    );
    console.log(util.inspect(driversList[0], false, null, true));
    console.log("------------------PROVIDER SERVICE TYPE DETAILS------------");
    console.log(
      util.inspect(
        driversList[0].provider_services.dataValues,
        false,
        null,
        true
      )
    );
    console.log("------------------PROVIDER SERVICE TYPE DETAILS------------");
    console.log("------------------DRIVER DETAILS------------");
    console.log(
      util.inspect(
        driversList[0].provider_services.provider.dataValues,
        false,
        null,
        true
      )
    );
    console.log("------------------DRIVER DETAILS------------");

    driversList.sort((a, b) => a.distance - b.distance);

    const fareAndDuration =
      await calculateDurationAndFare.calculateDurationAndFare(start, end);
    console.log("check0");
    if (fareAndDuration[0] != 200) {
      return {
        statusCode: fareAndDuration[0],
        status: "failed",
        message: fareAndDuration[2],
      };
    }
    const est_fare = fareAndDuration[1].estimated_fare;
    const ETA = fareAndDuration[2];

    if (driversList.length <= 0) {
      onSelectResponseBody = {
        context: context,
        message: { order: {} },
      };
      return {
        statusCode: 200,
        status: "success",
        message: onSelectResponseBody,
      };
    }
    var order = {
      provider: {},
      items: [],
      cancellation_terms: [],
      quote: {},
      payments: [],
    };

    var locations = [];
    var items = [];
    var categories = [];

    var providerDet = {
      id: "",
      descriptor: { name: "" },
      categories: "",
      locations: "",
    };
    providerDet.id = "Rydo";
    providerDet.descriptor.name = "Rydo mobility service";

    var category = {
      id: "",
      descriptor: { name: "" },
    };
    category.id = "AUTO";
    category.descriptor.name = "Auto Service";
    categories.push(category);
    providerDet.categories = categories;

    const itemDet = {
      id: "",
      descriptor: { name: "" },
      category_ids: [],
      location_ids: [],
    };
    console.log("check");
    for (i = 0; i == 0; i++) {
      const item = driversList[i].provider_services.provider.dataValues;

      locations.push({
        id: "Closest Auto",
        gps: item.latitude + "," + item.longitude,
      });
      providerDet.locations = locations;

      itemDet.id =
        "ITEMID-" +
        driversList[i].provider_services.dataValues.service_type_id.toString();
      itemDet.descriptor.name = "AUTO";
      // itemDet.category_ids.push({ id: providerDet.categories[i].id });
      // itemDet.location_ids.push({ id: locations[i].id });
      console.log("check11");
      const price = {};
      price.description = "Auto Fare";
      price.currency = "Rs.";
      price.value = est_fare.toString();
      itemDet.price = price;

      const time = {};
      time.label = "Ride Time";
      time.duration = ETA.toString();
      itemDet.time = time;

      items.push(itemDet);
    }
    order.items = items;
    order.provider = providerDet;

    const quote = {
      price: {},
    };
    quote.price.currency = "Rs. ";
    quote.price.value = est_fare.toString();

    order.quote = quote;
    console.log("check12");
    var paymentDet = {};
    paymentDet.collected_by = "BPP";
    paymentDet.type = "POST-FULFILLMENT";
    order.payments.push(paymentDet);

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
    console.log("check13");

    const response = await generateOnSelectResponse(context, order);
    console.log(
      "Response: ",
      util.inspect(response.message, false, null, true)
    );
    return response.message;
    // if (response.statusCode != 200) {
    //   return res.status(response.statusCode).json({
    //     statusCode: response.statusCode,
    //     status: "failed",
    //     message: `NACK`,
    //   });
    // }
    // return res.status(200).json({
    //   statusCode: 200,
    //   status: "success",
    //   message: `ACK`,
    //   data: response.message,
    // });
  } catch (error) {
    console.log(error.response);
    var NACK = await ErrResponse(reponse);
    return res.status(error.reponse.status).json({ NACK });
  }
};

const generateOnSelectResponse = async (contxt, order) => {
  console.log("check14");
  var context = {};
  context = contxt;
  context.action = "on_select";
  console.log("check15");
  onSelectResponseBody = {
    context: context,
    message: { order: order },
  };
  await saveToDb(onSelectResponseBody, "bpp_responses");
  return {
    statusCode: 200,
    status: "success",
    message: onSelectResponseBody,
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

module.exports = { selectRequest };
