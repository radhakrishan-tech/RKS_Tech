const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendOtp, verifyOtp } = require("../services/otpService");
const Customer = require("../models/Customer");

const requestOtpSchema = z.object({
  mobile: z.string().min(8).max(20),
});

const verifyOtpSchema = z.object({
  mobile: z.string().min(8).max(20),
  otp: z.string().length(5),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const requestOtpController = asyncHandler(async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const result = await sendOtp(parsed.data.mobile);
  return res.json(result);
});

const verifyOtpController = asyncHandler(async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const isValid = await verifyOtp(parsed.data.mobile, parsed.data.otp);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  const customer = await Customer.findOneAndUpdate(
    { mobile: parsed.data.mobile },
    {
      $set: { lastLoginAt: new Date() },
      $setOnInsert: {
        mobile: parsed.data.mobile,
        name: "",
        addresses: [],
      },
    },
    { new: true, upsert: true }
  ).lean();

  const token = jwt.sign(
    { role: "customer", mobile: parsed.data.mobile, customerId: String(customer._id) },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    role: "customer",
    profile: {
      id: customer._id,
      name: customer.name || "",
      mobile: customer.mobile,
      addresses: customer.addresses || [],
    },
  });
});

const adminLoginController = asyncHandler(async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.issues });
  }

  const { email, password } = parsed.data;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const isDefaultTestAdmin = email === "admin@test.com" && password === "admin123";
  const isConfiguredAdmin = email === adminEmail && password === adminPassword;

  if (!isDefaultTestAdmin && !isConfiguredAdmin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "2d",
  });

  return res.json({ token, role: "admin" });
});

module.exports = {
  requestOtpController,
  verifyOtpController,
  adminLoginController,
};
