import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PropertyForm from "../components/PropertyForm";
import { inr, errMsg, fmtDate, badgeClass } from "../constants";

function Stat({ label, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card stat-card shadow-sm"><div className="card-body py-3">
        <div className="text-muted small">{label}</div><div className="fs-4 fw-bold">{value}</div>
      </div></div>
    </div>
  );
}

function OwnerDashboard() {
  const [tab, setTab] = useState("properties");
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const flash = (type, text) => {
    setMsg({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const load = async () => {
    try {
      const [p, i] = await Promise.all([api.get("/properties/my"), api.get("/inquiries/received")]);
      setProperties(p.data.properties);
      setInquiries(i.data.inquiries);
    } catch (e) {
      flash("danger", errMsg(e));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addProperty = async (data) => {
    await api.post("/properties", data);
    await load();
    setTab("properties");
    flash("success", "Property added successfully");
  };
  const updateProperty = async (data) => {
    await api.put(`/properties/${editing._id}`, data);
    setEditing(null);
    await load();
    flash("success", "Property updated successfully");
  };
  const removeProperty = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? Its inquiries will also be removed.`)) return;
    try {
      await api.delete(`/properties/${p._id}`);
      await load();
      flash("success", "Property deleted");
    } catch (e) {
      flash("danger", errMsg(e));
    }
  };
  const respond = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      await load();
      flash("success", `Inquiry ${status.toLowerCase()}`);
    } catch (e) {
      flash("danger", errMsg(e));
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;

  const available = properties.filter((p) => p.status === "Available").length;
  const pending = inquiries.filter((q) => q.status === "Pending").length;

  return (
    <div className="container py-4">
      <h3 className="mb-3">Owner Dashboard</h3>
      {msg && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}
        <button type="button" className="btn-close" onClick={() => setMsg(null)} /></div>}

      <div className="row g-3 mb-4">
        <Stat label="Total Properties" value={properties.length} />
        <Stat label="Available" value={available} />
        <Stat label="Rented" value={properties.length - available} />
        <Stat label="Pending Inquiries" value={pending} />
      </div>

      <ul className="nav nav-tabs mb-3">
        {[["properties", "My Properties"], ["inquiries", "Inquiries Received"], ["add", "Add Property"]].map(([k, l]) => (
          <li className="nav-item" key={k}>
            <button className={`nav-link ${tab === k ? "active" : ""}`} onClick={() => { setTab(k); setEditing(null); }}>{l}</button>
          </li>
        ))}
      </ul>

      {tab === "properties" && (editing ? (
        <PropertyForm initial={editing} submitLabel="Save Changes" onSubmit={updateProperty} onCancel={() => setEditing(null)} />
      ) : properties.length === 0 ? (
        <div className="alert alert-info">You have not listed any property yet.</div>
      ) : (
        <div className="table-responsive card shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>Title</th><th>City</th><th>Rent</th><th>Status</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p._id}>
                  <td><Link to={`/properties/${p._id}`}>{p.title}</Link></td>
                  <td>{p.city}</td>
                  <td>{inr(p.rent)}</td>
                  <td><span className={`badge text-bg-${badgeClass(p.status)}`}>{p.status}</span></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditing(p)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeProperty(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {tab === "inquiries" && (inquiries.length === 0 ? (
        <div className="alert alert-info">No inquiries received yet.</div>
      ) : (
        <div className="table-responsive card shadow-sm">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr><th>Property</th><th>Tenant</th><th>Message</th><th>Date</th><th>Status</th><th className="text-end">Action</th></tr>
            </thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q._id}>
                  <td>{q.property?.title}</td>
                  <td>{q.tenant?.name}<div className="small text-muted">{q.tenant?.email}<br />{q.tenant?.phone}</div></td>
                  <td className="small" style={{ maxWidth: 240 }}>{q.message}</td>
                  <td className="small">{fmtDate(q.createdAt)}</td>
                  <td><span className={`badge text-bg-${badgeClass(q.status)}`}>{q.status}</span></td>
                  <td className="text-end">
                    {q.status === "Pending" && (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => respond(q._id, "Accepted")}>Accept</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => respond(q._id, "Rejected")}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {tab === "add" && <PropertyForm submitLabel="Add Property" onSubmit={addProperty} />}
    </div>
  );
}

function TenantDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/inquiries/my");
      setInquiries(res.data.inquiries);
    } catch (e) {
      setMsg({ type: "danger", text: errMsg(e) });
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this inquiry?")) return;
    try {
      await api.delete(`/inquiries/${id}`);
      await load();
      setMsg({ type: "success", text: "Inquiry withdrawn" });
    } catch (e) {
      setMsg({ type: "danger", text: errMsg(e) });
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;

  const count = (s) => inquiries.filter((q) => q.status === s).length;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Tenant Dashboard</h3>
        <div>
          <Link className="btn btn-primary btn-sm me-2" to="/properties">Browse Properties</Link>
          <Link className="btn btn-outline-success btn-sm" to="/estimator">Rent Estimator</Link>
        </div>
      </div>
      {msg && <div className={`alert alert-${msg.type} alert-dismissible`}>{msg.text}
        <button type="button" className="btn-close" onClick={() => setMsg(null)} /></div>}

      <div className="row g-3 mb-4">
        <Stat label="Inquiries Sent" value={inquiries.length} />
        <Stat label="Pending" value={count("Pending")} />
        <Stat label="Accepted" value={count("Accepted")} />
        <Stat label="Rejected" value={count("Rejected")} />
      </div>

      <h5>My Inquiries</h5>
      {inquiries.length === 0 ? (
        <div className="alert alert-info">You have not sent any inquiry yet.</div>
      ) : (
        <div className="table-responsive card shadow-sm">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr><th>Property</th><th>City</th><th>Rent</th><th>Sent on</th><th>Status</th><th className="text-end">Action</th></tr>
            </thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q._id}>
                  <td>{q.property ? <Link to={`/properties/${q.property._id}`}>{q.property.title}</Link> : "Removed listing"}</td>
                  <td>{q.property?.city}</td>
                  <td>{q.property ? inr(q.property.rent) : "-"}</td>
                  <td className="small">{fmtDate(q.createdAt)}</td>
                  <td><span className={`badge text-bg-${badgeClass(q.status)}`}>{q.status}</span></td>
                  <td className="text-end">
                    {q.status === "Pending" && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => withdraw(q._id)}>Withdraw</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === "owner" ? <OwnerDashboard /> : <TenantDashboard />;
}