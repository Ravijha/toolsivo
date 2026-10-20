import { useId } from "react";

export function LogoMark({ size = 36, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="4" y1="2" x2="46" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f6bff" />
          <stop offset=".52" stopColor="#a24bff" />
          <stop offset="1" stopColor="#ff4d8d" />
        </linearGradient>
        <linearGradient id={`h${id}`} x1="24" y1="0" x2="24" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#g${id})`} />
      <path d="M14 1.5h20A12.5 12.5 0 0 1 46.5 14v4C35 25 15 26 1.5 21v-7A12.5 12.5 0 0 1 14 1.5Z" fill={`url(#h${id})`} />
      {/* orbit ring — the "ora" */}
      <path d="M9.5 33.5c4.5 6 17 7.6 26.5 2.4" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" />
      {/* the T */}
      <rect x="10.5" y="12" width="23" height="6.6" rx="3.3" fill="#fff" />
      <rect x="18.7" y="12" width="6.6" height="24" rx="3.3" fill="#fff" />
      {/* spark */}
      <path d="M37.5 8.5c.5 3.2 1.8 4.5 5 5-3.2.5-4.5 1.8-5 5-.5-3.2-1.8-4.5-5-5 3.2-.5 4.5-1.8 5-5Z" fill="#fff" />
      <circle cx="39.5" cy="35" r="2.2" fill="#fff" fillOpacity=".85" />
    </svg>
  );
}

export default function Logo({ size = 36, showDomain = false }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word">
        tool<span className="logo-ora">sivo</span>
        {showDomain && <span className="logo-dom">.com</span>}
      </span>
    </span>
  );
}
