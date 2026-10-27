import { useState } from "react";
import { RefreshCw, AlertTriangle, ShieldAlert, Banknote, Truck, Undo2 } from "lucide-react";
import TransactionLog from "../../components/payments/TransactionLog";
import DeliverySetup from "../../components/payments/DeliverySetup";
import { useGetPaymentsSummaryQuery } from "../../redux/api/paymentApi";
import { formatBdt, dhakaDayStart, dhakaDayEnd } from "../../utils/format";

const CARD =
  "rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620]";
const MUTED = "text-[#2E4235]/65 dark:text-[#D2DDD6]/65";
const DATE_INPUT =
  "w-[132px] dark:[color-scheme:dark] rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] px-2.5 py-1.5 text-xs text-[#141f17] dark:text-white";

function SummaryCard({ label, value, hint, icon, isLoading, isError }) {
  return (
    <article className={`${CARD} px-[18px] py-4 flex flex-col gap-1.5 min-w-0`}>
      <div className="flex items-start justify-between gap-2.5">
        <p className={`m-0 text-[12.5px] font-medium ${MUTED}`}>{label}</p>
        <span className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[#F1EEE7] dark:bg-white/5 text-[#26382E] dark:text-[#8FAF9A] shrink-0">
          {icon}
        </span>
      </div>
      {isLoading ? (
        <h3 className="m-0 text-[22px] font-semibold text-[#141f17]/30 dark:text-white/30">···</h3>
      ) : isError ? (
        <h3 className="m-0 text-[22px] font-semibold text-[#141f17]/40 dark:text-white/40">—</h3>
      ) : (
        <h3 className="m-0 text-[22px] font-semibold tabular-nums tracking-tight text-[#141f17] dark:text-white">
          {formatBdt(value)}
        </h3>
      )}
      <small className={`text-xs ${MUTED}`}>{isError ? "Unavailable" : hint}</small>
    </article>
  );
}

function SectionHead({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="m-0 text-base font-semibold text-[#141f17] dark:text-white">{title}</h2>
      <p className={`m-0 mt-0.5 text-[13px] ${MUTED}`}>{subtitle}</p>
    </div>
  );
}

export default function PaymentsDelivery() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, isFetching, isError, error, refetch } = useGetPaymentsSummaryQuery({
    from: dhakaDayStart(from),
    to: dhakaDayEnd(to),
  });

  const summary = data?.data || {};
  const unknownRefundAmounts = Number(summary.unknownRefundAmounts) || 0;

  return (
    <>
      <title>Lumihaus Admin · Payments & Delivery</title>

      <div className="page-heading flex-wrap">
        <div>
          <h2>Payments & Delivery</h2>
          <p>Payments, refunds and courier charges.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Summary period — filters the totals below (by order creation date). */}
          <div
            role="group"
            aria-label="Summary period"
            className={`flex items-center gap-1.5 text-xs ${MUTED}`}
          >
            <span className="mr-0.5">Totals from</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="Totals from date"
              title="Summary from date (order creation date)"
              className={DATE_INPUT}
            />
            <span>to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="Totals to date"
              title="Summary to date (order creation date)"
              className={DATE_INPUT}
            />
          </div>
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
        <div className="px-4 py-3 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-300 text-[13px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {error?.status === 403 ? <ShieldAlert size={16} className="shrink-0" /> : <AlertTriangle size={16} className="shrink-0" />}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        <SummaryCard
          label="Payments received"
          value={summary.paymentsReceived}
          hint="Gross, before refunds"
          icon={<Banknote size={15} />}
          isLoading={isLoading}
          isError={isError}
        />
        <SummaryCard
          label="COD pending"
          value={summary.codPending}
          hint="To collect on delivery"
          icon={<Truck size={15} />}
          isLoading={isLoading}
          isError={isError}
        />
        <SummaryCard
          label="Refunded"
          value={summary.refunded}
          hint="Recorded refunds"
          icon={<Undo2 size={15} />}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Reconciliation caveat — these refunds are not counted in the total above. */}
      {unknownRefundAmounts > 0 && (
        <div className="px-4 py-3 mb-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-300/70 dark:border-amber-400/30 rounded-xl text-[13px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="m-0 leading-relaxed">
            <strong>
              {unknownRefundAmounts} refund{unknownRefundAmounts === 1 ? "" : "s"} have no recorded amount.
            </strong>{" "}
            The Refunded total above excludes them, so it understates the real figure. Check those
            orders manually before relying on this for reconciliation.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
        <section className={`${CARD} p-5 min-w-0`}>
          <SectionHead title="Transactions" subtitle="One row per order, newest first" />
          <TransactionLog />
        </section>

        <section className={`${CARD} p-5 min-w-0`}>
          <SectionHead title="Delivery setup" subtitle="Charges customers pay at checkout" />
          <DeliverySetup />
        </section>
      </div>
    </>
  );
}
