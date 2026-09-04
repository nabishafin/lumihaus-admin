import { useLocation } from "react-router";

const titles = { "/": "Overview", "/products": "Products", "/categories-brands": "Categories & Brands", "/orders": "Orders", "/customers": "Customers", "/payments-delivery": "Payments & Delivery", "/coupons-banners": "Coupons & Content", "/reports-settings": "Reports & Settings" };

export default function Header() {
  const { pathname } = useLocation();
  return <header className="header"><div><p className="eyebrow">Lumihaus Admin</p><h1>{titles[pathname] || "Dashboard"}</h1></div><div className="header-actions"><label className="search">⌕<input aria-label="Search" placeholder="Search anything..."/></label><button className="icon-button" aria-label="Notifications">♧<span className="notification-dot"/></button></div></header>;
}
