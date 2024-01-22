var { db, models } = require("../../Config/dbIndex.js");
var moment = require("moment");
const haversine = require("haversine");
const AdminTable = models.Admins;
const DriverTable = models.Providers;
const UserTable = models.Users;
const DriverDistanceTable = models.DriverDistance;
const PoiConstantsTable = models.PoiConstants;
const ProviderServiceTable = models.ProviderServices;

const setDriverLatestLocation = async (req, res, next) => {
  const id = req.params.id;
  const requestBody = req.body;

  const readAllPois = await PoiConstantsTable.findAll();
  const userLatitude = requestBody.latitude;
  const userLongitude = requestBody.longitude;
  let eachDistanceArray = [];
  let distanceData = [];
  const userLocation = {
    latitude: userLatitude,
    longitude: userLongitude,
  };

  const providerServiceTableRes = await ProviderServiceTable.findOne({
    where: { provider_id: id },
  });

  if (
    providerServiceTableRes === null ||
    providerServiceTableRes === undefined
  ) {
    return res.status(404).json({
      statusCode: 404,
      status: "failed",
      message: `Provider Service Table for this driver[${id}] we have not found in our DB!!`,
    });
  }

  //0* Before performing any operation first check about this driver existance in our DB

  //1.Finding havesine distance in km from each POI points from Driver Lat Long
  for (let i = 0; i < readAllPois.length; i++) {
    const poiLocation = {
      latitude: readAllPois[i].latitude,
      longitude: readAllPois[i].longitude,
    };

    distanceData = {
      driverID: id,
      service_type_id: providerServiceTableRes.service_type_id,
      provider_services_id: providerServiceTableRes.id,
      poiID: readAllPois[i].id,
      distance: haversine(userLocation, poiLocation, { unit: "km" }),
    };

    eachDistanceArray.push(distanceData);
  }

  //2.updating latest latLongs in provider Table as well
  updateDriverLatestLocation(id, userLatitude, userLongitude);

  //3.Checking if this driver entries already exist in the distance Table or not
  const drivers = await DriverDistanceTable.findAll({
    where: { driverID: id },
  });

  if (drivers.length > 0) {
    //4.update, driver already present
    const updateQuery =
      "UPDATE driver_distance SET poiID = :poi, distance = :dist, updated_at = :timestamp where driverID = :id AND poiID = :poi";
    const readQuery = "SELECT * FROM driver_distance WHERE driverID = :id";

    for (let i = 0; i < readAllPois.length; i++) {
      const poiLocation = {
        latitude: readAllPois[i].latitude,
        longitude: readAllPois[i].longitude,
      };

      await db.query(updateQuery, {
        replacements: {
          id: id,
          poi: readAllPois[i].id,
          dist: haversine(userLocation, poiLocation, { unit: "km" }),
          timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
      });

      if (i === readAllPois.length - 1) {
        return res.status(200).json({
          statusCode: 200,
          status: "success",
          message: `Distance Table Updated Successfully`,
          data: await DriverDistanceTable.findAll({ where: { driverID: id } }),
        });
      }
    }
  } else {
    //5.create, driver first time
    DriverDistanceTable.bulkCreate(eachDistanceArray)
      .then((result) => {
        return res.status(200).json({
          statusCode: 200,
          status: "success",
          message: `Distance Table Created Successfully`,
          data: result,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          statusCode: 500,
          status: "failed",
          message: `Provider Distance Creation Failed!!`,
          error: err,
        });
      });
  }
};

const setDriverStatus = async (req, res, next) => {
  let id = req.params.id;

  const providerServiceTableResult = await ProviderServiceTable.findOne({
    where: { provider_id: id },
  });
  if (
    providerServiceTableResult === null ||
    providerServiceTableResult === undefined
  ) {
    return res.status(200).json({
      statusCode: 404,
      status: "Not Found",
      message: `No Provider_Service Table With ID ${id} in our DB!!`,
    });
  }

  const updatedProvider = ProviderServiceTable.update(
    {
      status: req.body.status,
    },
    { where: { provider_id: id } }
  )
    .then(async (result) => {
      var updatedResult = await ProviderServiceTable.findOne({
        where: { provider_id: id },
      });
      if (updatedResult == undefined || updatedResult == null) {
        return res.status(500).json({
          statusCode: 500,
          status: "failed",
          message: `Provider ${id} Updation Failed!!`,
        });
      }
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Provider ${id} Updated Successfully`,
        updatedStatus: updatedResult.status,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Provider ${id} Updation Failed!!`,
        error: err,
      });
    });
};

const checkDriverStatus = async (req, res, next) => {
  let id = req.params.id;

  ProviderServiceTable.findOne({ where: { provider_id: id } })
    .then(async (result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        status: result.status,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        statusCode: 500,
        status: "failed",
        message: `Provider Status Check Failed!!`,
        err: err,
        error: `could not found driver with the ID ${id}`,
      });
    });
};

const calculateDistanceBetweenTwoPoints = () => {};

const calculatePoiDistancesFromDriverLocation = () => {};

const saveDriverLatestLocation = () => {};

const updateDriverLatestLocation = async (id, latitude, longitude) => {
  await DriverTable.update(
    {
      latitude: latitude,
      longitude: longitude,
      location_timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    { where: { id: id } }
  );
};

const saveDistancesInPOITable = () => {};

const updateDistancesInPOITable = () => {};

module.exports = {
  setDriverLatestLocation,
  setDriverStatus,
  checkDriverStatus,
};
