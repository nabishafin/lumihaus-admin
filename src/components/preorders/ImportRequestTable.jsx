const requests=[
  ["#PR-1042","Maliha Tasnim","dm.de","Balea Beauty Expert Serum","৳3,890","Quote Requested"],
  ["#PR-1041","Rumana Islam","rossmann.de","ISANA Hydro Booster","৳2,450","Advance Received"],
  ["#PR-1038","Ayesha Karim","douglas.de","Rituals Sakura Set","৳8,950","Purchased in Germany"],
  ["#PR-1031","Nafisa Rahman","dm.de","Penaten Baby Pflege","৳4,120","Air-shipped"],
];
export default function ImportRequestTable(){return <div className="table-wrap"><table><thead><tr><th>Request</th><th>Customer</th><th>Source</th><th>German product</th><th>Quote</th><th>Status</th><th/></tr></thead><tbody>{requests.map(r=><tr key={r[0]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td><a className="source-link" href={`https://${r[2]}`} target="_blank" rel="noreferrer">{r[2]} ↗</a></td><td>{r[3]}</td><td><b>{r[4]}</b></td><td><span className="badge">{r[5]}</span></td><td><button className="text-button">Manage</button></td></tr>)}</tbody></table></div>}
