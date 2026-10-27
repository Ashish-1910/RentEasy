const express = require("express");
const {
  createInquiry,
  getMyInquiries,
  getReceivedInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.use(protect); // every inquiry route needs login

router.post("/", authorize("tenant"), createInquiry);
router.get("/my", authorize("tenant"), getMyInquiries);
router.get("/received", authorize("owner"), getReceivedInquiries);
router.put("/:id", authorize("owner"), updateInquiryStatus);
router.delete("/:id", authorize("tenant"), deleteInquiry);

module.exports = router;
