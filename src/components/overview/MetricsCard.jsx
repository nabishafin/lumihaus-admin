export default function MetricsCard({ label, value, change, icon }) {
  return <article className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className={change?.startsWith("-") ? "trend down" : "trend"}>{change}</span></div><p>{label}</p><h3>{value}</h3><small>Compared with last month</small></article>;
}
