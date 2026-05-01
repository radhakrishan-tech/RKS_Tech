const { z } = require("zod");
const Product = require("../models/Product");
const Order = require("../models/Order");
const XLSX = require("xlsx");

const { asyncHandler } = require("../utils/asyncHandler");

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/),
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.enum(["Kurti", "Dupatta", "Plazo", "Bath Towel", "Face Towel"]),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  sku: z.string().min(2).max(100).optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isSummerFriendly: z.boolean().default(false),
  description: z.string().default(""),
  sizes: z.array(z.string().min(1)).min(1),
  colors: z.array(colorSchema).min(1),
  rating: z.number().min(0).max(5).default(0),
  numReviews: z.number().int().min(0).default(0),
});

const createProduct = asyncHandler(async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const product = await Product.create(parsed.data);
  return res.status(201).json(product);
});

const uploadImages = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  const host = `https://${req.get("host")}`;
  const images = files.map((file) => `${host}/uploads/${file.filename}`);
  return res.status(201).json({ images });
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "Pending",
    "Confirmed",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]),
});

function toPositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return fallback;
  }
  return Math.floor(n);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSV(rows) {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const head = headers.map(csvEscape).join(",");
  const body = rows
    .map((row) => headers.map((header) => csvEscape(row[header])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

const updateProduct = asyncHandler(async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product archived" });
});

const listAllProducts = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const search = String(req.query.search || "").trim();
  const category = String(req.query.category || "").trim();
  const status = String(req.query.status || "").trim();

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }
  if (category) {
    query.category = category;
  }
  if (status === "active") {
    query.active = true;
  }
  if (status === "inactive") {
    query.active = false;
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return res.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

const listOrders = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const status = String(req.query.status || "").trim();
  const search = String(req.query.search || "").trim();

  const query = {};
  if (status) {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { customerPhone: { $regex: search, $options: "i" } },
      { customerEmail: { $regex: search, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return res.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

const summary = asyncHandler(async (req, res) => {
  const [orderCount, salesAgg, pendingCount, deliveredCount, activeProducts] =
    await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, revenue: { $sum: "$pricing.total" } } },
      ]),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.countDocuments({ active: true }),
    ]);

  return res.json({
    totalOrders: orderCount,
    revenue: salesAgg[0]?.revenue || 0,
    pendingOrders: pendingCount,
    deliveredOrders: deliveredCount,
    activeProducts,
  });
});

const analytics = asyncHandler(async (_req, res) => {
  const dailyWindowStart = startOfDay(
    new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
  );
  const monthWindowStart = new Date();
  monthWindowStart.setMonth(monthWindowStart.getMonth() - 5);
  monthWindowStart.setDate(1);
  monthWindowStart.setHours(0, 0, 0, 0);

  const [dailySalesRaw, monthlySalesRaw, statusBreakdownRaw] =
    await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: dailyWindowStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: "$pricing.total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthWindowStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$pricing.total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

  const dailySales = dailySalesRaw.map((item) => ({
    date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(
      item._id.day
    ).padStart(2, "0")}`,
    revenue: item.revenue,
    orders: item.orders,
  }));

  const monthlySales = monthlySalesRaw.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    revenue: item.revenue,
    orders: item.orders,
  }));

  const statusBreakdown = statusBreakdownRaw.map((item) => ({
    status: item._id,
    count: item.count,
  }));

  return res.json({ dailySales, monthlySales, statusBreakdown });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const parsed = updateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: parsed.data.status },
    { new: true }
  );
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({ message: "Order status updated", order });
});

const downloadReport = asyncHandler(async (req, res) => {
  const type = String(req.params.type || "").toLowerCase();
  const format = String(req.query.format || "csv").toLowerCase();

  if (!["orders", "sales", "inventory"].includes(type)) {
    return res.status(400).json({ message: "Invalid report type" });
  }

  if (!["csv", "xlsx"].includes(format)) {
    return res.status(400).json({ message: "Invalid report format" });
  }

  let rows = [];

  if (type === "orders") {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    rows = orders.map((order) => ({
      orderId: order._id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      status: order.status,
      total: order.pricing?.total || 0,
      itemCount: order.items?.length || 0,
      createdAt: order.createdAt,
    }));
  }

  if (type === "sales") {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    rows = orders.map((order) => ({
      date: order.createdAt,
      orderId: order._id,
      subtotal: order.pricing?.subtotal || 0,
      discount: order.pricing?.discountAmount || 0,
      deliveryCharge: order.pricing?.deliveryCharge || 0,
      total: order.pricing?.total || 0,
      status: order.status,
    }));
  }

  if (type === "inventory") {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    rows = products.map((product) => ({
      productId: product._id,
      name: product.name,
      sku: product.sku || "",
      category: product.category,
      price: product.price,
      discountPrice: product.discountPrice || "",
      stock: product.stock,
      status: product.active ? "Active" : "Inactive",
      soldCount: product.soldCount || 0,
    }));
  }

  const filename = `${type}-report-${Date.now()}.${format}`;

  if (format === "csv") {
    const csv = buildCSV(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"${filename}\"`
    );
    return res.send(csv);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
  return res.send(buffer);
});

module.exports = {
  createProduct,
  uploadImages,
  updateProduct,
  deleteProduct,
  listAllProducts,
  listOrders,
  summary,
  analytics,
  updateOrderStatus,
  downloadReport,
};
