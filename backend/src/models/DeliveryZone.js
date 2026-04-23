const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema(
  {
    pincode: { type: String, required: true, unique: true },
    isLocal: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);
