"""
predict.py - called by the Node.js backend (mlController.js).
Input : JSON via stdin, a JSON string argument, or a path to a .json file.
Output: one JSON line on stdout.
"""
import sys
import os
import json
import warnings
warnings.filterwarnings("ignore")

import joblib
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE, "models")

CITIES = ["Chandigarh", "Mohali", "Panchkula", "Delhi", "Gurugram", "Noida",
          "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Jaipur", "Lucknow"]
TYPES = ["Apartment", "Independent House", "Villa", "PG/Studio"]
FURNISHED = ["Unfurnished", "Semi-Furnished", "Furnished"]


def fail(message, code=1):
    print(json.dumps({"success": False, "error": message}))
    sys.exit(code)


def read_input():
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if os.path.isfile(arg):
            with open(arg, "r", encoding="utf-8") as f:
                return json.load(f)
        return json.loads(arg)
    return json.loads(sys.stdin.read())


def validate(d):
    required = ["city", "property_type", "furnished", "bedrooms",
                "bathrooms", "area_sqft", "floor", "amenity_count"]
    missing = [k for k in required if k not in d]
    if missing:
        fail("Missing fields: " + ", ".join(missing))
    if d["city"] not in CITIES:
        fail("city must be one of: " + ", ".join(CITIES))
    if d["property_type"] not in TYPES:
        fail("property_type must be one of: " + ", ".join(TYPES))
    if d["furnished"] not in FURNISHED:
        fail("furnished must be one of: " + ", ".join(FURNISHED))
    try:
        row = {
            "bedrooms": int(d["bedrooms"]), "bathrooms": int(d["bathrooms"]),
            "area_sqft": float(d["area_sqft"]), "floor": int(d["floor"]),
            "amenity_count": int(d["amenity_count"]),
            "city": d["city"], "property_type": d["property_type"],
            "furnished": d["furnished"],
        }
    except (ValueError, TypeError):
        fail("Numeric fields must contain valid numbers")
    if not (1 <= row["bedrooms"] <= 10 and 1 <= row["bathrooms"] <= 10):
        fail("bedrooms and bathrooms must be between 1 and 10")
    if not (50 <= row["area_sqft"] <= 10000):
        fail("area_sqft must be between 50 and 10000")
    if not (0 <= row["floor"] <= 60):
        fail("floor must be between 0 and 60")
    if not (0 <= row["amenity_count"] <= 20):
        fail("amenity_count must be between 0 and 20")
    return row


def main():
    try:
        data = read_input()
    except Exception:
        fail("Invalid JSON input")
    row = validate(data)

    try:
        rent_model = joblib.load(os.path.join(MODEL_DIR, "rent_model.joblib"))
        cat_model = joblib.load(os.path.join(MODEL_DIR, "category_model.joblib"))
    except FileNotFoundError:
        fail("Model files not found. Run rental_ml.py first.")

    frame = pd.DataFrame([row])
    rent = float(rent_model.predict(frame)[0])
    rent = max(3000, int(round(rent / 500) * 500))
    category = str(cat_model.predict(frame)[0])

    mae = 0
    metrics_path = os.path.join(MODEL_DIR, "metrics.json")
    if os.path.isfile(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            mae = json.load(f)["regression"]["mae"]

    print(json.dumps({
        "success": True,
        "predicted_rent": rent,
        "price_category": category,
        "range_low": max(3000, int(round((rent - mae) / 500) * 500)),
        "range_high": int(round((rent + mae) / 500) * 500),
        "currency": "INR",
    }))


if __name__ == "__main__":
    main()