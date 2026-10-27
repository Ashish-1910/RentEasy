const express = require("express");
const {
  getProperties,
  getMyProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.get("/", getProperties);
router.get("/my", protect, authorize("owner"), getMyProperties); // must stay above "/:id"
router.get("/:id", getProperty);
router.post("/", protect, authorize("owner"), createProperty);
router.put("/:id", protect, authorize("owner"), updateProperty);
router.delete("/:id", protect, authorize("owner"), deleteProperty);

module.exports = router;
