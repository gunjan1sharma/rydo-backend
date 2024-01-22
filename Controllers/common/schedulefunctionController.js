const CronJob = require("node-cron");
const userRequestController = require("../User/userrequestController.js");
exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("*/1 * * * *", async () => {
    // userRequestController.updateRequestStatus();
  });

  scheduledJobFunction.start();
};
