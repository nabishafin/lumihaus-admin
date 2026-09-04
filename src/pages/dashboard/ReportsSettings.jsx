import { useState } from "react";
import { useAdminUI } from "../../context/AdminUIContext";
import {
  Building2,
  FileText,
  BarChart3,
  ShieldAlert,
  Save,
  CheckCircle2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Share2,
  DollarSign,
  FileSpreadsheet,
  Download,
  Eye,
  Edit3,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ReportsSettings() {
  const {
    storeSettings,
    updateStoreSettings,
    policyPages,
    updatePolicyPage,
  } = useAdminUI();

  const [activeTab, setActiveTab] = useState("store-info"); // 'store-info', 'policies', 'reports', 'activity'
  
  // Local editable store state
  const [storeForm, setStoreForm] = useState(storeSettings);

  // Policy CMS state
  const [selectedPolicyKey, setSelectedPolicyKey] = useState("terms");
  const [policyForm, setPolicyForm] = useState({
    title: policyPages.terms?.title || "",
    content: policyPages.terms?.content || "",
  });
  const [policyPreviewMode, setPolicyPreviewMode] = useState(false);

  // Handle Policy Selection Switch
  const handleSelectPolicy = (key) => {
    setSelectedPolicyKey(key);
    setPolicyForm({
      title: policyPages[key]?.title || "",
      content: policyPages[key]?.content || "",
    });
    setPolicyPreviewMode(false);
  };

  // Save Store Settings
  const handleSaveStoreInfo = (e) => {
    e.preventDefault();
    updateStoreSettings(storeForm);
  };

  // Save Current Policy
  const handleSavePolicy = (e) => {
    e.preventDefault();
    updatePolicyPage(selectedPolicyKey, policyForm);
  };

  const POLICY_OPTIONS = [
    { key: "terms", label: "Terms & Conditions", icon: "⚖️" },
    { key: "privacy", label: "Privacy & Data Policy", icon: "🔒" },
    { key: "returnRefund", label: "Return & Refund Policy", icon: "🔄" },
    { key: "shippingDelivery", label: "Shipping & Delivery Policy", icon: "🚚" },
    { key: "authenticity", label: "100% German Authenticity Guarantee", icon: "🇩🇪" },
    { key: "aboutUs", label: "About Lumihaus Germany", icon: "✨" },
  ];

  return (
    <>
      <title>Lumihaus Admin · Store Information & Policy CMS</title>

      {/* Page Header */}
      <div className="page-heading">
        <div>
          <h2>Store Settings, Information & Legal CMS</h2>
          <p>Manage brand basics, customer contact channels, live header notice, and website legal policies.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="filter-chips" style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("store-info")}
          className={`filter-chip ${activeTab === "store-info" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <Building2 size={15} />
          <span>General Store Information</span>
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`filter-chip ${activeTab === "policies" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <FileText size={15} />
          <span>Legal & Policy Pages CMS</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`filter-chip ${activeTab === "reports" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <BarChart3 size={15} />
          <span>Business Reports & Export</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`filter-chip ${activeTab === "activity" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <ShieldAlert size={15} />
          <span>Admin Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: GENERAL STORE INFORMATION */}
      {activeTab === "store-info" && (
        <form onSubmit={handleSaveStoreInfo} className="card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="section-head" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <div>
              <h3>Brand Profile & Live Store Details</h3>
              <p>These values power customer-facing contact info, top announcement banner, and billing addresses.</p>
            </div>
            <button type="submit" className="button primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {/* Store Name */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                <Globe size={14} className="text-muted" /> Store Brand Name
              </label>
              <input
                type="text"
                className="input"
                value={storeForm.storeName}
                onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                required
              />
            </div>

            {/* Tagline */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                <Sparkles size={14} className="text-muted" /> Tagline / Slogan
              </label>
              <input
                type="text"
                className="input"
                value={storeForm.tagline}
                onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
              />
            </div>

            {/* Official Email */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                <Mail size={14} className="text-muted" /> Support & Business Email
              </label>
              <input
                type="email"
                className="input"
                value={storeForm.email}
                onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                required
              />
            </div>

            {/* Phone Hotline */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                <Phone size={14} className="text-muted" /> Customer Hotline (BD)
              </label>
              <input
                type="text"
                className="input"
                value={storeForm.phone}
                onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                💬 Official WhatsApp Order Hotline
              </label>
              <input
                type="text"
                className="input"
                value={storeForm.whatsapp}
                onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
              />
            </div>

            {/* Euro exchange rate */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                <DollarSign size={14} className="text-muted" /> Euro Exchange Rate (1 EUR = BDT)
              </label>
              <input
                type="number"
                className="input"
                value={storeForm.euroExchangeRate}
                onChange={(e) => setStoreForm({ ...storeForm, euroExchangeRate: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Announcement Bar */}
          <div style={{ background: "var(--surface-alt)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--primary)" }}>
              <Megaphone size={16} /> Top Header Announcement Banner Notice
            </label>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
              This text displays at the very top of the customer website header across all pages.
            </p>
            <input
              type="text"
              className="input"
              value={storeForm.announcementText}
              onChange={(e) => setStoreForm({ ...storeForm, announcementText: e.target.value })}
              placeholder="e.g. ⚡ 100% Authentic German Imports direct from dm.de & Rossmann • Free Delivery nationwide"
            />
          </div>

          {/* Addresses */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                <MapPin size={14} className="text-muted" /> Dhaka Office & Distribution Hub
              </label>
              <textarea
                rows={3}
                className="input"
                value={storeForm.officeAddressBd}
                onChange={(e) => setStoreForm({ ...storeForm, officeAddressBd: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                <MapPin size={14} className="text-muted" /> Frankfurt Sourcing Warehouse (Germany)
              </label>
              <textarea
                rows={3}
                className="input"
                value={storeForm.warehouseAddressDe}
                onChange={(e) => setStoreForm({ ...storeForm, warehouseAddressDe: e.target.value })}
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Share2 size={15} /> Social Media Handles
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Facebook Page URL</label>
                <input
                  type="url"
                  className="input"
                  value={storeForm.facebookUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, facebookUrl: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Instagram URL</label>
                <input
                  type="url"
                  className="input"
                  value={storeForm.instagramUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>TikTok Profile URL</label>
                <input
                  type="url"
                  className="input"
                  value={storeForm.tiktokUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, tiktokUrl: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>YouTube Channel URL</label>
                <input
                  type="url"
                  className="input"
                  value={storeForm.youtubeUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, youtubeUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Copyright text */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "6px", display: "block" }}>
              Website Footer Copyright Notice
            </label>
            <input
              type="text"
              className="input"
              value={storeForm.copyrightText}
              onChange={(e) => setStoreForm({ ...storeForm, copyrightText: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="button primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} />
              <span>Save & Publish Store Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: LEGAL & POLICY PAGES CMS */}
      {activeTab === "policies" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px" }}>
          {/* Policy Selector Sidebar */}
          <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", height: "fit-content" }}>
            <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
              Select Policy Page
            </h4>
            {POLICY_OPTIONS.map((item) => {
              const isActive = selectedPolicyKey === item.key;
              const policyData = policyPages[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelectPolicy(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: isActive ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: isActive ? "var(--primary-subtle, rgba(217, 107, 134, 0.1))" : "var(--surface)",
                    color: isActive ? "var(--primary)" : "inherit",
                    fontWeight: isActive ? "700" : "500",
                    fontSize: "12px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    {policyData?.lastUpdated || "Live"}
                  </small>
                </button>
              );
            })}
          </div>

          {/* CMS Editor & Live Preview Panel */}
          <form onSubmit={handleSavePolicy} className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="section-head" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase" }}>
                  Active CMS Document
                </span>
                <h3>{POLICY_OPTIONS.find((p) => p.key === selectedPolicyKey)?.label}</h3>
                <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
                  <Clock size={12} /> Last updated: {policyPages[selectedPolicyKey]?.lastUpdated || "Recently"}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setPolicyPreviewMode(!policyPreviewMode)}
                  className="button secondary"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {policyPreviewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                  <span>{policyPreviewMode ? "Edit Markdown" : "Live Preview"}</span>
                </button>

                <button type="submit" className="button primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Save size={15} />
                  <span>Publish Policy</span>
                </button>
              </div>
            </div>

            {/* Policy Title */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                Page Display Title
              </label>
              <input
                type="text"
                className="input"
                value={policyForm.title}
                onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                required
              />
            </div>

            {/* Policy Content Editor or Preview */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>
                  {policyPreviewMode ? "Customer View (Preview)" : "Policy Content (Supports Markdown & Headings)"}
                </label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {policyForm.content.split(/\s+/).filter(Boolean).length} words · {policyForm.content.length} characters
                </span>
              </div>

              {policyPreviewMode ? (
                <div
                  style={{
                    padding: "20px",
                    background: "var(--surface-alt)",
                    borderRadius: "10px",
                    border: "1px solid var(--border)",
                    minHeight: "340px",
                    whiteSpace: "pre-line",
                    lineHeight: "1.7",
                    fontSize: "13px",
                  }}
                >
                  {policyForm.content}
                </div>
              ) : (
                <textarea
                  rows={14}
                  className="input"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: "12px", lineHeight: "1.6" }}
                  value={policyForm.content}
                  onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                  placeholder="Enter policy content using markdown (### Headings, - Bullet points, etc.)..."
                  required
                />
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Changes are instantly updated in the database and visible to customers.
              </span>
              <button type="submit" className="button primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} />
                <span>Save & Publish Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: BUSINESS REPORTS & EXPORTS */}
      {activeTab === "reports" && (
        <div className="report-grid">
          {[
            ["Sales & Revenue Report", "Monthly revenue, COD vs bKash collections, and gross margin", "sales_report_2026.xlsx"],
            ["Inventory & Low Stock Alert", "German stock levels, reorder points for Balea & Catrice", "inventory_report_2026.xlsx"],
            ["Customer Growth & Retention", "Registered accounts, VIP buyers, repeat order frequencies", "customer_report_2026.xlsx"],
            ["Pre-Order Fulfillment Audit", "Frankfurt air cargo customs transit & delivery schedules", "preorder_transit_2026.xlsx"],
          ].map(([title, desc, filename]) => (
            <section className="card report-card" key={title}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>📊</span>
                <h3 style={{ margin: 0 }}>{title}</h3>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>{desc}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="button secondary"
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={() => alert(`Exporting ${filename}...`)}
                >
                  <FileSpreadsheet size={14} /> Excel (.xlsx)
                </button>
                <button
                  className="button secondary"
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={() => alert(`Generating PDF for ${title}...`)}
                >
                  <Download size={14} /> PDF
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* TAB 4: ADMIN ACTIVITY AUDIT */}
      {activeTab === "activity" && (
        <section className="card spaced">
          <div className="section-head">
            <div>
              <h3>Admin Audit Trail & System Log</h3>
              <p>Chronological security log of administrative actions, pricing edits, and order status updates.</p>
            </div>
          </div>
          <div className="timeline">
            {[
              ["Shafin Ahmed", "updated Terms & Conditions and Privacy Policy CMS", "Just now"],
              ["Shafin Ahmed", "updated Top Announcement Banner Text", "15 min ago"],
              ["Shafin Ahmed", "updated order #LH-2084 status to In-Transit", "32 min ago"],
              ["Nabila Islam", "added new German Skincare product 'Balea Niacinamide'", "1 hour ago"],
              ["Shafin Ahmed", "created coupon code 'EID25'", "2 hours ago"],
              ["System", "synced Euro exchange rate: 1 EUR = 135 BDT", "4 hours ago"],
            ].map((x, idx) => (
              <div className="timeline-row" key={idx}>
                <span className="timeline-dot" />
                <div>
                  <strong>{x[0]}</strong> {x[1]}
                  <small>{x[2]}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
