const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../middleware/asyncHandler");

// Only these fields can be set by a client (blocks changing "owner" etc.)
const ALLOWED = [
  "title",
  "description",
  "city",
  "locality",
  "type",
  "rent",
  "bedrooms",
  "bathrooms",
  "areaSqFt",
  "floor",
  "furnished",
  "amenities",
  "status",
];

const pick = (body) => {
  const out = {};
  ALLOWED.forEach((k) => {
    if (body[k] !== undefined) out[k] = body[k];
  });
  return out;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/properties?city=&type=&minRent=&maxRent=&bedrooms=&furnished=&status=&search=&sort=&page=&limit=
exports.getProperties = asyncHandler(async (req, res) => {
  const {
    city,
    type,
    furnished,
    status,
    search,
    minRent,
    maxRent,
    bedrooms,
    sort,
  } = req.query;
  const filter = {};

  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, "i");
  if (type) filter.type = type;
  if (furnished) filter.furnished = furnished;
  if (status !== "All") filter.status = status || "Available";
  if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };

  if (minRent || maxRent) {
    filter.rent = {};
    if (minRent) filter.rent.$gte = Number(minRent);
    if (maxRent) filter.rent.$lte = Number(maxRent);
    if (Object.values(filter.rent).some(Number.isNaN)) {
      res.status(400);
      throw new Error("minRent and maxRent must be numbers");
    }
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: rx }, { locality: rx }, { city: rx }];
  }

  const sortMap = {
    rent_asc: { rent: 1 },
    rent_desc: { rent: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("owner", "name phone")
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: properties.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    properties,
  });
});

// GET /api/properties/my   (owner's own listings)
exports.getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, count: properties.length, properties });
});

// GET /api/properties/:id
exports.getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    "owner",
    "name phone",
  );
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  res.json({ success: true, property });
});

// POST /api/properties   (owner only)
exports.createProperty = asyncHandler(async (req, res) => {
  const property = await Property.create({
    ...pick(req.body),
    owner: req.user._id,
  });
  res.status(201).json({ success: true, property });
});

// PUT /api/properties/:id   (owner of that property only)
exports.updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  if (property.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can update only your own properties");
  }
  Object.assign(property, pick(req.body));
  await property.save();
  res.json({ success: true, property });
});

// DELETE /api/properties/:id   (owner of that property only)
exports.deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  if (property.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can delete only your own properties");
  }
  await Inquiry.deleteMany({ property: property._id });
  await property.deleteOne();
  res.json({ success: true, message: "Property deleted" });
});
