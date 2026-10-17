export default function MetricsCard({ label, value, change, icon }) {
  const isDown =
    change?.startsWith("-") ||
    change?.toLowerCase().includes("review") ||
    change?.toLowerCase().includes("re-order") ||
    change?.toLowerCase().includes("missing") ||
    change?.toLowerCase().includes("loss");

  return (
    <article className={`metric-card ${isDown ? "is-alert" : ""}`}>
      <div className="metric-top">
        <p>{label}</p>
        <span className="metric-icon">{icon}</span>
      </div>
      <h3>{value}</h3>
      {change && <span className={`trend ${isDown ? "down" : ""}`}>{change}</span>}
    </article>
  );
}
