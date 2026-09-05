import { createContext, useContext, useEffect, useState } from "react";

const DEFAULT_CATEGORIES = [];

const DEFAULT_BRANDS = [];

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
  vatPercentage: 0,
  copyrightText: "© 2026 LUMIHAUS BANGLADESH. 100% AUTHENTIC GERMAN IMPORTS. ALL RIGHTS RESERVED.",
};

const DEFAULT_POLICIES = {
  terms: {
    id: "terms",
    title: "Terms & Conditions",
    lastUpdated: "September 2026",
    content: `### 1. Introduction\nWelcome to Lumihaus Bangladesh ("we", "our", "us"). By accessing or purchasing from our platform, you agree to comply with and be bound by the following terms and conditions.\n\n### 2. Authentic German Sourcing & Stock\nAll products listed on Lumihaus are sourced directly from authorized retailers and distributors in Germany (including dm-drogerie markt, Rossmann, Douglas, and brand official stores). We guarantee 100% genuine batch codes and sealed factory packaging.\n\n### 3. Pricing and Payment\n- All prices are displayed in Bangladeshi Taka (BDT).\n- We accept manual bKash Send Money with TrxID verification and Cash on Delivery (COD).\n- For Custom German Pre-Orders, a 50% advance via bKash is required before international procurement.\n\n### 4. Order Acceptance & Cancellations\nWe reserve the right to refuse or cancel any order in the event of product unavailability, stock discrepancies from Germany, or incorrect pricing listings. Orders may only be canceled prior to dispatch from our Dhaka hub.`
  },
  privacy: {
    id: "privacy",
    title: "Privacy & Data Protection Policy",
    lastUpdated: "September 2026",
    content: `### 1. Information We Collect\nWe collect personal information necessary to fulfill your orders, including your name, delivery address, phone number, email address, and bKash transaction IDs.\n\n### 2. How We Use Your Data\n- To process, verify, and dispatch your cosmetic orders.\n- To communicate shipping tracking information and order confirmation via SMS/WhatsApp.\n- We do NOT sell, rent, or trade your personal information with any third-party marketing agencies.\n\n### 3. Payment Data Security\nLumihaus does not store your bKash PIN, banking passwords, or card details. All transactions are handled securely through verified bKash merchant/personal channels.`
  },
  returnRefund: {
    id: "returnRefund",
    title: "Return, Replacement & Refund Policy",
    lastUpdated: "September 2026",
    content: `### 1. 48-Hour Return Window\nIf you receive a defective, damaged, or incorrect item, please notify our support team within 48 hours of delivery with clear parcel unboxing photos/videos.\n\n### 2. Hygiene & Safety Exclusions\nDue to the hygiene nature of skincare and cosmetic products, items that have been unsealed, opened, swatched, or used CANNOT be returned unless proven damaged prior to delivery.\n\n### 3. Refund Processing\nApproved refunds are processed via bKash or Bank Transfer within 3 to 5 business days after our Dhaka quality control team inspects the returned parcel.`
  },
  shippingDelivery: {
    id: "shippingDelivery",
    title: "Shipping & Delivery Policy",
    lastUpdated: "September 2026",
    content: `### 1. Domestic Delivery Timeframes\n- **Inside Dhaka**: 24 – 48 Hours via Pathao Express / Steadfast. Delivery Fee: ৳60.\n- **Outside Dhaka (All Bangladesh)**: 48 – 72 Hours via courier. Delivery Fee: ৳120.\n- **Free Shipping**: Nationwide Free Shipping applies automatically on all orders over ৳5,000.\n\n### 2. German Pre-Order Shipments\nCustom German Pre-Orders take approximately 10 to 18 business days for air freight customs clearance from Frankfurt Airport to Dhaka Hazrat Shahjalal International Airport.`
  },
  authenticity: {
    id: "authenticity",
    title: "100% German Authenticity Guarantee",
    lastUpdated: "September 2026",
    content: `### Our Authenticity Promise\nEvery single bottle of Balea, Catrice, Sebamed, Penaten, and Isana at Lumihaus is sourced exclusively from official retail chains in Frankfurt and Berlin, Germany.\n\n### Batch Code Verification\nEvery skincare & cosmetic box features a readable batch production code that can be verified online (CheckFresh / CheckCosmetic). We offer a 10x money-back guarantee if any product is proven non-authentic.`
  },
  aboutUs: {
    id: "aboutUs",
    title: "About Lumihaus Germany",
    lastUpdated: "September 2026",
    content: `### The Lumihaus Story\nFounded to bridge the gap between premium European drugstore skincare and beauty enthusiasts in Bangladesh, Lumihaus brings high-efficacy German formulas directly to your doorstep.\n\nFrom dm-drogerie markt's iconic Balea Hyaluronic serums to dermatologist-tested Penaten baby lotions, we ensure transparent pricing, direct air shipment, and reliable customer service.`
  }
};

const AdminUIContext = createContext(null);

export function AdminUIProvider({ children }) {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic Categories state
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_categories");
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // Dynamic Brands state
  const [brands, setBrands] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_admin_brands");
      return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
    } catch {
      return DEFAULT_BRANDS;
    }
  });

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
      return saved ? JSON.parse(saved) : DEFAULT_POLICIES;
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
    notify(`Policy "${data.title || policyPages[policyKey]?.title}" published successfully!`);
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
