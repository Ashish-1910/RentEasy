const express = require("express");
const { predictRent } = require("../controllers/mlController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, predictRent);

module.exports = router;
