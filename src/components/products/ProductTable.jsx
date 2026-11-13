import { Edit3, Trash2, PackageOpen } from "lucide-react";

const bdt = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

export default function ProductTable({ items = [], isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#8FAF9A] border-r-transparent mb-3" />
        <p className="text-xs font-semibold">Loading products…</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl my-4">
        <PackageOpen size={36} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No products found</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Click &quot;Add product&quot; to create your first catalog item.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      {/* Six columns so stock and actions stay visible without sideways scrolling */}
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Unit cost</th>
            <th>Stock</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const image = Array.isArray(item.images) && typeof item.images[0] === "string" ? item.images[0] : null;
            const stockNum = typeof item.stock === "number" ? item.stock : parseInt(item.stock, 10) || 0;
            const price = item.price ?? item.regularPrice ?? 0;
            const listPrice = item.regularPrice ?? item.originalPrice ?? 0;
            const size = item.size || item.weightVolume || item.weight;
            const hasCost = item.costPrice !== undefined && item.costPrice !== null && !isNaN(Number(item.costPrice));
            const margin = hasCost ? price - Number(item.costPrice) : null;

            return (
              <tr key={item._id || item.id || item.name}>
                <td>
                  <div className="flex items-center gap-3 min-w-[260px]">
                    {image ? (
                      // Same 3:4 tile and background colour as the storefront product cards.
                      <img
                        src={image}
                        alt=""
                        className="w-12 h-16 object-contain p-1 rounded-lg bg-[#F3EDE2] shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <span className="product-thumb" style={{ background: "#F3EDE2" }}>
                        LH
                      </span>
                    )}
                    <div className="min-w-0">
                      <strong className="block text-[13px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {item.name}
                      </strong>
                      <span className="block text-[11.5px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        {[item.brand, size].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="text-xs text-gray-700 dark:text-zinc-300">{item.category}</td>
                <td>
                  <b className="block text-[13px] font-semibold text-gray-900 dark:text-white">{bdt(price)}</b>
                  {listPrice > price && <small className="block text-[11px] line-through text-gray-400">{bdt(listPrice)}</small>}
                  {item.euroCost ? (
                    <small className="block text-[11px] text-gray-500 dark:text-zinc-400" title="Price in Germany">
                      €{Number(item.euroCost).toFixed(2)} in DE
                    </small>
                  ) : null}
                </td>
                <td>
                  {hasCost ? (
                    <div className="text-xs">
                      <b className="font-semibold text-gray-900 dark:text-white block">{bdt(item.costPrice)}</b>
                      <span
                        className={`text-[11px] font-semibold ${margin < 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}
                        title="Unit gross profit before courier and operating expenses"
                      >
                        {margin < 0 ? `Loss ${bdt(-margin)}` : `+${bdt(margin)}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold" title="Unit cost not recorded">
                      Not set
                    </span>
                  )}
                </td>
                <td>
                  <span className={`badge ${stockNum === 0 ? "out-of-stock" : stockNum < 10 ? "low-stock" : "active"}`}>
                    {stockNum === 0 ? "Out of stock" : stockNum < 10 ? `${stockNum} · Low` : `${stockNum} in stock`}
                  </span>
                </td>
                <td>
                  <div className="row-actions justify-end">
                    <button className="icon-action cursor-pointer" onClick={() => onEdit?.(item)} title="Edit product" aria-label={`Edit ${item.name}`}>
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="icon-action cursor-pointer hover:text-red-600 hover:border-red-300"
                      onClick={() => onDelete?.(item)}
                      title="Delete product"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
