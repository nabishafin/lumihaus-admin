const DEFAULT_BRANDS = [
  ["Balea Germany", 38, "#d96b86"],
  ["Penaten Baby", 26, "#6b8dd9"],
  ["Catrice", 21, "#b174c2"],
  ["Alverde", 15, "#68a879"],
];

const COLORS = ["#d96b86", "#6b8dd9", "#b174c2", "#68a879", "#e8a756", "#4fa8a0"];

export default function TopPerformers({ brands }) {
  const brandList =
    brands && brands.length > 0
      ? brands.map((b, i) => [
          b.brand || b.name,
          b.percentage || b.share || 0,
          COLORS[i % COLORS.length],
        ])
      : DEFAULT_BRANDS;

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Best-selling brands</h2>
          <p>Share of monthly product sales</p>
        </div>
      </div>
      <div className="performers">
        {brandList.map(([name, value, color]) => (
          <div className="brand-performance" key={name}>
            <div>
              <span className="brand-dot" style={{ background: color }} />
              <strong>{name}</strong>
              <b>{value}%</b>
            </div>
            <div className="progress">
              <i style={{ width: `${Math.min(value * 2.3, 100)}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
