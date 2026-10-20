"use client";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function Toaster() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t;
    const on = (e) => {
      setMsg(e.detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 2200);
    };
    window.addEventListener("toolora:toast", on);
    return () => window.removeEventListener("toolora:toast", on);
  }, []);
  if (!msg) return null;
  return (
    <div className="toast" role="status" key={msg + Date.now()}>
      <CheckCircle2 size={17} /> {msg}
    </div>
  );
}
