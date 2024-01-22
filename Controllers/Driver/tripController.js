var { db, models } = require("../../Config/dbIndex.js");
const generalController = require("../Driver/generalController.js");
const { Op } = require("sequelize");
const AdminTable = models.Admins;
const DriverTable = models.Providers;
const UserTable = models.Users;
const DriverDistanceTable = models.Admins;
const PoiConstantsTable = models.Admins;
const RequestFilterTable = models.RequestFilters;
const UserRequestTable = models.UserRequests;
const ProviderServiceTable = models.ProviderServices;
const UserRequestRatingsTable = models.UserRequestRatings;

const getTrip = async (req, res, next) => {};

const ratePassenger = async (req, res, next) => {
  const { rating, comment, request_id } = req.body;

  //1.Rating Validation
  const ratingArray = [0, 1, 2, 3, 4, 5];
  if (
    !ratingArray.includes(rating) ||
    rating === null ||
    rating === undefined ||
    !Number.isInteger(rating)
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `Rating format should be in [required|integer|in:0,1,2,3,4,5]`,
    });
  }

  //2.comment verification
  // if (comment.lenght > 255 || comment === "") {
  //   return res.status(404).json({
  //     statusCode: 404,
  //     status: "failed",
  //     message: `Comment fromat should be [max:255|string|required]`,
  //   });
  // }

  //Fetching UserRequest Table
  const userRequestResult = await UserRequestTable.findOne({
    where: { [Op.and]: [{ id: request_id }, { status: "COMPLETED" }] },
  });

  //Verifying UserRequest Table should not be Null
  if (userRequestResult === null || userRequestResult === undefined) {
    return res.status(200).json({
      statusCode: 404,
      status: "failed",
      message: `UserRequest Row with ID[${request_id} does not exist in our DB!!]`,
    });
  }

  //Without Ride Status as Completed  we will not update/create Ratings
  if (userRequestResult.status !== "COMPLETED") {
    return res.status(200).json({
      statusCode: 404,
      status: "failed",
      message: `You can only Rate for Completed Ride`,
    });
  }

  var creatables = {
    request_id: request_id,
    provider_id: userRequestResult.provider_id,
    user_id: userRequestResult.user_id,
    user_rating: 0,
    provider_rating: rating,
    user_comment: "",
    provider_comment: comment,
  };

  //Now Fetching Ratings Table to see that this exist or not
  const userRequestRatingResult = await UserRequestRatingsTable.findOne({
    where: {
      [Op.and]: [
        { request_id: request_id },
        { user_id: userRequestResult.user_id },
      ],
    },
  });

  //3.Checking if we are having requested UserRequestRatingsTable or Not
  if (
    userRequestRatingResult === null ||
    userRequestRatingResult === undefined
  ) {
    //We have to insert new record in UserRequestRatings Table
    try {
      const createdRatingTableRes = await UserRequestRatingsTable.create(
        creatables
      );
      console.log(
        `Successfully Created Ratings Row : ${createdRatingTableRes}`
      );
    } catch (error) {
      console.log(`Error Occured While Creating Ratings Row : ${error}`);
    }
  } else {
    //We have to Update record in UserRequestRatings Table
    try {
      const updatedRatingsTableRes = await UserRequestRatingsTable.update(
        creatables,
        {
          where: {
            [Op.and]: [
              { request_id: request_id },
              { user_id: userRequestResult.user_id },
            ],
          },
        }
      );
      console.log(
        `Successfully Updated Ratings Row : ${updatedRatingsTableRes}`
      );
    } catch (error) {
      console.log(`Error Occured While Updating Ratings Row : ${error}`);
    }
  }

  //4.Checking that we have to update the rating or create new rating
  // if (userRequestResult.provider_rated === 0) {
  //   await UserRequestRatingsTable.create({
  //     provider_id: userRequestResult.provider_id,
  //     user_id: userRequestResult.user_id,
  //     request_id: userRequestResult.id,
  //     provider_rating: rating,
  //     provider_comment: comment,
  //     provider_rated: 1,
  //   });
  // } else {
  //   await UserRequestRatingsTable.update(
  //     {
  //       provider_rating: rating,
  //       provider_comment: comment,
  //       provider_rated: 1,
  //     },
  //     {
  //       where: {
  //         [Op.and]: [
  //           { request_id: request_id },
  //           { user_id: userRequestResult.user_id },
  //         ],
  //       },
  //     }
  //   );

  //5.Updating provider rated true in UserRequestTable as well
  await UserRequestTable.update(
    { provider_rated: 1 },
    {
      where: { [Op.and]: [{ id: request_id }, { status: "COMPLETED" }] },
    }
  );

  //6.Now making this rated provider active for next ride
  await ProviderServiceTable.update(
    { status: "active" },
    { where: { provider_id: userRequestResult.provider_id } }
  );

  // //7.Now deleting this request_filter after successful ride || Delete from filter so that it doesn't show up in status checks.
  // await RequestFilterTable.destroy({ where: { request_id: request_id } });

  //8.Now everything is done, returning the response
  return res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "Provider Rated to User successfully",
    updatedUserRequestRatingsTable: await UserRequestRatingsTable.findOne({
      where: {
        [Op.and]: [
          { request_id: request_id },
          { user_id: userRequestResult.user_id },
        ],
      },
    }),
  });
};

module.exports = { getTrip, ratePassenger };
