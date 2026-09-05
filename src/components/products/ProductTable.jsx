import { Edit3, Trash2, PackageOpen } from "lucide-react";

export default function ProductTable({ items = [], isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#d96b86] border-r-transparent mb-3" />
        <p className="text-xs font-semibold">Loading German products from database...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl my-4">
        <PackageOpen size={36} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No products found</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Click &quot;Add product&quot; to create your first German catalog item.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Size / Weight</th>
            <th>BDT Price</th>
            <th>Euro Cost</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const hasImage = item.images && item.images.length > 0 && typeof item.images[0] === "string";
            const stockNum = typeof item.stock === "number" ? item.stock : parseInt(item.stock, 10) || 0;

            return (
              <tr key={item._id || item.id || item.name}>
                <td>
                  <div className="product-cell">
                    {hasImage ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-10 h-11 object-cover rounded-lg border border-gray-200 dark:border-white/10 shrink-0"
                      />
                    ) : (
                      <span className="product-thumb" style={{ background: item.color || "#e8d4dc" }}>
                        LH
                      </span>
                    )}
                    <div>
                      <strong className="block text-xs font-bold text-gray-900 dark:text-white leading-tight">
                        {item.name}
                      </strong>
                      {item.expiryBatchCode && (
                        <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">
                          {item.expiryBatchCode}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-xs font-semibold text-gray-800 dark:text-zinc-200">{item.brand}</td>
                <td className="text-xs font-semibold text-gray-800 dark:text-zinc-200">{item.category}</td>
                <td className="text-xs text-gray-600 dark:text-zinc-400 font-medium">
                  {item.size || item.weight || item.weightVolume || "—"}
                </td>
                <td>
                  <b className="text-xs font-bold text-gray-900 dark:text-white">
                    ৳{(item.price || item.regularPrice || 0).toLocaleString()}
                  </b>
                  {item.discountPrice && item.discountPrice < item.price && (
                    <small className="block text-[10px] line-through text-gray-400">
                      ৳{item.discountPrice.toLocaleString()}
                    </small>
                  )}
                </td>
                <td className="text-xs font-mono font-medium text-gray-700 dark:text-zinc-300">
                  {item.euroCost ? `€${Number(item.euroCost).toFixed(2)}` : item.euro || "—"}
                </td>
                <td>
                  <span
                    className={`badge ${
                      stockNum === 0
                        ? "out-of-stock"
                        : stockNum < 10
                        ? "low-stock"
                        : "active"
                    }`}
                  >
                    {stockNum === 0
                      ? "Out of stock"
                      : stockNum < 10
                      ? `${stockNum} · Low stock`
                      : `${stockNum} in stock`}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-action cursor-pointer"
                      onClick={() => onEdit?.(item)}
                      title="Edit product"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="icon-action cursor-pointer hover:text-rose-500 hover:border-rose-300"
                      onClick={() => onDelete?.(item)}
                      title="Delete product"
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
