const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");

function formatINR(value) {
  return `Rs ${Number(value || 0).toFixed(0)}`;
}

const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="invoice-${order._id}.pdf"`
  );
  doc.pipe(res);

  // ── Header ──────────────────────────────────────────────────────────
  doc.fontSize(22).fillColor("#1f8f4d").text("Radha Krishan Studio", { align: "center" });
  doc.fontSize(10).fillColor("#5a695d").text("Smart Shopping, Simple Checkout", { align: "center" });
  doc.moveDown(0.4);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cbe0cd").stroke();
  doc.moveDown(0.6);

  // ── Invoice meta ─────────────────────────────────────────────────────
  doc.fillColor("#1b2a1c").fontSize(11);
  doc.text(`Invoice No: ${String(order._id).slice(-8).toUpperCase()}`, { continued: true });
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
    { align: "right" }
  );
  doc.moveDown(0.8);

  // ── Customer details ─────────────────────────────────────────────────
  doc.fontSize(11).fillColor("#1f8f4d").text("Bill To:");
  doc.fillColor("#1b2a1c").fontSize(10);
  doc.text(order.customerName);
  doc.text(`Phone: ${order.customerPhone}`);
  if (order.customerEmail) doc.text(`Email: ${order.customerEmail}`);
  doc.text(`${order.addressLine}, ${order.city}, ${order.state} - ${order.pincode}`);
  doc.moveDown(0.8);

  // ── Items table header ───────────────────────────────────────────────
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cbe0cd").stroke();
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#5a695d");
  const colX = [50, 240, 340, 410, 480];
  doc.text("Product", colX[0], doc.y, { width: 185, continued: false });
  const headerY = doc.y - doc.currentLineHeight();
  doc.text("Category", colX[1], headerY, { width: 95 });
  doc.text("Qty", colX[2], headerY, { width: 65 });
  doc.text("Unit Price", colX[3], headerY, { width: 65 });
  doc.text("Total", colX[4], headerY, { width: 65 });
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cbe0cd").stroke();
  doc.moveDown(0.3);

  // ── Items ─────────────────────────────────────────────────────────────
  doc.fillColor("#1b2a1c").fontSize(10);
  order.items.forEach((item) => {
    const rowY = doc.y;
    doc.text(item.name, colX[0], rowY, { width: 185 });
    doc.text(item.category, colX[1], rowY, { width: 95 });
    doc.text(String(item.quantity), colX[2], rowY, { width: 65 });
    doc.text(formatINR(item.unitPrice), colX[3], rowY, { width: 65 });
    doc.text(formatINR(item.lineTotal), colX[4], rowY, { width: 65 });
    doc.moveDown(0.2);
  });

  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cbe0cd").stroke();
  doc.moveDown(0.5);

  // ── Pricing summary ───────────────────────────────────────────────────
  const p = order.pricing;
  const summaryX = 350;
  const valueX = 480;

  const lineItem = (label, value, bold = false, colour = "#1b2a1c") => {
    const y = doc.y;
    doc.fillColor(colour).fontSize(bold ? 11 : 10);
    doc.text(label, summaryX, y, { width: 125 });
    doc.text(value, valueX, y, { width: 65, align: "right" });
    doc.moveDown(0.3);
  };

  lineItem("Subtotal", formatINR(p.subtotal));
  lineItem("Discount", `- ${formatINR(p.discountAmount)}`, false, "#1f8f4d");
  lineItem("Delivery", p.deliveryCharge === 0 ? "FREE" : formatINR(p.deliveryCharge));
  doc.moveDown(0.2);
  doc.moveTo(summaryX, doc.y).lineTo(545, doc.y).strokeColor("#cbe0cd").stroke();
  doc.moveDown(0.3);
  lineItem("Total", formatINR(p.total), true, "#1f8f4d");

  if (p.savedAmount > 0) {
    doc.moveDown(0.4);
    doc
      .rect(summaryX - 5, doc.y - 2, 200, 22)
      .fillAndStroke("#edf9ef", "#b6e4c2");
    doc
      .fillColor("#1f8f4d")
      .fontSize(10)
      .text(`You saved ${formatINR(p.savedAmount)} on this order!`, summaryX, doc.y, {
        width: 190,
        align: "center",
      });
    doc.moveDown(0.7);
  }

  // ── Footer ────────────────────────────────────────────────────────────
  doc.moveDown(1);
  doc.fontSize(9).fillColor("#5a695d").text("Thank you for shopping with Radha Krishan Studio!", {
    align: "center",
  });
  doc.text("Payment method: Cash on Delivery", { align: "center" });

  doc.end();
});

const getInvoiceSummary = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({
    orderId: order._id,
    invoiceNumber: String(order._id).slice(-8).toUpperCase(),
    createdAt: order.createdAt,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
      addressLine: order.addressLine,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
    },
    items: order.items,
    pricing: order.pricing,
    status: order.status,
    paymentMethod: order.paymentMethod,
  });
});

module.exports = { downloadInvoice, getInvoiceSummary };
