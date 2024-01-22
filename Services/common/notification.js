
const { models } = require("../../Config/dbIndex.js");
const notifications = require("./firebaseNotification.js")
const User = models.Users;
const ProviderDevices = models.ProviderDevices;


const notifyAllDrivers = async (nearbyDiversList, request, userId, notification_reason, type, providerId) => {
    
    var users = await User.findOne({ where: { id: userId } });
    var requestId = request.id;
    var title = "Ride Request: " + requestId;
    var body = "There is a new request from: " + users.first_name + "  and request id:  " + requestId;
    var isStickey = true;

    for (var i = 0; i < nearbyDiversList.length; i++) {
        var providerId = nearbyDiversList[i].provider_services.provider_id
        if (nearbyDiversList[i].provider_services.status == "active") {
            device_token_list = await ProviderDevices.findOne({ where: { provider_id: providerId } });
            if (device_token_list !== null) {
                console.log("Notification Data");
                console.log(device_token_list.token);
                console.log(title);
                console.log(body)
                console.log(request);
                console.log(userId);
                console.log(notification_reason);
                console.log(type);
                console.log(isStickey);
                console.log(userId)
                console.log(providerId);
                console.log(requestId);
                var notificationRes = await notifications.pushNotificationToDriver(device_token_list.token, title, body, request, notification_reason, type, isStickey, userId, providerId, requestId);
                // console.log(notificationRes);
            }
        }
    }
}

const notifyDriver = async (regToken, title, body, payload, notification_reason, type, stickey, userId, providerId, requestId) => {
    console.log(userId);
    console.log(providerId);
    console.log(requestId);

    var notification = await notifications.pushNotificationToDriver(regToken, title, body, payload, notification_reason, type, stickey, userId, providerId, requestId);
    console.log("Services");
    console.log(notification);

    return notification;
}
const notifyPassenger = async (regToken, title, body, payload, notification_reason, type, stickey, userId, providerId, requestId) => {
    console.log(userId);
    console.log(providerId);
    console.log(requestId);
    var notification = await notifications.pushNotificationToPassenger(regToken, title, body, payload, notification_reason, type, stickey, userId, providerId, requestId);
    return notification;

}

module.exports = { notifyAllDrivers, notifyDriver, notifyPassenger }
