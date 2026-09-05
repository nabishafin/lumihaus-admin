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
  RefreshCw,
} from "lucide-react";
import { useGetDashboardStatsQuery } from "../../redux/features/dashboardApi";

export default function Overview() {
  const { data: responseData, isLoading, refetch, isFetching } = useGetDashboardStatsQuery();
  const dashboardData = responseData?.data || responseData || {};
  const kpis = dashboardData?.kpis || {};

  const totalSales = kpis?.totalSalesVolume
    ? `৳${(kpis.totalSalesVolume >= 100000 ? (kpis.totalSalesVolume / 100000).toFixed(2) + "L" : kpis.totalSalesVolume.toLocaleString())}`
    : "৳12.48L";

  const todayRevenue = kpis?.todayRevenue
    ? `৳${kpis.todayRevenue.toLocaleString()}`
    : "৳84,320";

  const totalOrders = kpis?.totalOrders
    ? kpis.totalOrders.toLocaleString()
    : "1,284";

  const pendingBkash = kpis?.pendingBkash ?? 8;
  const activeSkus = kpis?.activeGermanSkus ?? 428;
  const lowStock = kpis?.lowStockAlerts ?? 14;

  return (
    <>
      <title>LumiHaus Admin · Overview</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">LIVE CONSOLE ANALYTICS</span>
          <h2>Guten Morgen, Shafin</h2>
          <p>Your German beauty catalog is performing beautifully today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="button secondary flex items-center gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Sync Data"}</span>
          </button>
        </div>
      </div>

      <div className="metrics-grid six">
        <MetricsCard
          label="Total sales volume"
          value={totalSales}
          change="+12.5%"
          icon={<Banknote size={18} />}
        />
        <MetricsCard
          label="Today's revenue"
          value={todayRevenue}
          change="+8.2%"
          icon={<BadgeEuro size={18} />}
        />
        <MetricsCard
          label="Total orders"
          value={totalOrders}
          change="+6.4%"
          icon={<ShoppingCart size={18} />}
        />
        <MetricsCard
          label="Pending bKash"
          value={String(pendingBkash)}
          change={pendingBkash > 0 ? "Action needed" : "All verified"}
          icon={<ClipboardCheck size={18} />}
        />
        <MetricsCard
          label="Active German SKUs"
          value={String(activeSkus)}
          change="+18 new"
          icon={<Boxes size={18} />}
        />
        <MetricsCard
          label="Low stock alerts"
          value={String(lowStock)}
          change={lowStock > 0 ? "Re-order dm.de" : "Healthy"}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div className="overview-grid">
        <AnalyticsChart salesRevenue={dashboardData?.salesRevenue} />
        <OrderDonut
          distribution={dashboardData?.orderStatusDistribution}
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

function OrderDonut({ distribution, totalOrders = 1284 }) {
  const parts = distribution
    ? Object.entries(distribution).map(([k, v]) => [k, v])
    : [
        ["Delivered", 62],
        ["Shipped", 14],
        ["Confirmed", 12],
        ["Placed", 8],
        ["Cancelled", 4],
      ];

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Order status</h2>
          <p>{totalOrders ? totalOrders.toLocaleString() : "1,284"} total orders</p>
        </div>
      </div>
      <div className="donut-wrap">
        <div className="donut">
          <div>
            <b>{totalOrders ? totalOrders.toLocaleString() : "1,284"}</b>
            <small>Orders</small>
          </div>
        </div>
        <div className="donut-legend">
          {parts.map(([x, v], i) => (
            <div key={x}>
              <i className={`legend-${i % 5}`} />
              <span>{x}</span>
              <b>{v}%</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentOrders({ orders }) {
  const list =
    orders && orders.length > 0
      ? orders
      : [
          {
            orderNumber: "#LH-2084",
            customerName: "Nusrat Jahan",
            total: 3450,
            status: "bKash pending",
          },
          {
            orderNumber: "#LH-2083",
            customerName: "Sadia Rahman",
            total: 5200,
            status: "Confirmed",
          },
          {
            orderNumber: "#LH-2082",
            customerName: "Tahmid Hasan",
            total: 1850,
            status: "Shipped",
          },
        ];

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Recent orders</h2>
          <p>Latest activity from checkout</p>
        </div>
        <a className="text-button" href="/orders">
          View all
        </a>
      </div>
      {list.map((x, idx) => (
        <div className="recent-order" key={x.orderNumber || idx}>
          <b>{x.orderNumber || x.id || `#LH-${2080 + idx}`}</b>
          <span>{x.customerName || x.customer?.name || "Customer"}</span>
          <strong>৳{(x.total || x.totalAmount || 0).toLocaleString()}</strong>
          <em>{x.paymentStatus || x.status || "Placed"}</em>
        </div>
      ))}
    </section>
  );
}
