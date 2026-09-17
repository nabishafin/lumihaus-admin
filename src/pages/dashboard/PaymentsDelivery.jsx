import { useState } from "react";
import { RefreshCw, AlertTriangle, ShieldAlert, Banknote, Truck, Undo2 } from "lucide-react";
import TransactionLog from "../../components/payments_delivery/TransactionLog";
import DeliverySetup from "../../components/payments_delivery/DeliverySetup";
import { useGetPaymentsSummaryQuery } from "../../redux/features/paymentApi";
import { formatBdt } from "../../utils/format";

function SummaryCard({ label, value, hint, icon, isLoading, isError }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
      </div>
      <p>{label}</p>
      {isLoading ? (
        <h3 className="text-neutral-300 dark:text-zinc-600">···</h3>
      ) : isError ? (
        <h3 className="text-neutral-400 dark:text-zinc-500">—</h3>
      ) : (
        <h3>{formatBdt(value)}</h3>
      )}
      <small>{isError ? "Unavailable" : hint}</small>
    </article>
  );
}

export default function PaymentsDelivery() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, isFetching, isError, error, refetch } = useGetPaymentsSummaryQuery({
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  });

  const summary = data?.data || {};
  const unknownRefundAmounts = Number(summary.unknownRefundAmounts) || 0;

  return (
    <>
      <title>Lumihaus Admin · Payments & Delivery</title>

      <div className="page-heading">
        <div>
          <span className="page-kicker">FINANCE & FULFILMENT</span>
          <h2>Payments & Delivery</h2>
          <p>Monitor collected payments, record refunds, and set courier charges.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            title="Summary from date (order creation date)"
            className="rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] px-2.5 py-2 text-xs"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            title="Summary to date (order creation date)"
            className="rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] px-2.5 py-2 text-xs"
          />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="button secondary flex items-center gap-1.5 cursor-pointer"
            title="Refresh summary"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {isError && (
        <div className="p-4 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {error?.status === 403 ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
            <span>
              {error?.status === 403
                ? "Access denied. Only admin or super_admin users may view payment totals."
                : error?.data?.message || "Failed to load payment summary."}
            </span>
          </div>
          <button onClick={() => refetch()} className="button secondary text-xs py-1 px-2.5 cursor-pointer shrink-0">
            Retry
          </button>
        </div>
      )}

      <div className="metrics-grid compact">
        <SummaryCard
          label="Payments received"
          value={summary.paymentsReceived}
          hint="Gross collected, before refunds"
          icon={<Banknote size={18} />}
          isLoading={isLoading}
          isError={isError}
        />
        <SummaryCard
          label="COD pending"
          value={summary.codPending}
          hint="Awaiting collection on delivery"
          icon={<Truck size={18} />}
          isLoading={isLoading}
          isError={isError}
        />
        <SummaryCard
          label="Refunded"
          value={summary.refunded}
          hint="Recorded refunds"
          icon={<Undo2 size={18} />}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Reconciliation caveat — these refunds are not counted in the total above. */}
      {unknownRefundAmounts > 0 && (
        <div className="p-3.5 mb-4 bg-amber-500/10 border-2 border-amber-400/50 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            <strong>
              {unknownRefundAmounts} refund{unknownRefundAmounts === 1 ? "" : "s"} have no recorded amount.
            </strong>{" "}
            The Refunded total above excludes them, so it understates the real figure. Check those
            orders manually before relying on this for reconciliation.
          </p>
        </div>
      )}

      <div className="two-column wide-first">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Transactions</h2>
              <p>One row per order · newest first</p>
            </div>
          </div>
          <TransactionLog />
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h2>Delivery setup</h2>
              <p>Charges customers pay at checkout</p>
            </div>
          </div>
          <DeliverySetup />
        </section>
      </div>
    </>
  );
}
