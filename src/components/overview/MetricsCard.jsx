export default function MetricsCard({ label, value, change, icon }) {
  const isDown =
    change?.startsWith("-") ||
    change?.toLowerCase().includes("review") ||
    change?.toLowerCase().includes("re-order");

  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        {change && (
          <span className={`trend ${isDown ? "down" : ""}`}>{change}</span>
        )}
      </div>
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}
