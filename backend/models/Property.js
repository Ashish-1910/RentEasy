const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 120,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    city: { type: String, required: [true, "City is required"], trim: true },
    locality: { type: String, trim: true },
    type: {
      type: String,
      required: [true, "Property type is required"],
      enum: ["Apartment", "Independent House", "Villa", "PG/Studio"],
    },
    rent: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: [1000, "Rent must be at least 1000"],
    },
    bedrooms: { type: Number, required: true, min: 1, max: 10 },
    bathrooms: { type: Number, required: true, min: 1, max: 10 },
    areaSqFt: { type: Number, required: true, min: 50, max: 10000 },
    floor: { type: Number, default: 0, min: 0, max: 60 },
    furnished: {
      type: String,
      enum: ["Unfurnished", "Semi-Furnished", "Furnished"],
      default: "Unfurnished",
    },
    amenities: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Available", "Rented"],
      default: "Available",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes for faster search and filtering
propertySchema.index({ city: 1, type: 1, rent: 1 });
propertySchema.index({ owner: 1 });

module.exports = mongoose.model("Property", propertySchema);
