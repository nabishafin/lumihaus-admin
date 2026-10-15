import { useMemo } from "react";
import MetricsCard from "../../components/overview/MetricsCard";
import AnalyticsChart from "../../components/overview/AnalyticsChart";
import TopPerformers from "../../components/overview/TopPerformers";
import {
  AlertTriangle,
  BadgeEuro,
  Banknote,
  Boxes,
  ClipboardCheck,
  Info,
  ShoppingCart,
  Truck,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useGetDashboardStatsQuery } from "../../redux/features/dashboardApi";

export default function Overview() {
  const { data: responseData, isLoading, isError, refetch, isFetching } = useGetDashboardStatsQuery();
  const dashboardData = responseData?.data || responseData || {};
  const kpis = dashboardData?.kpis || {};
  const profit = dashboardData?.profit;
  const formatMoney = (amount) => typeof amount === "number" && Number.isFinite(amount)
    ? new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 }).format(amount)
    : "Unavailable";
  const profitValue = isLoading ? "Loading..." : isError || !profit ? "Unavailable"
    : profit.isProfitComplete ? formatMoney(profit.netProfit) : "Cost missing";

  const totalSales =
    kpis?.totalSalesVolume !== undefined
      ? `৳${kpis.totalSalesVolume >= 100000 ? (kpis.totalSalesVolume / 100000).toFixed(2) + "L" : kpis.totalSalesVolume.toLocaleString()}`
      : "৳0";

  const todayRevenue =
    kpis?.todayRevenue !== undefined
      ? `৳${kpis.todayRevenue.toLocaleString()}`
      : "৳0";

  const totalOrders =
    kpis?.totalOrders !== undefined
      ? kpis.totalOrders.toLocaleString()
      : "0";

  const pendingBkash = kpis?.pendingBkash ?? 0;
  const activeSkus = kpis?.activeGermanSkus ?? 0;
  const lowStock = kpis?.lowStockAlerts ?? 0;
  const readyToShip = kpis?.ordersReadyToShip ?? 0;

  // Normalized order status distribution: combines legacy raw keys per contract
  const normalizedDistribution = useMemo(() => {
    if (!dashboardData?.orderStatusDistribution) return null;
    const dist = dashboardData.orderStatusDistribution;

    const inDelivery =
      (dist["In Delivery"] || 0) +
      (dist["Shipped"] || 0) +
      (dist["Processing"] || 0) +
      (dist["In-Transit"] || 0);

    const placed =
      (dist["Placed"] || 0) +
      (dist["bKash pending"] || 0) +
      (dist["bkashPending"] || 0);

    const confirmed = dist["Confirmed"] || 0;
    const delivered = dist["Delivered"] || 0;
    const cancelled = dist["Cancelled"] || 0;

    return {
      "In Delivery": inDelivery,
      Placed: placed,
      Confirmed: confirmed,
      Delivered: delivered,
      Cancelled: cancelled,
    };
  }, [dashboardData?.orderStatusDistribution]);

  const savedUserRaw = typeof window !== "undefined" ? localStorage.getItem("lumihaus_admin_user") : null;
  let adminName = "Admin";
  try {
    if (savedUserRaw) adminName = JSON.parse(savedUserRaw)?.name || "Admin";
  } catch {}

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="overview-page">
      <title>LumiHaus Admin · Overview</title>
      <div className="page-heading">
        <div>
          <h2>Guten Tag, {adminName}</h2>
          <p>{today} · Here is how the store is doing.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="button secondary"
          title="Refresh live data (60-sec backend cache)"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          <span>{isFetching ? "Syncing..." : "Sync data"}</span>
        </button>
      </div>

      <h3 className="overview-label">Sales</h3>
      <div className="metrics-grid">
        <MetricsCard
          label="Total sales volume"
          value={totalSales}
          change="Booked revenue"
          icon={<Banknote size={15} />}
        />
        <MetricsCard
          label="Today's revenue"
          value={todayRevenue}
          change="Booked today"
          icon={<BadgeEuro size={15} />}
        />
        <MetricsCard
          label="Net profit"
          value={profitValue}
          change={profit?.isProfitComplete ? (profit.netProfit < 0 ? "- Net loss" : "Delivered sales") : "Requires review"}
          icon={<TrendingUp size={15} />}
        />
        <MetricsCard
          label="Total orders"
          value={totalOrders}
          change="Lifetime store"
          icon={<ShoppingCart size={15} />}
        />
      </div>

      <h3 className="overview-label">Operations</h3>
      <div className="metrics-grid">
        <MetricsCard
          label="Pending bKash"
          value={String(pendingBkash)}
          change={pendingBkash > 0 ? "Requires review" : "All verified"}
          icon={<ClipboardCheck size={15} />}
        />
        <MetricsCard
          label="Orders ready to ship"
          value={String(readyToShip)}
          change="Incl. processing"
          icon={<Truck size={15} />}
        />
        <MetricsCard
          label="Active German SKUs"
          value={String(activeSkus)}
          change="Store catalog"
          icon={<Boxes size={15} />}
        />
        <MetricsCard
          label="Low stock alerts"
          value={String(lowStock)}
          change={lowStock > 0 ? "Re-order dm.de" : "Inventory healthy"}
          icon={<AlertTriangle size={15} />}
        />
      </div>

      <section className="card profit-card">
        <div className="section-head">
          <div>
            <h2>Net profit breakdown</h2>
            <p>Delivered sales less product costs, actual courier charges and other operating expenses.</p>
          </div>
          <a className="text-button" href="/expenses">Record expenses</a>
        </div>
        {isLoading ? <p>Loading profit calculation...</p> : isError || !profit ? <p>Profit data unavailable. Use Sync data to retry.</p> : (
          <>
            <div className="profit-rows">
              {[
                ["Product revenue", profit.productSales],
                ["Customer delivery income", profit.customerDeliveryCharged, "+"],
                ["Delivered sales", profit.netSales, "subtotal"],
                ["Sold product costs (COGS)", profit.cogs, "-"],
                ["Recorded courier expenses", profit.courierExpenses, "-"],
                ["Other operating expenses", profit.otherOperatingExpenses, "-"],
                ["Net profit", profit.netProfit, "total"],
              ].map(([label, amount, kind]) => (
                <div key={label} className={`profit-row ${kind === "subtotal" || kind === "total" ? kind : ""}`}>
                  <span>
                    {(kind === "+" || kind === "-") && <i>{kind === "-" ? "−" : "+"}</i>}
                    {label}
                  </span>
                  <b className={kind === "total" && amount < 0 ? "negative" : undefined}>
                    {amount === null || amount === undefined ? "Cost missing" : formatMoney(amount)}
                  </b>
                </div>
              ))}
            </div>
            {!profit.isProfitComplete && (
              <p role="status" className="callout warning">
                <AlertTriangle size={14} />
                <span>
                  Purchase costs are missing for {profit.missingCostsCount ?? "some"} sold items. Net profit can be
                  calculated once all costs are entered.
                </span>
              </p>
            )}
            {profit.unlinkedCourierExpenses > 0 && (
              <p className="callout info">
                <Info size={14} />
                <span>
                  {formatMoney(profit.unlinkedCourierExpenses)} in courier bills is deducted from net profit but not yet
                  linked to individual orders.
                </span>
              </p>
            )}
            <p className="profit-footnote">
              Based on recorded expenses. Courier expenses are deducted once; inventory purchases count through COGS, so
              nothing is double-counted.
            </p>
          </>
        )}
      </section>

      <div className="overview-grid">
        <AnalyticsChart salesRevenue={dashboardData?.salesRevenue} />
        <OrderDonut
          distribution={normalizedDistribution}
          totalOrders={kpis?.totalOrders}
        />
      </div>

      <div className="overview-bottom">
        <TopPerformers brands={dashboardData?.bestSellingBrands} />
        <RecentOrders orders={dashboardData?.recentOrders} />
      </div>
    </div>
  );
}

// Same order as the .legend-N colours in styles.css.
const DONUT_COLORS = ["var(--action)", "var(--sage)", "var(--gold)", "#D4C4B8", "var(--line)"];

function OrderDonut({ distribution, totalOrders = 0 }) {
  const parts = useMemo(() => {
    if (!distribution) return [];
    const entries = Object.entries(distribution);
    const sum = entries.reduce((acc, [, val]) => acc + val, 0) || 1;
    return entries.map(([k, v]) => [k, Math.round((v / sum) * 100), v]);
  }, [distribution]);

  // Draw the ring from the real split (it used to be a fixed decorative gradient).
  const ring = useMemo(() => {
    const total = parts.reduce((acc, [, , v]) => acc + v, 0);
    if (!total) return "var(--line)";
    let start = 0;
    const stops = parts.map(([, , v], i) => {
      const end = start + (v / total) * 100;
      const stop = `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}% ${end}%`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(",")})`;
  }, [parts]);

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Order status</h2>
          <p>{totalOrders ? totalOrders.toLocaleString() : "0"} total orders</p>
        </div>
      </div>
      <div className="donut-wrap">
        <div className="donut" style={{ background: ring }}>
          <div>
            <b>{totalOrders ? totalOrders.toLocaleString() : "0"}</b>
            <small>Orders</small>
          </div>
        </div>
        {parts.length === 0 ? (
          <p className="text-xs text-neutral-400 max-w-[160px]">No orders yet, so there is no status split to show.</p>
        ) : (
          <div className="donut-legend">
            {parts.map(([x, pct, val], i) => (
              <div key={x}>
                <i className={`legend-${i % DONUT_COLORS.length}`} />
                <span>{x}</span>
                <b>{val}</b>
                <small>{pct}%</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RecentOrders({ orders }) {
  const list = Array.isArray(orders) ? orders : [];

  const normalizeRecentStatus = (st) => {
    if (!st) return "Placed";
    if (st === "Shipped" || st === "Processing" || st === "In-Transit") return "In Delivery";
    if (st === "bKash pending") return "Placed";
    return st;
  };

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Recent orders</h2>
          <p>Latest activity from store checkout</p>
        </div>
        <a className="text-button" href="/orders">
          View all
        </a>
      </div>
      {list.length === 0 ? (
        <div className="text-xs text-neutral-400 py-4 text-center">
          No recent orders recorded yet.
        </div>
      ) : (
        list.slice(0, 5).map((x, idx) => {
          const status = normalizeRecentStatus(x.status || x.paymentStatus);
          return (
            <div className="recent-order" key={x.orderNumber || x.id || idx}>
              <b>{x.orderNumber || x.id || `#LH-${idx + 1}`}</b>
              <span>{x.customerName || x.customer?.name || "Customer"}</span>
              <strong>৳{(x.total || x.totalAmount || 0).toLocaleString()}</strong>
              <em className={`status-${status.toLowerCase().replace(/s+/g, "-")}`}>{status}</em>
            </div>
          );
        })
      )}
    </section>
  );
}
