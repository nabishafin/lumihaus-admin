import { Calculator, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function FreightCalculator(){
  const [weight,setWeight]=useState(500),[euro,setEuro]=useState(12.95),[rate,setRate]=useState(132),[cargo,setCargo]=useState(1.35),[margin,setMargin]=useState(25); const {notify}=useAdminUI();
  const quote=useMemo(()=>Math.ceil(((euro*rate)+(weight*cargo))*(1+margin/100)/10)*10,[weight,euro,rate,cargo,margin]);
  return <section className="card calculator-card"><div className="section-head"><div><span className="section-icon"><Calculator size={18}/></span><h2>Air freight quote</h2><p>Germany → Bangladesh landed price</p></div></div><div className="calculator-grid"><label>Product weight (g)<input type="number" value={weight} onChange={e=>setWeight(+e.target.value)}/></label><label>Source price (€)<input type="number" step=".01" value={euro} onChange={e=>setEuro(+e.target.value)}/></label><label>EUR exchange rate<input type="number" value={rate} onChange={e=>setRate(+e.target.value)}/></label><label>Air cargo / gram<input type="number" step=".05" value={cargo} onChange={e=>setCargo(+e.target.value)}/></label><label>Margin (%)<input type="number" value={margin} onChange={e=>setMargin(+e.target.value)}/></label></div><div className="quote-result"><span>Suggested client quote</span><strong>৳{quote.toLocaleString()}</strong><small>Includes product, freight & {margin}% margin</small></div><button className="button full-button" onClick={()=>notify(`৳${quote.toLocaleString()} quote sent to customer`)}><Send size={15}/> Send price quote</button></section>
}
