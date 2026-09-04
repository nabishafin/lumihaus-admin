import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import VariantManager from "./VariantManager";
import ImageUploadZone from "./ImageUploadZone";
import { useAdminUI } from "../../context/AdminUIContext";

export default function AddProductForm({ product, onClose, onSave }) {
  const { categories, brands } = useAdminUI();

  const [images, setImages] = useState(
    product?.images || [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85"
    ]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      ...product,
      images,
    });
  };

  return (
    <form className="modal product-modal" onSubmit={handleSubmit}>
      <div className="section-head modal-sticky">
        <div>
          <span className="page-kicker">GERMAN CATALOG</span>
          <h2>{product ? "Edit product" : "Add new product"}</h2>
        </div>
        <button type="button" className="icon-action" onClick={onClose}>
          <X size={17} />
        </button>
      </div>

      <div className="product-form-scroll">
        <div className="form-grid">
          <label className="full">
            Product name
            <input
              defaultValue={product?.name}
              placeholder="Original German product name"
              required
            />
          </label>

          <label>
            Brand
            <select defaultValue={product?.brand || brands[0]?.name || "Balea"}>
              {brands.map((b) => (
                <option key={b.id || b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Category
            <select defaultValue={product?.category || categories[0]?.name || "Skin"}>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name} {c.label && c.label !== c.name ? `(${c.label})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Regular price (BDT)
            <input
              defaultValue={product?.price?.replace?.(/\D/g, "") || "1450"}
              type="number"
              required
            />
          </label>

          <label>
            Discounted price (BDT)
            <input
              defaultValue={product?.discountPrice || ""}
              type="number"
              placeholder="Optional sale price"
            />
          </label>

          <label>
            Stock quantity
            <input
              defaultValue={product?.stock ?? 25}
              type="number"
              required
            />
          </label>

          <label>
            Weight / volume
            <input
              defaultValue={product?.weight || "200 g / 50 ml"}
              placeholder="e.g. 200 g or 30 ml"
            />
          </label>

          <label>
            Euro source price (€)
            <input
              defaultValue={product?.euro?.slice?.(1) || "3.95"}
              type="number"
              step="0.01"
            />
          </label>

          <label>
            Expiry batch code
            <input
              defaultValue={product?.batchCode || "BATCH-DE-2027"}
              placeholder="BATCH-DE-2027"
            />
          </label>

          {/* Direct File & URL Image Upload Zone */}
          <div className="full pt-2">
            <ImageUploadZone images={images} onChange={setImages} />
          </div>

          <label className="full">
            Description
            <textarea
              defaultValue={product?.description}
              placeholder="Describe the German formulation, dermatologist tests, and benefits..."
              rows={3}
            />
          </label>

          <label>
            Clean ingredients (INCI)
            <textarea
              defaultValue={product?.ingredients}
              placeholder="Aqua, Glycerin, Panthenol, Hyaluronic Acid..."
              rows={2}
            />
          </label>

          <label>
            How to use
            <textarea
              defaultValue={product?.howToUse}
              placeholder="Application ritual and frequency..."
              rows={2}
            />
          </label>

          <label>
            Key benefits
            <textarea
              defaultValue={product?.benefits}
              placeholder="24h hydration, vegan, DAAB tested..."
              rows={2}
            />
          </label>

          <label>
            Sizes available
            <input
              defaultValue={product?.sizes || "30ml, 50ml"}
              placeholder="30ml, 50ml, 100ml..."
            />
          </label>
        </div>

        <h3 className="mt-6 mb-3 text-sm font-bold text-[#2b2427]">
          Shades & Variants
        </h3>
        <VariantManager />

        <div className="toggle-grid mt-4">
          {["Featured", "Best Seller", "New Arrival", "Flash Sale Deal"].map((x) => (
            <label className="switch-row" key={x}>
              <span>{x}</span>
              <input type="checkbox" defaultChecked={x === "Featured" || x === "New Arrival"} />
              <i />
            </label>
          ))}
        </div>
      </div>

      <div className="modal-actions modal-sticky-bottom">
        <button type="button" className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="button">
          <ImagePlus size={15} /> Save product
        </button>
      </div>
    </form>
  );
}
