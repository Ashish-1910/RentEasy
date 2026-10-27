import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(
      q.trim()
        ? `/properties?search=${encodeURIComponent(q.trim())}`
        : "/properties",
    );
    setQ("");
  };
  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark sticky-top site-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-house-door-fill me-2 text-info"></i>RentEasy
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/properties">
                Properties
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/estimator">
                  Rent Estimator
                </NavLink>
              </li>
            )}
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard">
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>
          <form className="d-flex me-lg-3 mb-2 mb-lg-0" onSubmit={onSearch}>
            <input
              className="form-control form-control-sm me-2"
              type="search"
              placeholder="Search city or locality"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn btn-outline-light btn-sm" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-light small d-none d-xl-inline">
                  {user.name.split(" ")[0]} ({user.role})
                </span>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
