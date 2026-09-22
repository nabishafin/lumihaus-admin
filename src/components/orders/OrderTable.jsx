import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Printer, ShoppingBag, ShieldCheck, Receipt } from "lucide-react";
import OrderInvoicePrint from "./OrderInvoicePrint";

export default function OrderTable({ orders = [], isLoading, onOpenReview, onSelect, onOpenAccounting }) {
  const [printOrder, setPrintOrder] = useState(null);

  // Wait one paint for the invoice to render, then print just that order;
  // 'afterprint' clears it so the next click starts from a clean state.
  useEffect(() => {
    if (!printOrder) return;
    const handleAfterPrint = () => setPrintOrder(null);
    window.addEventListener("afterprint", handleAfterPrint);
    const timer = setTimeout(() => window.print(), 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printOrder]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#8FAF9A] border-r-transparent mb-3" />
        <p className="text-xs font-semibold">Loading orders from database...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl my-4">
        <ShoppingBag size={36} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No orders found</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          When customers place orders from the store, they will appear here in real-time.
        </p>
      </div>
    );
  }

  const formatCreationDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    const p = (paymentStatus || "").toLowerCase();
    if (p.includes("verified") || p === "paid") return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50";
    if (p.includes("failed") || p === "cancelled") return "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800/50";
    return "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/50";
  };

  return (
    <div className="table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order & Date</th>
            <th>Customer & Delivery</th>
            <th>Payment Details</th>
            <th>Total</th>
            <th>Fulfillment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isManualPending =
              (order.payment || "").toLowerCase().includes("pending");

            return (
              <tr key={order.id || order._id}>
                <td>
                  <b className="font-mono text-neutral-900 dark:text-white">{order.id}</b>
                  <div className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-0.5">
                    {formatCreationDate(order.createdAt)}
                  </div>
                </td>
                <td>
                  <div className="font-semibold text-neutral-900 dark:text-white">{order.name}</div>
                  <div className="text-xs text-neutral-500 dark:text-zinc-400">{order.phone}</div>
                  <small className="text-[11px] text-neutral-400 dark:text-zinc-500 truncate max-w-[180px] block" title={order.address}>
                    {order.address} ({order.area})
                  </small>
                </td>
                <td>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-medium text-neutral-700 dark:text-zinc-300">
                      {order.paymentMethod || "bKash (Manual)"}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPaymentBadgeClass(order.payment)}`}>
                      {order.payment}
                    </span>
                  </div>
                  {order.sender && order.sender !== "—" && (
                    <div className="text-[11px] text-neutral-600 dark:text-zinc-400 font-mono">
                      Sender: {order.sender}
                    </div>
                  )}
                  {order.trx && order.trx !== "—" && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                      TrxID: {order.trx}
                    </div>
                  )}
                </td>
                <td>
                  <b className="text-sm text-neutral-900 dark:text-white">{order.total}</b>
                </td>
                <td>
                  <span className={`badge status-${(order.status || "placed").toLowerCase().replace(/\s+/g, "-")}`}>
                    {order.status}
                  </span>
                  {order.courier && (
                    <div className="text-[10px] text-neutral-500 dark:text-zinc-400 mt-0.5">
                      via {order.courier}
                    </div>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    {isManualPending && (
                      <button
                        className="verify-button cursor-pointer flex items-center gap-1 text-xs py-1 px-2.5"
                        onClick={() => onOpenReview?.(order)}
                        title="Review bKash TrxID & Verify"
                      >
                        <ShieldCheck size={13} />
                        Review & Verify
                      </button>
                    )}
                    <button
                      className="icon-action cursor-pointer hover:text-[#26382E] hover:border-[#8FAF9A]"
                      onClick={() => onOpenAccounting?.(order)}
                      title="Order Profit, Costs & Courier Accounting"
                    >
                      <Receipt size={15} />
                    </button>
                    <button
                      className="icon-action cursor-pointer"
                      onClick={() => onSelect?.(order)}
                      title="View full order details & fulfillment pipeline"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="icon-action cursor-pointer"
                      onClick={() => setPrintOrder(order.raw || order)}
                      title="Print invoice"
                    >
                      <Printer size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {printOrder && <OrderInvoicePrint order={printOrder} />}
    </div>
  );
}


