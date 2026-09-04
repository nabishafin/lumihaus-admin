import MetricsCard from "../../components/overview/MetricsCard";
import AnalyticsChart from "../../components/overview/AnalyticsChart";
import TopPerformers from "../../components/overview/TopPerformers";

export default function Overview() {
  return <><title>Lumihaus Admin · Overview</title><div className="page-heading"><div><h2>Good morning, Shafin</h2><p>Here’s what’s happening with your store today.</p></div><button className="button">Download report</button></div><div className="metrics-grid"><MetricsCard label="Total revenue" value="৳12,48,250" change="+12.5%" icon="৳"/><MetricsCard label="Today's sales" value="৳84,320" change="+8.2%" icon="↗"/><MetricsCard label="Total orders" value="1,284" change="+6.4%" icon="▤"/><MetricsCard label="Customers" value="8,649" change="-1.2%" icon="♙"/></div><div className="overview-grid"><AnalyticsChart/><TopPerformers/></div></>;
}
