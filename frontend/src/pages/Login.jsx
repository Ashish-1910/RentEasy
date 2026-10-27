import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../constants";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setValidated(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h4 className="mb-3 text-center">Login to RentEasy</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form
            noValidate
            className={validated ? "was-validated" : ""}
            onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="invalid-feedback">Enter a valid email.</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="invalid-feedback">Password is required.</div>
            </div>
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={busy}>
              {busy ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-center mt-3 mb-2 small">
            New here? <Link to="/register">Create an account</Link>
          </p>
          <div className="alert alert-light border small mb-0">
            <strong>Demo logins</strong>
            <br />
            Tenant: priya.sharma@example.com / Tenant@123
            <br />
            Owner: rajesh.kumar@example.com / Owner@123
          </div>
        </div>
      </div>
    </div>
  );
}

