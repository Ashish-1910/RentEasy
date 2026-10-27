const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/inquiries   (tenant only)
exports.createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, message } = req.body;

  if (!propertyId) {
    res.status(400);
    throw new Error("propertyId is required");
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  if (property.status !== "Available") {
    res.status(400);
    throw new Error("This property is no longer available");
  }

  const already = await Inquiry.findOne({ property: propertyId, tenant: req.user._id });
  if (already) {
    res.status(400);
    throw new Error("You have already sent an inquiry for this property");
  }

  const inquiry = await Inquiry.create({
    property: propertyId,
    tenant: req.user._id,
    message,
  });
  res.status(201).json({ success: true, inquiry });
});

// GET /api/inquiries/my   (tenant: inquiries I sent)
exports.getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ tenant: req.user._id })
    .populate("property", "title city locality rent status")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: inquiries.length, inquiries });
});

// GET /api/inquiries/received   (owner: inquiries on my properties)
exports.getReceivedInquiries = asyncHandler(async (req, res) => {
  const myProperties = await Property.find({ owner: req.user._id }).select("_id");
  const ids = myProperties.map((p) => p._id);

  const inquiries = await Inquiry.find({ property: { $in: ids } })
    .populate("property", "title city locality rent")
    .populate("tenant", "name email phone")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: inquiries.length, inquiries });
});

// PUT /api/inquiries/:id   (owner: accept or reject)
exports.updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["Accepted", "Rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be either Accepted or Rejected");
  }

  const inquiry = await Inquiry.findById(req.params.id).populate("property", "owner");
  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }
  if (inquiry.property.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can respond only to inquiries on your own properties");
  }

  inquiry.status = status;
  await inquiry.save();
  res.json({ success: true, inquiry });
});

// DELETE /api/inquiries/:id   (tenant: withdraw my own pending inquiry)
exports.deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }
  if (inquiry.tenant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can withdraw only your own inquiries");
  }
  if (inquiry.status !== "Pending") {
    res.status(400);
    throw new Error("Only pending inquiries can be withdrawn");
  }
  await inquiry.deleteOne();
  res.json({ success: true, message: "Inquiry withdrawn" });
});