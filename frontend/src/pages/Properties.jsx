import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import SearchFilter from "../components/SearchFilter";
import PropertyCard from "../components/PropertyCard";
import { errMsg } from "../constants";

const FILTER_KEYS = [
  "search",
  "city",
  "type",
  "minRent",
  "maxRent",
  "bedrooms",
  "furnished",
  "sort",
];

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({
    properties: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = params.toString();

  useEffect(() => {
    const q = new URLSearchParams(query);
    if (!q.has("limit")) q.set("limit", "9");
    setLoading(true);
    setError("");
    api
      .get(`/properties?${q.toString()}`)
      .then((res) => setData(res.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [query]);

  const apply = (f) => {
    const next = {};
    FILTER_KEYS.forEach((k) => {
      if (
        f[k] !== undefined &&
        f[k] !== "" &&
        !(k === "sort" && f[k] === "newest")
      )
        next[k] = f[k];
    });
    setParams(next);
  };

  const goPage = (p) => {
    const next = Object.fromEntries(params.entries());
    next.page = p;
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Browse Rental Properties</h3>
      <SearchFilter
        key={query}
        initial={Object.fromEntries(params.entries())}
        onApply={apply}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : data.properties.length === 0 ? (
        <div className="alert alert-info">
          No properties found. Try changing your filters.
        </div>
      ) : (
        <>
          <p className="text-muted">
            Showing {data.properties.length} of {data.total} properties
          </p>
          <div className="row g-4">
            {data.properties.map((p) => (
              <div className="col-12 col-md-6 col-lg-4" key={p._id}>
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
          {data.pages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${data.page <= 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goPage(data.page - 1)}>
                    Previous
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">
                    {data.page} / {data.pages}
                  </span>
                </li>
                <li
                  className={`page-item ${data.page >= data.pages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goPage(data.page + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
