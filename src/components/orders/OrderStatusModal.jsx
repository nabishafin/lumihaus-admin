import { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, Printer, Package, Truck, User, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useGetOrderByIdQuery } from "../../redux/features/orderApi";

export default function OrderStatusModal({ order: initialOrder, onClose, onSave, onVerifyPayment, isSavingStatus, isSavingPayment }) {
  const targetId = initialOrder?._id || initialOrder?.id;

  // Fetch full live order details including statusHistory & items
  const { data: detailResponse, isLoading: isLoadingDetails, isFetching: isFetchingDetails } = useGetOrderByIdQuery(targetId, {
    skip: !targetId,
  });

  const order = detailResponse?.data || initialOrder;

  const [status, setStatus] = useState(order?.status || "Placed");
  const [courier, setCourier] = useState(order?.deliveryPartner?.provider || order?.courier || "Steadfast");
  const [trackingNumber, setTrackingNumber] = useState(order?.deliveryPartner?.trackingNumber || order?.trackingNumber || "");
  const [note, setNote] = useState("");

  // Keep state synchronized with fetched order data
  useEffect(() => {
    if (order) {
      if (order.status) setStatus(order.status);
      if (order.deliveryPartner?.provider || order.courier) {
        setCourier(order.deliveryPartner?.provider || order.courier);
      }
      if (order.deliveryPartner?.trackingNumber !== undefined || order.trackingNumber !== undefined) {
        setTrackingNumber(order.deliveryPartner?.trackingNumber || order.trackingNumber || "");
      }
    }
  }, [order]);

  if (!order) return null;

  const isDelivered = order.status === "Delivered";
  const isCancelled = order.status === "Cancelled";
  const isBkash = (order.paymentMethod || "").toLowerCase().includes("bkash");
  const isPaymentPending = (order.paymentStatus || order.payment || "").toLowerCase().includes("pending");

  const handleStatusSubmit = (e) => {
    e.preventDefault();

    if (status === "Cancelled") {
      const ok = window.confirm("Are you sure you want to cancel this order? Cancelled orders cannot be reopened.");
      if (!ok) return;
    }

    if (isDelivered && status === "Cancelled") {
      toast.error("Delivered orders cannot be cancelled through this endpoint.");
      return;
    }

    // Prepare payload. Omitted fields preserve existing values; explicit empty strings clear them.
    const payload = {
      id: targetId,
      status,
    };

    if (courier !== (order.deliveryPartner?.provider || order.courier || "")) {
      payload.courier = courier;
    }
    if (trackingNumber !== (order.deliveryPartner?.trackingNumber || order.trackingNumber || "")) {
      payload.trackingNumber = trackingNumber;
    }
    if (note.trim()) {
      payload.note = note.trim();
    }

    onSave(payload);
  };

  const handleVerify = (paymentStatus) => {
    onVerifyPayment(targetId, paymentStatus);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal order-modal"
        style={{ width: "min(680px, calc(100% - 30px))", maxHeight: "90vh", overflowY: "auto" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="section-head flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="page-kicker text-[11px] font-bold tracking-wider text-[#8FAF9A] uppercase">
                ORDER MANAGEMENT & PIPELINE
              </span>
              {(isLoadingDetails || isFetchingDetails) && (
                <span className="text-[10px] text-neutral-400 animate-pulse">Syncing...</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5 font-mono">
              {order.orderNumber || order.id}
            </h2>
            <div className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5">
              Placed on {formatDateTime(order.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="button secondary text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
              onClick={() => window.print()}
              title="Print packing slip"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              type="button"
              className="icon-action cursor-pointer p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500"
              onClick={onClose}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Pipeline Tracker */}
        <div className="pipeline">
          {["Placed", "Confirmed", "Processing", "Shipped", "Delivered"].map((x, i) => (
            <div className={x === order.status ? "current" : ""} key={x}>
              <i>{i + 1}</i>
              <span>{x}</span>
            </div>
          ))}
        </div>

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F9F6EF] dark:bg-zinc-800/60 p-3.5 rounded-xl border border-[#E8CFC8]/60 dark:border-white/10">
          <div className="space-y-1">
            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
              <User size={13} className="text-[#8FAF9A]" />
              Customer Details
            </div>
            <div>{order.customer?.name || order.name}</div>
            <div className="text-neutral-600 dark:text-zinc-400">{order.customer?.phone || order.phone}</div>
            {order.customer?.email && (
              <div className="text-neutral-500 dark:text-zinc-400">{order.customer?.email}</div>
            )}
          </div>
          <div className="space-y-1">
            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
              <MapPin size={13} className="text-[#8FAF9A]" />
              Delivery Address
            </div>
            <div className="leading-relaxed text-neutral-700 dark:text-zinc-300">
              {order.customer?.deliveryAddress || order.shippingAddress?.street || order.address}
            </div>
            <div className="text-neutral-500 dark:text-zinc-400">
              {order.customer?.zone ? `${order.customer.zone}, ` : ""}
              {order.customer?.district || order.shippingAddress?.city || order.area}
            </div>
          </div>
        </div>

        {/* Items List */}
        {order.items && order.items.length > 0 && (
          <div className="border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden text-xs">
            <div className="bg-neutral-100/70 dark:bg-zinc-800 px-3.5 py-2 font-bold text-neutral-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Package size={13} className="text-[#8FAF9A]" />
              Ordered Items ({order.items.length})
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-white/5 max-h-48 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={item._id || idx} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded border border-neutral-200 dark:border-white/10 shrink-0"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-zinc-400">
                        {item.selectedSize && `Size: ${item.selectedSize} · `}
                        Qty: {item.quantity} × ৳{item.price}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-white shrink-0">
                    ৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-neutral-50 dark:bg-zinc-900/60 p-3 border-t border-neutral-200 dark:border-white/10 flex justify-between items-center text-xs">
              <span className="text-neutral-500">Delivery Fee: ৳{order.deliveryCharge || 0}</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                Total: ৳{(order.total || order.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* bKash Payment & Manual Verification Card */}
        <div className="border border-neutral-200 dark:border-white/10 rounded-xl p-4 space-y-3 bg-neutral-50/50 dark:bg-zinc-800/40 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#8FAF9A]" />
              Payment Status: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{order.paymentStatus || order.payment || "Pending"}</span>
            </span>
            <span className="text-neutral-500 font-mono text-[11px]">{order.paymentMethod || "bKash (Manual)"}</span>
          </div>

          {isBkash && (
            <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-neutral-200/70 dark:border-white/5 font-mono">
              <div>
                <span className="text-neutral-500 text-[10px] block">Sender Number:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {order.paymentDetails?.senderNumber || order.bkashSenderNumber || order.senderNumber || "—"}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] block">bKash TrxID:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {order.paymentDetails?.transactionId || order.bkashTrxId || order.trxId || "—"}
                </span>
              </div>
            </div>
          )}

          {/* Verification Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-neutral-500 dark:text-zinc-400">
              Manual verification: Confirm transaction against your bKash statement.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleVerify("Failed")}
                disabled={isSavingPayment}
                className="button secondary text-red-600 hover:bg-red-50 text-xs py-1 px-2.5 cursor-pointer disabled:opacity-50"
              >
                Mark Failed
              </button>
              <button
                type="button"
                onClick={() => handleVerify("Pending Verification")}
                disabled={isSavingPayment}
                className="button secondary text-xs py-1 px-2.5 cursor-pointer disabled:opacity-50"
              >
                Set Pending
              </button>
              <button
                type="button"
                onClick={() => handleVerify("Verified")}
                disabled={isSavingPayment}
                className="button text-xs py-1 px-3 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                {isSavingPayment ? "Saving..." : "Verify Payment"}
              </button>
            </div>
          </div>
        </div>

        {/* Fulfillment Pipeline Form */}
        <form onSubmit={handleStatusSubmit} className="space-y-3 pt-1">
          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
            <Truck size={14} className="text-[#8FAF9A]" />
            Fulfillment & Courier Pipeline
          </div>

          <div className="form-grid">
            <label>
              Fulfillment Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isCancelled}
              >
                <option value="Placed">Placed (bKash Pending)</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">In Delivery (Courier)</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled" disabled={isDelivered}>
                  Cancelled {isDelivered ? "(Not allowed for delivered)" : ""}
                </option>
              </select>
            </label>

            <label>
              Courier Partner
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                disabled={isCancelled}
              >
                <option value="Steadfast">Steadfast Courier</option>
                <option value="Pathao">Pathao Courier</option>
                <option value="RedX">RedX Delivery</option>
                <option value="Paperfly">Paperfly</option>
                <option value="Self Pickup">Self Pickup / Office</option>
              </select>
            </label>

            <label className="full">
              Consignment / Tracking Number
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. STF-8291046 or PTH-92841 (Leave blank to clear)"
                disabled={isCancelled}
              />
            </label>

            <label className="full">
              Admin Note / Status Remark
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Handed over to Steadfast / Parcel packed (Optional)"
                disabled={isCancelled}
              />
            </label>
          </div>

          <div className="modal-actions flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="button secondary cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSavingStatus || isCancelled}
              className="button cursor-pointer disabled:opacity-50"
            >
              {isSavingStatus ? "Saving Changes..." : "Save Fulfillment Changes"}
            </button>
          </div>
        </form>

        {/* Status History Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-white/10 pt-4 space-y-2">
            <div className="font-bold text-neutral-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
              <Clock size={13} className="text-[#8FAF9A]" />
              Status History Timeline ({order.statusHistory.length})
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {order.statusHistory.map((h, i) => (
                <div
                  key={h._id || i}
                  className="p-2.5 rounded-lg bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200/60 dark:border-white/5 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">{h.status}</span>
                      {h.updatedBy && (
                        <span className="text-[10px] text-neutral-400">by {String(h.updatedBy).slice(-6)}</span>
                      )}
                    </div>
                    {h.note && (
                      <p className="text-[11px] text-neutral-600 dark:text-zinc-400">{h.note}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                    {formatDateTime(h.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
