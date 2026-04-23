const express = require("express");
const {
  getMyAccount,
  updateMyProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/customerController");
const { protectCustomer } = require("../middleware/auth");

const router = express.Router();

router.use(protectCustomer);
router.get("/me", getMyAccount);
router.put("/me", updateMyProfile);
router.post("/me/addresses", addAddress);
router.put("/me/addresses/:addressId", updateAddress);
router.delete("/me/addresses/:addressId", deleteAddress);

module.exports = router;
