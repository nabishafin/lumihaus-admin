import { useState } from "react";
import {
  useGetPreOrdersQuery,
  useUpdatePreOrderStatusMutation,
} from "../../redux/features/preOrderApi";
import { ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const PREORDER_STATUSES = [
  "Requested",
  "Sourced in Germany",
  "Air Freight to BD",
  "Customs Clearance",
  "Ready for Delivery",
  "Completed",
  "Cancelled",
];

const DEFAULT_FALLBACK_REQUESTS = [
  {
    _id: "pr-1042",
    requestNumber: "#PR-1042",
    customer: { name: "Maliha Tasnim", phone: "01712-345678" },
    germanStoreUrl: "https://www.dm.de",
    productName: "Balea Beauty Expert Serum",
    estimatedPriceBdt: 3890,
    status: "Requested",
  },
  {
    _id: "pr-1041",
    requestNumber: "#PR-1041",
    customer: { name: "Rumana Islam", phone: "01819-234567" },
    germanStoreUrl: "https://www.rossmann.de",
    productName: "ISANA Hydro Booster",
    estimatedPriceBdt: 2450,
    status: "Sourced in Germany",
  },
  {
    _id: "pr-1038",
    requestNumber: "#PR-1038",
    customer: { name: "Ayesha Karim", phone: "01911-987654" },
    germanStoreUrl: "https://www.douglas.de",
    productName: "Rituals Sakura Set",
    estimatedPriceBdt: 8950,
    status: "Air Freight to BD",
  },
  {
    _id: "pr-1031",
    requestNumber: "#PR-1031",
    customer: { name: "Nafisa Rahman", phone: "01622-456789" },
    germanStoreUrl: "https://www.dm.de",
    productName: "Penaten Baby Pflege",
    estimatedPriceBdt: 4120,
    status: "Ready for Delivery",
  },
];

export default function ImportRequestTable() {
  const { data: apiResponse } = useGetPreOrdersQuery();
  const [updateStatusApi] = useUpdatePreOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState(null);

  const rawList =
    apiResponse?.data?.preOrders ||
    apiResponse?.data ||
    (Array.isArray(apiResponse) ? apiResponse : null);

  const requests =
    Array.isArray(rawList) && rawList.length > 0
      ? rawList
      : DEFAULT_FALLBACK_REQUESTS;

  const handleStatusChange = async (item, newStatus) => {
    if (!item?._id || item._id.startsWith("pr-")) {
      toast.success(`Status updated to ${newStatus} (demo mode)`);
      return;
    }

    setUpdatingId(item._id);
    const toastId = toast.loading(`Updating ${item.requestNumber || "pre-order"} to ${newStatus}...`);
    try {
      await updateStatusApi({ id: item._id, status: newStatus }).unwrap();
      toast.success(`Pre-order status updated to ${newStatus}!`, { id: toastId });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update pre-order status", { id: toastId });
    } finally {
      setUpdatingId(null);
    }
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
            <th>Estimate</th>
            <th>Pipeline Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const reqId = r.requestNumber || `#PR-${r._id ? r._id.slice(-4).toUpperCase() : "1001"}`;
            const custName = r.customer?.name || "Customer";
            const custPhone = r.customer?.phone || "";
            const sourceUrl = r.germanStoreUrl || "";
            const sourceHost = sourceUrl ? (() => {
              try { return new URL(sourceUrl).hostname.replace("www.", ""); } catch { return sourceUrl; }
            })() : "dm.de";

            const bdtPrice = r.estimatedPriceBdt || (r.itemPriceEur ? Math.round(r.itemPriceEur * (r.euroRate || 135) * 1.3) : 0);

            return (
              <tr key={r._id || reqId}>
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
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {r.productName || "Custom Import Product"}
                  </span>
                </td>
                <td>
                  <b className="font-mono text-xs text-gray-900 dark:text-white">
                    {bdtPrice ? `৳${bdtPrice.toLocaleString()}` : "Pending"}
                  </b>
                </td>
                <td>
                  <select
                    value={r.status || "Requested"}
                    disabled={updatingId === r._id}
                    onChange={(e) => handleStatusChange(r, e.target.value)}
                    className="text-xs rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 px-2 py-1 outline-none cursor-pointer focus:border-emerald-600"
                  >
                    {PREORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
