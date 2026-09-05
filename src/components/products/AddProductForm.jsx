import { useState, useMemo } from "react";
import { ImagePlus, X } from "lucide-react";
import VariantManager from "./VariantManager";
import ImageUploadZone from "./ImageUploadZone";
import { useAdminUI } from "../../context/AdminUIContext";

export default function AddProductForm({ product, onClose, onSave }) {
  const { categories, brands } = useAdminUI();

  const [name, setName] = useState(product?.name || "");
  const [brand, setBrand] = useState(product?.brand || brands[0]?.name || "Balea");
  const [category, setCategory] = useState(product?.category || categories[0]?.name || "Skin");
  const [regularPrice, setRegularPrice] = useState(
    product?.price || product?.regularPrice || ""
  );
  const [discountPrice, setDiscountPrice] = useState(
    product?.discountPrice || ""
  );
  const [stock, setStock] = useState(product?.stock ?? 25);
  const [weightVolume, setWeightVolume] = useState(
    product?.size || product?.weight || product?.weightVolume || "200 g / 50 ml"
  );
  const [euroCost, setEuroCost] = useState(
    product?.euroCost || (product?.euro ? product.euro.replace("€", "") : "3.95")
  );
  const [expiryBatchCode, setExpiryBatchCode] = useState(
    product?.expiryBatchCode || product?.batchCode || "BATCH-DE-2027"
  );
  const [rating, setRating] = useState(product?.rating ?? 4.9);
  const [badge, setBadge] = useState(
    product?.badge || (product?.isNew ? "New Arrival" : product?.isBestSeller ? "Best-Seller" : "German Direct")
  );
  const [isNew, setIsNew] = useState(product?.isNew ?? true);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [description, setDescription] = useState(product?.description || "");
  const [ingredients, setIngredients] = useState(product?.ingredients || "");
  const [howToUse, setHowToUse] = useState(product?.howToUse || "");
  const [benefits, setBenefits] = useState(product?.benefits || "");

  const [images, setImages] = useState(
    product?.images || [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
    ]
  );

  // Live discount percentage computation
  const calculatedDiscount = useMemo(() => {
    const reg = Number(regularPrice);
    const disc = Number(discountPrice);
    if (reg > 0 && disc > 0 && reg > disc) {
      return {
        percent: Math.round(((reg - disc) / reg) * 100),
        savings: reg - disc,
      };
    }
    return null;
  }, [regularPrice, discountPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      name,
      brand,
      category,
      price: discountPrice ? Number(discountPrice) : Number(regularPrice),
      regularPrice: Number(regularPrice),
      originalPrice: Number(regularPrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      discountPercent: calculatedDiscount ? calculatedDiscount.percent : 0,
      stock: Number(stock),
      inStock: Number(stock) > 0,
      size: weightVolume,
      weightVolume,
      euroCost: Number(euroCost),
      expiryBatchCode,
      rating: Number(rating) || 4.9,
      badge,
      isNew: Boolean(isNew),
      isBestSeller: Boolean(isBestSeller),
      isFeatured: Boolean(isFeatured),
      description,
      ingredients,
      howToUse,
      benefits,
      images,
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal product-modal"
        style={{
          maxHeight: "90vh",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: 0,
          gap: 0,
        }}
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="section-head modal-sticky" style={{ flexShrink: 0, padding: "20px 24px" }}>
          <div>
            <span className="page-kicker">GERMAN CATALOG</span>
            <h2>{product ? "Edit product" : "Add new product"}</h2>
          </div>
          <button type="button" className="icon-action cursor-pointer" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div
          className="product-form-scroll"
          style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "20px 24px" }}
        >
          <div className="form-grid">
            <label className="full">
              Product name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Original German product name (e.g. Balea Beauty Expert Calming Serum)"
                required
              />
            </label>

            <label>
              Brand
              <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                {brands.map((b) => (
                  <option key={b.id || b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
                type="number"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="e.g. 1850"
                required
              />
            </label>

            <label>
              Discounted / Sale price (BDT)
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Optional sale price (e.g. 1650)"
              />
              {calculatedDiscount && (
                <span style={{ fontSize: "11px", color: "#e11d48", fontWeight: "700", marginTop: "4px", display: "block" }}>
                  🏷️ Live Discount: -{calculatedDiscount.percent}% OFF (Save ৳{calculatedDiscount.savings})
                </span>
              )}
            </label>

            <label>
              Initial Rating (1.0 - 5.0)
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g. 4.9"
              />
            </label>

            <label>
              Stock quantity
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Units in Dhaka / transit"
                required
              />
            </label>

            <label>
              Weight / Volume
              <input
                value={weightVolume}
                onChange={(e) => setWeightVolume(e.target.value)}
                placeholder="e.g. 200 g / 50 ml / 30 ml"
              />
            </label>

            <label>
              Euro source price (€ dm.de)
              <input
                type="number"
                step="0.01"
                value={euroCost}
                onChange={(e) => setEuroCost(e.target.value)}
                placeholder="e.g. 4.95"
              />
            </label>

            <label>
              Expiry batch code (Germany)
              <input
                value={expiryBatchCode}
                onChange={(e) => setExpiryBatchCode(e.target.value)}
                placeholder="BATCH-DE-2027"
              />
            </label>

            <label>
              Product Badge / Ribbon
              <select value={badge} onChange={(e) => {
                setBadge(e.target.value);
                if (e.target.value === "New Arrival") setIsNew(true);
                if (e.target.value === "Best-Seller") setIsBestSeller(true);
              }}>
                <option value="New Arrival">New Arrival</option>
                <option value="Best-Seller">Best-Seller</option>
                <option value="German Direct">German Direct</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Featured">Featured</option>
                <option value="">None</option>
              </select>
            </label>

            {/* Collection Tabs / Flags Checkboxes */}
            <div className="full" style={{ display: "flex", gap: "20px", padding: "10px 0", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--accent)" }}
                />
                Show in "New Arrivals" Tab
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--accent)" }}
                />
                Show in "Best-Sellers" Tab
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--accent)" }}
                />
                Feature on Homepage
              </label>
            </div>

            {/* Direct File & URL Image Upload Zone */}
            <div className="full pt-2">
              <ImageUploadZone images={images} onChange={setImages} />
            </div>

            <label className="full">
              Product Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the German formulation, dermatologist tests, and benefits..."
                rows={3}
              />
            </label>

            <label>
              Clean ingredients (INCI)
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Aqua, Glycerin, Panthenol, Hyaluronic Acid..."
                rows={2}
              />
            </label>

            <label>
              How to use
              <textarea
                value={howToUse}
                onChange={(e) => setHowToUse(e.target.value)}
                placeholder="Application ritual and frequency..."
                rows={2}
              />
            </label>

            <label className="full">
              Key benefits
              <textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="24h hydration, vegan, DAAB allergy tested..."
                rows={2}
              />
            </label>
          </div>

          <h3 className="mt-6 mb-3 text-sm font-bold text-gray-900 dark:text-white">
            Shades & Variants
          </h3>
          <VariantManager />
        </div>

        <div
          className="modal-actions modal-sticky-bottom"
          style={{ flexShrink: 0, padding: "16px 24px", borderTop: "1px solid var(--line)", background: "var(--surface)", zIndex: 10 }}
        >
          <button type="button" className="button secondary cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button cursor-pointer">
            <ImagePlus size={15} /> Save product
          </button>
        </div>
      </form>
    </div>
  );
}
