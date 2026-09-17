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
