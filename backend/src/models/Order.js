const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerMobile: { type: String, index: true },
    customerEmail: { type: String },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true },
      discountPercent: { type: Number, required: true },
      discountAmount: { type: Number, required: true },
      deliveryCharge: { type: Number, required: true },
      total: { type: Number, required: true },
      savedAmount: { type: Number, required: true },
      deliveryRuleLabel: { type: String, default: "" },
      offerAppliedLabel: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    codConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
