var { models } = require("../../Config/dbIndex.js");
const moment = require("moment");
const { Op } = require("sequelize");
const UserRequests = models.UserRequests;
const ProviderServices = models.ProviderServices;
const ProviderDevices = models.ProviderDevices;
const UserRequestRating = models.UserRequestRatings;
const Providers = models.Providers;
const Notification = models.Notification;
const notificationServices = require("../../Services/common/notification.js");

const updateRequestStatus = async () => {
    const timeoutDuration = 3;
    const expiryTime = moment(new Date(Date.now() - (timeoutDuration * 60 * 1000))).format("YYYY-MM-DD HH:mm:ss")

    console.log("calling every 1 minute");
    // console.log(moment(new Date(Date.now() - (3 * 60 * 1000))).format("YYYY-MM-DDTHH:mm:ss"));
    console.log(moment(new Date(Date.now() - (3 * 60 * 1000))).toISOString());


    var requestResponse = await UserRequests.findAll({

        where: {
            status: "SEARCHING",
            created_at: {
                [Op.lt]: expiryTime,
            },
        },
    });
    for (var i = 0; i < requestResponse.length; i++) {
        const notifications = await Notification.findAll({
            where: { user_request_id: requestResponse[i].id },
        });
        if (notifications.length > 0) {
            var updateStatus = await UserRequests.update(
                { status: "NO_DRIVER_ACCEPTED" },
                { where: { id: requestResponse[i].id } }
            );
        }

    }
    console.log(requestResponse)

}

const cancelRequest = async (req, res) => {

    const request_id = req.params.requestId;
    const user_id = req.params.userId;
    const stickey = true;
    var response;
    const cancel_reason = req.body.cancel_reason;
    const notification_reason = "ride_cancelled_by_passenger";
    const title = "Ride Cancelled";
    const body = "Sorry, this ride has been cancelled by passenger";
    const type = "ride";

    if (request_id == undefined) {
        return res.status(404).json({
            statusCode: 404,
            status: "Invalid request id",
        });
    }
    if (cancel_reason == "" || cancel_reason == undefined) {
        return res.status(500).json({
            statusCode: 500,
            status: "Invalid input",
            message: "Please specify the ride cancel reason",
        })
    }

    var UserRequest = await UserRequests.findOne({ where: { id: request_id } });

    if (UserRequest.status == 'CANCELLED') {
        return res.status(500).json({
            statusCode: 500,
            status: "Cancelled",
            message: "Ride already cancelled",
        })
    }
    if (UserRequest.status == "COMPLETED") {
        return res.status(500).json({
            statusCode: 500,
            status: "COMPLETED",
            message: "Ride already completed",
        })

    }
    if (['SEARCHING', 'ARRIVED', 'SCHEDULED', 'ACCEPTED'].includes(UserRequest.status)) {

        response = await UserRequests.update({ status: "CANCELLED", cancel_reason: cancel_reason, cancelled_by: 'USER' }, { where: { id: UserRequest.id } });
        await Notification.destroy({
            where: { user_request_id: request_id, user_id: user_id }
        });

        if (UserRequest.status != 'SCHEDULED') {
            if (UserRequest.provider_id != 0) {
                ProviderServices.update({ status: "active" }, { where: { provider_id: UserRequest.provider_id } })
            }
        }
        // Send Push Notification to Provider that user has cancelled the ride if request status is not searching
        console.log("Provider Id")
        console.log(UserRequest.provider_id);
        if (UserRequest.provider_id != 0) {
            const provider_devices = await ProviderDevices.findOne({ where: { provider_id: UserRequest.provider_id } });
            console.log(provider_devices.token);

            console.log("Device Token " + provider_devices.token);
            console.log("Title " + title);
            console.log("Body " + body);
            console.log("Reason " + notification_reason);
            console.log("Type " + type);
            console.log("Stickey " + stickey);
            console.log("User Id " + user_id);
            console.log("Provider id " + UserRequest.provider_id);
            console.log("Request Id " + request_id);
            var notification = await notificationServices.notifyDriver(provider_devices.token, title, body, UserRequest, notification_reason, type, stickey, user_id, UserRequest.provider_id, request_id);
        }
        return res.status(200).json({
            statusCode: 200,
            status: "Cancelled",
            message: "Ride cancelled successfully",
        })
    } else {
        return res.status(404).json({
            statusCode: 404,
            status: "cancelled",
            message: `Ride already cancelled`,
        });

    }
}
const getrequestStatus = async (req, res) => {
    var requestId = req.params.requestId;
    var provider_serviceResult = {}
    if (requestId == undefined) {
        return res.status(404).json({
            statusCode: 404,
            status: "failed",
            message: `Please provider request id`,
        });
    }
    console.log(requestId);
    try {
        var result = await UserRequests.findOne({
            where: { id: requestId },
            include: [{
                model: Providers,
                as: 'provider',
            }]
        });
        if (result.provider_id !== null) {
            provider_serviceResult = await ProviderServices.findOne({
                where: { provider_id: result.provider_id },
            });
        }
        var requestStatus = {
            ride_data: result,
            provider_services: provider_serviceResult,
        };

        return res.status(200).json({
            statusCode: 200,
            status: "success",
            message: `UserRequestTable Fetched Successfully`,
            data: requestStatus,
            //data: userRequestResult,
        });
    } catch (error) {
        return res.status(404).json({
            statusCode: 404,
            status: "failed",
            message: `Something Went Wrong while fetching UserRequestTable!!!`,
            error: error,
        });

    }
}
const rateProvider = async (req, res) => {
    const { rating, comment, request_id } = req.body;
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
    if (
        comment === null ||
        comment === undefined ||
        comment.length > 255 ||
        comment === ""
    ) {
        return res.status(404).json({
            statusCode: 404,
            status: "failed",
            message: `Comment fromat should be [max:255|string|required]`,
        });
    }
    const userRequest = await UserRequests.findOne({
        where: { [Op.and]: [{ id: request_id }, { status: "COMPLETED" }] },
    });
    console.log(userRequest)
    if (userRequest === null || userRequest === undefined) {
        return res.status(404).json({
            statusCode: 404,
            status: "failed",
            message: `This request does not exists`,
        });
    } if (userRequest.user_rated === 0) {
        await UserRequestRating.create({
            provider_id: userRequest.provider_id,
            user_id: userRequest.user_id,
            request_id: userRequest.id,
            user_rating: rating,
            user_comment: comment,
        });
    } else {
        await UserRequestRating.update(
            {
                user_rating: rating,
                user_comment: comment,
            },
            {
                where: {
                    [Op.and]: [
                        { request_id: request_id },
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
    // $average = UserRequestRating:: where('provider_id', $UserRequest -> provider_id) -> avg('user_rating');
    // Provider:: where('id', $UserRequest -> provider_id) -> update(['rating' => $average]);
    // Send Push Notification to Provider 
    return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "User Rated successfully",
    });
}

module.exports = { updateRequestStatus, getrequestStatus, cancelRequest, rateProvider };