var { db, models } = require("../../Config/dbIndex.js");
const Admin = models.Admins;

const createAdmin = async (req, res, next) => {
  let info = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    picture: req.body.picture,
    language: req.body.language,
    remember_token: req.body.remember_token,
  };

  const createdAdmin = Admin.create(info)
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Admin ${info.name} ${result.id} Created Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `Admin ${info.name} ${createdAdmin.id} Creation Failed!!`,
        error: err,
      });
    });
};
const updateAdmin = async (req, res, next) => {
  let id = req.params.id;

  const updatedAdmin = Admin.update(req.body, { where: { id: id } })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Admin ${result.id} Updated Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `Admin ${id} Updation Failed!!`,
        error: err,
      });
    });
};
const readAdmin = async (req, res, next) => {
  const id = req.params.id;

  const readSingleAdmins = Admin.findOne({ where: { id: id } })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Admain Fetched Successfully`,
        totalAdmins: result.length,
        data: result,
        sqlCode: readSingleAdmins,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `Admin Fetching Failed!!`,
        error: err,
      });
    });
};
const deleteAdmin = async (req, res, next) => {
  const id = req.params.id;

  const deleteSingleAdmin = Admin.destroy({ where: { id: id } })
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `Admin ${id} Deleted Successfully`,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `Admin ${id} Deletion Failed!!`,
        error: err,
      });
    });
};
const readAllAdmins = async (req, res, next) => {
  const readAllAdmins = Admin.findAll()
    .then((result) => {
      return res.status(200).json({
        statusCode: 200,
        status: "success",
        message: `All Admain Fetched Successfully`,
        totalAdmins: result.length,
        data: result,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        statusCode: 404,
        status: "failed",
        message: `Admin Fetching Failed!!`,
        error: err,
      });
    });
};

module.exports = {
  createAdmin,
  updateAdmin,
  readAdmin,
  deleteAdmin,
  readAllAdmins,
};
