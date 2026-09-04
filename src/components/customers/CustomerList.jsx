export const customers=[
  {initials:"NJ",name:"Nusrat Jahan",phone:"01712 884 921",email:"nusrat@email.com",orders:18,spent:"৳42,800",address:"Dhanmondi, Dhaka"},
  {initials:"SR",name:"Sadia Rahman",phone:"01304 678 318",email:"sadia@email.com",orders:12,spent:"৳28,350",address:"Zindabazar, Sylhet"},
  {initials:"TH",name:"Tahmid Hasan",phone:"01611 384 209",email:"tahmid@email.com",orders:9,spent:"৳19,200",address:"Uttara, Dhaka"},
  {initials:"FA",name:"Farzana Akter",phone:"01918 220 451",email:"farzana@email.com",orders:7,spent:"৳16,780",address:"Kotwali, Chattogram"},
];
export default function CustomerList({items=customers,onSelect}){return <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Mobile</th><th>Default address</th><th>Orders</th><th>Total spent</th><th/></tr></thead><tbody>{items.map(c=><tr key={c.phone}><td><div className="customer-cell"><span className="avatar">{c.initials}</span><div><strong>{c.name}</strong><small>{c.email}</small></div></div></td><td><b>{c.phone}</b></td><td>{c.address}</td><td>{c.orders}</td><td>{c.spent}</td><td><button className="text-button" onClick={()=>onSelect?.(c)}>View profile</button></td></tr>)}</tbody></table></div>}
