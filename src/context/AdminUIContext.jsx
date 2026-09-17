import { createContext, useContext, useEffect, useState } from "react";
import { useGetCategoriesQuery, useGetBrandsQuery } from "../redux/features/catalogApi";

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Skin", label: "Skincare", icon: "✨" },
  { id: "cat-2", name: "Body", label: "Body Care", icon: "🧴" },
  { id: "cat-3", name: "Makeup", label: "Makeup", icon: "💄" },
  { id: "cat-4", name: "Baby", label: "Baby & Kids", icon: "👶" },
  { id: "cat-5", name: "Hair", label: "Hair Care", icon: "🌿" },
];

const DEFAULT_BRANDS = [
  { id: "b-1", name: "Balea", origin: "Germany", desc: "dm-drogerie markt Germany" },
  { id: "b-2", name: "Catrice", origin: "Germany", desc: "European cosmetics & clean beauty" },
  { id: "b-3", name: "Penaten", origin: "Germany", desc: "German baby care since 1904" },
  { id: "b-4", name: "Alverde", origin: "Germany", desc: "Certified organic natural cosmetics" },
  { id: "b-5", name: "Isana", origin: "Germany", desc: "Personal care from Rossmann Germany" },
  { id: "b-6", name: "Nivea", origin: "Germany", desc: "Classic German skincare" },
  { id: "b-7", name: "Eucerin", origin: "Germany", desc: "Clinical dermatologist skincare" },
  { id: "b-8", name: "Sebamed", origin: "Germany", desc: "pH 5.5 medical skincare" },
];

const DEFAULT_STORE_SETTINGS = {
  storeName: "Lumihaus Germany",
  tagline: "100% Authentic German Skincare & European Luxury Cosmetics",
  email: "concierge@lumihaus.de",
  phone: "+880 1711-234567",
  whatsapp: "+880 1711-234567",
  officeAddressBd: "House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh",
  warehouseAddressDe: "Zeil 106, 60313 Frankfurt am Main, Germany",
  facebookUrl: "https://facebook.com/lumihaus.bd",
  instagramUrl: "https://instagram.com/lumihaus.bd",
  tiktokUrl: "https://tiktok.com/@lumihaus",
  youtubeUrl: "https://youtube.com/@lumihaus",
  announcementText: "⚡ 100% Authentic German Imports direct from dm.de & Rossmann • Free Delivery nationwide on orders over ৳5,000",
  freeShippingThreshold: 5000,
  euroExchangeRate: 135,
  // Empty until loaded from /api/settings — never seed a placeholder receiving
  // number, or the console could show a number customers are not actually paying.
  bkashNumber: "",
  bkashType: "Personal (Send Money)",
  vatPercentage: 0,
  copyrightText: "© 2026 LUMIHAUS BANGLADESH. 100% AUTHENTIC GERMAN IMPORTS. ALL RIGHTS RESERVED.",
};

const DEFAULT_POLICIES = {
  aboutUs: {
    id: "aboutUs",
    title: "About Us",
    slug: "about-us",
    category: "Brand Story",
    lastUpdated: "September 2026",
    content: `Welcome to Lumihaus. We provide 100% authentic skincare and beauty products directly sourced from Germany.

Every product is purchased from official German retailers and shipped via air freight to guarantee genuine quality and freshness for customers in Bangladesh.`,
  },
  terms: {
    id: "terms",
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    category: "Legal",
    lastUpdated: "September 2026",
    content: `1. Orders are confirmed via phone call or bKash payment verification.
2. All prices are listed in Bangladeshi Taka (BDT).
3. We guarantee 100% genuine German products in original sealed packaging.
4. Orders can be cancelled before dispatch from our Dhaka office.`,
  },
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    slug: "privacy-policy",
    category: "Legal",
    lastUpdated: "September 2026",
    content: `We collect only essential details (name, delivery address, phone number) required to process and deliver your order.

Your personal information is kept strictly confidential and will never be shared or sold to third parties.`,
  },
  returnRefund: {
    id: "returnRefund",
    title: "Return & Refund Policy",
    slug: "return-refund-policy",
    category: "Customer Service",
    lastUpdated: "September 2026",
    content: `1. Any damaged or incorrect item must be reported within 48 hours of delivery with parcel photos.
2. Opened or used skincare items cannot be returned due to hygiene safety.
3. Approved refunds are sent via bKash within 3 to 5 business days.`,
  },
  shippingDelivery: {
    id: "shippingDelivery",
    title: "Shipping & Delivery Policy",
    slug: "shipping-policy",
    category: "Logistics",
    lastUpdated: "September 2026",
    content: `- Inside Dhaka: Delivery within 24 to 48 hours (Delivery Fee: ৳60).
- Outside Dhaka: Delivery within 2 to 3 days (Delivery Fee: ৳120).
- Free Shipping: Free delivery applies automatically on orders over ৳5,000.`,
  },
  authenticity: {
    id: "authenticity",
    title: "Authenticity Guarantee",
    slug: "authenticity-guarantee",
    category: "Trust & Safety",
    lastUpdated: "September 2026",
    content: `All products at Lumihaus are 100% genuine and sourced directly from official retailers in Germany (dm-drogerie markt, Rossmann).

Every product comes with original verifiable batch codes to guarantee authenticity.`,
  },
  faq: {
    id: "faq",
    title: "Frequently Asked Questions (FAQ)",
    slug: "faq",
    category: "Customer Service",
    lastUpdated: "September 2026",
    content: `Find answers to common questions about products, ordering, and delivery.`,
  },
};

const AdminUIContext = createContext(null);

export function AdminUIProvider({ children }) {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  // Live queries from backend catalog API
  const { data: apiCategoriesRes } = useGetCategoriesQuery();
  const { data: apiBrandsRes } = useGetBrandsQuery();

  // Dynamic Categories state
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_categories");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // Dynamic Brands state
  const [brands, setBrands] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_brands");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BRANDS;
    } catch {
      return DEFAULT_BRANDS;
    }
  });

  // Live sync categories from backend
  useEffect(() => {
    const list = apiCategoriesRes?.data || (Array.isArray(apiCategoriesRes) ? apiCategoriesRes : null);
    if (Array.isArray(list) && list.length > 0) {
      setCategories(list);
    }
  }, [apiCategoriesRes]);

  // Live sync brands from backend
  useEffect(() => {
    const list = apiBrandsRes?.data || (Array.isArray(apiBrandsRes) ? apiBrandsRes : null);
    if (Array.isArray(list) && list.length > 0) {
      setBrands(list);
    }
  }, [apiBrandsRes]);

  useEffect(() => {
    const saved = localStorage.getItem("lumihaus-theme");
    const enabled = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(enabled);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("lumihaus-theme", dark ? "dark" : "light");
  }, [dark]);

  // Persist categories & brands
  useEffect(() => {
    try {
      localStorage.setItem("lumihaus_admin_categories", JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem("lumihaus_admin_brands", JSON.stringify(brands));
    } catch {}
  }, [brands]);

  function notify(message, tone = "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2800);
  }

  // Category Operations
  const addCategory = (categoryData) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      count: 0,
      icon: categoryData.icon || "◇",
      ...categoryData,
    };
    setCategories((prev) => [newCat, ...prev]);
    notify(`Category "${newCat.name}" added successfully`);
  };

  const updateCategory = (id, updatedData) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedData } : cat))
    );
    notify("Category updated successfully");
  };

  const deleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    notify(`Category "${cat?.name || ""}" deleted`, "warning");
  };

  // Brand Operations
  const addBrand = (brandData) => {
    const newBrand = {
      id: `b-${Date.now()}`,
      verified: true,
      ...brandData,
    };
    setBrands((prev) => [newBrand, ...prev]);
    notify(`Brand "${newBrand.name}" added successfully`);
  };

  const deleteBrand = (id) => {
    const brand = brands.find((b) => b.id === id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
    notify(`Brand "${brand?.name || ""}" removed`, "warning");
  };

  // Store Information & Branding Settings
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_store_settings");
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // CMS Legal & Policy Pages
  const [policyPages, setPolicyPages] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_policies");
      if (!saved) return DEFAULT_POLICIES;
      const parsed = JSON.parse(saved);
      // Clean up any corrupted legacy entries or overly bloated legacy texts
      const cleaned = { ...DEFAULT_POLICIES };
      Object.keys(DEFAULT_POLICIES).forEach((k) => {
        if (parsed[k] && typeof parsed[k] === "object") {
          let title = parsed[k].title || DEFAULT_POLICIES[k].title;
          let content = parsed[k].content || DEFAULT_POLICIES[k].content;
          // If title has corrupted bytes, replace with clean default title
          if (/[âð\uFFFD]/.test(title)) {
            title = DEFAULT_POLICIES[k].title;
          }
          // If content has legacy long-winded text, replace with clean concise default
          if (
            content.includes("Founded to bridge the gap") ||
            content.includes("dm-drogerie markt's iconic Balea") ||
            content.includes("Hygiene & Safety Exclusions") ||
            content.includes("Pathao Express / Steadfast") ||
            content.includes("CheckFresh / CheckCosmetic")
          ) {
            content = DEFAULT_POLICIES[k].content;
            title = DEFAULT_POLICIES[k].title;
          }
          cleaned[k] = {
            ...DEFAULT_POLICIES[k],
            ...parsed[k],
            title,
            content,
          };
        }
      });
      return cleaned;
    } catch {
      return DEFAULT_POLICIES;
    }
  });

  // Persist Store Settings & Policies
  useEffect(() => {
    try {
      localStorage.setItem("lumihaus_admin_store_settings", JSON.stringify(storeSettings));
    } catch {}
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem("lumihaus_admin_policies", JSON.stringify(policyPages));
    } catch {}
  }, [policyPages]);

  const updateStoreSettings = (newSettings) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    notify("Store details & basic information updated successfully!");
  };

  const updatePolicyPage = (policyKey, data) => {
    setPolicyPages((prev) => ({
      ...prev,
      [policyKey]: {
        ...prev[policyKey],
        ...data,
        lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      },
    }));
    notify(`Page "${data.title || policyPages[policyKey]?.title}" published successfully!`);
  };

  const resetPolicyPage = (policyKey) => {
    if (DEFAULT_POLICIES[policyKey]) {
      setPolicyPages((prev) => ({
        ...prev,
        [policyKey]: {
          ...DEFAULT_POLICIES[policyKey],
          lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        },
      }));
      notify(`Reset "${DEFAULT_POLICIES[policyKey].title}" to default template`);
    }
  };

  return (
    <AdminUIContext.Provider
      value={{
        dark,
        setDark,
        collapsed,
        setCollapsed,
        toast,
        notify,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        brands,
        addBrand,
        deleteBrand,
        storeSettings,
        updateStoreSettings,
        policyPages,
        updatePolicyPage,
        resetPolicyPage,
      }}
    >
      {children}
      {toast && <div className={`toast ${toast.tone}`}>{toast.message}</div>}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  const value = useContext(AdminUIContext);
  if (!value) throw new Error("useAdminUI must be used inside AdminUIProvider");
  return value;
}
