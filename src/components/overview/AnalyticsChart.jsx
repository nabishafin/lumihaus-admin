const values = [34, 48, 42, 68, 56, 75, 63, 82, 72, 90, 78, 94];
export default function AnalyticsChart() {
  return <section className="card chart-card"><div className="section-head"><div><h2>Revenue analytics</h2><p>Sales performance over time</p></div><select aria-label="Period"><option>Monthly</option><option>Weekly</option><option>Yearly</option></select></div><div className="chart-bars">{values.map((v,i) => <div key={i} className="bar-column"><div className="bar" style={{height:`${v}%`}}/><span>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}</span></div>)}</div></section>;
}
