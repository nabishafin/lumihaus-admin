import { NavLink } from "react-router";

const links = [
  ["/", "Overview", "⌂"], ["/products", "Products", "◫"], ["/categories-brands", "Categories & Brands", "◇"],
  ["/orders", "Orders", "▤"], ["/customers", "Customers", "♙"], ["/payments-delivery", "Payments & Delivery", "৳"],
  ["/coupons-banners", "Coupons & Content", "%"], ["/reports-settings", "Reports & Settings", "⚙"],
];

export default function Sidebar() {
  return <aside className="sidebar"><div className="brand"><span className="brand-mark">L</span><div><strong>Lumihaus</strong><small>Admin panel</small></div></div><nav>{links.map(([to,label,icon]) => <NavLink key={to} to={to} end={to === "/"} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}><span>{icon}</span>{label}</NavLink>)}</nav><div className="sidebar-user"><span className="avatar">SA</span><div><strong>Shafin Ahmed</strong><small>Super Admin</small></div></div></aside>;
}
