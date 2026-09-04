import { useState, useRef } from "react";
import { Upload, Plus, Trash2, ShieldCheck, Check, Globe } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function BrandLogoUpload() {
  const { brands, addBrand, deleteBrand } = useAdminUI();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandOrigin, setNewBrandOrigin] = useState("Germany (dm.de)");
  const [logoPreview, setLogoPreview] = useState("");
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    addBrand({
      name: newBrandName.trim(),
      origin: newBrandOrigin.trim() || "Germany",
      logo: logoPreview || "",
    });

    setNewBrandName("");
    setLogoPreview("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Brand List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex items-center justify-between p-3 border border-[#eceeea] rounded-xl bg-white hover:border-[#d96b86]/40 transition group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f9edf1] text-[#9c4b61] font-bold text-xs font-serif">
                {brand.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2b2427] truncate">{brand.name}</p>
                <p className="text-[10px] text-[#8e958d] flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-600" />
                  {brand.origin || "Germany"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove "${brand.name}" from active brands?`)) {
                  deleteBrand(brand.id);
                }
              }}
              className="icon-action text-[#7a8179] hover:text-red-600 opacity-80 group-hover:opacity-100"
              title="Remove brand"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Brand Accordion / Form */}
      {showAddForm ? (
        <form
          onSubmit={handleAddBrand}
          className="rounded-xl border border-[#eedde3] bg-[#fffafc] p-4 space-y-3"
        >
          <h4 className="text-xs font-bold text-[#2b2427]">Add New German Brand</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#60685f] uppercase mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="e.g. Eucerin, Douglas, Balea"
                className="w-full text-xs p-2 border border-[#dfe3dc] rounded-lg bg-white outline-none focus:border-[#d96b86]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#60685f] uppercase mb-1">
                Source / Origin
              </label>
              <input
                type="text"
                value={newBrandOrigin}
                onChange={(e) => setNewBrandOrigin(e.target.value)}
                placeholder="Germany (dm.de / Rossmann)"
                className="w-full text-xs p-2 border border-[#dfe3dc] rounded-lg bg-white outline-none focus:border-[#d96b86]"
              />
            </div>
          </div>

          {/* Logo Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border border-dashed border-[#ccd4c7] rounded-lg p-3 text-center bg-white hover:border-[#d96b86] transition flex items-center justify-center gap-2 text-xs text-[#6e5f65]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Upload size={14} className="text-[#d96b86]" />
            <span>{logoPreview ? "Brand Logo Selected (Click to change)" : "Upload Brand Logo PNG / SVG (Optional)"}</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="button secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="button text-xs">
              <Check size={13} /> Save Brand
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[#ccd4c7] bg-white text-xs font-bold text-[#5c685b] hover:border-[#d96b86] hover:text-[#b55871] hover:bg-[#fff9fa] transition"
        >
          <Plus size={14} /> + Add New Brand Asset
        </button>
      )}
    </div>
  );
}
