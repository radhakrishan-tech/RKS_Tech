import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export async function fetchProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data;
}

export async function fetchCategories() {
  const { data } = await api.get("/products/categories");
  return data.categories;
}

export async function fetchProductBySlug(slug) {
  const { data } = await api.get(`/products/${slug}`);
  return data;
}

export async function fetchSuggestions(productId) {
  const { data } = await api.get(`/products/id/${productId}/suggestions`);
  return data;
}

export async function previewOrder(payload) {
  const { data } = await api.post("/orders/preview", payload);
  return data;
}

export async function placeOrder(payload) {
  const { data } = await api.post("/orders", payload);
  return data;
}

export async function placeOrderWithToken(payload, token) {
  const { data } = await api.post("/orders", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function requestOtp(payload) {
  const { data } = await api.post("/auth/request-otp", payload);
  return data;
}

export async function verifyOtp(payload) {
  const { data } = await api.post("/auth/verify-otp", payload);
  return data;
}

export async function fetchMyAccount(token) {
  const { data } = await api.get("/account/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function updateMyProfile(token, payload) {
  const { data } = await api.put("/account/me", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function addMyAddress(token, payload) {
  const { data } = await api.post("/account/me/addresses", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function updateMyAddress(token, addressId, payload) {
  const { data } = await api.put(`/account/me/addresses/${addressId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function deleteMyAddress(token, addressId) {
  const { data } = await api.delete(`/account/me/addresses/${addressId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function adminLogin(payload) {
  const { data } = await api.post("/auth/admin/login", payload);
  return data;
}

export async function fetchAdminSummary(token) {
  const { data } = await api.get("/admin/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function fetchAdminAnalytics(token) {
  const { data } = await api.get("/admin/analytics", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function fetchAdminProducts(token, params = {}) {
  const { data } = await api.get("/admin/products", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function fetchAdminOrders(token, params = {}) {
  const { data } = await api.get("/admin/orders", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function createAdminProduct(token, payload) {
  const { data } = await api.post("/admin/products", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function uploadAdminImages(token, files = []) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const { data } = await api.post("/admin/uploads/images", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data.images || [];
}

export async function updateAdminProduct(token, productId, payload) {
  const { data } = await api.put(`/admin/products/${productId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function deleteAdminProduct(token, productId) {
  const { data } = await api.delete(`/admin/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function updateAdminOrderStatus(token, orderId, status) {
  const { data } = await api.patch(
    `/admin/orders/${orderId}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
}

export async function downloadAdminReport(token, type, format = "csv") {
  const response = await api.get(`/admin/reports/${type}`, {
    params: { format },
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });

  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/octet-stream",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;

  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename=\"?([^\"]+)\"?/);
  anchor.download = match?.[1] || `${type}-report.${format}`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

export async function fetchInvoiceSummary(orderId) {
  const { data } = await api.get(`/orders/${orderId}/invoice-summary`);
  return data;
}

export function getInvoiceDownloadUrl(orderId) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return `${base}/orders/${orderId}/invoice`;
}
