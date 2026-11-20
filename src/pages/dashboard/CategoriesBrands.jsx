import { useCreateCategoryMutation } from "../../redux/api/catalogApi";
import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import CategoryList from "../../components/catalog/CategoryList";
import BrandLogoUpload from "../../components/catalog/BrandLogoUpload";
import { useAdminUI } from "../../context/AdminUIContext";
import CategoryFields from "../../components/catalog/CategoryFields";
import { CARD, SMALL_BUTTON, ICON_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from "../../components/catalog/ui";

export default function CategoriesBrands() {
  const { addCategory } = useAdminUI();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");

  const [createCategoryApi] = useCreateCategoryMutation();

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const catName = newCatName.trim();
    const catLabel = newCatLabel.trim() || catName;

    const toastId = toast.loading(`Creating "${catName}" category...`);

    try {
      await createCategoryApi({
        name: catName,
        label: catLabel,
      }).unwrap();

      addCategory({
        name: catName,
        label: catLabel,
      }, true);

      setNewCatName("");
      setNewCatLabel("");
      setShowAddModal(false);
      toast.success(`Category "${catName}" created successfully!`, { id: toastId });
    } catch (error) {
      // Do not add a local-only category: the storefront would never see it.
      toast.error(error?.data?.message || `Could not create "${catName}". Nothing was saved.`, { id: toastId, duration: 6000 });
    }
  };

  return (
    <>
      <title>Lumihaus Admin · Categories & Brands</title>

      <div className="page-heading">
        <div>
          <h1>Categories & brands</h1>
          <p>What shoppers can filter and browse by on the storefront.</p>
        </div>
      </div>

      <div className="two-column items-start">
        {/* Categories */}
        <section className={CARD}>
          <div className="section-head">
            <div>
              <h2>Categories</h2>
              <p>Used in shop filters and navigation.</p>
            </div>
            <button
              type="button"
              className={SMALL_BUTTON}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} /> Add category
            </button>
          </div>
          <CategoryList />
        </section>

        {/* Brands (renders its own card) */}
        <BrandLogoUpload />
      </div>

      {/* Add New Category Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateCategory}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#141f17] dark:text-white">New category</h2>
              <button type="button" className={ICON_BUTTON} onClick={() => setShowAddModal(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <CategoryFields
              value={{ name: newCatName, label: newCatLabel }}
              onChange={(patch) => {
                if ("name" in patch) setNewCatName(patch.name);
                if ("label" in patch) setNewCatLabel(patch.label);
              }}
            />

            <div className="flex justify-end gap-2">
              <button type="button" className={SECONDARY_BUTTON} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className={PRIMARY_BUTTON}>
                <Check size={14} /> Create category
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

