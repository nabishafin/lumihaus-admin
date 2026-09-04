import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import ProductTable, { products } from "../../components/products/ProductTable";
import AddProductForm from "../../components/products/AddProductForm";
import { useAdminUI } from "../../context/AdminUIContext";

export default function Products() {
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { notify, categories, brands } = useAdminUI();

  const items = useMemo(
    () =>
      products.filter(
        (p) =>
          (selectedBrand === "All" || p.brand === selectedBrand) &&
          (selectedCategory === "All" || p.category === selectedCategory) &&
          p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, selectedBrand, selectedCategory]
  );

  function save() {
    setOpen(false);
    setEditing(null);
    notify("German catalog product saved");
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
        <div className="heading-actions">
          <button className="button secondary">
            <Download size={15} /> Export
          </button>
          <button
            className="button"
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search German products..."
            />
          </label>

          {/* Dynamic Brands Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
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
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <ProductTable
          items={items}
          onEdit={(item) => {
            setEditing(item);
            setOpen(true);
          }}
        />
      </section>

      {open && (
        <div className="modal-backdrop">
          <AddProductForm
            product={editing}
            onClose={() => setOpen(false)}
            onSave={save}
          />
        </div>
      )}
    </>
  );
}
