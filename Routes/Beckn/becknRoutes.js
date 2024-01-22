const bppController = require("../../Controllers/Beckn/bppController.js");
const router = require("express").Router();
router.post("/mobility/bpp", bppController.bppActionHandler);

module.exports = router;
