import { useState } from "react";
import { CITIES, TYPES, FURNISHED, AMENITIES, errMsg } from "../constants";

const BLANK = {
  title: "",
  description: "",
  city: "Chandigarh",
  locality: "",
  type: "Apartment",
  rent: "",
  bedrooms: 2,
  bathrooms: 1,
  areaSqFt: "",
  floor: 0,
  furnished: "Unfurnished",
  amenities: [],
  status: "Available",
};

export default function PropertyForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const [f, setF] = useState({ ...BLANK, ...(initial || {}) });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const toggleAmenity = (a) =>
    setF({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    });

  const submit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setValidated(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        title: f.title,
        description: f.description,
        city: f.city,
        locality: f.locality,
        type: f.type,
        rent: Number(f.rent),
        bedrooms: Number(f.bedrooms),
        bathrooms: Number(f.bathrooms),
        areaSqFt: Number(f.areaSqFt),
        floor: Number(f.floor),
        furnished: f.furnished,
        amenities: f.amenities,
        status: f.status,
      });
    } catch (err) {
      setError(errMsg(err));
    }
    setBusy(false);
  };

  return (
    <form
      noValidate
      className={`card card-body shadow-sm ${validated ? "was-validated" : ""}`}
      onSubmit={submit}>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            name="title"
            required
            maxLength={120}
            value={f.title}
            onChange={change}
          />
          <div className="invalid-feedback">Title is required.</div>
        </div>
        <div className="col-md-4">
          <label className="form-label">Monthly Rent (₹)</label>
          <input
            className="form-control"
            type="number"
            name="rent"
            required
            min="1000"
            value={f.rent}
            onChange={change}
          />
          <div className="invalid-feedback">Rent must be at least 1000.</div>
        </div>
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            rows="2"
            maxLength={1000}
            value={f.description}
            onChange={change}
          />
        </div>
        <div className="col-md-3">
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
        <div className="col-md-3">
          <label className="form-label">Locality</label>
          <input
            className="form-control"
            name="locality"
            required
            value={f.locality}
            onChange={change}
          />
          <div className="invalid-feedback">Locality is required.</div>
        </div>
        <div className="col-md-3">
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
        <div className="col-md-3">
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
        <div className="col-6 col-md-3">
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
          <div className="invalid-feedback">1 to 10.</div>
        </div>
        <div className="col-6 col-md-3">
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
          <div className="invalid-feedback">1 to 10.</div>
        </div>
        <div className="col-6 col-md-3">
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
          <div className="invalid-feedback">50 to 10000.</div>
        </div>
        <div className="col-6 col-md-3">
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
          <div className="invalid-feedback">0 to 60.</div>
        </div>
        <div className="col-12">
          <label className="form-label d-block">Amenities</label>
          {AMENITIES.map((a) => (
            <div className="form-check form-check-inline" key={a}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`am-${a}`}
                checked={f.amenities.includes(a)}
                onChange={() => toggleAmenity(a)}
              />
              <label className="form-check-label" htmlFor={`am-${a}`}>
                {a}
              </label>
            </div>
          ))}
        </div>
        {initial && (
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={f.status}
              onChange={change}>
              <option>Available</option>
              <option>Rented</option>
            </select>
          </div>
        )}
      </div>
      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

