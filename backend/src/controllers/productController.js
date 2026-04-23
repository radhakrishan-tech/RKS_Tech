const { z } = require("zod");
const Product = require("../models/Product");
const { asyncHandler } = require("../utils/asyncHandler");
const { getSeasonTheme } = require("../services/weatherService");
const { buildQuickOrderLink } = require("../services/whatsappService");
const Order = require("../models/Order");
// Returns [{ category: "Kurti", sold: 12 }, ...] for last 30 days
const getCategorySalesLast30Days = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const pipeline = [
    { $match: { createdAt: { $gte: since }, status: { $ne: "Cancelled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.category", sold: { $sum: "$items.quantity" } } },
    { $project: { _id: 0, category: "$_id", sold: 1 } },
    { $sort: { sold: -1 } },
  ];
  const sales = await Order.aggregate(pipeline);
  return res.json({ sales });
});

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

const listProducts = asyncHandler(async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query" });
  }

  const { search, category, minPrice, maxPrice } = parsed.data;
  const filter = { active: true };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  const seasonTheme = getSeasonTheme();
  const products = await Product.find(filter).sort({ isSummerFriendly: -1, createdAt: -1 }).lean();

  const transformed = products.map((product) => {
    const ageInDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const badges = [];

    if (ageInDays <= 14) {
      badges.push("New Arrival");
    }
    if (product.soldCount >= 15) {
      badges.push("Trending");
    }
    if (product.stock <= 5) {
      badges.push("Only few left");
    }

    return {
      ...product,
      badges,
      quickOrderLink: buildQuickOrderLink(product),
    };
  });

  return res.json({
    seasonTheme,
    products: transformed,
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({
    ...product,
    quickOrderLink: buildQuickOrderLink(product),
  });
});

const listVisibleCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $match: { count: { $gt: 0 } } },
    { $project: { _id: 0, name: "$_id", count: 1 } },
    { $sort: { name: 1 } },
  ]);

  return res.json({ categories });
});

const productSuggestions = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const suggestions = [];
  if (product.category.toLowerCase().includes("towel")) {
    const faceTowel = await Product.findOne({
      active: true,
      category: "Face Towel",
      _id: { $ne: product._id },
    }).lean();

    if (faceTowel) {
      suggestions.push({
        title: "Add face towel at 10% off",
        product: faceTowel,
      });
    }
  }

  const alsoBought = await Product.find({
    active: true,
    category: { $ne: product.category },
  })
    .sort({ soldCount: -1 })
    .limit(4)
    .lean();

  return res.json({ suggestions, alsoBought });
});

module.exports = {
  listProducts,
  getProductBySlug,
  listVisibleCategories,
  productSuggestions,
  getCategorySalesLast30Days,
};
