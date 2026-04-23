const express = require("express");
const { previewPricing, placeOrder, getOrderStatus } = require("../controllers/orderController");
const { downloadInvoice, getInvoiceSummary } = require("../controllers/invoiceController");
const { protectCustomer } = require("../middleware/auth");

const router = express.Router();

router.post("/preview", previewPricing);
router.post("/", (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return placeOrder(req, res, next);
	}
	return protectCustomer(req, res, () => placeOrder(req, res, next));
});

// Public order tracking endpoint
router.get("/:id/status", getOrderStatus);

router.get("/:id/invoice-summary", getInvoiceSummary);
router.get("/:id/invoice", downloadInvoice);

module.exports = router;
