import { useState, useMemo, useEffect } from "react";
import {
  useGetPreOrdersQuery,
  useUpdatePreOrderStatusMutation,
} from "../../redux/features/preOrderApi";
import { ExternalLink, Calculator, MessageSquare, Check, Clock } from "lucide-react";
import toast from "react-hot-toast";

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

export default function ImportRequestTable({
  selectedRequest,
  onSelectRequest,
  activeFilter = "All",
  onCountsCalculated,
}) {
  const { data: apiResponse, isLoading } = useGetPreOrdersQuery();
  const [updateStatusApi] = useUpdatePreOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState(null);

  const rawList =
    apiResponse?.data?.preOrders ||
    apiResponse?.data ||
    (Array.isArray(apiResponse) ? apiResponse : null);

  // Purely use real backend pre-orders (no mock data)
  const requests = Array.isArray(rawList) ? rawList : [];

  // Calculate live dynamic counts for status tabs
  useEffect(() => {
    if (onCountsCalculated) {
      const counts = {
        All: requests.length,
        Requested: requests.filter((r) => (r.status || "Requested") === "Requested").length,
        Quoted: requests.filter((r) => r.status === "Quoted").length,
        "Sourced in Germany": requests.filter((r) => r.status === "Sourced in Germany").length,
        "Air Freight to BD": requests.filter((r) => r.status === "Air Freight to BD").length,
        "Ready for Delivery": requests.filter((r) => r.status === "Ready for Delivery").length,
        Completed: requests.filter((r) => r.status === "Completed").length,
      };
      onCountsCalculated(counts);
    }
  }, [requests, onCountsCalculated]);

  // Filter requests based on active tab
  const filteredRequests = useMemo(() => {
    if (!activeFilter || activeFilter === "All") return requests;
    return requests.filter((r) => (r.status || "Requested") === activeFilter);
  }, [requests, activeFilter]);

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
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Request #</th>
            <th>Customer</th>
            <th>Source / Link</th>
            <th>German Product</th>
            <th>Price Quote</th>
            <th>Pipeline Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                No requests found in "{activeFilter}" stage.
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
                  <td>
                    <b className="font-mono text-xs">{reqId}</b>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-gray-900 dark:text-white">{custName}</span>
                      {custPhone && <span className="text-[11px] text-gray-500 font-mono">{custPhone}</span>}
                    </div>
                  </td>
                  <td>
                    {sourceUrl ? (
                      <a
                        className="source-link inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {sourceHost} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">Direct Request</span>
                    )}
                  </td>
                  <td>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-1 max-w-[220px]" title={r.productName}>
                      {r.productName || "Custom Import Product"}
                    </span>
                  </td>
                  <td>
                    <b className="font-mono text-xs text-gray-900 dark:text-white">
                      {bdtPrice ? `৳${bdtPrice.toLocaleString()}` : <span className="text-amber-600">Needs Quote</span>}
                    </b>
                  </td>
                  <td>
                    <select
                      value={r.status || "Requested"}
                      disabled={updatingId === r._id}
                      onChange={(e) => handleStatusChange(r, e.target.value)}
                      className="text-xs rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 px-2 py-1 outline-none cursor-pointer focus:border-emerald-600 font-medium"
                    >
                      {PREORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Select & Load into Calculator */}
                      <button
                        type="button"
                        onClick={() => onSelectRequest && onSelectRequest(isSelected ? null : r)}
                        className={`text-xs px-2.5 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer transition ${
                          isSelected
                            ? "bg-emerald-700 text-white"
                            : "bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200"
                        }`}
                        title="Calculate freight & prepare quote"
                      >
                        <Calculator size={13} />
                        {isSelected ? "Quoting..." : "Quote"}
                      </button>

                      {/* WhatsApp 1-Click Chat */}
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(r)}
                        className="p-1 rounded text-white bg-[#25D366] hover:bg-[#1EBE5D] cursor-pointer"
                        title="Send quote or chat via WhatsApp"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
