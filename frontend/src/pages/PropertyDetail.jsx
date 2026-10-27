import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PropertyImage from "../components/PropertyImage";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import InquiryModal from "../components/InquiryModal";
import { inr, errMsg, fmtDate, badgeClass } from "../constants";

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [estError, setEstError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/properties/${id}`)
      .then((res) => setP(res.data.property))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const checkEstimate = async () => {
    setEstError("");
    try {
      const res = await api.post("/predict-rent", {
        city: p.city,
        type: p.type,
        furnished: p.furnished,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        areaSqFt: p.areaSqFt,
        floor: p.floor,
        amenities: p.amenities,
        rent: p.rent,
      });
      setEstimate(res.data.prediction);
    } catch (e) {
      setEstError(errMsg(e));
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  if (error)
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container py-4">
      <Link to="/properties" className="small">
        &larr; Back to listings
      </Link>
      {notice && <div className="alert alert-success mt-3">{notice}</div>}

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <PropertyImage property={p} height={300} />
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span className="badge text-bg-secondary">{p.type}</span>
                <span className={`badge text-bg-${badgeClass(p.status)}`}>
                  {p.status}
                </span>
              </div>
              <h3 className="mt-2">{p.title}</h3>
              <p className="text-muted">
                {p.locality}, {p.city}
              </p>
              <p>{p.description}</p>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <th>Bedrooms</th>
                    <td>{p.bedrooms}</td>
                    <th>Bathrooms</th>
                    <td>{p.bathrooms}</td>
                  </tr>
                  <tr>
                    <th>Area</th>
                    <td>{p.areaSqFt} sq ft</td>
                    <th>Floor</th>
                    <td>{p.floor}</td>
                  </tr>
                  <tr>
                    <th>Furnishing</th>
                    <td>{p.furnished}</td>
                    <th>Listed on</th>
                    <td>{fmtDate(p.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
              <h6>Amenities</h6>
              {p.amenities?.length ? (
                p.amenities.map((a) => (
                  <span key={a} className="badge text-bg-light border me-1">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-muted small">No amenities listed</span>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <p className="fs-3 fw-bold text-primary mb-1">
                {inr(p.rent)}
                <small className="fs-6 text-muted"> / month</small>
              </p>
              <hr />
              <p className="mb-1">
                <strong>Owner:</strong> {p.owner?.name}
              </p>
              <p className="mb-3">
                <strong>Phone:</strong> {p.owner?.phone || "Not shared"}
              </p>

              {!user && (
                <Link
                  className="btn btn-primary w-100"
                  to="/login"
                  state={{ from: `/properties/${id}` }}>
                  Login to send inquiry
                </Link>
              )}
              {user?.role === "tenant" && p.status === "Available" && (
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowModal(true)}>
                  Send Inquiry
                </button>
              )}
              {user?.role === "tenant" && p.status !== "Available" && (
                <div className="alert alert-secondary mb-0">
                  This property is already rented.
                </div>
              )}
              {user?.role === "owner" && (
                <div className="text-muted small">
                  Owners cannot send inquiries.
                </div>
              )}
            </div>
          </div>

          {user && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h6>Is the rent fair?</h6>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={checkEstimate}>
                  Compare with market estimate
                </button>
                {estError && (
                  <div className="alert alert-danger mt-2 py-2">{estError}</div>
                )}
                {estimate && (
                  <div className="mt-3 small">
                    <p className="mb-1">
                      Estimated rent:{" "}
                      <strong>{inr(estimate.predictedRent)}</strong>
                    </p>
                    <p className="mb-1">
                      Range: {inr(estimate.rangeLow)} to{" "}
                      {inr(estimate.rangeHigh)}
                    </p>
                    <p className="mb-1">
                      Category:{" "}
                      <span className="badge text-bg-info">
                        {estimate.priceCategory}
                      </span>
                    </p>
                    {estimate.verdict && (
                      <p className="mb-0 fw-semibold">{estimate.verdict}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <InquiryModal
          property={p}
          onClose={() => setShowModal(false)}
          onSent={() => {
            setShowModal(false);
            setNotice(
              "Inquiry sent successfully. The owner will respond soon.",
            );
          }}
        />
      )}
    </div>
  );
}
