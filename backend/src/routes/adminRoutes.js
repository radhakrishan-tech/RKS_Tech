const express = require("express");
const {
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
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.use(protectAdmin);
router.get("/summary", summary);
router.get("/analytics", analytics);
router.get("/products", listAllProducts);
router.post("/uploads/images", upload.array("images", 8), uploadImages);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/orders", listOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/reports/:type", downloadReport);

module.exports = router;
