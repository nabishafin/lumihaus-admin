// Spreadsheet apps execute cells starting with these characters as formulas,
// so text values that start with one are prefixed with a single quote.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function toCsvCell(value) {
  if (value === null || value === undefined) return '""';
  // Real numbers (including negatives) are data, not formulas.
  const text = String(value);
  const safe = typeof value !== "number" && FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(toCsvCell).join(",")).join("\n");
  // BOM so Excel opens UTF-8 (৳, Bangla names) correctly.
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

// Fetches every page of a paginated admin list (backend max limit is 100).
// fetchPage(page, limit) must resolve to the raw API response.
export async function fetchAllPages(fetchPage, { limit = 100, maxPages = 50 } = {}) {
  const rows = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const res = await fetchPage(page, limit);
    const list = Array.isArray(res?.data) ? res.data : [];
    rows.push(...list);
    const pages = Number(res?.pagination?.pages) || 1;
    if (page >= pages || list.length === 0) break;
  }
  return rows;
}
