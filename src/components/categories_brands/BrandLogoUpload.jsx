import React, { useState, useRef } from "react";
import { Upload, Plus, Trash2, ShieldCheck, Check, Globe, Edit3, X, Image as ImageIcon } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "../../redux/features/catalogApi";

export default function BrandLogoUpload() {
  const { brands: localBrands, addBrand, updateBrand, deleteBrand } = useAdminUI();
  const { data: apiBrandsData, isLoading: brandsLoading } = useGetBrandsQuery();

  const [createBrandApi] = useCreateBrandMutation();
  const [updateBrandApi] = useUpdateBrandMutation();
  const [deleteBrandApi] = useDeleteBrandMutation();

  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandOrigin, setNewBrandOrigin] = useState("Germany");
  const [newBrandDesc, setNewBrandDesc] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const displayedBrands =
    apiBrandsData?.data && Array.isArray(apiBrandsData.data)
      ? apiBrandsData.data
      : Array.isArray(apiBrandsData)
      ? apiBrandsData
      : localBrands || [];

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && editingBrand) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBrand((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const brandPayload = {
      name: newBrandName.trim(),
      origin: newBrandOrigin.trim() || "Germany",
      desc:
        newBrandDesc.trim() ||
        "100% authentic import directly from certified German pharmacies & dm.de.",
      logo: logoPreview || undefined,
      verified: true,
    };

    try {
      await createBrandApi(brandPayload).unwrap();
    } catch (err) {
      console.error("API create brand notice:", err);
    }

    addBrand(brandPayload);
    setNewBrandName("");
    setNewBrandOrigin("Germany");
    setNewBrandDesc("");
    setLogoPreview("");
    setShowAddForm(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.name.trim()) return;

    const payload = {
      name: editingBrand.name.trim(),
      origin: editingBrand.origin?.trim() || "Germany",
      desc:
        editingBrand.desc?.trim() ||
        "100% authentic import directly from certified German pharmacies & dm.de.",
      logo: editingBrand.logo || undefined,
      verified: editingBrand.verified !== undefined ? editingBrand.verified : true,
    };

    const targetId = editingBrand._id || editingBrand.id;

    try {
      await updateBrandApi({ id: targetId, ...payload }).unwrap();
    } catch (err) {
      console.error("API update brand notice:", err);
    }

    if (updateBrand) {
      updateBrand(targetId, payload);
    }
    setEditingBrand(null);
  };

  return (
    <div className="card space-y-4">
      <div className="section-head">
        <div>
          <h2>German Brand Partners</h2>
          <p>Curated drugstore brands sourced directly from Europe.</p>
        </div>
        <span className="text-xs font-bold text-[#b55871] bg-[#fdf2f4] px-2.5 py-1 rounded-full border border-[#f3d3dc]">
          {displayedBrands.length} Brands
        </span>
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedBrands.map((brand) => (
          <div
            key={brand._id || brand.id}
            className="flex flex-col justify-between p-3.5 border border-[#eceeea] rounded-xl bg-white hover:border-[#d96b86]/50 transition group hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-contain border border-[#f0f0f0] p-0.5 bg-[#fafafa]"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f9edf1] text-[#9c4b61] font-bold text-sm font-serif">
                    {brand.name ? brand.name.slice(0, 2).toUpperCase() : "BR"}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[#2b2427] truncate">{brand.name}</p>
                    <span className="text-[10px] uppercase font-bold text-[#b84e68] bg-[#fdf2f4] px-1.5 py-0.5 rounded border border-[#f3d3dc]">
                      {brand.origin || "Germany"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7a8179] line-clamp-2 mt-1 leading-relaxed">
                    {brand.desc || "100% authentic import directly from certified German pharmacies & dm.de."}
                  </p
                  >
                </div>
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setEditingBrand({
                      _id: brand._id || brand.id,
                      name: brand.name || "",
                      origin: brand.origin || "Germany",
                      desc:
                        brand.desc ||
                        "100% authentic import directly from certified German pharmacies & dm.de.",
                      logo: brand.logo || "",
                      verified: brand.verified ?? true,
                    })
                  }
                  className="p-1.5 text-[#7a8179] hover:text-[#d96b86] hover:bg-[#fff0f4] rounded-lg transition cursor-pointer"
                  title="Edit Brand"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Remove "${brand.name}" from active brands?`)) {
                      try {
                        await deleteBrandApi(brand._id || brand.id).unwrap();
                      } catch (err) {
                        console.error("API delete brand notice:", err);
                      }
                      deleteBrand(brand._id || brand.id);
                    }
                  }}
                  className="p-1.5 text-[#7a8179] hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Remove brand"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Brand Modal */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-[#ebdce2] animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
              <h3 className="text-base font-bold text-[#2b2427]">Edit German Brand</h3>
              <button
                type="button"
                className="p-1 text-[#8e958d] hover:text-[#2b2427] rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                onClick={() => setEditingBrand(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#60685f] uppercase tracking-wide mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. ISANA, Balea, Catrice"
                  className="w-full text-xs p-2.5 border border-[#dfe3dc] rounded-xl bg-white outline-none focus:border-[#d96b86] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#60685f] uppercase tracking-wide mb-1">
                  Source / Origin Badge (e.g. Germany)
                </label>
                <input
                  type="text"
                  value={editingBrand.origin || ""}
                  onChange={(e) => setEditingBrand({ ...editingBrand, origin: e.target.value })}
                  placeholder="Germany (dm.de / Rossmann)"
                  className="w-full text-xs p-2.5 border border-[#dfe3dc] rounded-xl bg-white outline-none focus:border-[#d96b86] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#60685f] uppercase tracking-wide mb-1">
                  Storefront Description (হোমপেজ কার্ডের বিবরণ)
                </label>
                <textarea
                  rows={3}
                  value={editingBrand.desc || ""}
                  onChange={(e) => setEditingBrand({ ...editingBrand, desc: e.target.value })}
                  placeholder="e.g. 100% authentic import directly from certified German pharmacies & dm.de."
                  className="w-full text-xs p-2.5 border border-[#dfe3dc] rounded-xl bg-white outline-none focus:border-[#d96b86] leading-relaxed"
                />
              </div>

              {/* Logo Upload in Edit */}
              <div>
                <label className="block text-[11px] font-bold text-[#60685f] uppercase tracking-wide mb-1">
                  Brand Logo
                </label>
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="cursor-pointer border border-dashed border-[#ccd4c7] rounded-xl p-3 text-center bg-[#fafafa] hover:border-[#d96b86] transition flex items-center justify-center gap-2 text-xs text-[#6e5f65]"
                >
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditLogoUpload}
                  />
                  {editingBrand.logo ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={editingBrand.logo}
                        alt="Preview"
                        className="h-7 w-7 object-contain rounded border border-[#eee]"
                      />
                      <span className="text-xs text-emerald-700 font-semibold">Logo loaded (click to change)</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={14} className="text-[#d96b86]" />
                      <span>Upload Brand Logo (PNG / SVG / JPG)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#f0f0f0]">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#dfe3dc] text-[#5c685b] hover:bg-neutral-50 transition cursor-pointer"
                onClick={() => setEditingBrand(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#b84e68] text-white hover:bg-[#a14057] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} /> Update Brand
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Brand Form */}
      {showAddForm ? (
        <form
          onSubmit={handleAddBrand}
          className="rounded-2xl border border-[#eedde3] bg-[#fffafc] p-5 space-y-3.5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#f3dce3]">
            <h4 className="text-xs font-bold text-[#2b2427] uppercase tracking-wider">
              Add New German Brand Partner
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#8e958d] hover:text-[#2b2427] cursor-pointer"
            >
              Cancel
            </button>
          </div>

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
                placeholder="e.g. ISANA, Balea, Penaten"
                className="w-full text-xs p-2.5 border border-[#dfe3dc] rounded-xl bg-white outline-none focus:border-[#d96b86]"
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
                className="w-full text-xs p-2.5 border border-[#dfe3dc] rounded-xl bg-white outline-none focus:border-[#d96b86]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#60685f] uppercase mb-1">
              Storefront Description (হোমপেজ কার্ডের বিবরণ)
            </label>
            <textarea
              rows={2}
              value={newBrandDesc}
              onChange={(e) => setNewBrandDesc(e.target.value)}
              placeholder="e.g. 100% authentic import directly from certified German pharmacies & dm.de."
              className="w-full text-xs p-2.5 border border-[#dfe3dc] rounded-xl bg-white outline-none focus:border-[#d96b86] leading-relaxed"
            />
          </div>

          {/* Logo Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border border-dashed border-[#ccd4c7] rounded-xl p-3 text-center bg-white hover:border-[#d96b86] transition flex items-center justify-center gap-2 text-xs text-[#6e5f65]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {logoPreview ? (
              <div className="flex items-center gap-2">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="h-7 w-7 object-contain rounded border border-[#eee]"
                />
                <span className="text-xs text-emerald-700 font-semibold">Logo loaded (click to change)</span>
              </div>
            ) : (
              <>
                <Upload size={14} className="text-[#d96b86]" />
                <span>Upload Brand Logo (Optional PNG / SVG)</span>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#dfe3dc] text-[#5c685b] hover:bg-neutral-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#b84e68] text-white hover:bg-[#a14057] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={13} /> Save Brand
            </button
            >
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[#ccd4c7] bg-white text-xs font-bold text-[#5c685b] hover:border-[#d96b86] hover:text-[#b55871] hover:bg-[#fff9fa] transition cursor-pointer"
        >
          <Plus size={15} /> + Add New Brand Asset
        </button>
      )}
    </div>
  );
}