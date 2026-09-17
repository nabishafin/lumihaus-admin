import { useMemo, useState, useRef } from "react";
import { useGetDashboardStatsQuery } from "../../redux/features/dashboardApi";

/** @typedef {"daily" | "weekly" | "monthly"} RevenuePeriod */

/** @type {ReadonlyArray<{ label: string, value: RevenuePeriod }>} */
const PERIOD_OPTIONS = Object.freeze([
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
]);

const SUBTITLES = Object.freeze({
  daily: "Daily revenue",
  weekly: "Weekly revenue",
  monthly: "Monthly revenue",
});

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 2,
});

function formatBDT(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num === 0) return "৳0";
  return `৳${currencyFormatter.format(num)}`;
}

function getErrorMessage(error, response) {
  return (
    response?.message ||
    error?.data?.message ||
    error?.error ||
    "Unable to load sales revenue. Please try again."
  );
}

export default function AnalyticsChart({ salesRevenue: initialSalesRevenue }) {
  /** @type {[RevenuePeriod, import("react").Dispatch<import("react").SetStateAction<RevenuePeriod>>]} */
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const activePeriodRef = useRef(selectedPeriod);

  const handlePeriodChange = (nextPeriod) => {
    if (nextPeriod === selectedPeriod) return;
    activePeriodRef.current = nextPeriod;
    setSelectedPeriod(nextPeriod);
  };

  const {
    currentData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetDashboardStatsQuery(selectedPeriod);

  const rawData = currentData?.data || currentData;
  const salesRevenueData = rawData?.salesRevenue;

  // Verify response matches the active selected period to prevent stale overwrites
  const isMatchingPeriod =
    salesRevenueData?.period?.toLowerCase() === selectedPeriod.toLowerCase();

  // While loading another period, do not display previous period's values
  const isBusy = isLoading || isFetching || (!currentData && !isError);
  const hasApiError = isError && !isBusy;

  const points = useMemo(() => {
    if (isBusy || !isMatchingPeriod) return [];
    const rawPoints = Array.isArray(salesRevenueData?.points)
      ? salesRevenueData.points
      : [];

    return rawPoints.map((pt) => ({
      date: pt?.date ?? "",
      label: String(pt?.label ?? ""),
      revenue: Number(pt?.revenue ?? 0),
    }));
  }, [salesRevenueData?.points, isMatchingPeriod, isBusy]);

  const rawTotal = Number(salesRevenueData?.totalRevenue ?? 0);
  const totalRevenue =
    !isBusy && isMatchingPeriod && Number.isFinite(rawTotal) ? rawTotal : 0;

  const maxRevenue = Math.max(0, ...points.map((pt) => pt.revenue));
  const isAllZero = points.length === 0 || points.every((pt) => pt.revenue === 0);

  const subtitle = SUBTITLES[selectedPeriod] || "Daily revenue";
  const displayedAmount = isBusy ? "..." : formatBDT(totalRevenue);

  return (
    <section className="card chart-card">
      <div className="section-head">
        <div>
          <h2>Sales revenue</h2>
          <p>
            <strong className="displayed-amount">{displayedAmount}</strong>
            {" · "}
            <span className="chart-subtitle">{subtitle}</span>
          </p>
        </div>

        <div
          className="revenue-period-control"
          role="group"
          aria-label="Revenue chart period"
        >
          {PERIOD_OPTIONS.map((option) => (
            <button
              type="button"
              className={selectedPeriod === option.value ? "active" : ""}
              onClick={() => handlePeriodChange(option.value)}
              aria-pressed={selectedPeriod === option.value}
              key={option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isBusy ? (
        <div className="chart-state" role="status" aria-live="polite">
          <span className="chart-spinner" aria-hidden="true" />
          <p>Loading {subtitle.toLowerCase()}...</p>
        </div>
      ) : hasApiError ? (
        <div className="chart-state chart-error" role="alert">
          <p>{getErrorMessage(error, currentData)}</p>
        </div>
      ) : points.length === 0 ? (
        <div className="chart-state" role="status">
          <p>No sales in this period</p>
        </div>
      ) : (
        <div className="chart-bars-wrapper" style={{ position: "relative" }}>
          {isAllZero && (
            <div
              className="no-sales-overlay"
              role="status"
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "var(--surface)",
                padding: "8px 18px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--muted)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              No sales in this period
            </div>
          )}

          <div
            className="chart-bars"
            aria-label={`${selectedPeriod} sales revenue chart`}
            style={{
              overflowX: points.length > 14 ? "auto" : undefined,
              scrollbarWidth: "thin",
            }}
          >
            {points.map((point, index) => {
              const heightPercent =
                maxRevenue > 0 && point.revenue > 0
                  ? (point.revenue / maxRevenue) * 100
                  : 0;

              return (
                <div
                  key={`${point.label}-${point.date || index}`}
                  className="bar-column"
                  style={{
                    minWidth: points.length > 20 ? "24px" : undefined,
                  }}
                >
                  <div
                    className="bar"
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: point.revenue > 0 ? "4px" : "0px",
                    }}
                    title={`${point.label}: ${formatBDT(point.revenue)}`}
                    role="img"
                    aria-label={`${point.label}: ${formatBDT(point.revenue)}`}
                  />
                  <span>{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
