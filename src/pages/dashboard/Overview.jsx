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

  return (
    <>
      <title>LumiHaus Admin · Overview</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">LIVE CONSOLE ANALYTICS</span>
          <h2>Guten Tag, {adminName}</h2>
          <p>Your German drugstore beauty catalog and order pipeline are live.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="button secondary flex items-center gap-1.5 cursor-pointer"
            title="Refresh Live Data (60-sec backend cache)"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Sync Data"}</span>
          </button>
        </div>
      </div>

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

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="section-head">
          <div>
            <h2>Net profit breakdown</h2>
            <p>Delivered sales less product costs, actual courier charges and other operating expenses.</p>
          </div>
          <a className="text-button" href="/expenses">Record expenses</a>
        </div>
        {isLoading ? <p>Loading profit calculation...</p> : isError || !profit ? <p>Profit data unavailable. Use Sync Data to retry.</p> : (
          <>
            <table style={{ width: "100%" }}>
              <tbody>
                {[
                  ["Product revenue", profit.productSales],
                  ["+ Customer delivery income", profit.customerDeliveryCharged],
                  ["= Delivered sales", profit.netSales],
                  ["- Sold product costs (COGS)", profit.cogs],
                  ["- Actual recorded courier expenses", profit.courierExpenses],
                  ["- Other operating expenses", profit.otherOperatingExpenses],
                  ["= Net Profit", profit.netProfit],
                ].map(([label, amount]) => (
                  <tr key={label} style={label.startsWith("=") ? { fontWeight: "bold" } : undefined}>
                    <td>{label}</td>
                    <td style={{ textAlign: "right" }}>{amount === null || amount === undefined ? "Cost missing" : formatMoney(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!profit.isProfitComplete && (
              <p role="status" style={{ color: "#b45309", fontWeight: 600, marginTop: 8 }}>
                ⚠️ Cost missing: Purchase costs are missing from {profit.missingCostsCount ?? "some"} sold items. Net profit cannot be calculated until all costs are entered.
              </p>
            )}
            {profit.unlinkedCourierExpenses > 0 && (
              <p style={{ color: "#42584B", background: "#EEF3EF", padding: "8px 12px", borderRadius: 8, marginTop: 8 }}>
                ℹ️ <strong>Unlinked courier expenses:</strong> {formatMoney(profit.unlinkedCourierExpenses)} in courier bills are deducted globally from Net Profit, but not yet linked to individual orders.
              </p>
            )}
            <p style={{ fontSize: "11.5px", color: "#6b7280", marginTop: 8 }}>
              Based on recorded expenses. Courier expenses are deducted once. Inventory purchases are accounted for through sold product costs (COGS), avoiding double-counting.
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
    </>
  );
}

function OrderDonut({ distribution, totalOrders = 0 }) {
  const parts = useMemo(() => {
    if (!distribution) return [];
    const entries = Object.entries(distribution);
    const sum = entries.reduce((acc, [, val]) => acc + val, 0) || 1;
    return entries.map(([k, v]) => [k, Math.round((v / sum) * 100), v]);
  }, [distribution]);

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Order status</h2>
          <p>{totalOrders ? totalOrders.toLocaleString() : "0"} total orders</p>
        </div>
      </div>
      <div className="donut-wrap">
        <div className="donut">
          <div>
            <b>{totalOrders ? totalOrders.toLocaleString() : "0"}</b>
            <small>Orders</small>
          </div>
        </div>
        <div className="donut-legend">
          {parts.length === 0 ? (
            <div className="text-xs text-neutral-400 py-4">No order status distribution recorded.</div>
          ) : (
            parts.map(([x, pct, val], i) => (
              <div key={x}>
                <i className={`legend-${i % 5}`} />
                <span>{x}</span>
                <b>{pct}% ({val})</b>
              </div>
            ))
          )}
        </div>
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
        list.slice(0, 5).map((x, idx) => (
          <div className="recent-order" key={x.orderNumber || x.id || idx}>
            <b>{x.orderNumber || x.id || `#LH-${idx + 1}`}</b>
            <span>{x.customerName || x.customer?.name || "Customer"}</span>
            <strong>৳{(x.total || x.totalAmount || 0).toLocaleString()}</strong>
            <em>{normalizeRecentStatus(x.status || x.paymentStatus)}</em>
          </div>
        ))
      )}
    </section>
  );
}
