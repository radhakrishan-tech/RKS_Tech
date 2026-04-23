// ─── In-memory fallback store (used by mock and email providers) ─────────────
const otpStore = new Map();
const providerByTarget = new Map();

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function fixedTestCode() {
  return "12345";
}

// ─── Provider: Twilio Verify ──────────────────────────────────────────────────
async function twilioSend(mobile) {
  const twilio = require("twilio");
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: mobile, channel: "sms" });
}

async function twilioVerify(mobile, code) {
  const twilio = require("twilio");
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const check = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: mobile, code });
  return check.status === "approved";
}

// ─── Provider: Email OTP ──────────────────────────────────────────────────────
async function emailSend(email) {
  const nodemailer = require("nodemailer");
  const code = randomCode();
  otpStore.set(email, { code, createdAt: Date.now() });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP - Radha Krishan Studio",
    text: `Your OTP is ${code}. Valid for 5 minutes.`,
    html: `<p>Your OTP is <strong>${code}</strong>. Valid for 5 minutes.</p>`,
  });
}

// ─── Provider: Mock (dev default) ────────────────────────────────────────────
async function mockSend(target) {
  const code = fixedTestCode();
  otpStore.set(target, { code, createdAt: Date.now() });
  return code;
}

// ─── Public API ───────────────────────────────────────────────────────────────
const PROVIDER = () => (process.env.OTP_PROVIDER || "mock").toLowerCase();

async function sendOtp(target) {
  const configuredProvider = PROVIDER();

  try {
    if (configuredProvider === "twilio") {
      await twilioSend(target);
      providerByTarget.set(target, "twilio");
      return { provider: "twilio", message: "OTP sent via SMS" };
    }

    if (configuredProvider === "email") {
      await emailSend(target);
      providerByTarget.set(target, "email");
      return { provider: "email", message: "OTP sent via email" };
    }

    // mock — return code in dev, omit in production
    const code = await mockSend(target);
    providerByTarget.set(target, "mock");
    return {
      provider: "mock",
      message: "OTP generated (mock mode)",
      debugCode: process.env.NODE_ENV === "production" ? undefined : code,
    };
  } catch (error) {
    // Graceful fallback to mock when a provider fails startup
    console.error(`OTP provider "${configuredProvider}" failed, falling back to mock:`, error.message);
    const code = await mockSend(target);
    providerByTarget.set(target, "mock-fallback");
    return {
      provider: "mock-fallback",
      message: "OTP generated (fallback mode)",
      debugCode: process.env.NODE_ENV === "production" ? undefined : code,
    };
  }
}

async function verifyOtp(target, code) {
  const provider = providerByTarget.get(target) || PROVIDER();

  if (provider === "twilio") {
    try {
      const isValid = await twilioVerify(target, code);
      if (isValid) {
        providerByTarget.delete(target);
      }
      return isValid;
    } catch {
      return false;
    }
  }

  // email and mock both use in-memory store
  const entry = otpStore.get(target);
  if (!entry) return false;

  const isExpired = Date.now() - entry.createdAt > 5 * 60 * 1000;
  if (isExpired) {
    otpStore.delete(target);
    return false;
  }

  const isValid = entry.code === code;
  if (isValid) {
    otpStore.delete(target);
    providerByTarget.delete(target);
  }
  return isValid;
}

module.exports = { sendOtp, verifyOtp };
