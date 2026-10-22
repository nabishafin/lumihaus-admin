// Amounts arrive from the API as plain numbers in BDT; formatting is a UI concern.
export function formatBdt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `৳${n.toLocaleString("en-BD")}`;
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Today's calendar date in Asia/Dhaka as YYYY-MM-DD. toISOString() would give
// the UTC date, which is yesterday between 00:00 and 06:00 Dhaka time.
export function todayDhaka() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

// Inclusive Asia/Dhaka (UTC+6, no DST) bounds for a YYYY-MM-DD date input, as
// ISO timestamps with offset. new Date("YYYY-MM-DD") would be UTC midnight and
// drop most of the selected "to" day.
export function dhakaDayStart(date) {
  return date ? `${date}T00:00:00.000+06:00` : undefined;
}

export function dhakaDayEnd(date) {
  return date ? `${date}T23:59:59.999+06:00` : undefined;
}
