import { useState } from "react";
import api from "../api/axios";
import { errMsg } from "../constants";

export default function InquiryModal({ property, onClose, onSent }) {
  const [message, setMessage] = useState(
    "Namaste, I am interested in this property. Is it still available?",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post("/inquiries", { propertyId: property._id, message });
      onSent();
    } catch (e) {
      setError(errMsg(e));
      setBusy(false);
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Send Inquiry</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <p className="small text-muted mb-2">{property.title}</p>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <label className="form-label">Your message</label>
            <textarea
              className="form-control"
              rows="4"
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={send} disabled={busy}>
              {busy ? "Sending..." : "Send Inquiry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
