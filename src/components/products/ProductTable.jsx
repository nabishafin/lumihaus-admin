import { Edit3, MoreHorizontal } from "lucide-react";
export const products=[
  {name:"Balea Beauty Expert Calming Serum",brand:"Balea",category:"Skin",weight:"30 ml",price:"৳1,850",euro:"€4.95",stock:48,color:"#e8d4dc"},
  {name:"Penaten Ultra Sensitive Pflegeöl",brand:"Penaten",category:"Baby",weight:"200 ml",price:"৳1,690",euro:"€4.45",stock:7,color:"#dbe8f5"},
  {name:"Catrice True Skin Foundation",brand:"Catrice",category:"Makeup",weight:"30 ml",price:"৳2,200",euro:"€6.95",stock:32,color:"#ead6ce"},
  {name:"Alverde Naturkosmetik Körperbutter",brand:"Alverde",category:"Body",weight:"200 g",price:"৳1,490",euro:"€3.75",stock:0,color:"#dce8d4"},
  {name:"ISANA Hydro Booster Augen Roll-on",brand:"Isana",category:"Skin",weight:"15 ml",price:"৳1,280",euro:"€3.29",stock:19,color:"#d6e8ea"},
];
export default function ProductTable({items=products,onEdit}) { return <div className="table-wrap"><table><thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Size</th><th>BDT price</th><th>Euro cost</th><th>Stock</th><th/></tr></thead><tbody>{items.map(item=><tr key={item.name}><td><div className="product-cell"><span className="product-thumb" style={{background:item.color}}>LH</span><strong>{item.name}</strong></div></td><td>{item.brand}</td><td>{item.category}</td><td>{item.weight}</td><td><b>{item.price}</b></td><td>{item.euro}</td><td><span className={`badge ${item.stock===0?"out-of-stock":item.stock<10?"low-stock":"active"}`}>{item.stock===0?"Out of stock":item.stock<10?`${item.stock} · Low`:`${item.stock} units`}</span></td><td><button className="icon-action" onClick={()=>onEdit?.(item)}><Edit3 size={14}/></button><button className="icon-action"><MoreHorizontal size={14}/></button></td></tr>)}</tbody></table></div>; }
