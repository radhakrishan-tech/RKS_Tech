const express = require("express");
const {
  listProducts,
  getProductBySlug,
  listVisibleCategories,
  productSuggestions,
  getCategorySalesLast30Days,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", listProducts);
router.get("/categories", listVisibleCategories);
router.get("/categories/sales30d", getCategorySalesLast30Days);
router.get("/id/:id/suggestions", productSuggestions);
router.get("/:slug", getProductBySlug);

module.exports = router;
