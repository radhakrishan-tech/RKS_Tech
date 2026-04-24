import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  adminLogin,
  createAdminProduct,
  deleteAdminProduct,
  downloadAdminReport,
  fetchAdminAnalytics,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminSummary,
  uploadAdminImages,
  updateAdminOrderStatus,
  updateAdminProduct,
} from "../services/api";

const initialForm = {
  name: "",
  slug: "",
  category: "Kurti",
  price: "",
  discountPrice: "",
  stock: "",
  description: "",
  tags: "",
  sku: "",
  images: "",
  sizes: "",
  colors: [{ name: "", hex: "#000000" }],
  active: true,
  isSummerFriendly: false,
};

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function normalizeNumberInput(value) {
  if (value === "") return "";
  const num = Number(value);
  return Number.isFinite(num) ? num : "";
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminPage() {
  const [token, setToken] = useState(
    localStorage.getItem("rks_admin_token") || ""
  );
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [form, setForm] = useState(initialForm);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState({
    dailySales: [],
    monthlySales: [],
    statusBreakdown: [],
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [productFilters, setProductFilters] = useState({
    search: "",
    category: "",
    status: "active",
    page: 1,
    limit: 8,
  });
  const [orderFilters, setOrderFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 8,
  });
  const [productPagination, setProductPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [orderPagination, setOrderPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [editingProductId, setEditingProductId] = useState("");
  const [editForm, setEditForm] = useState(initialForm);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [editUploadedImages, setEditUploadedImages] = useState([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);

  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(window.__rksToastTimer);
    window.__rksToastTimer = window.setTimeout(() => setToast(null), 2500);
  };

  const handleAuthError = (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("rks_admin_token");
      setToken("");
      showToast("error", "Session expired. Please login again.");
      return true;
    }
    return false;
  };

  const loadSummaryAndAnalytics = async (adminToken) => {
    const [summaryData, analyticsData] = await Promise.all([
      fetchAdminSummary(adminToken),
      fetchAdminAnalytics(adminToken),
    ]);
    setSummary(summaryData);
    setAnalytics(analyticsData);
  };

  const loadProducts = async (adminToken) => {
    const data = await fetchAdminProducts(adminToken, productFilters);
    setProducts(data.products || []);
    setProductPagination(
      data.pagination || { page: 1, totalPages: 1, total: 0 }
    );
  };

  const loadOrders = async (adminToken) => {
    const data = await fetchAdminOrders(adminToken, orderFilters);
    setOrders(data.orders || []);
    setOrderPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
  };

  const loadDashboard = async (adminToken) => {
    setLoading(true);
    try {
      await Promise.all([
        loadSummaryAndAnalytics(adminToken),
        loadProducts(adminToken),
        loadOrders(adminToken),
      ]);
    } catch (error) {
      if (!handleAuthError(error)) {
        showToast(
          "error",
          error?.response?.data?.message || "Could not load admin dashboard"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboard(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadProducts(token).catch((error) => {
      if (!handleAuthError(error))
        showToast("error", "Failed to fetch products");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilters]);

  useEffect(() => {
    if (!token) return;
    loadOrders(token).catch((error) => {
      if (!handleAuthError(error)) showToast("error", "Failed to fetch orders");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderFilters]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const data = await adminLogin(loginForm);
      localStorage.setItem("rks_admin_token", data.token);
      setToken(data.token);
      showToast("success", "Logged in successfully");
    } catch (error) {
      setLoginError(error?.response?.data?.message || "Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rks_admin_token");
    setToken("");
    showToast("success", "Logged out");
  };

  const buildPayload = (sourceForm, extraImages = []) => {
    const urlImages = sourceForm.images
      ? sourceForm.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    return {
      name: sourceForm.name.trim(),
      slug: sourceForm.slug.trim() || toSlug(sourceForm.name),
      category: sourceForm.category,

      price: Number(sourceForm.price) || 0,
      discountPrice:
        sourceForm.discountPrice === ""
          ? undefined
          : Number(sourceForm.discountPrice),
      compareAtPrice:
        sourceForm.discountPrice === "" ? undefined : Number(sourceForm.price),
      stock: Number(sourceForm.stock) || 0,

      description: sourceForm.description?.trim() || "",
      tags: sourceForm.tags
        ? sourceForm.tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],

      sku: sourceForm.sku?.trim() || undefined,

      // 🔥 FIXED PART
      sizes: sourceForm.sizes
        ? sourceForm.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],

      colors: sourceForm.colors.filter((c) => c.name && c.hex),

      rating: sourceForm.rating ? Number(sourceForm.rating) : 0,

      images: [...urlImages, ...extraImages],

      active: Boolean(sourceForm.active),
      isSummerFriendly: Boolean(sourceForm.isSummerFriendly),
    };
  };
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createAdminProduct(token, buildPayload(form, uploadedImages));
      setForm(initialForm);
      setUploadedImages([]);
      await loadSummaryAndAnalytics(token);
      await loadProducts(token);
      showToast("success", "Product created");
    } catch (error) {
      if (!handleAuthError(error))
        showToast(
          "error",
          error?.response?.data?.message || "Failed to create product"
        );
    }
  };

  const startEditProduct = (product) => {
    setEditingProductId(product._id);
    setEditUploadedImages([]);
    setEditForm({
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || "Kurti",
      price: String(product.price ?? ""),
      discountPrice: String(product.discountPrice ?? ""),
      stock: String(product.stock ?? ""),
      description: product.description || "",
      tags: product.tags?.join(", ") || "",
      sku: product.sku || "",
      images: product.images?.join(", ") || "",
      active: Boolean(product.active),
      isSummerFriendly: Boolean(product.isSummerFriendly),
    });
  };

  const cancelEditProduct = () => {
    setEditingProductId("");
    setEditForm(initialForm);
    setEditUploadedImages([]);
  };

  const handleUpdateProduct = async (productId) => {
    try {
      await updateAdminProduct(
        token,
        productId,
        buildPayload(editForm, editUploadedImages)
      );
      cancelEditProduct();
      await loadProducts(token);
      await loadSummaryAndAnalytics(token);
      showToast("success", "Product updated");
    } catch (error) {
      if (!handleAuthError(error))
        showToast(
          "error",
          error?.response?.data?.message || "Failed to update product"
        );
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteAdminProduct(token, productId);
      setDeleteTarget(null);
      if (editingProductId === productId) cancelEditProduct();
      await loadProducts(token);
      await loadSummaryAndAnalytics(token);
      showToast("success", "Product deleted");
    } catch (error) {
      if (!handleAuthError(error))
        showToast(
          "error",
          error?.response?.data?.message || "Failed to archive product"
        );
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await updateAdminOrderStatus(token, orderId, status);
      await loadOrders(token);
      await loadSummaryAndAnalytics(token);
      showToast("success", `Order moved to ${status}`);
    } catch (error) {
      if (!handleAuthError(error))
        showToast(
          "error",
          error?.response?.data?.message || "Failed to update order status"
        );
    }
  };

  const handleReportDownload = async (type, format) => {
    try {
      await downloadAdminReport(token, type, format);
      showToast("success", `${type} report downloaded`);
    } catch (error) {
      if (!handleAuthError(error))
        showToast(
          "error",
          error?.response?.data?.message || "Report download failed"
        );
    }
  };

  const handleImageFiles = async (files, isEdit = false) => {
    const safeFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!safeFiles.length) {
      showToast("error", "Please upload image files only");
      return;
    }

    try {
      setLoading(true);
      const uploaded = await uploadAdminImages(token, safeFiles);
      if (isEdit) {
        setEditUploadedImages((prev) => [...prev, ...uploaded].slice(0, 8));
      } else {
        setUploadedImages((prev) => [...prev, ...uploaded].slice(0, 8));
      }
      showToast("success", `${uploaded.length} image(s) uploaded`);
    } catch (error) {
      if (!handleAuthError(error)) {
        showToast(
          "error",
          error?.response?.data?.message || "Image upload failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 5),
    [products]
  );
  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 5 && product.active),
    [products]
  );

  if (!token) {
    return (
      <main className="container admin-login">
        <h2>Admin Panel</h2>
        <div className="demo-credentials">
          <strong>Demo Credentials</strong>
          <p>
            Email: <code>admin@test.com</code>
          </p>
          <p>
            Password: <code>admin123</code>
          </p>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            required
          />
          <button type="submit">Login to Admin Panel</button>
          {loginError ? <p className="admin-error-text">{loginError}</p> : null}
        </form>
      </main>
    );
  }

  return (
    <main className="container admin-dashboard-v2">
      {toast ? (
        <div className={`admin-toast ${toast.type}`}>{toast.message}</div>
      ) : null}

      <section className="admin-topbar">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage products, orders, analytics, reports, and inventory.</p>
        </div>
        <button type="button" className="danger-button" onClick={handleLogout}>
          Logout
        </button>
      </section>

      <section className="summary-cards">
        <article>
          <p>Total Orders</p>
          <strong>{summary?.totalOrders || 0}</strong>
        </article>
        <article>
          <p>Revenue</p>
          <strong>Rs {Math.round(summary?.revenue || 0)}</strong>
        </article>
        <article>
          <p>Pending Orders</p>
          <strong>{summary?.pendingOrders || 0}</strong>
        </article>
        <article>
          <p>Delivered Orders</p>
          <strong>{summary?.deliveredOrders || 0}</strong>
        </article>
        <article>
          <p>Active Products</p>
          <strong>{summary?.activeProducts || 0}</strong>
        </article>
      </section>

      <section className="admin-analytics-grid">
        <article className="admin-card">
          <h3>Sales Overview (Daily)</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ea580c"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="admin-card">
          <h3>Sales Overview (Monthly)</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" />
                <Bar dataKey="revenue" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="admin-card">
          <h3>Orders Status Breakdown</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  dataKey="count"
                  data={analytics.statusBreakdown || []}
                  nameKey="status"
                  outerRadius={90}
                  fill="#2563eb"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="admin-card">
        <h3>Reports Download</h3>
        <div className="admin-report-grid">
          <button
            type="button"
            onClick={() => handleReportDownload("orders", "csv")}
          >
            Orders CSV
          </button>
          <button
            type="button"
            onClick={() => handleReportDownload("orders", "xlsx")}
          >
            Orders Excel
          </button>
          <button
            type="button"
            onClick={() => handleReportDownload("sales", "csv")}
          >
            Sales CSV
          </button>
          <button
            type="button"
            onClick={() => handleReportDownload("sales", "xlsx")}
          >
            Sales Excel
          </button>
          <button
            type="button"
            onClick={() => handleReportDownload("inventory", "csv")}
          >
            Inventory CSV
          </button>
          <button
            type="button"
            onClick={() => handleReportDownload("inventory", "xlsx")}
          >
            Inventory Excel
          </button>
        </div>
      </section>

      <section className="admin-grid-v2">
        <form
          className="product-form admin-card"
          onSubmit={handleCreateProduct}
        >
          <h3>Add Product</h3>
          <div className="admin-field-grid">
            <input
              placeholder="Product Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: toSlug(e.target.value),
                })
              }
              required
            />
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: toSlug(e.target.value) })
              }
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>Kurti</option>
              <option>Dupatta</option>
              <option>Plazo</option>
              <option>Bath Towel</option>
              <option>Face Towel</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: normalizeNumberInput(e.target.value),
                })
              }
              required
            />
            <input
              type="number"
              placeholder="Discount Price"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountPrice: normalizeNumberInput(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: normalizeNumberInput(e.target.value),
                })
              }
              required
            />
            <input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) =>
                setForm({ ...form, sku: e.target.value.toUpperCase() })
              }
            />
            <input
              placeholder="Sizes (comma separated, e.g. S,M,L,XL)"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              required
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label>Colors:</label>
              {form.colors.map((color, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    placeholder="Color Name"
                    value={color.name}
                    onChange={(e) => {
                      const updated = [...form.colors];
                      updated[idx].name = e.target.value;
                      setForm({ ...form, colors: updated });
                    }}
                    required
                  />
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const updated = [...form.colors];
                      updated[idx].hex = e.target.value;
                      setForm({ ...form, colors: updated });
                    }}
                    required
                    style={{
                      width: 32,
                      height: 32,
                      border: "none",
                      background: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        colors: form.colors.filter((_, i) => i !== idx),
                      })
                    }
                    disabled={form.colors.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    colors: [...form.colors, { name: "", hex: "#000000" }],
                  })
                }
              >
                Add Color
              </button>
            </div>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Rating (0-5)"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
            <input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
          <input
            placeholder="Image URLs (comma separated)"
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
          />
          <div
            className={`image-dropzone ${isDraggingImages ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingImages(true);
            }}
            onDragLeave={() => setIsDraggingImages(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingImages(false);
              handleImageFiles(Array.from(e.dataTransfer.files || []), false);
            }}
          >
            <p>Drag & drop images here, or upload files</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                handleImageFiles(Array.from(e.target.files || []), false)
              }
            />
          </div>
          {uploadedImages.length ? (
            <div className="image-preview-grid">
              {uploadedImages.map((img, idx) => (
                <img
                  key={`${img.slice(0, 20)}-${idx}`}
                  src={img}
                  alt={`preview-${idx}`}
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active Product
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.isSummerFriendly}
              onChange={(e) =>
                setForm({ ...form, isSummerFriendly: e.target.checked })
              }
            />
            Summer Friendly
          </label>
          <button
            type="submit"
            disabled={
              form.sizes.trim() === "" ||
              !form.colors.some((c) => c.name && c.hex)
            }
          >
            Save Product
          </button>
        </form>

        <section className="admin-card admin-section-stack">
          <h3>Inventory Management</h3>
          <p>Track low stock and best-selling products.</p>
          <div className="admin-mini-grid">
            <article>
              <h4>Low Stock (5 or less)</h4>
              <ul>
                {lowStockProducts.length ? (
                  lowStockProducts.slice(0, 8).map((product) => (
                    <li key={product._id}>
                      {product.name} - {product.stock}
                    </li>
                  ))
                ) : (
                  <li>No low-stock products</li>
                )}
              </ul>
            </article>
            <article>
              <h4>Top Selling Products</h4>
              <ul>
                {topProducts.length ? (
                  topProducts.map((product) => (
                    <li key={product._id}>
                      {product.name} - Sold {product.soldCount || 0}
                    </li>
                  ))
                ) : (
                  <li>No sales data yet</li>
                )}
              </ul>
            </article>
          </div>
        </section>
      </section>

      <section className="admin-card">
        <h3>Product Listing</h3>
        <div className="admin-filter-row">
          <input
            placeholder="Search name / slug / SKU"
            value={productFilters.search}
            onChange={(e) =>
              setProductFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
          />
          <select
            value={productFilters.category}
            onChange={(e) =>
              setProductFilters((prev) => ({
                ...prev,
                category: e.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All Categories</option>
            <option value="Kurti">Kurti</option>
            <option value="Dupatta">Dupatta</option>
            <option value="Plazo">Plazo</option>
            <option value="Bath Towel">Bath Towel</option>
            <option value="Face Towel">Face Towel</option>
          </select>
          <select
            value={productFilters.status}
            onChange={(e) =>
              setProductFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="admin-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <span className="admin-no-image">No Image</span>
                    )}
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <small>{product.sku || "No SKU"}</small>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    Rs {Math.round(product.price)}
                    {product.discountPrice ? (
                      <small>
                        Disc: Rs {Math.round(product.discountPrice)}
                      </small>
                    ) : null}
                  </td>
                  <td>{product.stock}</td>
                  <td>{product.active ? "Active" : "Inactive"}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        onClick={() => startEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => setDeleteTarget(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <button
            type="button"
            disabled={productPagination.page <= 1}
            onClick={() =>
              setProductFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Prev
          </button>
          <span>
            Page {productPagination.page} / {productPagination.totalPages}
          </span>
          <button
            type="button"
            disabled={productPagination.page >= productPagination.totalPages}
            onClick={() =>
              setProductFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next
          </button>
        </div>
      </section>

      {editingProductId ? (
        <section className="admin-card">
          <h3>Edit Product</h3>
          <div className="admin-field-grid">
            <input
              placeholder="Product Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <input
              placeholder="Slug"
              value={editForm.slug}
              onChange={(e) =>
                setEditForm({ ...editForm, slug: toSlug(e.target.value) })
              }
            />
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
            >
              <option>Kurti</option>
              <option>Dupatta</option>
              <option>Plazo</option>
              <option>Bath Towel</option>
              <option>Face Towel</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              value={editForm.price}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  price: normalizeNumberInput(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Discount Price"
              value={editForm.discountPrice}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  discountPrice: normalizeNumberInput(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Stock"
              value={editForm.stock}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  stock: normalizeNumberInput(e.target.value),
                })
              }
            />
            <input
              placeholder="SKU"
              value={editForm.sku}
              onChange={(e) =>
                setEditForm({ ...editForm, sku: e.target.value.toUpperCase() })
              }
            />
            <input
              placeholder="Tags (comma separated)"
              value={editForm.tags}
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
            />
          </div>
          <textarea
            placeholder="Description"
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
            rows={4}
          />
          <input
            placeholder="Image URLs (comma separated)"
            value={editForm.images}
            onChange={(e) =>
              setEditForm({ ...editForm, images: e.target.value })
            }
          />
          <div className="image-dropzone">
            <p>Upload additional images</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                handleImageFiles(Array.from(e.target.files || []), true)
              }
            />
          </div>
          {editUploadedImages.length ? (
            <div className="image-preview-grid">
              {editUploadedImages.map((img, idx) => (
                <img
                  key={`${img.slice(0, 20)}-${idx}`}
                  src={img}
                  alt={`edit-preview-${idx}`}
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}
          <div className="admin-row-actions">
            <button
              type="button"
              onClick={() => handleUpdateProduct(editingProductId)}
            >
              Save
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={cancelEditProduct}
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section className="admin-card">
        <h3>Orders</h3>
        <div className="admin-filter-row">
          <input
            placeholder="Search customer / phone / email"
            value={orderFilters.search}
            onChange={(e) =>
              setOrderFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
          />
          <select
            value={orderFilters.status}
            onChange={(e) =>
              setOrderFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All Status</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>{String(order._id).slice(-8)}</strong>
                    <small>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <strong>{order.customerName}</strong>
                    <small>{order.customerPhone}</small>
                  </td>
                  <td>{order.items?.length || 0}</td>
                  <td>Rs {Math.round(order.pricing?.total || 0)}</td>
                  <td>{order.status}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusChange(order._id, e.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <button
            type="button"
            disabled={orderPagination.page <= 1}
            onClick={() =>
              setOrderFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Prev
          </button>
          <span>
            Page {orderPagination.page} / {orderPagination.totalPages}
          </span>
          <button
            type="button"
            disabled={orderPagination.page >= orderPagination.totalPages}
            onClick={() =>
              setOrderFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next
          </button>
        </div>
      </section>

      <section className="admin-card">
        <h3>Sales Records</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Delivery</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={`sales-${order._id}`}>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{String(order._id).slice(-8)}</td>
                  <td>{order.customerName}</td>
                  <td>Rs {Math.round(order.pricing?.subtotal || 0)}</td>
                  <td>Rs {Math.round(order.pricing?.discountAmount || 0)}</td>
                  <td>Rs {Math.round(order.pricing?.deliveryCharge || 0)}</td>
                  <td>Rs {Math.round(order.pricing?.total || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {deleteTarget ? (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Delete Product</h4>
            <p>
              Are you sure you want to delete "{deleteTarget.name}"? This action
              cannot be undone.
            </p>
            <div className="admin-row-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDeleteProduct(deleteTarget._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-loading-overlay">Loading dashboard...</div>
      ) : null}
    </main>
  );
}
