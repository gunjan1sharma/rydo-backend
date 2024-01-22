const util = require("util");
const moment = require("moment");
const { MongoClient } = require("mongodb");
const { Op } = require("sequelize");
const { models } = require("../../Config/dbIndex.js");
const {
  ACKResponse,
  NACKResponse,
  ErrResponse,
} = require("../../Utils/Beckn/becknResponse.js");

const UserRequests = models.UserRequests;
const UserRequestRating = models.UserRequestRatings;

const rateRequest = async (req, res) => {
  try {
    console.log("Signature: ", req.headers["authorization"]);
    console.log("Rate request: ", util.inspect(req.body, false, null, true));

    const context = req.body.context;
    const ratings = req.body.message.ratings;

    //to check if its a valid request
    var confirmedOrder = await fetchFromDb(
      { transaction_id: context.transaction_id, action: "on_confirm" },
      "bpp_responses"
    );
    if (!confirmedOrder.context.transaction_id == context.transaction_id) {
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

    // var ratedOrder = await fetchFromDb(
    //   { transaction_id: context.transaction_id, action: "on_rating" },
    //   "bpp_responses"
    // );

    // if (ratedOrder != null) {
    //   if (ratedOrder.context.transaction_id == context.transaction_id) {
    //     console.log("rating already provided");
    //     return res.status(404).json({
    //       context: context,
    //       message: {
    //         description: "Rating already provided",
    //         status: "NACK",
    //       },
    //       error: {
    //         description: "Rating already provided",
    //         type: "JSON_SCHEMA_ERROR",
    //         code: 30010,
    //       },
    //     });
    //   }
    // }

    if (!ratings[0].hasOwnProperty("value")) {
      console.log("no rating value");
      return res.status(404).json({
        context: context,
        message: {
          description: "No Rating Value",
          status: "NACK",
        },
        error: {
          description: "No Rating Value",
          type: "JSON_SCHEMA_ERROR",
          code: 30010,
        },
      });
    }

    //saving rate request to db;
    await saveToDb(req.body, "bpp_requests");

    var rating_res = await rateProvider(req.body);

    if (rating_res.statusCode != 200) {
      // return { message: {
      //     description: "Rating not supported",
      //     status: "NACK",
      //   },
      //   error: {
      //     description: "Rating not supported",
      //     type: "JSON_SCHEMA_ERROR",
      //     code: 50001	,
      //   }
      // }
      // return res.status(404).json({
      return {
        context: context,
        message: {
          description: "Rating not supported",
          status: "NACK",
        },
        error: {
          description: "Rating not supported",
          type: "JSON_SCHEMA_ERROR",
          code: 50001,
        },
      };
      //});
    } else {
      response = await generateOnRatingResponse(req.body);

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

const generateOnRatingResponse = async (rating_details) => {
  try {
    rating_details.context.action = "on_rating";
    var message = {
      feedback_form: {
        descriptor: { name: "Thank you for your feedback" },
      },
    };
    rating_details.message = message;
    rating_details.message.created_at = moment(new Date()).format(
      "YYYY-MM-DDTHH:mm:ssZ"
    );

    rating_details.message.updated_at = moment(new Date()).format(
      "YYYY-MM-DDTHH:mm:ssZ"
    );

    console.log("rating response: " + rating_details);
    var OnRatingResponseBody = rating_details;
    await saveToDb(OnRatingResponseBody, "bpp_responses");

    return {
      status: 200,
      message: OnRatingResponseBody,
    };
  } catch (error) {
    console.log(error.response);
    var NACK = await ErrResponse(error);
    return res.status(error.response.status).json({ NACK });
  }
};

const rateProvider = async (rating_details) => {
  var context = rating_details.context;
  var rating = rating_details.message.ratings[0].value;
  rating = parseInt(rating) % 5;
  console.log("rating: " + rating);
  const userRequest = await UserRequests.findOne({
    where: {
      [Op.and]: [
        { transaction_id: context.transaction_id },
        { status: "COMPLETED" },
      ],
    },
  });

  if (userRequest === null || userRequest === undefined) {
    return {
      statusCode: 404,
      status: "failed",
      message: `This request does not exists`,
    };
  }
  var request_id = userRequest.id;
  const ratingArray = [0, 1, 2, 3, 4, 5];
  if (
    !ratingArray.includes(rating) ||
    rating === null ||
    rating === undefined ||
    !Number.isInteger(rating)
  ) {
    return {
      statusCode: 404,
      status: "failed",
      message: `Rating format should be in [required|integer|in:0,1,2,3,4,5]`,
    };
  }

  if (userRequest.user_rated == 0) {
    await UserRequestRating.create({
      provider_id: userRequest.provider_id,
      user_id: userRequest.user_id,
      request_id: userRequest.id,
      user_rating: rating,
      user_comment: "NA",
    });
  } else {
    await UserRequestRating.update(
      {
        user_rating: rating,
        user_comment: "NA",
      },
      {
        where: {
          [Op.and]: [
            { request_id: userRequest.id },
            { user_id: userRequest.user_id },
          ],
        },
      }
    );
  }

  //5.Updating provider rated true in UserRequestTable as well
  await UserRequests.update(
    { user_rated: 1 },
    {
      where: { [Op.and]: [{ id: request_id }, { status: "COMPLETED" }] },
    }
  );

  // Send Push Notification to Provider

  //8.Now everything is done, returning the response
  return {
    statusCode: 200,
    status: "success",
    message: "User Rated successfully",
  };
};
module.exports = { rateRequest };
