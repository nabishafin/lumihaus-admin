import {
  Award,
  BookOpen,
  Boxes,
  Camera,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Megaphone,
  PackageSearch,
  Receipt,
  RefreshCw,
  Scale,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users2,
  WalletCards,
} from "lucide-react";

// Sidebar sections, top to bottom. Each link is [path, label, Icon].
export const navGroups = [
  {
    title: "Dashboard",
    links: [["/", "Overview", LayoutDashboard]],
  },
  {
    title: "Sales",
    links: [
      ["/orders", "Orders & bKash", ClipboardList],
      ["/payments-delivery", "Payments & Delivery", WalletCards],
      ["/pre-orders", "Import Requests", PackageSearch],
      ["/expenses", "Expenses & Costs", Receipt],
    ],
  },
  {
    title: "Catalog",
    links: [
      ["/products", "German Products", ShoppingBag],
      ["/bundles", "Skincare Bundles", Sparkles],
      ["/categories-brands", "Categories & Brands", Boxes],
      ["/german-ritual", "German Ritual Feed", Camera],
    ],
  },
  {
    title: "Customers",
    links: [
      ["/users", "Users & Admins", Users2],
      ["/subscribers", "Subscribers", Mail],
    ],
  },
];

export const storePageLinks = [
  ["/pages/about-us", "About Us", BookOpen],
  ["/pages/terms", "Terms & Conditions", Scale],
  ["/pages/privacy", "Privacy Policy", ShieldCheck],
  ["/pages/refund", "Return & Refund", RefreshCw],
  ["/pages/shipping", "Shipping & Delivery", Truck],
  ["/pages/authenticity", "Authenticity Guarantee", Award],
  ["/pages/faq", "FAQ", HelpCircle],
  ["/banners", "Campaign Banner", Megaphone],
];

export const systemLinks = [["/settings", "Settings", Settings2]];

// Section + page label for the top bar breadcrumb.
export function findNavTrail(pathname) {
  for (const group of navGroups) {
    const hit = group.links.find(([to]) => (to === "/" ? pathname === "/" : pathname.startsWith(to)));
    if (hit) return { section: group.title, page: hit[1] };
  }
  const page = storePageLinks.find(([to]) => pathname.startsWith(to));
  if (page) return { section: "Storefront", page: page[1] };
  if (pathname.startsWith("/settings")) return { section: "System", page: "Settings" };
  return { section: "Dashboard", page: "Overview" };
}
