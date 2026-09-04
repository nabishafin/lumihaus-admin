import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import OrderTable, { seedOrders } from "../../components/orders/OrderTable";
import OrderStatusModal from "../../components/orders/OrderStatusModal";
import { useAdminUI } from "../../context/AdminUIContext";

export default function Orders(){
  const [orders,setOrders]=useState(seedOrders); const [selected,setSelected]=useState(null); const [query,setQuery]=useState(""); const [filter,setFilter]=useState("All"); const {notify}=useAdminUI();
  const visible=useMemo(()=>orders.filter(o=>(filter==="All"||filter==="bKash pending"&&o.payment==="Pending"||o.status===filter)&&`${o.id} ${o.name} ${o.phone} ${o.trx}`.toLowerCase().includes(query.toLowerCase())),[orders,query,filter]);
  function verify(id){setOrders(rows=>rows.map(o=>o.id===id?{...o,payment:"Verified",status:"Confirmed"}:o));notify(`${id} TrxID verified — order confirmed`);}
  function save(form){const status=form.get("status");setOrders(rows=>rows.map(o=>o.id===selected.id?{...o,status}:o));setSelected(null);notify("Order pipeline updated successfully");}
  return <><title>LumiHaus Admin · Orders & bKash</title><div className="page-heading"><div><span className="page-kicker">CORE OPERATIONS</span><h2>Orders & bKash verification</h2><p>Verify customer payments and move orders through fulfilment.</p></div><button className="button secondary"><Download size={15}/> Export orders</button></div><div className="status-tabs premium-tabs">{["All","bKash pending","Placed","Confirmed","Processing","Shipped","Delivered","Cancelled"].map(x=><button onClick={()=>setFilter(x)} className={filter===x?"active":""} key={x}>{x}{x==="bKash pending"&&<b>{orders.filter(o=>o.payment==="Pending").length}</b>}</button>)}</div><section className="card"><div className="toolbar"><label className="table-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order, phone or TrxID..."/></label><span className="result-count">{visible.length} orders found</span></div><OrderTable orders={visible} onVerify={verify} onSelect={setSelected}/></section><OrderStatusModal order={selected} onClose={()=>setSelected(null)} onSave={save}/></>;
}
