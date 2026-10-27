import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import SkeletonCard from "../components/SkeletonCard";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import { CITY_PALETTES } from "../components/PropertyImage";
import { CITIES, TYPES } from "../constants";
import { useAuth } from "../context/AuthContext";

const SKY = [
  [0, 60],
  [40, 90],
  [80, 50],
  [120, 110],
  [170, 70],
  [210, 130],
  [260, 80],
  [300, 100],
  [350, 60],
  [390, 120],
  [440, 85],
  [480, 140],
  [530, 70],
  [570, 105],
  [620, 55],
  [660, 125],
  [710, 90],
  [750, 65],
  [800, 115],
  [850, 75],
  [890, 135],
  [940, 60],
  [980, 100],
  [1030, 80],
  [1070, 120],
  [1120, 70],
  [1160, 95],
];

function Skyline() {
  return (
    <svg
      className="hero-skyline"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      aria-hidden="true">
      {SKY.map(([x, h], i) => (
        <rect
          key={`b${i}`}
          x={x - 8}
          y={160 - h * 0.8 - 14}
          width="34"
          height={h * 0.8 + 14}
          fill="#f5f7fb"
          opacity=".35"
        />
      ))}
      {SKY.map(([x, h], i) => (
        <rect
          key={`f${i}`}
          x={x}
          y={160 - h}
          width="36"
          height={h}
          fill="#f5f7fb"
        />
      ))}
    </svg>
  );
}

const POPULAR = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Chandigarh",
  "Pune",
  "Hyderabad",
  "Gurugram",
  "Jaipur",
];
const STEPS = [
  [
    "bi-search",
    "1. Search",
    "Filter by city, type, rent range and furnishing to find the right place.",
  ],
  [
    "bi-chat-dots",
    "2. Inquire",
    "Register as a tenant and send an inquiry straight to the owner.",
  ],
  [
    "bi-key",
    "3. Move in",
    "Owners accept inquiries and you close the deal directly.",
  ],
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [text, setText] = useState("");
  const [featured, setFeatured] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/properties?limit=6")
      .then((res) => {
        setFeatured(res.data.properties);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (text.trim()) p.set("search", text.trim());
    if (city) p.set("city", city);
    if (type) p.set("type", type);
    navigate(`/properties?${p.toString()}`);
  };

  return (
    <>
      <section className="hero-v2">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <div className="container position-relative text-center">
          <span className="badge rounded-pill text-bg-light mb-3 px-3 py-2">
            <i className="bi bi-stars text-warning me-1"></i>ML-powered rent
            estimates
          </span>
          <h1 className="display-4 hero-title">
            Find your next home
            <br />
            across India
          </h1>
          <p className="lead mb-4 opacity-90">
            Browse rental listings, contact owners directly and check whether
            the rent is fair.
          </p>

          <form
            className="glass-search mx-auto"
            style={{ maxWidth: 860 }}
            onSubmit={search}>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <input
                  className="form-control form-control-lg"
                  placeholder="Locality or keyword"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-3">
                <select
                  className="form-select form-select-lg"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}>
                  <option value="">All Cities</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-3">
                <select
                  className="form-select form-select-lg"
                  value={type}
                  onChange={(e) => setType(e.target.value)}>
                  <option value="">All Types</option>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-2 d-grid">
                <button
                  className="btn btn-warning btn-lg fw-semibold"
                  type="submit">
                  <i className="bi bi-search me-1"></i>Search
                </button>
              </div>
            </div>
          </form>

          <div className="mt-3">
            <span className="small opacity-75 me-2">Popular:</span>
            {["Mumbai", "Bengaluru", "Delhi", "Chandigarh", "Pune"].map((c) => (
              <Link key={c} className="chip" to={`/properties?city=${c}`}>
                {c}
              </Link>
            ))}
          </div>
        </div>
        <Skyline />
      </section>

      <div className="container stats-strip">
        <div className="row g-3">
          {[
            [<CountUp end={total} />, "Available listings"],
            [<CountUp end={CITIES.length} />, "Cities covered"],
            [<CountUp end={TYPES.length} />, "Property types"],
            [<CountUp end={92} suffix="%" />, "Price-category accuracy (ML)"],
          ].map(([num, label], i) => (
            <div className="col-6 col-lg-3" key={label}>
              <Reveal delay={i * 80} className="h-100">
                <div className="stat-pill h-100">
                  <div className="num">{num}</div>
                  <div className="text-muted small">{label}</div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      <div className="container pt-5">
        <Reveal>
          <h4 className="section-title">Explore popular cities</h4>
        </Reveal>
        <div className="row g-3">
          {POPULAR.map((c, i) => {
            const [a, b] = CITY_PALETTES[c];
            return (
              <div className="col-6 col-md-3" key={c}>
                <Reveal delay={i * 60}>
                  <Link
                    to={`/properties?city=${c}`}
                    className="city-card"
                    style={{
                      background: `linear-gradient(135deg, ${a}, ${b})`,
                    }}>
                    <i className="bi bi-buildings"></i>
                    <span className="fw-bold fs-5">{c}</span>
                    <span className="small opacity-75">
                      View rentals <i className="bi bi-arrow-right"></i>
                    </span>
                  </Link>
                </Reveal>
              </div>
            );
          })}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
          <Reveal>
            <h4 className="section-title mb-0">Latest listings</h4>
          </Reveal>
          <Link to="/properties">
            View all <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="row g-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="col-12 col-md-6 col-lg-4" key={i}>
                  <SkeletonCard />
                </div>
              ))
            : featured.map((p) => (
                <div className="col-12 col-md-6 col-lg-4" key={p._id}>
                  <PropertyCard property={p} />
                </div>
              ))}
        </div>

        <Reveal>
          <h4 className="section-title mt-5">How it works</h4>
        </Reveal>
        <div className="row g-3">
          {STEPS.map(([icon, title, desc], i) => (
            <div className="col-md-4" key={title}>
              <Reveal delay={i * 100} className="h-100">
                <div className="step-card">
                  <div className="step-icon">
                    <i className={`bi ${icon}`}></i>
                  </div>
                  <h5>{title}</h5>
                  <p className="text-muted mb-0">{desc}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal className="mt-5">
          <div className="cta-banner">
            <div className="row align-items-center g-3">
              <div className="col-lg-8">
                <h3 className="fw-bold">Not sure what rent to ask or pay?</h3>
                <p className="mb-0 opacity-90">
                  Our machine learning model compares a property with Indian
                  market patterns and returns an estimate, a likely range and a
                  price category.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link
                  className="btn btn-warning btn-lg fw-semibold"
                  to={user ? "/estimator" : "/register"}>
                  {user ? "Open Rent Estimator" : "Get started free"}{" "}
                  <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
