require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");

// ---------- seeded random helpers (same data on every run) ----------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pickOne = (arr) => arr[Math.floor(rand() * arr.length)];
const weightedPick = (items, weights) => {
  let r = rand() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};
const normal = () => {
  let u = 0,
    v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const daysAgo = (d) =>
  new Date(Date.now() - d * 86400000 - randInt(0, 86399) * 1000);

// ---------- reference data ----------
const OWNERS = [
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "9876543210",
  },
  {
    name: "Gurpreet Singh",
    email: "gurpreet.singh@example.com",
    phone: "9988776655",
  },
  {
    name: "Sunita Verma",
    email: "sunita.verma@example.com",
    phone: "9815012345",
  },
  {
    name: "Amit Agarwal",
    email: "amit.agarwal@example.com",
    phone: "9810234567",
  },
  {
    name: "Harpreet Kaur",
    email: "harpreet.kaur@example.com",
    phone: "9872345678",
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.malhotra@example.com",
    phone: "9911223344",
  },
  { name: "Neha Gupta", email: "neha.gupta@example.com", phone: "9823456789" },
  {
    name: "Suresh Reddy",
    email: "suresh.reddy@example.com",
    phone: "9848012345",
  },
  { name: "Anil Joshi", email: "anil.joshi@example.com", phone: "9414123456" },
];

const TENANTS = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9812345678",
  },
  {
    name: "Rohan Mehta",
    email: "rohan.mehta@example.com",
    phone: "9822334455",
  },
  {
    name: "Simran Kaur",
    email: "simran.kaur@example.com",
    phone: "9780123456",
  },
  { name: "Arjun Nair", email: "arjun.nair@example.com", phone: "9886543210" },
  {
    name: "Pooja Yadav",
    email: "pooja.yadav@example.com",
    phone: "9936123456",
  },
  {
    name: "Karan Bhatia",
    email: "karan.bhatia@example.com",
    phone: "9876012345",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "9845678901",
  },
  {
    name: "Mohit Chauhan",
    email: "mohit.chauhan@example.com",
    phone: "9650123456",
  },
];

// city: base rent per sq ft (INR) and localities (same scale as the ML dataset)
const CITY_DATA = {
  Chandigarh: {
    base: 30,
    localities: [
      "Sector 17",
      "Sector 22",
      "Sector 35",
      "Sector 44",
      "Manimajra",
    ],
  },
  Mohali: {
    base: 24,
    localities: [
      "Sector 70",
      "Sector 71",
      "Phase 5",
      "Sector 82",
      "Kharar Road",
    ],
  },
  Panchkula: {
    base: 22,
    localities: ["Sector 5", "Sector 20", "Sector 15", "Sector 7"],
  },
  Delhi: {
    base: 38,
    localities: ["Dwarka", "Rohini", "Saket", "Lajpat Nagar", "Janakpuri"],
  },
  Gurugram: {
    base: 40,
    localities: ["DLF Phase 3", "Sector 56", "Golf Course Road", "Sohna Road"],
  },
  Noida: {
    base: 28,
    localities: ["Sector 62", "Sector 137", "Sector 18", "Sector 75"],
  },
  Mumbai: {
    base: 70,
    localities: [
      "Andheri West",
      "Powai",
      "Thane West",
      "Borivali",
      "Navi Mumbai",
    ],
  },
  Pune: { base: 30, localities: ["Hinjewadi", "Kothrud", "Wakad", "Baner"] },
  Bengaluru: {
    base: 38,
    localities: ["Koramangala", "Whitefield", "HSR Layout", "Electronic City"],
  },
  Hyderabad: {
    base: 30,
    localities: ["Gachibowli", "Madhapur", "Kukatpally", "Banjara Hills"],
  },
  Jaipur: {
    base: 18,
    localities: ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme"],
  },
  Lucknow: {
    base: 16,
    localities: ["Gomti Nagar", "Hazratganj", "Indira Nagar", "Aliganj"],
  },
};
const TYPES = ["Apartment", "Independent House", "Villa", "PG/Studio"];
const TYPE_MULT = {
  Apartment: 1.0,
  "Independent House": 1.1,
  Villa: 1.5,
  "PG/Studio": 0.9,
};
const FURNISHED = ["Unfurnished", "Semi-Furnished", "Furnished"];
const FURN_MULT = { Unfurnished: 0.9, "Semi-Furnished": 1.0, Furnished: 1.15 };
const AMENITIES = [
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
const MESSAGES = [
  "Namaste, I am interested in this property. Is it still available?",
  "Can I visit this Sunday morning? Please share a convenient time.",
  "Is the rent negotiable? I plan to stay for at least 2 years.",
  "Please share the security deposit and maintenance details.",
  "I work nearby and need to shift next month. Is that possible?",
  "Is parking included in the rent? I have a car and a two-wheeler.",
  "We are a family of four. Are pets and guests allowed?",
];

// ---------- property generator ----------
const buildProperty = (city, ownerId) => {
  const { base, localities } = CITY_DATA[city];
  const locality = pickOne(localities);
  const type = weightedPick(TYPES, [55, 20, 10, 15]);
  let bed, area, floor;
  if (type === "Apartment") {
    bed = randInt(1, 4);
    area = bed * randInt(300, 430);
    floor = randInt(0, 20);
  } else if (type === "Independent House") {
    bed = randInt(2, 5);
    area = bed * randInt(350, 500);
    floor = randInt(0, 2);
  } else if (type === "Villa") {
    bed = randInt(3, 6);
    area = bed * randInt(450, 650);
    floor = randInt(0, 2);
  } else {
    bed = 1;
    area = randInt(120, 300);
    floor = randInt(0, 3);
  }
  const bath = type === "PG/Studio" ? 1 : Math.max(1, bed - randInt(0, 1));
  const furnished = weightedPick(FURNISHED, [30, 40, 30]);
  const amenityCount = randInt(0, 10);

  let rent =
    area *
    base *
    TYPE_MULT[type] *
    FURN_MULT[furnished] *
    (1 + 0.012 * amenityCount) *
    (1 + 0.004 * floor) *
    (1 + 0.06 * normal());
  rent = Math.max(3000, Math.round(rent / 500) * 500);

  const title =
    type === "PG/Studio"
      ? `Studio / PG Room in ${locality}, ${city}`
      : `${bed}BHK ${type} in ${locality}, ${city}`;
  const floorText = floor === 0 ? "ground floor" : `floor ${floor}`;
  const created = daysAgo(randInt(2, 180));

  return {
    title,
    description: `${furnished} ${type.toLowerCase()} of ${area} sq ft on ${floorText} in ${locality}. Close to market, schools and public transport.`,
    city,
    locality,
    type,
    rent,
    bedrooms: bed,
    bathrooms: bath,
    areaSqFt: area,
    floor,
    furnished,
    amenities: shuffle(AMENITIES).slice(0, amenityCount),
    status: rand() < 0.3 ? "Rented" : "Available",
    owner: ownerId,
    createdAt: created,
  };
};

// ---------- main ----------
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to database:", mongoose.connection.name);

  await Inquiry.deleteMany({});
  await Property.deleteMany({});
  await User.deleteMany({});
  console.log("Old users, properties and inquiries cleared");

  // User.create runs the password-hashing hook
  const ownerDocs = [];
  for (const o of OWNERS)
    ownerDocs.push(
      await User.create({ ...o, password: "Owner@123", role: "owner" }),
    );
  const tenantDocs = [];
  for (const t of TENANTS)
    tenantDocs.push(
      await User.create({ ...t, password: "Tenant@123", role: "tenant" }),
    );

  const cityNames = Object.keys(CITY_DATA);
  const propertyData = [];
  cityNames.forEach((city, ci) => {
    const owner = ownerDocs[ci % ownerDocs.length];
    for (let i = 0; i < 5; i++)
      propertyData.push(buildProperty(city, owner._id));
  });
  const properties = await Property.insertMany(propertyData);

  // inquiries: one per tenant per property, dated after the listing
  const used = new Set();
  const inquiryData = [];
  let guard = 0;
  while (inquiryData.length < 50 && guard < 2000) {
    guard++;
    const p = pickOne(properties);
    const t = pickOne(tenantDocs);
    const key = `${p._id}-${t._id}`;
    if (used.has(key)) continue;
    used.add(key);
    const start = p.createdAt.getTime();
    const created = new Date(start + rand() * (Date.now() - start));
    const status =
      p.status === "Rented"
        ? weightedPick(["Accepted", "Rejected"], [60, 40])
        : weightedPick(["Pending", "Accepted", "Rejected"], [60, 20, 20]);
    inquiryData.push({
      property: p._id,
      tenant: t._id,
      message: pickOne(MESSAGES),
      status,
      createdAt: created,
    });
  }
  await Inquiry.insertMany(inquiryData);

  // ---------- summary (good for a screenshot) ----------
  const rows = {};
  properties.forEach((p) => {
    rows[p.city] = rows[p.city] || {
      properties: 0,
      available: 0,
      rented: 0,
      totalRent: 0,
    };
    rows[p.city].properties++;
    rows[p.city][p.status === "Available" ? "available" : "rented"]++;
    rows[p.city].totalRent += p.rent;
  });
  Object.values(rows).forEach((r) => {
    r.avgRent = Math.round(r.totalRent / r.properties);
    delete r.totalRent;
  });

  console.log("\nSEED COMPLETE");
  console.log(
    `Users: ${ownerDocs.length + tenantDocs.length} (${ownerDocs.length} owners, ${tenantDocs.length} tenants)`,
  );
  console.log(`Properties: ${properties.length}`);
  console.log(`Inquiries: ${inquiryData.length}\n`);
  console.table(rows);
  console.log("\nLogins:  owners -> Owner@123   |   tenants -> Tenant@123");
  console.log(
    "Example: rajesh.kumar@example.com (owner), priya.sharma@example.com (tenant)",
  );

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
