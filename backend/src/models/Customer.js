const mongoose = require("mongoose");

const customerAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home", trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    mobile: { type: String, required: true, unique: true, index: true, trim: true },
    addresses: [customerAddressSchema],
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
