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
    title: "About Lumihaus Germany",
    slug: "about-us",
    category: "Brand Story",
    lastUpdated: "September 2026",
    content: `### The Lumihaus Story
Founded to bridge the gap between premium European drugstore skincare and beauty enthusiasts in Bangladesh, Lumihaus brings high-efficacy German formulas directly to your doorstep.

### Direct Air Import from Frankfurt
From dm-drogerie markt's iconic Balea Hyaluronic serums to dermatologist-tested Penaten baby care and Sebamed therapeutic formulas, every product in our inventory is sourced fresh from Germany. We bypass third-party middlemen through direct commercial air cargo from Frankfurt Airport to Dhaka Hazrat Shahjalal International Airport.

### Our 3 Core Guarantees
- **100% Authentic Products**: Direct retail receipts and verifiable European batch codes on every item.
- **Fresh Temperature-Controlled Stock**: Fast air freight ensures no oxidation or degradation of sensitive skincare actives.
- **Fair & Transparent Pricing**: Real-time Euro conversion with clear freight and delivery charges.`,
  },
  terms: {
    id: "terms",
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    category: "Legal",
    lastUpdated: "September 2026",
    content: `### 1. Introduction
Welcome to Lumihaus Bangladesh ("we", "our", "us"). By accessing our storefront or placing an order, you agree to comply with and be bound by the following terms and conditions.

### 2. Authentic German Sourcing & Stock
All products listed on Lumihaus are sourced directly from authorized retailers in Germany (including dm-drogerie markt, Rossmann, Douglas, and official brand outlets). We guarantee 100% genuine batch codes and sealed factory packaging.

### 3. Pricing and Payment
- All prices are displayed in Bangladeshi Taka (BDT).
- We accept manual bKash Send Money with TrxID verification and Cash on Delivery (COD).
- For Custom German Pre-Orders, a 50% advance via bKash is required before international procurement.

### 4. Order Acceptance & Cancellations
We reserve the right to cancel any order in the event of stock discrepancies in Germany or pricing errors. Orders may be canceled prior to dispatch from our Dhaka fulfillment center.`,
  },
  privacy: {
    id: "privacy",
    title: "Privacy & Data Protection Policy",
    slug: "privacy-policy",
    category: "Legal",
    lastUpdated: "September 2026",
    content: `### 1. Information We Collect
We collect personal information necessary to process and deliver your orders:
- Full Name and Delivery Address
- Phone Number and Email Address
- bKash Transaction IDs (TrxID) for payment verification

### 2. How We Use Your Data
- To verify, dispatch, and track your cosmetic parcels.
- To communicate order updates via SMS and WhatsApp.
- We never sell, rent, or trade your personal information with third-party marketing networks.

### 3. Payment Security
Lumihaus does not collect or store your bKash PIN or banking passwords. All transactions are securely handled through official bKash mobile banking channels.`,
  },
  returnRefund: {
    id: "returnRefund",
    title: "Return, Replacement & Refund Policy",
    slug: "return-refund-policy",
    category: "Customer Service",
    lastUpdated: "September 2026",
    content: `### 1. 48-Hour Return Window
If you receive a defective, damaged, or incorrect product, please contact our support team within 48 hours of delivery with clear parcel unboxing photos or video evidence.

### 2. Hygiene & Safety Exclusions
Due to hygiene and sanitary safety regulations for cosmetics and baby products, items that have been unsealed, opened, swatched, or used cannot be returned unless proven defective prior to arrival.

### 3. Refund Processing
Approved refunds are processed via bKash or Bank Transfer within 3 to 5 business days after our Dhaka quality control team inspects the returned parcel.`,
  },
  shippingDelivery: {
    id: "shippingDelivery",
    title: "Shipping & Delivery Policy",
    slug: "shipping-policy",
    category: "Logistics",
    lastUpdated: "September 2026",
    content: `### 1. Domestic Delivery Timeframes & Rates
- **Inside Dhaka**: 24 – 48 Hours via Pathao Express / Steadfast (Delivery Fee: ৳60).
- **Outside Dhaka (All Bangladesh)**: 48 – 72 Hours via courier (Delivery Fee: ৳120).
- **Free Shipping**: Nationwide Free Shipping applies automatically on all orders over ৳5,000.

### 2. German Pre-Order Shipments
Custom German Pre-Orders take approximately 10 to 18 business days for air freight customs clearance from Frankfurt Airport to Dhaka Airport.

### 3. Parcel Tracking
Once dispatched, customers receive an SMS with the courier tracking ID to follow live parcel status.`,
  },
  authenticity: {
    id: "authenticity",
    title: "100% German Authenticity Guarantee",
    slug: "authenticity-guarantee",
    category: "Trust & Safety",
    lastUpdated: "September 2026",
    content: `### Our Authenticity Promise
Every single bottle of Balea, Catrice, Sebamed, Penaten, and Isana at Lumihaus is sourced exclusively from official retail chains in Frankfurt and Berlin, Germany.

### Batch Code Verification
Every skincare and cosmetic box features a readable batch production code that can be verified online (CheckFresh / CheckCosmetic). We offer a 10x money-back guarantee if any product is proven non-authentic.

### Sealed Factory Freshness
All sensitive vitamin serums, creams, and ampoules are shipped via temperature-monitored air cargo to protect active ingredients from tropical heat.`,
  },
  faq: {
    id: "faq",
    title: "Frequently Asked Questions (FAQ)",
    slug: "faq",
    category: "Customer Service",
    lastUpdated: "September 2026",
    content: `### 1. Are all products 100% genuine and made in Germany?
Yes. Every product is purchased directly from certified German drugstores (dm-drogerie markt, Rossmann, Müller) and official European brand distributors.

### 2. How do I pay with bKash?
Select "bKash Send Money" at checkout, send the order total to our official bKash merchant number, and submit your 10-character Transaction ID (TrxID) in the payment box.

### 3. How does the German Pre-Order service work?
If a German skincare product is not in our ready Dhaka stock, you can request a custom air freight order by submitting the dm.de or rossmann.de link. Delivery takes 10–18 days after a 50% advance payment.

### 4. What is your return policy?
We offer replacements or refunds for damaged or incorrect items reported within 48 hours of delivery with an unboxing video.`,
  },
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
      if (!saved) return DEFAULT_POLICIES;
      const parsed = JSON.parse(saved);
      // Clean up any corrupted legacy entries
      const cleaned = { ...DEFAULT_POLICIES };
      Object.keys(DEFAULT_POLICIES).forEach((k) => {
        if (parsed[k] && typeof parsed[k] === "object") {
          let title = parsed[k].title || DEFAULT_POLICIES[k].title;
          // If title has corrupted bytes like â, ð, replace with clean default title
          if (/[âð\uFFFD]/.test(title)) {
            title = DEFAULT_POLICIES[k].title;
          }
          cleaned[k] = {
            ...DEFAULT_POLICIES[k],
            ...parsed[k],
            title,
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
