import { useMemo, useState } from "react";
import { Download, Plus, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import ProductTable from "../../components/products/ProductTable";
import AddProductForm from "../../components/products/AddProductForm";
import { useAdminUI } from "../../context/AdminUIContext";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../redux/features/productApi";

export default function Products() {
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);

  const { notify, categories, brands } = useAdminUI();

  // RTK Query API hooks
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery({
    search: query.trim() || undefined,
    brand: selectedBrand !== "All" ? selectedBrand : undefined,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    page,
    limit: 20,
  });

  const [createProductApi] = useCreateProductMutation();
  const [updateProductApi] = useUpdateProductMutation();
  const [deleteProductApi] = useDeleteProductMutation();

  // Real products data from backend
  const items = useMemo(() => {
    if (!apiResponse) return [];
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    if (Array.isArray(apiResponse?.products)) return apiResponse.products;
    return [];
  }, [apiResponse]);

  const pagination = apiResponse?.pagination || {
    page: 1,
    limit: 20,
    total: items.length,
    pages: 1,
  };

  // Handle Save (Create or Update)
  async function handleSave(productData) {
    const isEdit = !!editing?._id || !!editing?.id;
    const targetId = editing?._id || editing?.id;
    const toastId = toast.loading(
      isEdit ? `Updating "${productData.name}"...` : `Creating "${productData.name}"...`
    );

    try {
      if (isEdit) {
        await updateProductApi({ id: targetId, ...productData }).unwrap();
        toast.success(`Product "${productData.name}" updated successfully!`, { id: toastId });
      } else {
        await createProductApi(productData).unwrap();
        toast.success(`Product "${productData.name}" added to catalog!`, { id: toastId });
      }
      setOpen(false);
      setEditing(null);
      notify("German catalog product saved");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save product", { id: toastId });
    }
  }

  // Handle Delete with Toasty / SweetAlert-style interactive confirmation
  function handleDelete(item) {
    const productId = item?._id || item?.id || item;
    const productName = item?.name || "this German product";

    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1 min-w-[280px]">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white">Delete Product?</h4>
              <p className="text-xs text-gray-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">{productName}</strong>?
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                await executeDelete(productId, productName);
              }}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
        position: "top-center",
        style: {
          borderRadius: "14px",
          background: "#ffffff",
          color: "#1e191c",
          border: "2px solid #f43f5e",
          boxShadow: "0 20px 35px -5px rgba(0, 0, 0, 0.25)",
          maxWidth: "400px",
          padding: "14px 16px",
        },
      }
    );
  }

  async function executeDelete(productId, productName) {
    const toastId = toast.loading(`Deleting "${productName}"...`);
    try {
      await deleteProductApi(productId).unwrap();
      toast.success(`Product "${productName}" deleted successfully!`, { id: toastId });
      notify("Product deleted from German catalog");
    } catch (err) {
      toast.error(err?.data?.message || `Failed to delete "${productName}"`, { id: toastId });
    }
  }

  return (
    <>
      <title>LumiHaus Admin · German Products</title>

      <div className="page-heading">
        <div>
          <span className="page-kicker">GERMAN STOCK CATALOG</span>
          <h2>German Product Catalog</h2>
          <p>Inventory, source pricing, variants, and merchandising.</p>
        </div>
        <div className="heading-actions flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="button secondary flex items-center gap-1.5"
            title="Refresh Catalog"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Sync"}</span>
          </button>
          <button
            onClick={() => toast.success("Exporting product inventory (.xlsx)...")}
            className="button secondary"
          >
            <Download size={15} /> Export
          </button>
          <button
            className="button cursor-pointer"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus size={15} /> Add product
          </button>
        </div>
      </div>

      <section className="card">
        <div className="toolbar">
          <label className="table-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search German products by name, brand, or batch..."
            />
          </label>

          {/* Dynamic Brands Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Brands</option>
            {brands.map((b) => (
              <option key={b.id || b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Dynamic Categories Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="result-count text-xs text-gray-500">
            {isLoading || isFetching ? "Loading..." : `${pagination.total ?? items.length} products`}
          </span>
        </div>

        <ProductTable
          items={items}
          isLoading={isLoading}
          onEdit={(item) => {
            setEditing(item);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-4 mt-4 px-2">
            <span className="text-xs text-gray-500 dark:text-zinc-400">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="button secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                className="button secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {open && (
        <AddProductForm
          product={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
