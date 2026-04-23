const express = require("express");
const {
  requestOtpController,
  verifyOtpController,
  adminLoginController,
} = require("../controllers/authController");

const router = express.Router();

router.post("/request-otp", requestOtpController);
router.post("/verify-otp", verifyOtpController);
router.post("/admin/login", adminLoginController);

module.exports = router;
