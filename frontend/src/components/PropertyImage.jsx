import { useId } from "react";

export const CITY_PALETTES = {
  Chandigarh: ["#38bdf8", "#6366f1"],
  Mohali: ["#34d399", "#0ea5e9"],
  Panchkula: ["#a3e635", "#16a34a"],
  Delhi: ["#fb923c", "#dc2626"],
  Gurugram: ["#818cf8", "#312e81"],
  Noida: ["#f472b6", "#7c3aed"],
  Mumbai: ["#f59e0b", "#be185d"],
  Pune: ["#2dd4bf", "#0f766e"],
  Bengaluru: ["#4ade80", "#0891b2"],
  Hyderabad: ["#c084fc", "#be123c"],
  Jaipur: ["#fda4af", "#ea580c"],
  Lucknow: ["#fcd34d", "#b45309"],
};
const DEFAULT_PALETTE = ["#38bdf8", "#6366f1"];

const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

function Windows({ x, y, cols, rows, seed, w = 14, h = 12, gx = 8, gy = 9 }) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = (seed + r * 7 + c * 3) % 3 !== 0;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={x + c * (w + gx)}
          y={y + r * (h + gy)}
          width={w}
          height={h}
          rx="2"
          fill={lit ? "#fde68a" : "#cbd5e1"}
          opacity={lit ? 0.95 : 0.75}
        />,
      );
    }
  }
  return <g>{cells}</g>;
}

function Tree({ x, s = 1 }) {
  return (
    <g transform={`translate(${x} 178) scale(${s})`}>
      <rect x="-3" y="-26" width="6" height="26" fill="#78350f" />
      <circle cx="0" cy="-36" r="16" fill="#15803d" />
      <circle cx="-10" cy="-28" r="11" fill="#16a34a" />
      <circle cx="10" cy="-28" r="11" fill="#16a34a" />
    </g>
  );
}

function Building({ type, seed }) {
  if (type === "Independent House") {
    return (
      <g>
        <rect x="244" y="46" width="18" height="40" fill="#92400e" />
        <rect x="120" y="96" width="160" height="82" fill="#fff7ed" />
        <polygon points="105,100 200,42 295,100" fill="#b45309" />
        <rect x="188" y="130" width="26" height="48" rx="3" fill="#7c2d12" />
        <circle cx="208" cy="156" r="2" fill="#fde68a" />
        <rect x="138" y="112" width="32" height="28" rx="3" fill="#fde68a" />
        <line
          x1="154"
          y1="112"
          x2="154"
          y2="140"
          stroke="#b45309"
          strokeWidth="2"
        />
        <line
          x1="138"
          y1="126"
          x2="170"
          y2="126"
          stroke="#b45309"
          strokeWidth="2"
        />
        <rect x="230" y="112" width="32" height="28" rx="3" fill="#fde68a" />
        <line
          x1="246"
          y1="112"
          x2="246"
          y2="140"
          stroke="#b45309"
          strokeWidth="2"
        />
        <line
          x1="230"
          y1="126"
          x2="262"
          y2="126"
          stroke="#b45309"
          strokeWidth="2"
        />
        <Tree x={55} s={0.9} />
        <Tree x={352} s={1} />
      </g>
    );
  }
  if (type === "Villa") {
    return (
      <g>
        <rect x="60" y="106" width="280" height="8" rx="2" fill="#334155" />
        <rect x="100" y="66" width="200" height="42" rx="3" fill="#f1f5f9" />
        <rect x="92" y="60" width="216" height="8" rx="2" fill="#334155" />
        <rect x="118" y="76" width="40" height="24" rx="2" fill="#7dd3fc" />
        <rect x="180" y="76" width="40" height="24" rx="2" fill="#7dd3fc" />
        <rect x="242" y="76" width="40" height="24" rx="2" fill="#7dd3fc" />
        <rect x="70" y="114" width="260" height="64" fill="#ffffff" />
        <rect x="88" y="128" width="50" height="34" rx="2" fill="#fde68a" />
        <rect x="262" y="128" width="50" height="34" rx="2" fill="#fde68a" />
        <rect x="184" y="132" width="32" height="46" rx="3" fill="#334155" />
        <g transform="translate(364 178)">
          <path
            d="M0 0 C 4 -30 -2 -50 2 -70"
            stroke="#78350f"
            strokeWidth="5"
            fill="none"
          />
          <ellipse
            cx="-14"
            cy="-72"
            rx="16"
            ry="5"
            fill="#16a34a"
            transform="rotate(-25 -14 -72)"
          />
          <ellipse
            cx="18"
            cy="-72"
            rx="16"
            ry="5"
            fill="#15803d"
            transform="rotate(25 18 -72)"
          />
          <ellipse cx="2" cy="-78" rx="14" ry="5" fill="#22c55e" />
        </g>
        <Tree x={34} s={0.8} />
      </g>
    );
  }
  if (type === "PG/Studio") {
    return (
      <g>
        <rect x="132" y="88" width="136" height="10" rx="3" fill="#475569" />
        <rect x="140" y="98" width="120" height="80" rx="3" fill="#ffffff" />
        <rect x="152" y="114" width="34" height="26" rx="2" fill="#fde68a" />
        <line
          x1="169"
          y1="114"
          x2="169"
          y2="140"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <rect x="214" y="132" width="26" height="46" rx="3" fill="#334155" />
        <circle cx="124" cy="170" r="9" fill="#16a34a" />
        <circle cx="276" cy="170" r="9" fill="#22c55e" />
        <Tree x={60} s={0.85} />
        <Tree x={345} s={0.9} />
      </g>
    );
  }
  // Apartment (default)
  return (
    <g>
      <rect x="70" y="50" width="110" height="128" rx="4" fill="#f8fafc" />
      <rect x="70" y="50" width="110" height="8" rx="2" fill="#94a3b8" />
      <Windows x={82} y={62} cols={4} rows={5} seed={seed} />
      <rect x="112" y="158" width="26" height="20" rx="2" fill="#334155" />
      <rect x="200" y="86" width="90" height="92" rx="4" fill="#e2e8f0" />
      <Windows x={212} y={98} cols={3} rows={3} seed={seed + 1} />
      <rect x="234" y="156" width="22" height="22" rx="2" fill="#475569" />
      <Tree x={38} s={0.9} />
      <Tree x={340} s={1} />
    </g>
  );
}

export default function PropertyImage({ property, height = 180 }) {
  const uid = useId().replace(/:/g, "");
  const seed = hash(String(property?._id || property?.title || "x"));
  const [c1, c2] = CITY_PALETTES[property?.city] || DEFAULT_PALETTE;
  const type = property?.type;

  return (
    <div className="pimg" style={{ height }}>
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`${type || "Property"} illustration`}>
        <defs>
          <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <rect width="400" height="220" fill={`url(#sky-${uid})`} />
        <circle
          cx={320 - (seed % 60)}
          cy="48"
          r="20"
          fill="#ffffff"
          opacity=".85"
        />
        <g className="cloud" opacity=".8">
          <ellipse cx="80" cy="42" rx="30" ry="9" fill="#fff" />
          <ellipse cx="102" cy="36" rx="20" ry="8" fill="#fff" />
        </g>
        <rect y="178" width="400" height="42" fill="#166534" opacity=".92" />
        <rect y="178" width="400" height="5" fill="#22c55e" opacity=".6" />
        <Building type={type} seed={seed} />
      </svg>
    </div>
  );
}
