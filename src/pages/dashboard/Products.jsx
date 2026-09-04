import { useState } from "react";
import ProductTable from "../../components/products/ProductTable";
import AddProductForm from "../../components/products/AddProductForm";
import VariantManager from "../../components/products/VariantManager";
export default function Products(){const [adding,setAdding]=useState(false);return <><title>Lumihaus Admin · Products</title><div className="page-heading"><div><h2>Products</h2><p>Manage inventory, pricing and product variants.</p></div><button className="button" onClick={()=>setAdding(!adding)}>{adding?"Close form":"+ Add product"}</button></div>{adding&&<section className="card form-card"><h2>New product</h2><AddProductForm/><h3>Shades & variants</h3><VariantManager/></section>}<section className="card"><div className="toolbar"><input placeholder="Search products..."/><select><option>All categories</option><option>Makeup</option></select><select><option>All statuses</option><option>Low stock</option></select></div><ProductTable/></section></>}
