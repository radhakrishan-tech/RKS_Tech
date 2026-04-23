function resolveDiscountPercent(totalQty) {
  if (totalQty >= 5) {
    return 10;
  }
  if (totalQty >= 3) {
    return 5;
  }
  return 0;
}

function resolveDeliveryCharge(pincode, orderAmount) {
  const baseCharge = Number(process.env.DELIVERY_CHARGE || 70);
  const normalizedPincode = String(pincode || "").trim();
  const amount = Number(orderAmount || 0);

  if (normalizedPincode === "123001" && amount > 499) {
    return 0;
  }

  return baseCharge;
}

async function buildPricing(items, pincode) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const discountPercent = resolveDiscountPercent(totalQty);
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const postDiscountAmount = Number((subtotal - discountAmount).toFixed(2));
  const deliveryCharge = resolveDeliveryCharge(pincode, postDiscountAmount);
  const total = Number((subtotal - discountAmount + deliveryCharge).toFixed(2));

  return {
    subtotal,
    discountPercent,
    discountAmount,
    deliveryCharge,
    total,
    savedAmount: discountAmount,
    deliveryRuleLabel:
      deliveryCharge === 0
        ? "Free delivery applied: pincode 123001 and order amount above Rs 499"
        : "Delivery charge applied: free delivery only for pincode 123001 above Rs 499",
    offerAppliedLabel:
      discountPercent > 0 ? `Offer Applied: ${discountPercent}% OFF` : "No offer applied",
  };
}

module.exports = { buildPricing, resolveDiscountPercent };
