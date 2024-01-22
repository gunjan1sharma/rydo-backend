const driverApp = require("../../Middleware/authMiddlewareDriver.js");
const { getMessaging } = require('firebase-admin/messaging');
const { models } = require("../../Config/dbIndex.js");
const NotificationMaster = models.NotificationMaster;
const Notification = models.Notification;


const pushNotificationToDriver = async (regToken, title, body, payloadObj, notification_reason, type, isStickey, userId, providerId, requestId) => {
  var notifications = [];
  var requestData = JSON.stringify(payloadObj)
  const otherMessaging = getMessaging(driverApp.driverApp);

  const message = {
    apns: {
      headers: {},
      payload: {
        aps: {
          badge: 1,
          sound: "default",
        },
      },
    },
    token: regToken,
    notification: {
      title: title,
      body: body,
    },
    data: {
      requestData,
      type: type,
    },
    android: {
      priority: "high",
      notification: {
        icon: "stock_ticker_update",
        color: "#7e55c3",
        sound: "default",
        sticky: false,
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
        default_sound: true,
      },
    },
  };

  try {
    const response = await otherMessaging.send(message);
    const obj = {};
    obj.status = "SENT";
    obj.result = response;
    notifications.push(obj);
    saveNotification(notification_reason, obj.status, obj.result, userId, providerId, requestId)
  }
  catch (error) {
    const obj = {};
    console.log("error");
    obj.status = "NOT_SENT";
    obj.result = error.errorInfo.code;
    notifications.push(obj);

  };
  console.log("Notifications")
  console.log(notifications);
  return notifications;

}
const pushNotificationToPassenger = async (regToken, title, body, payloadObj, notification_reason, type, stickey, userId, providerId, requestId) => {
  var requestData = JSON.stringify(payloadObj)
  var notifications = [];
  const message = {
    apns: {
      headers: {
      },
      payload: {
        aps: {
          badge: 1,
          sound: 'default'
        },
      },
    },
    token: regToken,
    notification: {
      title: title,
      body: body,
    },
    data: {
      title: requestData,
      type: type
    },
    android: {
      priority: "high",

      notification: {
        icon: 'stock_ticker_update',
        color: '#7e55c3',
        sound: "default",
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        sticky: true,
        default_sound: true,
      }
    },
  };
  const options = {
    "contentAvailable": true
  };

  try {
    const response = await getMessaging().send(message);
    // .then(function (response) {
    const obj = {};
    obj.status = "SENT";
    obj.result = response;
    notifications.push(obj);
    saveNotification(notification_reason, obj.status, obj.result, userId, providerId, requestId)
  } catch (error) {
    const obj = {};
    console.log("error");
    obj.status = "NOT_SENT";
    obj.result = error.errorInfo.code;
    notifications.push(obj);
  };
  console.log("Notifications")
  console.log(notifications);
  return notifications;

}
const saveNotification = async (notification_reason, notification_status, notification_response, userId, providerId, requestId) => {
  console.log(userId);
  console.log(requestId);
  console.log(providerId);

  var Notificationmaster = await NotificationMaster.findOne({ where: { notification_reason: notification_reason } });
  if (Notificationmaster) {
    var notification_type_id = Notificationmaster.id;
    var ride_accept_status = "PENDING"
  }

  const notificationPayload = {
    notification_type_id: notification_type_id,
    user_id: userId,
    provider_id: providerId,
    notification_status: notification_status,
    notification_response: notification_response,
    user_request_id: requestId,
  }

  const notification = await Notification.create(notificationPayload);
}

module.exports = { pushNotificationToPassenger, pushNotificationToDriver, saveNotification };