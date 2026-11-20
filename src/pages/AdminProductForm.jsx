import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { brandApi, categoryApi } from "../services/api";

const empty = {
  id: "",
  name: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  status: "Active",
  featured: false,
  imageUrl: "",
  description: "",
};

export default function AdminProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);

  const { products, saveProduct } = useShop();
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load brands
  useEffect(() => {
    brandApi
      .getAll()
      .then(setBrands)
      .catch((err) => {
        console.error("Could not load brands:", err);
        setError("Could not load brands.");
      });
  }, []);

  // Load categories
  useEffect(() => {
    categoryApi
      .getAll()
      // categoryApi returns objects { id, name, ... }; the dropdown needs only the names
      .then((data) => setCategories(data.map((c) => c.name)))
      .catch((err) => console.error("Could not load categories", err));
  }, []);

  // Load product when editing
  useEffect(() => {
    if (!editing) return;

    const found = products.find(
      (p) => String(p.id) === String(id)
    );

    if (found) {
      setForm({
        ...empty,
        ...found,
        brand: found.brandId || "",
        category: found.categoryId || "",
        price: found.price ?? "",
        stock: found.stock ?? "",
      });
    }
  }, [id, editing, products]);

  // Handle input changes
  const change = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === "" || form.stock === "") {
      setError("Please complete the product name, price and stock.");
      return;
    }
    // Validation: price cannot be negative
    if (Number(form.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }
    const product = {
      ...form,
      id: editing ? id : "",
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      brand: form.brand,
      category: form.category,
    };
    // Wait for the backend. If it refuses (e.g. 400), show its message
    // and stay on the form instead of leaving silently.
    try {
      await saveProduct(product);
      navigate("/admin/products");
    } catch (err) {
      const message = err.response?.data;
      setError(typeof message === "string" ? message : "Could not save the product.");
    }
  };

  return (
    <>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted"
      >
        <ArrowLeft size={15} /> Back to products
      </Link>

      <div className="mt-5">
        <p className="eyebrow text-rose">
          {editing ? "Catalogue update" : "New catalogue item"}
        </p>

        <h1 className="mt-2 font-display text-4xl">
          {editing ? "Edit product" : "Add product"}
        </h1>

        <p className="mt-2 text-sm text-muted">
          Enter the product information below.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 max-w-3xl rounded-2xl border border-line bg-white p-6 md:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-xs font-semibold">
            Product name *
            <input
              className="field mt-2"
              name="name"
              value={form.name}
              onChange={change}
              required
              placeholder="e.g. Daily Hydrating Serum"
            />
          </label>

          <label className="text-xs font-semibold">
            Category
            <select
              className="field mt-2"
              name="category"
              value={form.category}
              onChange={change}
            >
              <option value="">-- Choose a category --</option>

              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold">
            Brand
            <select
              className="field mt-2"
              name="brand"
              value={form.brand}
              onChange={change}
            >
              <option value="">-- Choose a brand --</option>

              {brands.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold">
            Price (USD) *
            <input
              className="field mt-2"
              type="number"
              min="0"
              step="0.01"
              name="price"
              value={form.price}
              onChange={change}
              required
              placeholder="0.00"
            />
          </label>

          <label className="text-xs font-semibold">
            Stock quantity *
            <input
              className="field mt-2"
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={change}
              required
              placeholder="0"
            />
          </label>

          <label className="text-xs font-semibold">
            Status
            <select
              className="field mt-2"
              name="status"
              value={form.status}
              onChange={change}
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </label>

          <label className="text-xs font-semibold md:col-span-2">
            Image URL
            <input
              className="field mt-2"
              name="imageUrl"
              value={form.imageUrl}
              onChange={change}
              placeholder="https://example.com/product.jpg"
            />
          </label>

          <label className="text-xs font-semibold md:col-span-2">
            Description
            <textarea
              className="field mt-2 min-h-28"
              name="description"
              value={form.description}
              onChange={change}
              placeholder="Describe the product..."
            />
          </label>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              name="featured"
              checked={Boolean(form.featured)}
              onChange={change}
            />
            Feature this product on the home page
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose">{error}</p>
        )}

        <div className="mt-7 flex flex-wrap gap-3 border-t border-line pt-6">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save product"}
          </button>

          <Link to="/admin/products" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}