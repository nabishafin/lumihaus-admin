const COLORS = ["#8FAF9A", "#6b8dd9", "#b174c2", "#68a879", "#e8a756", "#4fa8a0"];

export default function TopPerformers({ brands }) {
  const brandList =
    Array.isArray(brands) && brands.length > 0
      ? brands.map((b, i) => ({
          name: b.brand || b.name || "Brand",
          percentage: Number(b.percentage ?? b.share ?? 0),
          quantity: b.quantity !== undefined ? Number(b.quantity) : null,
          color: COLORS[i % COLORS.length],
        }))
      : [];

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Best-selling brands</h2>
          <p>Share of monthly product sales</p>
        </div>
      </div>
      <div className="performers">
        {brandList.length === 0 ? (
          <div className="text-xs text-neutral-400 py-6 text-center">
            No brand sales data available yet.
          </div>
        ) : (
          brandList.map(({ name, percentage, quantity, color }) => (
            <div className="brand-performance" key={name}>
              <div>
                <span className="brand-dot" style={{ background: color }} />
                <strong>{name}</strong>
                <b>
                  {quantity !== null ? `${quantity} sold · ` : ""}
                  {percentage}%
                </b>
              </div>
              <div className="progress">
                <i style={{ width: `${Math.min(percentage * 2.3, 100)}%`, background: color }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

