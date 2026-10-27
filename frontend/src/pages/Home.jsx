import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import { CITIES, TYPES } from "../constants";

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get("/properties?limit=6")
      .then((res) => setFeatured(res.data.properties))
      .catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (city) p.set("city", city);
    if (type) p.set("type", type);
    navigate(`/properties?${p.toString()}`);
  };

  return (
    <>
      <section className="hero py-5">
        <div className="container py-4 text-center">
          <h1 className="display-5 fw-bold">
            Find your next home across India
          </h1>
          <p className="lead mb-4">
            Browse verified rental listings, contact owners directly, and check
            fair rent with our ML estimator.
          </p>
          <form className="row g-2 justify-content-center" onSubmit={search}>
            <div className="col-12 col-md-3">
              <select
                className="form-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}>
                <option value="">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}>
                <option value="">All Types</option>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button className="btn btn-warning fw-semibold" type="submit">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Latest Listings</h4>
          <Link to="/properties">View all</Link>
        </div>
        <div className="row g-4">
          {featured.map((p) => (
            <div className="col-12 col-md-6 col-lg-4" key={p._id}>
              <PropertyCard property={p} />
            </div>
          ))}
        </div>

        <h4 className="mt-5 mb-3">How it works</h4>
        <div className="row g-3 text-center">
          {[
            ["1. Search", "Filter by city, type, rent and furnishing."],
            [
              "2. Inquire",
              "Register as a tenant and send an inquiry to the owner.",
            ],
            ["3. Move in", "Owners accept inquiries and you close the deal."],
          ].map(([t, d]) => (
            <div className="col-md-4" key={t}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5>{t}</h5>
                  <p className="text-muted mb-0">{d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

