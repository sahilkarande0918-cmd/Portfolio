"use client";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

const fmtTime = new Intl.DateTimeFormat("en-IN", { timeZone: site.timeZone, hour: "numeric", minute: "2-digit", hour12: true });
const fmtDate = new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone, day: "numeric", month: "long", year: "numeric" });

function formatClock(d: Date) {
  const time = fmtTime.format(d).replace(/\s/g, "").toLowerCase();
  const p = fmtDate.formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value;
  return { time, date: `${g("day")} ${g("month")}, ${g("year")}` };
}

/** Pune local time, refreshed on the minute; blank until mounted so nothing stale is server-rendered */
export function useClock() {
  const [v, setV] = useState({ time: "—", date: "" });
  useEffect(() => {
    let t = 0;
    const tick = () => {
      setV(formatClock(new Date()));
      t = window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return v;
}
