import { useState } from "react";
const series = { Daily: [42,55,48,70,61,84,76], Weekly: [34,48,42,68,56,75,83,62], Monthly: [34,48,42,68,56,75,63,82,72,90,78,94] };
export default function AnalyticsChart() {
  const [period,setPeriod]=useState("Monthly"); const values=series[period];
  return <section className="card chart-card"><div className="section-head"><div><h2>Sales revenue</h2><p>৳12.48L gross revenue · +12.5%</p></div><div className="chart-tabs">{Object.keys(series).map(x=><button className={period===x?"active":""} onClick={()=>setPeriod(x)} key={x}>{x}</button>)}</div></div><div className="chart-bars">{values.map((v,i) => <div key={i} className="bar-column"><div className="bar" style={{height:`${v}%`}} title={`৳${v*1250}`}/><span>{period==="Monthly"?["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]:`0${i+1}`}</span></div>)}</div></section>;
}
