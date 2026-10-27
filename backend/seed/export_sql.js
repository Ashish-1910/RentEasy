require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");

const SQL_DIR = path.join(__dirname, "..", "..", "sql");
const DATA_DIR = path.join(SQL_DIR, "data");
const TENANT_CITIES = ["Chandigarh", "Delhi", "Mohali", "Bengaluru", "Pune", "Gurugram", "Mumbai", "Hyderabad"];

const day = (d) => new Date(d).toISOString().slice(0, 10);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const sq = (v) =>
  v === null || v === undefined ? "NULL"
  : typeof v === "number" ? String(v)
  : "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const toCsv = (headers, rows) =>
  [headers.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n") + "\n";
const insertSql = (table, cols, rows) =>
  rows.length
    ? `INSERT INTO ${table} (${cols.join(", ")}) VALUES\n` +
      rows.map((r) => "  (" + r.map(sq).join(", ") + ")").join(",\n") + ";\n\n"
    : "";

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const users = await User.find().sort({ _id: 1 }).lean();
  const props = await Property.find().sort({ _id: 1 }).lean();
  const inqs = await Inquiry.find().sort({ createdAt: 1, _id: 1 }).lean();
  if (!users.length || !props.length) throw new Error("Database is empty. Run: npm run seed");

  const userId = new Map(users.map((u, i) => [String(u._id), i + 1]));
  const propId = new Map(props.map((p, i) => [String(p._id), i + 1]));
  const userByKey = new Map(users.map((u) => [String(u._id), u]));

  // users (owners get the city of their first property, tenants get a fixed city list)
  const ownerCity = {};
  props.forEach((p) => { const k = String(p.owner); if (!ownerCity[k]) ownerCity[k] = p.city; });
  let tIdx = 0;
  const userRows = users.map((u, i) => [
    i + 1, u.name, u.email, cap(u.role),
    u.role === "owner" ? ownerCity[String(u._id)] || "Delhi" : TENANT_CITIES[tIdx++ % TENANT_CITIES.length],
  ]);

  // inquiry counts per property
  const inqCount = new Map();
  const validInqs = inqs.filter((q) => propId.has(String(q.property)) && userId.has(String(q.tenant)));
  validInqs.forEach((q) => inqCount.set(String(q.property), (inqCount.get(String(q.property)) || 0) + 1));

  // properties
  const propRows = props.map((p, i) => [
    i + 1, userId.get(String(p.owner)), p.city, p.locality || "", p.type, p.bedrooms, p.bathrooms,
    p.areaSqFt, p.furnished, p.floor || 0, (p.amenities || []).length, p.rent, p.status, day(p.createdAt),
  ]);

  // inquiries
  const inqRows = validInqs.map((q, i) => [
    i + 1, propId.get(String(q.property)), userId.get(String(q.tenant)), day(q.createdAt), q.status,
  ]);

  // leases: one per Rented property (tenant = accepted inquirer if any)
  const tenants = users.filter((u) => u.role === "tenant");
  const accepted = new Map();
  validInqs.forEach((q) => {
    if (q.status === "Accepted" && !accepted.has(String(q.property))) accepted.set(String(q.property), String(q.tenant));
  });
  const today = new Date();
  const leaseRows = [];
  props.filter((p) => p.status === "Rented").forEach((p, idx) => {
    const tid = accepted.get(String(p._id)) || String(tenants[idx % tenants.length]._id);
    let start = new Date(new Date(p.createdAt).getTime() + (7 + ((idx * 5) % 30)) * 86400000);
    if (start > today) start = new Date(today.getTime() - 86400000);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 11);
    const rent = Math.round((p.rent * (1 - (idx % 4) * 0.02)) / 500) * 500;
    leaseRows.push([leaseRows.length + 1, propId.get(String(p._id)), userId.get(tid), day(start), day(end), rent]);
  });

  // flat analysis file for Excel and Tableau
  const analysisRows = props.map((p, i) => [
    i + 1, p.title, p.city, p.locality || "", p.type, p.bedrooms, p.bathrooms, p.areaSqFt, p.furnished,
    p.floor || 0, (p.amenities || []).length, p.rent, p.status, userByKey.get(String(p.owner)).name,
    day(p.createdAt), inqCount.get(String(p._id)) || 0, Math.round((p.rent / p.areaSqFt) * 100) / 100,
  ]);

  // ---- write files ----
  let sql = "USE rental_analytics;\n\n";
  sql += insertSql("users", ["user_id", "name", "email", "role", "city"], userRows);
  sql += insertSql("properties",
    ["property_id", "owner_id", "city", "locality", "property_type", "bedrooms", "bathrooms", "area_sqft",
     "furnished", "floor_no", "amenity_count", "rent", "status", "listed_date"], propRows);
  sql += insertSql("inquiries", ["inquiry_id", "property_id", "tenant_id", "inquiry_date", "status"], inqRows);
  sql += insertSql("leases", ["lease_id", "property_id", "tenant_id", "start_date", "end_date", "monthly_rent"], leaseRows);
  fs.writeFileSync(path.join(SQL_DIR, "02_insert_data.sql"), sql);

  const w = (name, headers, rows) => fs.writeFileSync(path.join(DATA_DIR, name), toCsv(headers, rows));
  w("users.csv", ["user_id", "name", "email", "role", "city"], userRows);
  w("properties.csv", ["property_id", "owner_id", "city", "locality", "property_type", "bedrooms", "bathrooms",
    "area_sqft", "furnished", "floor_no", "amenity_count", "rent", "status", "listed_date"], propRows);
  w("inquiries.csv", ["inquiry_id", "property_id", "tenant_id", "inquiry_date", "status"], inqRows);
  w("leases.csv", ["lease_id", "property_id", "tenant_id", "start_date", "end_date", "monthly_rent"], leaseRows);
  w("property_analysis.csv", ["property_id", "title", "city", "locality", "property_type", "bedrooms", "bathrooms",
    "area_sqft", "furnished", "floor", "amenity_count", "rent", "status", "owner_name", "listed_date",
    "inquiry_count", "rent_per_sqft"], analysisRows);

  console.log("EXPORT COMPLETE");
  console.log(`users: ${userRows.length} | properties: ${propRows.length} | inquiries: ${inqRows.length} | leases: ${leaseRows.length}`);
  console.log("Written: sql/02_insert_data.sql and 5 CSV files in sql/data/");
  await mongoose.disconnect();
})().catch(async (e) => {
  console.error("Export failed:", e.message);
  await mongoose.disconnect();
  process.exit(1);
});
