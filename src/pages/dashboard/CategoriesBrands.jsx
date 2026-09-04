import { useState } from "react";
import { Plus, X, Sparkles, Check } from "lucide-react";
import CategoryList from "../../components/categories_brands/CategoryList";
import BrandLogoUpload from "../../components/categories_brands/BrandLogoUpload";
import { useAdminUI } from "../../context/AdminUIContext";

export default function CategoriesBrands() {
  const { addCategory } = useAdminUI();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("✨");

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      label: newCatLabel.trim() || newCatName.trim(),
      icon: newCatIcon.trim() || "◇",
    });

    setNewCatName("");
    setNewCatLabel("");
    setNewCatIcon("✨");
    setShowAddModal(false);
  };

  return (
    <>
      <title>Lumihaus Admin · Categories & Brands</title>

      <div className="page-heading">
        <div>
          <span className="page-kicker">CATALOG MERCHANDISING</span>
          <h2>Categories & Brands</h2>
          <p>Organize categories and brands that appear dynamically across your storefront.</p>
        </div>
        <button
          className="button"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} /> New category
        </button>
      </div>

      <div className="two-column">
        {/* Categories Section */}
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Catalog Categories</h2>
              <p>Active categories linked to product filters & shop navigation.</p>
            </div>
            <button
              className="button secondary text-xs"
              onClick={() => setShowAddModal(true)}
            >
              + Add
            </button>
          </div>
          <CategoryList />
        </section>

        {/* Brand Assets Section */}
        <section className="card">
          <div className="section-head">
            <div>
              <h2>German Brand Partners</h2>
              <p>Curated drugstore brands sourced directly from Europe.</p>
            </div>
          </div>
          <BrandLogoUpload />
        </section>
      </div>

      {/* Add New Category Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateCategory}>
            <div className="section-head">
              <div>
                <span className="page-kicker">NEW ENTRY</span>
                <h2>Add New Category</h2>
              </div>
              <button
                type="button"
                className="icon-action"
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <label className="block text-xs font-bold text-[#60685f]">
              Category Code / Short Name * (e.g. Skin, Makeup, Supplements)
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Supplements, Fragrance, Mom"
                className="mt-1 w-full"
              />
            </label>

            <label className="block text-xs font-bold text-[#60685f]">
              Full Display Label (e.g. German Dietary Supplements)
              <input
                type="text"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="e.g. German Wellness & Supplements"
                className="mt-1 w-full"
              />
            </label>

            <label className="block text-xs font-bold text-[#60685f]">
              Icon / Emoji Symbol
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="💊, ✨, 🧴, 🌸"
                className="mt-1 w-full"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="button secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button">
                <Check size={14} /> Create Category
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
