import { Link } from "react-router-dom";
import { inr, badgeClass } from "../constants";

export default function PropertyCard({ property: p }) {
  return (
    <div className="card property-card h-100 shadow-sm">
      <div className="property-img">🏠</div>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <span className="badge text-bg-secondary">{p.type}</span>
          <span className={`badge text-bg-${badgeClass(p.status)}`}>
            {p.status}
          </span>
        </div>
        <h6 className="card-title mt-2">{p.title}</h6>
        <p className="text-muted small mb-2">
          {p.locality}, {p.city}
        </p>
        <p className="fw-bold fs-5 text-primary mb-2">
          {inr(p.rent)}
          <small className="text-muted fs-6"> / month</small>
        </p>
        <p className="small mb-3">
          {p.bedrooms} Bed · {p.bathrooms} Bath · {p.areaSqFt} sq ft ·{" "}
          {p.furnished}
        </p>
        <Link
          to={`/properties/${p._id}`}
          className="btn btn-outline-primary btn-sm mt-auto">
          View Details
        </Link>
      </div>
    </div>
  );
}
