import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RentEstimator from "./pages/RentEstimator";

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-3 fw-bold">404</h1>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Go Home
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer mt-5 pt-5 pb-3">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <h5 className="text-white">
              <i className="bi bi-house-door-fill me-2 text-info"></i>RentEasy
            </h5>
            <p className="small mb-0">
              A rental property platform for India with owner and tenant
              dashboards, inquiry tracking and an ML-based rent estimator.
            </p>
          </div>
          <div className="col-6 col-md-3">
            <h6 className="text-white">Explore</h6>
            <ul className="list-unstyled small mb-0">
              <li>
                <Link to="/properties">Browse properties</Link>
              </li>
              <li>
                <Link to="/estimator">Rent estimator</Link>
              </li>
              <li>
                <Link to="/register">Create account</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h6 className="text-white">Built with</h6>
            <p className="small mb-0">
              React · Bootstrap · Node.js · Express · MongoDB · scikit-learn ·
              MySQL · Tableau
            </p>
          </div>
        </div>
        <hr className="border-secondary mt-4" />
        <div className="text-center small">
          MCA Semester 3 Project · University Institute of Computing, Chandigarh
          University
        </div>
      </div>
    </footer>
  );
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <ScrollTop />
      <Navbar />
      <main style={{ minHeight: "70vh" }}>
        <div key={location.pathname} className="page-fade">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estimator"
              element={
                <ProtectedRoute>
                  <RentEstimator />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
}
