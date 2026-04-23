function buildOrderMessage(order) {
  const lines = order.items.map(
    (item) => `- ${item.name} x${item.quantity} (Rs ${item.lineTotal})`
  );

  return [
    "New order received - Radha Krishan Studio",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Address: ${order.addressLine}, ${order.city}, ${order.state} - ${order.pincode}`,
    "Items:",
    ...lines,
    `Total: Rs ${order.pricing.total}`,
  ].join("\n");
}

async function sendAdminOrderAlert(order) {
  const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || "";
  const message = buildOrderMessage(order);

  return {
    delivered: false,
    channel: "whatsapp-sandbox-simulated",
    adminNumber,
    message,
  };
}

function buildQuickOrderLink(product, qty = 1) {
  const text = `Namaste, mujhe ye order karna hai: ${product.name} (${product.category}) x${qty}. Price: Rs ${product.price}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

module.exports = { sendAdminOrderAlert, buildQuickOrderLink };
