const { z } = require("zod");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");

const profileSchema = z.object({
  name: z.string().min(2).max(80),
});

const addressSchema = z.object({
  label: z.string().min(2).max(30).optional(),
  addressLine: z.string().min(5).max(200),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  pincode: z.string().min(4).max(12),
  landmark: z.string().max(120).optional(),
  isDefault: z.boolean().optional(),
});

function applyDefaultAddressRule(addresses, preferredId = null) {
  if (!Array.isArray(addresses) || !addresses.length) {
    return [];
  }

  if (preferredId) {
    return addresses.map((addr) => ({
      ...addr,
      isDefault: String(addr._id || addr.id || "") === String(preferredId),
    }));
  }

  const hasDefault = addresses.some((addr) => Boolean(addr.isDefault));
  if (hasDefault) {
    return addresses;
  }

  return addresses.map((addr, index) => ({ ...addr, isDefault: index === 0 }));
}

const getMyAccount = asyncHandler(async (req, res) => {
  const mobile = req.customer.mobile;

  const customer = await Customer.findOne({ mobile }).lean();
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const orders = await Order.find({ customerMobile: mobile })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    profile: {
      id: customer._id,
      name: customer.name || "",
      mobile: customer.mobile,
      addresses: customer.addresses || [],
    },
    orders,
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const customer = await Customer.findOneAndUpdate(
    { mobile: req.customer.mobile },
    { $set: { name: parsed.data.name.trim() } },
    { new: true }
  ).lean();

  return res.json({
    profile: {
      id: customer._id,
      name: customer.name || "",
      mobile: customer.mobile,
      addresses: customer.addresses || [],
    },
  });
});

const addAddress = asyncHandler(async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const customer = await Customer.findOne({ mobile: req.customer.mobile });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const nextAddress = {
    label: parsed.data.label || "Home",
    addressLine: parsed.data.addressLine,
    city: parsed.data.city,
    state: parsed.data.state,
    pincode: parsed.data.pincode,
    landmark: parsed.data.landmark || "",
    isDefault: Boolean(parsed.data.isDefault),
  };

  customer.addresses.push(nextAddress);
  if (nextAddress.isDefault) {
    const lastId = customer.addresses[customer.addresses.length - 1]?._id;
    customer.addresses = applyDefaultAddressRule(customer.addresses, lastId);
  } else {
    customer.addresses = applyDefaultAddressRule(customer.addresses);
  }
  await customer.save();

  return res.status(201).json({ addresses: customer.addresses });
});

const updateAddress = asyncHandler(async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const customer = await Customer.findOne({ mobile: req.customer.mobile });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const idx = customer.addresses.findIndex((address) => String(address._id) === String(req.params.addressId));
  if (idx < 0) {
    return res.status(404).json({ message: "Address not found" });
  }

  const updated = {
    ...customer.addresses[idx].toObject(),
    label: parsed.data.label || customer.addresses[idx].label || "Home",
    addressLine: parsed.data.addressLine,
    city: parsed.data.city,
    state: parsed.data.state,
    pincode: parsed.data.pincode,
    landmark: parsed.data.landmark || "",
    isDefault: Boolean(parsed.data.isDefault),
  };

  customer.addresses[idx] = updated;
  if (updated.isDefault) {
    customer.addresses = applyDefaultAddressRule(customer.addresses, req.params.addressId);
  } else {
    customer.addresses = applyDefaultAddressRule(customer.addresses);
  }

  await customer.save();
  return res.json({ addresses: customer.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ mobile: req.customer.mobile });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  customer.addresses = (customer.addresses || []).filter(
    (address) => String(address._id) !== String(req.params.addressId)
  );
  customer.addresses = applyDefaultAddressRule(customer.addresses);

  await customer.save();
  return res.json({ addresses: customer.addresses });
});

module.exports = {
  getMyAccount,
  updateMyProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};
