import { useState } from "react";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, XCircle } from "lucide-react";

export default function ManualBkashVerifyModal({ order, onClose, onVerify, isSaving }) {
  const [remarks, setRemarks] = useState("");

  if (!order) return null;

  const handleAction = (paymentStatus) => {
    onVerify(order._id || order.id, paymentStatus);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal order-modal"
        style={{ width: "min(500px, calc(100% - 30px))" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="section-head flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
          <div>
            <span className="page-kicker text-[11px] font-bold tracking-wider text-[#8FAF9A] uppercase flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#8FAF9A]" />
              MANUAL BKASH VERIFICATION
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
              Review Payment · {order.id}
            </h2>
          </div>
          <button
            type="button"
            className="icon-action cursor-pointer p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5"
            onClick={onClose}
            disabled={isSaving}
          >
            <X size={17} />
          </button>
        </div>

        {/* Verification Checklist Card */}
        <div className="bg-[#F9F6EF] dark:bg-zinc-800/60 p-4 rounded-xl border border-[#E8CFC8]/70 dark:border-white/10 space-y-2.5 text-xs text-neutral-800 dark:text-zinc-200">
          <div className="flex justify-between items-center py-1 border-b border-neutral-200/80 dark:border-white/10">
            <span className="text-neutral-500 dark:text-zinc-400">Order Total:</span>
            <span className="text-base font-bold text-neutral-900 dark:text-white">{order.total}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-500 dark:text-zinc-400">Customer:</span>
            <span className="font-semibold">{order.name} ({order.phone})</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-500 dark:text-zinc-400">bKash Sender Number:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white">{order.sender}</span>
          </div>

          <div className="flex justify-between items-center bg-white dark:bg-zinc-900/60 p-2.5 rounded-lg border border-neutral-200 dark:border-white/5">
            <span className="text-neutral-500 dark:text-zinc-400">Transaction ID (TrxID):</span>
            <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
              {order.trx}
            </span>
          </div>
        </div>

        {/* Advisory Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            <strong>Manual Verification:</strong> Please inspect your bKash merchant or personal statement to verify that the amount has been credited from this sender number and TrxID before confirming.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-white/10">
          <button
            type="button"
            className="button secondary w-full sm:w-auto cursor-pointer"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleAction("Failed")}
            disabled={isSaving}
            className="button secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5"
            title="Mark transaction as failed"
          >
            <XCircle size={14} />
            Mark as Failed
          </button>
          <button
            type="button"
            onClick={() => handleAction("Verified")}
            disabled={isSaving}
            className="button w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5"
            title="Verify payment and advance Placed to Confirmed"
          >
            <CheckCircle2 size={14} />
            {isSaving ? "Verifying..." : "Confirm & Verify Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
