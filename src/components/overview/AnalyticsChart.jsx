import { useMemo, useState } from "react";
import { useGetRevenueAnalyticsQuery } from "../../redux/features/dashboardApi";

/** @typedef {"daily" | "weekly" | "monthly"} RevenuePeriod */

/** @type {ReadonlyArray<{ label: string, value: RevenuePeriod }>} */
const PERIOD_OPTIONS = Object.freeze([
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
]);

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 2,
});

function getErrorMessage(error, response) {
  return (
    response?.message ||
    error?.data?.message ||
    error?.error ||
    "Unable to load revenue analytics. Please try again."
  );
}

function normalizeChart(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      label: String(
        item?.label ?? item?.month ?? item?.day ?? item?.week ?? item?.date ?? "",
      ),
      value: Number(
        item?.value ?? item?.revenue ?? item?.totalRevenue ?? item?.amount,
      ),
    }))
    .filter((item) => item.label && Number.isFinite(item.value));
}

function getAvailableRevenueSeries(salesRevenue, period) {
  const selectedSeries = salesRevenue?.[period];
  if (Array.isArray(selectedSeries)) return selectedSeries;

  // Some dashboard responses currently expose only the monthly series.
  return salesRevenue?.monthly ?? salesRevenue?.weekly ?? salesRevenue?.daily ?? [];
}

export default function AnalyticsChart({ salesRevenue }) {
  /** @type {[RevenuePeriod, import("react").Dispatch<import("react").SetStateAction<RevenuePeriod>>]} */
  const [period, setPeriod] = useState("daily");
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetRevenueAnalyticsQuery(period);

  const analytics = response?.data || response || {};
  const chart = useMemo(() => {
    const apiChart = normalizeChart(analytics?.chart);
    if (apiChart.length > 0) return apiChart;

    const analyticsSeries = normalizeChart(
      getAvailableRevenueSeries(analytics?.salesRevenue, period),
    );
    if (analyticsSeries.length > 0) return analyticsSeries;

    return normalizeChart(getAvailableRevenueSeries(salesRevenue, period));
  }, [analytics?.chart, analytics?.salesRevenue, period, salesRevenue]);

  const maxValue = Math.max(0, ...chart.map((item) => item.value));
  const apiTotalRevenue = Number(analytics?.totalRevenue);
  const totalRevenue = Number.isFinite(apiTotalRevenue)
    ? apiTotalRevenue
    : chart.reduce((total, item) => total + item.value, 0);
  const growth = Number(analytics?.growth);
  const hasTotalRevenue = Number.isFinite(apiTotalRevenue) || chart.length > 0;
  const hasGrowth = Number.isFinite(growth);
  const hasApiError =
    (isError || response?.success === false) && chart.length === 0;
  const isBusy = isLoading || isFetching;

  /** @param {RevenuePeriod} nextPeriod */
  const handlePeriodChange = (nextPeriod) => {
    if (nextPeriod === period) return;
    setPeriod(nextPeriod);
  };

  return (
    <section className="card chart-card">
      <div className="section-head">
        <div>
          <h2>Sales revenue</h2>
          <p>
            {hasTotalRevenue
              ? `৳${currencyFormatter.format(totalRevenue)} ${period} revenue`
              : `${PERIOD_OPTIONS.find((option) => option.value === period)?.label} revenue`}
            {hasGrowth ? ` · ${growth >= 0 ? "+" : ""}${growth}%` : ""}
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
              className={period === option.value ? "active" : ""}
              onClick={() => handlePeriodChange(option.value)}
              aria-pressed={period === option.value}
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
          <p>Loading {period} revenue...</p>
        </div>
      ) : hasApiError ? (
        <div className="chart-state chart-error" role="alert">
          <p>{getErrorMessage(error, response)}</p>
        </div>
      ) : chart.length === 0 ? (
        <div className="chart-state" role="status">
          <p>No revenue data is available for this period.</p>
        </div>
      ) : (
        <div className="chart-bars" aria-label={`${period} sales revenue chart`}>
          {chart.map((item, index) => {
            const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

            return (
              <div key={`${item.label}-${index}`} className="bar-column">
                <div
                  className="bar"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`৳${currencyFormatter.format(item.value)}`}
                  role="img"
                  aria-label={`${item.label}: ৳${currencyFormatter.format(item.value)}`}
                />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
