import { Link } from "react-router-dom";
import PropertyImage from "./PropertyImage";
import { inr, badgeClass } from "../constants";

export default function PropertyCard({ property: p }) {
  const isNew = Date.now() - new Date(p.createdAt).getTime() < 14 * 86400000;

  return (
    <div className="card property-card h-100 shadow-sm">
      <Link to={`/properties/${p._id}`} className="text-decoration-none">
        <div className="pcard-media">
          <PropertyImage property={p} height={180} />
          <span
            className={`badge text-bg-${badgeClass(p.status)} pcard-status`}>
            {p.status}
          </span>
          {isNew && (
            <span className="badge text-bg-warning pcard-new">New</span>
          )}
          <span className="pcard-price">
            {inr(p.rent)}
            <small> /mo</small>
          </span>
        </div>
      </Link>
      <div className="card-body d-flex flex-column">
        <span className="small text-primary fw-semibold">{p.type}</span>
        <h6 className="card-title mt-1 mb-1">{p.title}</h6>
        <p className="text-muted small mb-3">
          <i className="bi bi-geo-alt-fill me-1"></i>
          {p.locality}, {p.city}
        </p>
        <div className="d-flex justify-content-between small text-secondary border-top pt-2 mb-3">
          <span>
            <i className="bi bi-door-open me-1"></i>
            {p.bedrooms} Bed
          </span>
          <span>
            <i className="bi bi-droplet me-1"></i>
            {p.bathrooms} Bath
          </span>
          <span>
            <i className="bi bi-aspect-ratio me-1"></i>
            {p.areaSqFt} sq ft
          </span>
        </div>
        <Link
          to={`/properties/${p._id}`}
          className="btn btn-primary btn-sm mt-auto">
          View Details <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
}
