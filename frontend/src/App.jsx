import { Link, Route, Routes } from "react-router-dom";
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
      <h1 className="display-4">404</h1>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Go Home
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer mt-5 py-4">
      <div className="container text-center small">
        RentEasy &middot; Rental Property Management System &middot; MCA
        Semester 3 Project, Chandigarh University
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "70vh" }}>
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
      </main>
      <Footer />
    </>
  );
}
