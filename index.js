const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const admin = require("firebase-admin");
const db = require("./Config/dbIndex.js");
const driverRouter = require("./Routes/Driver/driverRoutes.js");
const userRouter = require("./Routes/User/userRoutes.js");
const commonRouter = require("./Routes/Common/commonRoutes.js");
const becknRouter = require("./Routes/Beckn/becknRoutes.js");
const scheduledFunctions = require("./Controllers/common/schedulefunctionController.js");
const profileController = require("./Controllers/common/profileController.js");
const bppController = require("./Controllers/Beckn/bppController.js");
const axios = require("axios").default;
const util = require("util");
var serviceAccountPassenger = require("./Config/dev-passenger-firebase-adminsdk-nvrgt-6c157d8d49.json");

const { initializeApp } = require("firebase-admin/app");
require("dotenv").config({
  path: __dirname + `/../../.env.${process.env.NODE_ENV}`,
});

initializeApp({
  credential: admin.credential.cert(serviceAccountPassenger),
});
console.log("ENV TYPE");
console.log(process.env.SERVER_TYPE);
if (process.env.SERVER_TYPE == "DEVELOPMENT") {
  console.log("DEVELOPMENT SERVER RUNNING");
}

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/rydov2/api/driver", driverRouter);
app.use("/rydov2/api/user", userRouter);
app.use("/rydov2/api/common", commonRouter);
app.use("/rydov2/api/beckn", becknRouter);

app.get("/rydov2/api/search", (req, res, next) => {
  res.status(200).json({
    statusCode: 200,
    status: "success",
    clientId: uuidv4(),
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo V2 Backend API CI version 1.0",
  });
});

app.get("/", async (req, res, next) => {
  var resp = [];
  try {
    resp = await axios.get(
      "https://api.ipify.org/?format=jsonp&callback=getip"
    );
    console.log(`IP Info Called Successfully..`);
    console.log(resp);
  } catch (error) {
    console.log(`Error Occured While IP Info : ${error}`);
  }

  res.status(200).json({
    statusCode: 200,
    status: "success",
    clientId: uuidv4(),
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo V2 Backend API CI version 1.0",
    ipInfo: resp.data,
  });
});
// app.get("/rydov2/api/search", (req, res, next) => {
//   res.status(200).json({
//     statusCode: 200,
//     status: "success",
//     clientId: uuidv4(),
//     timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
//     message: "Hello From Rydo V2 Backend API CI version 1.0",
//   });
// });
// app.post("/rydov2/api/search", (req, res, next) => {
//   res.status(200).json({
//     statusCode: 200,
//     status: "success",
//     clientId: uuidv4(),
//     timestamp: require("moment")().format("DD/MM/YYYY HH:mm:ss a"),
//     message: "Hello From Rydo V2 Backend API CI version 1.0",
//   });
// });
app.post("/rydov2/api/on_search", (req, res, next) => {
  console.log(req.headers);
  const becknResponse = req.body;
  console.log("BAP: ", util.inspect(becknResponse, false, null, true));
  res.status(200).json({
    statusCode: 200,
    status: "success",
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo BPP,here is search result",
    beckn_response: becknResponse,
  });
});

app.post("/rydov2/api/on_select", (req, res, next) => {
  console.log(req.headers);
  const becknResponse = req.body;
  console.log("BAP: ", util.inspect(becknResponse, false, null, true));
  res.status(200).json({
    statusCode: 200,
    status: "success",
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo BPP,here is select result",
    beckn_response: becknResponse,
  });
});

app.post("/rydov2/api/on_init", (req, res, next) => {
  console.log(req.headers);
  const becknResponse = req.body;
  console.log("BAP: ", util.inspect(becknResponse, false, null, true));
  res.status(200).json({
    statusCode: 200,
    status: "success",
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo BPP,here is init result",
    beckn_response: becknResponse,
  });
});

app.post("/rydov2/api/on_confirm", (req, res, next) => {
  console.log(req.headers);
  const becknResponse = req.body;
  console.log("BAP: ", util.inspect(becknResponse, false, null, true));
  res.status(200).json({
    statusCode: 200,
    status: "success",
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo BPP,here is confirm result",
    beckn_response: becknResponse,
  });
});

app.post("/rydov2/api/on_status", (req, res, next) => {
  console.log(req.headers);
  const becknResponse = req.body;
  console.log("BAP: ", util.inspect(becknResponse, false, null, true));
  res.status(200).json({
    statusCode: 200,
    status: "success",
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo BPP,here is cancel result",
    beckn_response: becknResponse,
  });
});

app.post("/rydov2/api/on_cancel", (req, res, next) => {
  console.log(req.headers);
  const becknResponse = req.body;
  console.log("BAP: ", util.inspect(becknResponse, false, null, true));
  res.status(200).json({
    statusCode: 200,
    status: "success",
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo BPP,here is cancel result",
    beckn_response: becknResponse,
  });
});

app.post("/rydov2/api/on_rating", (req, res, next) => {
  console.log(req.headers);
  const becknResponse = req.body;
  console.log("BAP: ", util.inspect(becknResponse, false, null, true));
  res.status(200).json({
    statusCode: 200,
    status: "success",
    timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
    message: "Hello From Rydo BPP,here is rating result",
    beckn_response: becknResponse,
  });
});

// app.post("/rydov2/api/webhook/search", (req, res, next) => {
//   res.status(200).json({
//     statusCode: 200,
//     status: "success",
//     clientId: uuidv4(),
//     timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
//     message: "Hello From Rydo callback(search)",
//   });
// });

// app.post("/rydov2/api/webhook/on_search", (req, res, next) => {
//   res.status(200).json({
//     statusCode: 200,
//     status: "success",
//     clientId: uuidv4(),
//     timestamp: require("moment")().format("YYYY-MM-DD HH:mm:ss"),
//     message: "Hello From Rydo callback(search)",
//   });
// });

// app.post("/rydov2/api/webhook", async (req, res, next) => {
//   console.log("calling webhook at http://34.203.216.243:3001/on_search");

//   const data = req.body;
//   console.log("rebody: ", req.body);
//   const message = {
//     catalog: {
//       "bpp/descriptor": {
//         name: "Mock BPP",
//       },
//     },
//   };
//   data.context.action = "on_search";
//   data.message = message;
//   console.log("reqbody: ", req.body);
//   const result = await axios.post("http://34.203.216.243:3001/on_search", data);
//   console.log(result);
//   return res.status(200).json({
//     statusCode: 200,
//     status: "success",
//   });
// });
app.post("/rydov2/api/webhook", async (req, res, next) => {
  const data = await bppController.bppActionHandler(req, res);
  console.log("webhookdata: " + util.inspect(data, false, null, true));
  const action = data.context.action;
  console.log("calling webhook at http://35.174.145.56:3001/" + action);
  const result = await axios.post("http://35.174.145.56:3001/" + action, data);
  console.log(util.inspect(result, false, null, true));
  return res.status(200).json({
    statusCode: 200,
    status: "success",
  });
});
scheduledFunctions.initScheduledJobs();
app.listen(PORT, async () => {
  console.log("");
  console.log(
    "---------------------------------------------------------------"
  );
  console.log(
    `Server Started Running on [ ${process.env.SERVER_TYPE} ] Port [ ${PORT} ]`
  );
  console.log(
    "---------------------------------------------------------------"
  );
  console.log("");
  console.log("downloadFilePath : ", process.env.DOWNLOAD_FILE_PATH);
  console.log("DB_HOST : ", process.env.DB_HOST);
  console.log("DB_USER : ", process.env.DB_USER);
  console.log("DB_PASSWORD : ", process.env.DB_PASSWORD);
  console.log("DB : ", process.env.DB);
  //Logic and Functions for scheduling MMI Auth Token Generation on every 86400 seconds(24 Hour)
  //[currently commented out to not generate Token on every server restart]
  // await profileController.mmiAuthTokenGeneration();
  // profileController.mmiAuthTokenAutoScheduling();
});
