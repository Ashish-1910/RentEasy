import { useState } from "react";
import { CITIES, TYPES, FURNISHED } from "../constants";

const EMPTY = {
  search: "",
  city: "",
  type: "",
  minRent: "",
  maxRent: "",
  bedrooms: "",
  furnished: "",
  sort: "newest",
};

export default function SearchFilter({ initial, onApply }) {
  const [f, setF] = useState({ ...EMPTY, ...initial });
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    onApply(f);
  };
  const clear = () => {
    setF(EMPTY);
    onApply(EMPTY);
  };

  return (
    <form className="card card-body shadow-sm mb-4" onSubmit={submit}>
      <div className="row g-2">
        <div className="col-md-4">
          <input
            className="form-control"
            name="search"
            placeholder="Search title, locality, city"
            value={f.search}
            onChange={change}
          />
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            name="city"
            value={f.city}
            onChange={change}>
            <option value="">All Cities</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            name="type"
            value={f.type}
            onChange={change}>
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            name="bedrooms"
            value={f.bedrooms}
            onChange={change}>
            <option value="">Any Bedrooms</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+ BHK
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            name="furnished"
            value={f.furnished}
            onChange={change}>
            <option value="">Any Furnishing</option>
            {FURNISHED.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3">
          <input
            className="form-control"
            type="number"
            min="0"
            name="minRent"
            placeholder="Min rent (₹)"
            value={f.minRent}
            onChange={change}
          />
        </div>
        <div className="col-6 col-md-3">
          <input
            className="form-control"
            type="number"
            min="0"
            name="maxRent"
            placeholder="Max rent (₹)"
            value={f.maxRent}
            onChange={change}
          />
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            name="sort"
            value={f.sort}
            onChange={change}>
            <option value="newest">Newest first</option>
            <option value="rent_asc">Rent: low to high</option>
            <option value="rent_desc">Rent: high to low</option>
          </select>
        </div>
        <div className="col-6 col-md-3 d-flex gap-2">
          <button className="btn btn-primary flex-grow-1" type="submit">
            Apply
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={clear}>
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
