import { useState, useEffect } from "react";
import { Search, AlertTriangle, ShieldAlert, Receipt, Undo2, RefreshCw } from "lucide-react";
import { useGetPaymentTransactionsQuery } from "../../redux/features/paymentApi";
import { formatBdt, formatDateTime } from "../../utils/format";
import RecordRefundModal from "./RecordRefundModal";

const METHODS = [
  { label: "All methods", value: "" },
  { label: "bKash", value: "bKash" },
  { label: "COD", value: "COD" },
];

const STATUSES = [
  { label: "All statuses", value: "" },
  { label: "Paid", value: "Paid" },
  { label: "Pending", value: "Pending" },
  { label: "Refunded", value: "Refunded" },
  { label: "Failed", value: "Failed" },
];

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "paid") return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50";
  if (s === "refunded") return "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/50";
  if (s === "failed") return "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800/50";
  return "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/50";
}

export default function TransactionLog() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [refundTarget, setRefundTarget] = useState(null);

  // Debounce the search box so we do not hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [search, method, status, from, to, limit]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetPaymentTransactionsQuery({
    page,
    limit,
    method: method || undefined,
    status: status || undefined,
    search: search || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  });

  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination || { page: 1, limit, total: 0, pages: 1 };

  return (
    <>
      {/* Toolbar */}
      <div className="toolbar flex flex-col lg:flex-row lg:items-center gap-2.5">
        <label className="table-search">
          <Search size={15} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search TrxID, order number, or phone..."
          />
        </label>

        <select value={method} onChange={(e) => setMethod(e.target.value)} className="cursor-pointer">
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="cursor-pointer">
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          title="From date"
          className="rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] px-2.5 py-2 text-xs"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          title="To date"
          className="rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] px-2.5 py-2 text-xs"
        />

        <span className="result-count whitespace-nowrap">
          {isLoading || isFetching ? "Loading..." : `${pagination.total} transactions`}
        </span>
      </div>

      {isError ? (
        <div className="p-4 my-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {error?.status === 403 ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
            <span>
              {error?.status === 403
                ? "Access denied. Only admin or super_admin users may view transactions."
                : error?.data?.message || "Failed to load transactions."}
            </span>
          </div>
          <button onClick={() => refetch()} className="button secondary text-xs py-1 px-2.5 cursor-pointer shrink-0">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#8FAF9A] border-r-transparent mb-3" />
          <p className="text-xs font-semibold">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl my-4">
          <Receipt size={36} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No transactions found</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            {search || method || status || from || to
              ? "Try clearing the filters above."
              : "Payments will appear here as customers place orders."}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <b className="font-mono text-xs">{t.transactionId || "—"}</b>
                    <div className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-0.5">
                      {formatDateTime(t.createdAt)}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-semibold">{t.orderNumber}</span>
                  </td>
                  <td>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {t.customerName || "Customer"}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-zinc-400 font-mono">
                      {t.customerPhone || "—"}
                    </div>
                  </td>
                  <td className="text-xs font-medium">{t.method}</td>
                  <td>
                    <b className="text-xs">{formatBdt(t.amount)}</b>
                    {t.refundedAmount != null && (
                      <div className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-0.5">
                        −{formatBdt(t.refundedAmount)} refunded
                        {t.refundedAt ? ` · ${formatDateTime(t.refundedAt)}` : ""}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.status === "Paid" ? (
                      <button
                        className="button secondary text-xs py-1 px-2.5 cursor-pointer flex items-center gap-1.5"
                        onClick={() => setRefundTarget(t)}
                        title="Record a refund you have already sent"
                      >
                        <Undo2 size={13} />
                        Record refund
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#DCD6CB] dark:border-white/10">
          <span className="text-xs text-neutral-500 dark:text-zinc-400">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-xs px-2 py-1 cursor-pointer"
              title="Page size"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="button secondary text-xs py-1 px-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs font-semibold">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages || isFetching}
              className="button secondary text-xs py-1 px-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {refundTarget && (
        <RecordRefundModal transaction={refundTarget} onClose={() => setRefundTarget(null)} />
      )}
    </>
  );
}
