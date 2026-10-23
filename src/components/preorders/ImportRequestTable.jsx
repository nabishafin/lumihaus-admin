import { useState, useEffect } from "react";
import {
  useGetPreOrdersQuery,
  useUpdatePreOrderStatusMutation,
} from "../../redux/features/preOrderApi";
import { ExternalLink, Calculator, MessageSquare, Check, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { TH, TD, MUTED } from "./ui";

export const PREORDER_STATUSES = [
  "Requested",
  "Quoted",
  "Sourced in Germany",
  "Air Freight to BD",
  "Customs Clearance",
  "Ready for Delivery",
  "Completed",
  "Cancelled",
];

const PAGE_SIZE = 20;

export default function ImportRequestTable({
  selectedRequest,
  onSelectRequest,
  activeFilter = "All",
  onCountsCalculated,
}) {
  const [page, setPage] = useState(1);
  // Status filtering and paging happen on the server so every request is reachable.
  const { data: apiResponse, isLoading, isFetching } = useGetPreOrdersQuery({
    page,
    limit: PAGE_SIZE,
    ...(activeFilter && activeFilter !== "All" ? { status: activeFilter } : {}),
  });
  const [updateStatusApi] = useUpdatePreOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState(null);

  const rawList =
    apiResponse?.data?.preOrders ||
    apiResponse?.data ||
    (Array.isArray(apiResponse) ? apiResponse : null);

  // Purely use real backend pre-orders (no mock data)
  const requests = Array.isArray(rawList) ? rawList : [];

  const pagination = apiResponse?.pagination;
  const totalPages = Math.max(1, Number(pagination?.pages) || 1);

  // Back to the first page whenever the stage filter changes
  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  // Tab counts come from the backend, which counts the whole pipeline
  // independent of the current filter and page.
  useEffect(() => {
    if (!onCountsCalculated || !apiResponse) return;
    const statusCounts = apiResponse.statusCounts || {};
    onCountsCalculated({
      ...statusCounts,
      All: apiResponse.pipelineCounts?.All ?? pagination?.total ?? requests.length,
    });
  }, [apiResponse, onCountsCalculated]);

  // The server already filtered by the active stage
  const filteredRequests = requests;

  const handleStatusChange = async (item, newStatus) => {
    if (!item?._id || item._id.startsWith("pr-")) {
      toast.success(`Status changed to ${newStatus} (demo mode)`);
      return;
    }

    setUpdatingId(item._id);
    const toastId = toast.loading(`Updating ${item.requestNumber || "pre-order"} to ${newStatus}...`);
    try {
      await updateStatusApi({ id: item._id, status: newStatus }).unwrap();
      toast.success(`Status updated to ${newStatus}!`, { id: toastId });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status", { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenWhatsApp = (item) => {
    const phone = item.customer?.phone;
    if (!phone) {
      toast.error("No phone number available for this customer.");
      return;
    }
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "88" + clean;
    if (!clean.startsWith("88") && clean.length === 10) clean = "880" + clean;

    const bdt = item.quotedPriceBdt || item.estimatedPriceBdt || 0;
    const msg = `Hello ${item.customer?.name || "Customer"}! 👋
Regarding your German pre-order request for "${item.productName || "German Item"}" (${item.requestNumber || ""}):
Landed Price Quote: ৳${bdt ? bdt.toLocaleString() : "TBD"}
Please let us know if you would like to proceed with your order. - LumiHaus`;

    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="table-wrap -mx-1">
      <table className="w-full">
        <thead>
          <tr>
            <th className={TH}>Request</th>
            <th className={TH}>Customer</th>
            <th className={TH}>Product</th>
            <th className={TH}>Quote</th>
            <th className={TH}>Status</th>
            <th className={`${TH} text-right!`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan={6} className={`text-center py-10! text-[13px]! font-normal! whitespace-normal! text-[#2E4235]/65! dark:text-[#D2DDD6]/65! border-0!`}>
                {!activeFilter || activeFilter === "All"
                  ? "No import requests yet."
                  : "No requests in this stage."}
              </td>
            </tr>
          ) : (
            filteredRequests.map((r) => {
              const reqId = r.requestNumber || `#PR-${r._id ? r._id.slice(-4).toUpperCase() : "1001"}`;
              const custName = r.customer?.name || "Customer";
              const custPhone = r.customer?.phone || "";
              const sourceUrl = r.germanStoreUrl || "";
              const sourceHost = sourceUrl ? (() => {
                try { return new URL(sourceUrl).hostname.replace("www.", ""); } catch { return sourceUrl; }
              })() : "dm.de";

              const bdtPrice =
                r.quotedPriceBdt ||
                (typeof r.quotation === "number"
                  ? r.quotation
                  : r.quotation?.priceBdt || r.quotation?.quotedPriceBdt) ||
                r.estimatedPriceBdt ||
                (r.itemPriceEur ? Math.round(r.itemPriceEur * (r.euroRate || 135) * 1.3) : 0);
              const isSelected = selectedRequest?._id === r._id;

              return (
                <tr
                  key={r._id || reqId}
                  className={isSelected ? "selected-row" : ""}
                  style={{ transition: "background 0.15s" }}
                >
                  <td className={TD}>
                    <span className="font-mono text-xs text-[#141f17] dark:text-white">{reqId}</span>
                  </td>
                  <td className={TD}>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-[#141f17] dark:text-white">{custName}</span>
                      {custPhone && <span className={`text-xs tabular-nums ${MUTED}`}>{custPhone}</span>}
                    </div>
                  </td>
                  <td className={TD}>
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-[13px] text-[#141f17] dark:text-white truncate max-w-[220px]"
                        title={r.productName}
                      >
                        {r.productName || "Custom Import Product"}
                      </span>
                      {sourceUrl ? (
                        <a
                          className={`source-link inline-flex items-center gap-1 text-xs hover:underline ${MUTED} hover:text-[#26382E] dark:hover:text-[#8FAF9A]`}
                          href={sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {sourceHost} <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className={`text-xs ${MUTED}`}>Direct request</span>
                      )}
                    </div>
                  </td>
                  <td className={TD}>
                    {bdtPrice ? (
                      <span className="text-[13px] tabular-nums text-[#141f17] dark:text-white">
                        ৳{bdtPrice.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[13px] text-amber-700 dark:text-amber-400">Needs quote</span>
                    )}
                  </td>
                  <td className={TD}>
                    <select
                      value={r.status || "Requested"}
                      disabled={updatingId === r._id}
                      onChange={(e) => handleStatusChange(r, e.target.value)}
                      className="text-xs! font-normal! rounded-md border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] text-[#141f17]! dark:text-white! px-2 py-1 outline-none cursor-pointer focus:border-[#8FAF9A]"
                    >
                      {PREORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={TD}>
                    <div className="flex items-center justify-end gap-1">
                      {/* Select & load into calculator */}
                      <button
                        type="button"
                        onClick={() => onSelectRequest && onSelectRequest(isSelected ? null : r)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1 cursor-pointer transition border ${
                          isSelected
                            ? "bg-[#26382E] text-white border-[#26382E] dark:bg-[#8FAF9A] dark:text-[#17251C] dark:border-[#8FAF9A]"
                            : "bg-white dark:bg-transparent text-[#26382E] dark:text-[#D2DDD6] border-[#DCD6CB] dark:border-white/10 hover:bg-[#F3EDE2] dark:hover:bg-white/5"
                        }`}
                        title="Calculate freight & prepare quote"
                      >
                        <Calculator size={13} />
                        {isSelected ? "Quoting…" : "Quote"}
                      </button>

                      {/* WhatsApp chat */}
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(r)}
                        className="p-1.5 rounded-md text-[#1E9E52] dark:text-[#4ADE80] hover:bg-[#1E9E52]/10 cursor-pointer transition"
                        title="Send quote or chat via WhatsApp"
                        aria-label="Chat on WhatsApp"
                      >
                        <MessageSquare size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={`flex items-center justify-between gap-3 px-1 pt-3 text-[13px] ${MUTED}`}>
          <span>
            Page {page} of {totalPages}
            {pagination?.total !== undefined ? ` · ${pagination.total} requests` : ""}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="button secondary cursor-pointer disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="button secondary cursor-pointer disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
