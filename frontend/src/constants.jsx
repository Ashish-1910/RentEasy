export const CITIES = [
  "Chandigarh",
  "Mohali",
  "Panchkula",
  "Delhi",
  "Gurugram",
  "Noida",
  "Mumbai",
  "Pune",
  "Bengaluru",
  "Hyderabad",
  "Jaipur",
  "Lucknow",
];
export const TYPES = ["Apartment", "Independent House", "Villa", "PG/Studio"];
export const FURNISHED = ["Unfurnished", "Semi-Furnished", "Furnished"];
export const AMENITIES = [
  "Parking",
  "Lift",
  "Power Backup",
  "Gym",
  "Swimming Pool",
  "24x7 Security",
  "Club House",
  "Modular Kitchen",
  "Gas Pipeline",
  "Park Facing",
  "CCTV",
  "Water Supply 24x7",
];

export const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
export const errMsg = (e) =>
  e?.response?.data?.message || e?.message || "Something went wrong";
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export const badgeClass = (s) =>
  ({
    Available: "success",
    Rented: "danger",
    Pending: "warning",
    Accepted: "success",
    Rejected: "danger",
  })[s] || "secondary";
