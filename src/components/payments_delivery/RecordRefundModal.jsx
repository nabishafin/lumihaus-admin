import { useState } from "react";
import { X, AlertTriangle, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRecordRefundMutation } from "../../redux/features/paymentApi";
import { formatBdt } from "../../utils/format";

const MAX_REASON = 500;

export default function RecordRefundModal({ transaction, onClose }) {
  const [recordRefund, { isLoading }] = useRecordRefundMutation();
  const [isFullRefund, setIsFullRefund] = useState(true);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!transaction) return null;

  const orderTotal = Number(transaction.amount) || 0;

  const validateAmount = () => {
    if (isFullRefund) return { ok: true, value: undefined };

    const raw = String(amount).trim();
    if (!raw) return { ok: false, error: "Enter the refund amount, or choose a full refund." };
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
      return { ok: false, error: "Amount must be a number with at most two decimal places." };
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0.01) {
      return { ok: false, error: "Amount must be at least 0.01." };
    }
    if (value > orderTotal) {
      return { ok: false, error: `Amount cannot exceed the order total (${formatBdt(orderTotal)}).` };
    }
    return { ok: true, value };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 1 || trimmedReason.length > MAX_REASON) {
      toast.error(`Reason is required and must be 1–${MAX_REASON} characters.`);
      return;
    }

    const parsed = validateAmount();
    if (!parsed.ok) {
      toast.error(parsed.error);
      return;
    }

    if (!confirmed) {
      toast.error("Please confirm you have already sent the refund to the customer.");
      return;
    }

    const toastId = toast.loading("Recording refund...");
    try {
      await recordRefund({
        orderId: transaction.orderId,
        amount: parsed.value,
        reason: trimmedReason,
      }).unwrap();

      toast.success(`Refund recorded for ${transaction.orderNumber}.`, { id: toastId });
      onClose();
    } catch (err) {
      const status = err?.status ?? err?.originalStatus;
      let message = err?.data?.message;

      if (status === 409) {
        message = message || "This order has already been refunded.";
      } else if (status === 404) {
        message = message || "Order not found — it may have been deleted.";
      } else if (status === 400) {
        message = message || "Refund rejected: check the order is paid and the amount is valid.";
      } else if (status === 401) {
        message = "Your admin session has expired. Please sign in again.";
      } else if (status === 403) {
        message = "Access denied — recording refunds requires an admin account.";
      } else if (!message) {
        message = "Could not record the refund. Please try again.";
      }

      toast.error(message, { id: toastId, duration: 6000 });
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        style={{ width: "min(520px, calc(100% - 30px))" }}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="section-head">
          <div>
            <span className="page-kicker">MANUAL RECONCILIATION</span>
            <h2>Record refund · {transaction.orderNumber}</h2>
          </div>
          <button type="button" className="icon-action cursor-pointer" onClick={onClose} disabled={isLoading}>
            <X size={17} />
          </button>
        </div>

        {/* The single most important thing on this screen. */}
        <div className="p-3.5 bg-amber-500/10 border-2 border-amber-400/50 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            <strong>This only records a refund you have already sent.</strong> No money is
            transferred by this action — send it through bKash or your courier first, then record
            it here so the books match.
          </p>
        </div>

        <div className="rounded-xl bg-[#F9F6EF] dark:bg-zinc-800/60 border border-[#DCD6CB] dark:border-white/10 p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-zinc-400">Customer</span>
            <span className="font-semibold">{transaction.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-zinc-400">Method</span>
            <span className="font-semibold">{transaction.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-zinc-400">Order total</span>
            <span className="font-mono font-bold">{formatBdt(orderTotal)}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <span className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wide">
            Refund amount
          </span>

          <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
            <input
              type="radio"
              name="refundScope"
              checked={isFullRefund}
              onChange={() => setIsFullRefund(true)}
              className="accent-[#26382E] h-4 w-4"
            />
            <span>Full refund — {formatBdt(orderTotal)}</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
            <input
              type="radio"
              name="refundScope"
              checked={!isFullRefund}
              onChange={() => setIsFullRefund(false)}
              className="accent-[#26382E] h-4 w-4"
            />
            <span>Partial refund</span>
          </label>

          {!isFullRefund && (
            <div className="pl-7">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500 or 1500.50"
                className="w-full rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm font-mono font-bold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
              />
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                Only one refund can be recorded per order — a partial refund cannot be topped up later.
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wide mb-1.5">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            maxLength={MAX_REASON}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Damaged on arrival — replacement unavailable"
            className="w-full rounded-xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#1A1D1B] px-3.5 py-2.5 text-xs text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] leading-relaxed"
          />
          <p className="text-[11px] text-gray-400 mt-1 text-right">
            {reason.trim().length}/{MAX_REASON}
          </p>
        </div>

        <label className="flex items-start gap-2.5 text-xs font-semibold cursor-pointer rounded-xl border border-[#DCD6CB] dark:border-white/10 p-3">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="accent-[#26382E] h-4 w-4 mt-0.5 shrink-0"
          />
          <span className="leading-relaxed">
            I have already sent this refund to the customer and want to record it.
          </span>
        </label>

        <div className="flex justify-end gap-2.5 pt-1">
          <button
            type="button"
            className="button secondary cursor-pointer"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading || !confirmed}
          >
            <Undo2 size={15} />
            {isLoading ? "Recording..." : "Record refund"}
          </button>
        </div>
      </form>
    </div>
  );
}
