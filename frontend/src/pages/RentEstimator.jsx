import { useState } from "react";
import api from "../api/axios";
import { CITIES, TYPES, FURNISHED, inr, errMsg } from "../constants";

export default function RentEstimator() {
  const [f, setF] = useState({
    city: "Chandigarh",
    type: "Apartment",
    furnished: "Semi-Furnished",
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1100,
    floor: 3,
    amenity_count: 5,
    rent: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const payload = {
        city: f.city,
        type: f.type,
        furnished: f.furnished,
        bedrooms: Number(f.bedrooms),
        bathrooms: Number(f.bathrooms),
        areaSqFt: Number(f.areaSqFt),
        floor: Number(f.floor),
        amenity_count: Number(f.amenity_count),
      };
      if (f.rent !== "") payload.rent = Number(f.rent);
      const res = await api.post("/predict-rent", payload);
      setResult(res.data.prediction);
    } catch (err) {
      setError(errMsg(err));
    }
    setBusy(false);
  };

  return (
    <div className="container py-4" style={{ maxWidth: 820 }}>
      <h3>Rent Estimator</h3>
      <p className="text-muted">
        Powered by a machine learning model trained on Indian rental data.
      </p>
      <div className="row g-4">
        <div className="col-md-7">
          <form className="card card-body shadow-sm" onSubmit={submit}>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">City</label>
                <select
                  className="form-select"
                  name="city"
                  value={f.city}
                  onChange={change}>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  name="type"
                  value={f.type}
                  onChange={change}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Furnishing</label>
                <select
                  className="form-select"
                  name="furnished"
                  value={f.furnished}
                  onChange={change}>
                  {FURNISHED.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Area (sq ft)</label>
                <input
                  className="form-control"
                  type="number"
                  name="areaSqFt"
                  required
                  min="50"
                  max="10000"
                  value={f.areaSqFt}
                  onChange={change}
                />
              </div>
              <div className="col-4">
                <label className="form-label">Bedrooms</label>
                <input
                  className="form-control"
                  type="number"
                  name="bedrooms"
                  required
                  min="1"
                  max="10"
                  value={f.bedrooms}
                  onChange={change}
                />
              </div>
              <div className="col-4">
                <label className="form-label">Bathrooms</label>
                <input
                  className="form-control"
                  type="number"
                  name="bathrooms"
                  required
                  min="1"
                  max="10"
                  value={f.bathrooms}
                  onChange={change}
                />
              </div>
              <div className="col-4">
                <label className="form-label">Floor</label>
                <input
                  className="form-control"
                  type="number"
                  name="floor"
                  required
                  min="0"
                  max="60"
                  value={f.floor}
                  onChange={change}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Number of amenities</label>
                <input
                  className="form-control"
                  type="number"
                  name="amenity_count"
                  required
                  min="0"
                  max="20"
                  value={f.amenity_count}
                  onChange={change}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Asking rent (optional, ₹)</label>
                <input
                  className="form-control"
                  type="number"
                  name="rent"
                  min="0"
                  value={f.rent}
                  onChange={change}
                />
              </div>
            </div>
            <button
              className="btn btn-primary mt-3"
              type="submit"
              disabled={busy}>
              {busy ? "Estimating..." : "Estimate Rent"}
            </button>
          </form>
        </div>
        <div className="col-md-5">
          {error && <div className="alert alert-danger">{error}</div>}
          {result && (
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <p className="text-muted mb-1">Estimated monthly rent</p>
                <p className="display-6 fw-bold text-primary">
                  {inr(result.predictedRent)}
                </p>
                <p className="mb-1">
                  Likely range: {inr(result.rangeLow)} to{" "}
                  {inr(result.rangeHigh)}
                </p>
                <p>
                  <span className="badge text-bg-info">
                    {result.priceCategory}
                  </span>
                </p>
                {result.verdict && (
                  <div className="alert alert-secondary mb-0">
                    {result.verdict}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
