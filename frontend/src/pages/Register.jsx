import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../constants";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "tenant",
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!e.currentTarget.checkValidity()) {
      setValidated(true);
      return;
    }
    if (f.password !== f.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await register({
        name: f.name,
        email: f.email,
        phone: f.phone,
        password: f.password,
        role: f.role,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h4 className="mb-3 text-center">Create your account</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form
            noValidate
            className={validated ? "was-validated" : ""}
            onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input
                className="form-control"
                name="name"
                required
                maxLength={80}
                value={f.name}
                onChange={change}
              />
              <div className="invalid-feedback">Name is required.</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                required
                value={f.email}
                onChange={change}
              />
              <div className="invalid-feedback">Enter a valid email.</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Mobile number</label>
              <input
                className="form-control"
                name="phone"
                required
                pattern="[6-9][0-9]{9}"
                value={f.phone}
                onChange={change}
              />
              <div className="invalid-feedback">
                Enter a valid 10-digit Indian mobile number.
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={f.password}
                  onChange={change}
                />
                <div className="invalid-feedback">At least 6 characters.</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Confirm password</label>
                <input
                  className="form-control"
                  type="password"
                  name="confirm"
                  required
                  value={f.confirm}
                  onChange={change}
                />
                <div className="invalid-feedback">Confirm your password.</div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label d-block">I am a</label>
              {["tenant", "owner"].map((r) => (
                <div className="form-check form-check-inline" key={r}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id={`role-${r}`}
                    value={r}
                    checked={f.role === r}
                    onChange={change}
                  />
                  <label
                    className="form-check-label text-capitalize"
                    htmlFor={`role-${r}`}>
                    {r}
                  </label>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={busy}>
              {busy ? "Creating..." : "Register"}
            </button>
          </form>
          <p className="text-center mt-3 mb-0 small">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
