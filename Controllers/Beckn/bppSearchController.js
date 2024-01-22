const util = require("util");

const { MongoClient } = require("mongodb");

const userController = require("../../Controllers/User/userController.js");
const calculateDurationAndFare = require("../../Utils/Beckn/calculateDistanceandFareUtil.js");
const { ErrResponse } = require("../../Utils/Beckn/becknResponse.js");

const models = require("../../Config/dbIndex.js");
const ServiceTypes = models.ServiceTypes;

const searchRequest = async (req, res) => {
  try {
    console.log("Signature: ", req.headers["authorization"]);
    console.log("Search request: ", util.inspect(req.body, false, null, true));
    var context = req.body.context;
    var intent = req.body.message.intent;
    if (!intent.hasOwnProperty("fulfillment")) {
      console.log("need fulfillment");
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
    if (intent.fulfillment.hasOwnProperty("stops")) {
      if (intent.fulfillment.stops.length <= 1) {
        console.log("need start and end gps cordinates");
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
    }
    console.log(
      "source: ",
      req.body.message.intent.fulfillment.stops[0].location.gps
    );
    console.log(
      "destination: ",
      req.body.message.intent.fulfillment.stops[
        req.body.message.intent.fulfillment.stops.length - 1
      ].location.gps
    );

    const start = req.body.message.intent.fulfillment.stops[0].location.gps;
    const start_cordinates = start.toString().split(",");
    console.log(start_cordinates[0], start_cordinates[1]);
    const source = {
      s_latitude: start_cordinates[0],
      s_longitude: start_cordinates[1],
      service_type_id: 5,
    };
    const end =
      req.body.message.intent.fulfillment.stops[
        req.body.message.intent.fulfillment.stops.length - 1
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
    console.log(util.inspect(driversList, false, null, true));

    if (driversList.length <= 0) {
      context.action = "on_search";
      onSearchResponseBody = {
        context: context,
        message: { catalog: {} },
      };
      // return {
      //   statusCode: 200,
      //   status: "success",
      //   message: onSearchResponseBody,
      // };
      return onSearchResponseBody;
    }
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
    if (fareAndDuration[0] != 200) {
      return {
        statusCode: fareAndDuration[0],
        status: "failed",
        message: fareAndDuration[2],
      };
    }
    const est_fare = fareAndDuration[1].estimated_fare;
    const ETA = fareAndDuration[2];

    var catalog = {
      descriptor: { name: "" },
      providers: "",
    };
    catalog.descriptor.name = "Rydo India";

    console.log("check7");

    var providers = [];

    var locations = [];
    var items = [];
    var categories = [];

    var providerDet = {
      id: "",
      descriptor: { name: "" },
      categories: "",
      locations: "",
      items: "",
      payments: "",
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
      providerDet.items = items;
    }

    var payments = [];
    var paymentDet = {};
    paymentDet.collected_by = "BPP";
    paymentDet.type = "POST-FULFILLMENT";
    payments.push(paymentDet);
    providerDet.payments = payments;

    providers.push(providerDet);

    catalog.providers = providers;

    console.log("catalog: " + util.inspect(catalog, false, null, true));

    const response = await generateOnSearchResponse(context, catalog);
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
    return res.status(error.response.status).json({ NACK });
  }
};

const generateOnSearchResponse = async (contxt, catalog) => {
  var context = {};
  context = contxt;
  context.action = "on_search";

  var onSearchResponseBody = {
    context: context,
    message: { catalog: catalog },
  };

  await saveToDb(onSearchResponseBody, "bpp_responses");
  return {
    statusCode: 200,
    status: "success",
    message: onSearchResponseBody,
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

module.exports = { searchRequest };
