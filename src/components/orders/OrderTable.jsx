import { CheckCircle2, Eye, Printer } from "lucide-react";

export const seedOrders = [
  {id:"#LH-2084",name:"Nusrat Jahan",phone:"01712 884 921",area:"Inside Dhaka",address:"Dhanmondi 12/A, Dhaka",sender:"01844 291 870",trx:"BKG7H2P9KL",total:"৳3,450",payment:"Pending",status:"Placed"},
  {id:"#LH-2080",name:"Farzana Akter",phone:"01918 220 451",area:"Outside Dhaka",address:"Kotwali, Chattogram",sender:"01918 220 451",trx:"BKG5DP42QX",total:"৳6,780",payment:"Pending",status:"Placed"},
  {id:"#LH-2078",name:"Mahmud Hasan",phone:"01611 384 209",area:"Inside Dhaka",address:"Uttara Sector 7, Dhaka",sender:"01791 004 822",trx:"BKG1KL89TS",total:"৳2,150",payment:"Verified",status:"Processing"},
  {id:"#LH-2074",name:"Sadia Rahman",phone:"01304 678 318",area:"Outside Dhaka",address:"Zindabazar, Sylhet",sender:"01304 678 318",trx:"BKG9XA81MN",total:"৳5,200",payment:"Verified",status:"Shipped"},
];

export default function OrderTable({orders,onVerify,onSelect}){
  return <div className="table-wrap"><table className="orders-table"><thead><tr><th>Order & customer</th><th>Delivery</th><th>bKash sender</th><th>Transaction ID</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><b>{order.id}</b><div>{order.name}</div><small>{order.phone}</small></td><td><b>{order.area}</b><small>{order.address}</small></td><td><span className="sensitive-value">{order.sender}</span></td><td><span className="trx-code">{order.trx}</span></td><td><b>{order.total}</b></td><td><span className={`badge status-${order.status.toLowerCase()}`}>{order.status}</span><small>{order.payment} payment</small></td><td><div className="row-actions">{order.payment==="Pending"?<button className="verify-button" onClick={()=>onVerify(order.id)}><CheckCircle2 size={14}/>Verify & confirm</button>:<button className="icon-action" onClick={()=>onSelect(order)} title="Order details"><Eye size={15}/></button>}<button className="icon-action" onClick={()=>window.print()} title="Print invoice"><Printer size={15}/></button></div></td></tr>)}</tbody></table></div>
}
