import { useState, useMemo, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import VariantManager from "./VariantManager";
import ImageUploadZone from "./ImageUploadZone";
import { useAdminUI } from "../../context/AdminUIContext";
import { useGetCategoriesQuery, useGetBrandsQuery } from "../../redux/features/catalogApi";

export default function AddProductForm({ product, onClose, onSave }) {
  const { categories: contextCategories, brands: contextBrands } = useAdminUI();
  const { data: apiCategoriesRes } = useGetCategoriesQuery();
  const { data: apiBrandsRes } = useGetBrandsQuery();

  const categories = useMemo(() => {
    const apiList = apiCategoriesRes?.data || (Array.isArray(apiCategoriesRes) ? apiCategoriesRes : null);
    if (Array.isArray(apiList) && apiList.length > 0) return apiList;
    if (Array.isArray(contextCategories) && contextCategories.length > 0) return contextCategories;
    return [
      { id: "cat-1", name: "Skin", label: "Skincare" },
      { id: "cat-2", name: "Body", label: "Body Care" },
      { id: "cat-3", name: "Makeup", label: "Makeup" },
      { id: "cat-4", name: "Baby", label: "Baby & Kids" },
      { id: "cat-5", name: "Hair", label: "Hair Care" },
    ];
  }, [apiCategoriesRes, contextCategories]);

  const brands = useMemo(() => {
    const apiList = apiBrandsRes?.data || (Array.isArray(apiBrandsRes) ? apiBrandsRes : null);
    if (Array.isArray(apiList) && apiList.length > 0) return apiList;
    if (Array.isArray(contextBrands) && contextBrands.length > 0) return contextBrands;
    return [
      { id: "b-1", name: "Balea" },
      { id: "b-2", name: "Catrice" },
      { id: "b-3", name: "Penaten" },
      { id: "b-4", name: "Alverde" },
      { id: "b-5", name: "Isana" },
      { id: "b-6", name: "Nivea" },
      { id: "b-7", name: "Eucerin" },
      { id: "b-8", name: "Sebamed" },
    ];
  }, [apiBrandsRes, contextBrands]);

  const [name, setName] = useState(product?.name || "");
  const [brand, setBrand] = useState(product?.brand || brands[0]?.name || "Balea");
  const [category, setCategory] = useState(product?.category || categories[0]?.name || "Skin");

  // Keep brand and category in sync once loaded if initially empty
  useEffect(() => {
    if (!brand && brands.length > 0) {
      setBrand(brands[0].name);
    }
  }, [brands, brand]);

  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);
  const [regularPrice, setRegularPrice] = useState(
    product?.price || product?.regularPrice || ""
  );
  const [discountPrice, setDiscountPrice] = useState(
    product?.discountPrice || ""
  );
  const [costPrice, setCostPrice] = useState(
    product?.costPrice !== undefined && product?.costPrice !== null ? product.costPrice : ""
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

  // Live Gross Profit and Margin estimates (before operating expenses)
  const profitEstimates = useMemo(() => {
    const isRecorded = costPrice !== "" && costPrice !== null && costPrice !== undefined;
    if (!isRecorded) {
      return { isRecorded: false };
    }

    const cost = Number(costPrice);
    if (isNaN(cost) || cost < 0) {
      return { isRecorded: false, isInvalid: true };
    }

    const effectiveSellingPrice = Number(discountPrice) > 0 ? Number(discountPrice) : Number(regularPrice);
    const stockNum = Number(stock) || 0;

    const grossProfitUnit = effectiveSellingPrice - cost;
    const isLoss = grossProfitUnit < 0;
    const grossMargin =
      effectiveSellingPrice > 0
        ? ((grossProfitUnit / effectiveSellingPrice) * 100).toFixed(1)
        : null;
    const totalInventoryCost = cost * stockNum;

    return {
      isRecorded: true,
      cost,
      sellingPrice: effectiveSellingPrice,
      grossProfitUnit,
      grossMargin,
      isLoss,
      totalInventoryCost,
    };
  }, [costPrice, regularPrice, discountPrice, stock]);

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
      costPrice: costPrice !== "" && costPrice !== null && !isNaN(Number(costPrice))
        ? Math.max(0, Number(costPrice))
        : undefined,
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
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header" style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
              {product ? "Edit German Catalog Product" : "Add Authentic German Product"}
            </h3>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              Synced directly with MongoDB & storefront product catalog
            </span>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="form-scrollable-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div className="form-grid">
            <label className="full">
              Product title / formulation name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Balea Aqua Feuchtigkeits Serum"
                required
              />
            </label>

            <label>
              Brand
              <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                {brand && !brands.some((b) => b.name === brand) && (
                  <option value={brand}>{brand}</option>
                )}
                {brands.map((b) => (
                  <option key={b._id || b.id || b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {category && !categories.some((c) => c.name === category) && (
                  <option value={category}>{category}</option>
                )}
                {categories.map((c) => (
                  <option key={c._id || c.id || c.name} value={c.name}>
                    {c.label || c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Regular price (BDT) *
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

            {/* Cost per Unit (BDT) */}
            <label>
              Cost per Unit (BDT)
              <input
                type="number"
                step="any"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="e.g. 950 (Allocated cost)"
              />
              <small style={{ fontSize: "10.5px", color: "#6b7280", marginTop: "4px", display: "block", lineHeight: "1.4" }}>
                Purchase price including this unit’s allocated import freight/customs costs.
              </small>
            </label>

            {/* Live Profit Estimates Card */}
            <div style={{ gridColumn: "1 / -1", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "12px 16px", background: "#f9fafb" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#1f2937" }}>
                  📊 Estimated Unit Gross Profit & Inventory Cost
                </span>
                <span style={{ fontSize: "10.5px", color: "#6b7280", fontStyle: "italic" }}>
                  (Before operating expenses)
                </span>
              </div>

              {!profitEstimates.isRecorded ? (
                <div style={{ fontSize: "11.5px", color: "#b45309", fontWeight: "600", padding: "4px 0" }}>
                  ⚠️ Purchase cost not recorded. (Gross profit & margin cannot be calculated until unit cost is entered).
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", paddingTop: "4px" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: "10.5px", color: "#6b7280", display: "block", fontWeight: "600" }}>
                      Gross Profit / Unit
                    </span>
                    <strong style={{ fontSize: "14px", fontWeight: "900", color: profitEstimates.isLoss ? "#dc2626" : "#059669", display: "block", marginTop: "2px" }}>
                      {profitEstimates.isLoss ? "Loss: -" : "+"}৳{Math.abs(profitEstimates.grossProfitUnit).toLocaleString()}
                    </strong>
                    <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                      Selling ৳{profitEstimates.sellingPrice} − Cost ৳{profitEstimates.cost}
                    </span>
                  </div>

                  <div style={{ padding: "8px 12px", borderRadius: "8px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: "10.5px", color: "#6b7280", display: "block", fontWeight: "600" }}>
                      Gross Margin
                    </span>
                    <strong style={{ fontSize: "14px", fontWeight: "900", color: profitEstimates.isLoss ? "#dc2626" : "#059669", display: "block", marginTop: "2px" }}>
                      {profitEstimates.grossMargin !== null ? `${profitEstimates.grossMargin}%` : "N/A"}
                    </strong>
                    <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                      Of selling price
                    </span>
                  </div>

                  <div style={{ padding: "8px 12px", borderRadius: "8px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: "10.5px", color: "#6b7280", display: "block", fontWeight: "600" }}>
                      Stock Asset Value
                    </span>
                    <strong style={{ fontSize: "14px", fontWeight: "900", color: "#111827", display: "block", marginTop: "2px" }}>
                      ৳{profitEstimates.totalInventoryCost.toLocaleString()}
                    </strong>
                    <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                      {stock || 0} units in stock
                    </span>
                  </div>
                </div>
              )}
            </div>

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
