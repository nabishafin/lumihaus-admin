import React, { useState, useRef } from "react";
import { Upload, Plus, Trash2, ShieldCheck, Check, Globe, Edit3, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";
import { useAdminUI } from "../../context/AdminUIContext";
import {
  CARD, SMALL_BUTTON, LIST, ROW, TILE, TITLE, MUTED, ICON_BUTTON, ICON_BUTTON_DANGER,
  FIELD_LABEL, FIELD_INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON,
} from "./ui";
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

    const brandName = newBrandName.trim();
    const brandPayload = {
      name: brandName,
      origin: newBrandOrigin.trim() || "Germany",
      desc:
        newBrandDesc.trim() ||
        "100% authentic import directly from certified German pharmacies & dm.de.",
      logo: logoPreview || undefined,
      verified: true,
    };

    const toastId = toast.loading(`Adding brand "${brandName}"...`);

    try {
      await createBrandApi(brandPayload).unwrap();
    } catch (err) {
      // Keep the form filled in; a local-only brand would never reach the storefront.
      toast.error(err?.data?.message || `Could not add "${brandName}". Nothing was saved.`, { id: toastId, duration: 6000 });
      return;
    }

    addBrand(brandPayload, true);
    setNewBrandName("");
    setNewBrandOrigin("Germany");
    setNewBrandDesc("");
    setLogoPreview("");
    setShowAddForm(false);
    toast.success(`Brand "${brandName}" added successfully!`, { id: toastId });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.name.trim()) return;

    const brandName = editingBrand.name.trim();
    const payload = {
      name: brandName,
      origin: editingBrand.origin?.trim() || "Germany",
      desc:
        editingBrand.desc?.trim() ||
        "100% authentic import directly from certified German pharmacies & dm.de.",
      logo: editingBrand.logo || undefined,
      verified: editingBrand.verified !== undefined ? editingBrand.verified : true,
    };

    const targetId = editingBrand._id || editingBrand.id;
    const toastId = toast.loading(`Updating brand "${brandName}"...`);

    try {
      await updateBrandApi({ id: targetId, ...payload }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || `Could not update "${brandName}". Nothing was saved.`, { id: toastId, duration: 6000 });
      return;
    }

    if (updateBrand) {
      updateBrand(targetId, payload, true);
    }
    setEditingBrand(null);
    toast.success(`Brand "${brandName}" updated successfully!`, { id: toastId });
  };


  const DEFAULT_DESC = "100% authentic import directly from certified German pharmacies & dm.de.";

  const logoPicker = (inputRef, logo, onChange) => (
    <div
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer border border-dashed border-[#DCD6CB] dark:border-white/15 rounded-lg px-3 py-2.5 bg-[#FAF8F4] dark:bg-white/5 hover:border-[#8FAF9A] transition flex items-center justify-center gap-2 text-xs text-[#2E4235]/70 dark:text-[#D2DDD6]/70"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      {logo ? (
        <div className="flex items-center gap-2">
          <img src={logo} alt="Preview" className="h-7 w-7 object-contain rounded border border-[#DCD6CB] dark:border-white/10 bg-white" />
          <span>Logo added · click to change</span>
        </div>
      ) : (
        <>
          <Upload size={14} />
          <span>Upload logo (PNG, SVG or JPG, optional)</span>
        </>
      )}
    </div>
  );

  return (
    <section className={CARD}>
      <div className="section-head">
        <div>
          <h2>Brand partners</h2>
          <p>
            {displayedBrands.length} {displayedBrands.length === 1 ? "brand" : "brands"} · sourced from Germany
          </p>
        </div>
        {!showAddForm && (
          <button type="button" className={SMALL_BUTTON} onClick={() => setShowAddForm(true)}>
            <Plus size={14} /> Add brand
          </button>
        )}
      </div>

      {/* Add brand form */}
      {showAddForm && (
        <form
          onSubmit={handleAddBrand}
          className="mb-4 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#FAF8F4] dark:bg-white/[0.03] p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-[#141f17] dark:text-white">New brand</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={FIELD_LABEL}>Brand name *</label>
              <input
                type="text"
                required
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="e.g. ISANA, Balea, Penaten"
                className={FIELD_INPUT}
              />
            </div>
            <div>
              <label className={FIELD_LABEL}>Origin</label>
              <input
                type="text"
                value={newBrandOrigin}
                onChange={(e) => setNewBrandOrigin(e.target.value)}
                placeholder="Germany (dm.de / Rossmann)"
                className={FIELD_INPUT}
              />
            </div>
          </div>

          <div>
            <label className={FIELD_LABEL}>Storefront description</label>
            <textarea
              rows={2}
              value={newBrandDesc}
              onChange={(e) => setNewBrandDesc(e.target.value)}
              placeholder={`e.g. ${DEFAULT_DESC}`}
              className={`${FIELD_INPUT} leading-relaxed`}
            />
          </div>

          {logoPicker(fileInputRef, logoPreview, handleLogoUpload)}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowAddForm(false)} className={SECONDARY_BUTTON}>
              Cancel
            </button>
            <button type="submit" className={PRIMARY_BUTTON}>
              <Check size={14} /> Save brand
            </button>
          </div>
        </form>
      )}

      {/* Brand list: one per row so full names always fit */}
      {displayedBrands.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-[#2E4235]/65 dark:text-[#D2DDD6]/65">
          No brands yet.
        </p>
      ) : (
        <ul className={LIST}>
          {displayedBrands.map((brand) => {
            const origin = (brand.origin || "").trim();
            const showOrigin = origin && !/^germany$/i.test(origin);
            const desc = brand.desc || DEFAULT_DESC;
            return (
              <li key={brand._id || brand.id} className={ROW}>
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className={`${TILE} object-contain p-1 bg-white`}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className={`${TILE} flex items-center justify-center bg-[#F3EDE2] dark:bg-white/5 text-sm font-semibold text-[#2E4235]/70 dark:text-[#D2DDD6]/70`}
                  >
                    {brand.name ? brand.name.charAt(0).toUpperCase() : "?"}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <p className={TITLE}>{brand.name}</p>
                  <p className={`${MUTED} mt-0.5`} title={desc}>
                    {showOrigin ? `${origin} · ` : ""}
                    {desc}
                  </p>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBrand({
                        _id: brand._id || brand.id,
                        name: brand.name || "",
                        origin: brand.origin || "Germany",
                        desc: brand.desc || DEFAULT_DESC,
                        logo: brand.logo || "",
                        verified: brand.verified ?? true,
                      })
                    }
                    className={ICON_BUTTON}
                    title="Edit brand"
                    aria-label={`Edit ${brand.name}`}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      confirmToast({
                        title: "Remove Brand Partner?",
                        message: `Are you sure you want to remove "${brand.name}" from active German brand partners?`,
                        confirmLabel: "Yes, Remove",
                        onConfirm: async () => {
                          const toastId = toast.loading(`Removing "${brand.name}"...`);
                          try {
                            await deleteBrandApi(brand._id || brand.id).unwrap();
                            deleteBrand(brand._id || brand.id, true);
                            toast.success(`Brand "${brand.name}" removed successfully!`, { id: toastId });
                          } catch (err) {
                            toast.error(err?.data?.message || `Could not remove "${brand.name}". It is still live.`, { id: toastId, duration: 6000 });
                          }
                        },
                      });
                    }}
                    className={ICON_BUTTON_DANGER}
                    title="Remove brand"
                    aria-label={`Remove ${brand.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Edit brand modal */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md bg-white dark:bg-[#222620] rounded-xl p-6 shadow-2xl space-y-4 border border-[#DCD6CB] dark:border-white/10 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD6CB]/70 dark:border-white/10">
              <h3 className="text-base font-semibold text-[#141f17] dark:text-white">Edit brand</h3>
              <button
                type="button"
                className={ICON_BUTTON}
                onClick={() => setEditingBrand(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={FIELD_LABEL}>Brand name *</label>
                <input
                  type="text"
                  required
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. ISANA, Balea, Catrice"
                  className={FIELD_INPUT}
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>Origin</label>
                <input
                  type="text"
                  value={editingBrand.origin || ""}
                  onChange={(e) => setEditingBrand({ ...editingBrand, origin: e.target.value })}
                  placeholder="Germany (dm.de / Rossmann)"
                  className={FIELD_INPUT}
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>Storefront description</label>
                <textarea
                  rows={3}
                  value={editingBrand.desc || ""}
                  onChange={(e) => setEditingBrand({ ...editingBrand, desc: e.target.value })}
                  placeholder={`e.g. ${DEFAULT_DESC}`}
                  className={`${FIELD_INPUT} leading-relaxed`}
                />
              </div>

              <div>
                <label className={FIELD_LABEL}>Logo</label>
                {logoPicker(editFileInputRef, editingBrand.logo, handleEditLogoUpload)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DCD6CB]/70 dark:border-white/10">
              <button type="button" className={SECONDARY_BUTTON} onClick={() => setEditingBrand(null)}>
                Cancel
              </button>
              <button type="submit" className={PRIMARY_BUTTON}>
                <Check size={14} /> Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
