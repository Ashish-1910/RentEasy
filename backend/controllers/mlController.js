const { spawn } = require("child_process");
const path = require("path");
const asyncHandler = require("../middleware/asyncHandler");

const PREDICT_SCRIPT = path.join(__dirname, "..", "..", "ml", "predict.py");

// Runs predict.py, sends JSON through stdin, reads one JSON line back
const runPredict = (payload) =>
  new Promise((resolve, reject) => {
    const py = spawn(process.env.PYTHON_CMD || "python", [PREDICT_SCRIPT]);
    let out = "";
    let err = "";

    const timer = setTimeout(() => {
      py.kill();
      reject(new Error("Prediction timed out"));
    }, 20000);

    py.stdout.on("data", (d) => (out += d));
    py.stderr.on("data", (d) => (err += d));

    py.on("error", (e) => {
      clearTimeout(timer);
      reject(new Error("Could not start Python: " + e.message));
    });

    py.on("close", () => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(out.trim().split("\n").pop()));
      } catch {
        reject(
          new Error(
            "Prediction failed: " +
              (err.trim().split("\n").pop() || "no output"),
          ),
        );
      }
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });

// POST /api/predict-rent   (any logged-in user)
exports.predictRent = asyncHandler(async (req, res) => {
  const b = req.body;

  // Accepts both property-model names (type, areaSqFt, amenities) and ML names
  const payload = {
    city: b.city,
    property_type: b.property_type || b.type,
    furnished: b.furnished,
    bedrooms: b.bedrooms,
    bathrooms: b.bathrooms,
    area_sqft: b.area_sqft ?? b.areaSqFt,
    floor: b.floor ?? 0,
    amenity_count:
      b.amenity_count ?? (Array.isArray(b.amenities) ? b.amenities.length : 0),
  };

  const result = await runPredict(payload);
  if (!result.success) {
    res.status(400);
    throw new Error(result.error);
  }

  const prediction = {
    predictedRent: result.predicted_rent,
    priceCategory: result.price_category,
    rangeLow: result.range_low,
    rangeHigh: result.range_high,
    currency: result.currency,
  };

  // Optional: compare the owner's asking rent with the estimate
  if (b.rent !== undefined && b.rent !== "") {
    const asking = Number(b.rent);
    if (!Number.isNaN(asking)) {
      prediction.askingRent = asking;
      prediction.verdict =
        asking < result.range_low
          ? "Below market estimate"
          : asking > result.range_high
            ? "Above market estimate"
            : "Within market estimate";
    }
  }

  res.json({ success: true, prediction });
});
