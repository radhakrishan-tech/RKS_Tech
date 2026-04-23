const { z } = require("zod");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPricing } = require("../services/pricingService");
const { sendAdminOrderAlert } = require("../services/whatsappService");

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().email().optional().or(z.literal("")),
  addressLine: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  codConfirmed: z.boolean(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ),
});

async function mapOrderItems(requestItems) {
  const ids = requestItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids }, active: true }).lean();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  return requestItems.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("One or more products are invalid");
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    return {
      product: product._id,
      name: product.name,
      category: product.category,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
    };
  });
}

const previewPricing = asyncHandler(async (req, res) => {
  const payload = z
    .object({
      pincode: z.string().min(4),
      items: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().min(1),
        })
      ),
    })
    .safeParse(req.body);

  if (!payload.success) {
    return res.status(400).json({ message: "Invalid request", errors: payload.error.issues });
  }

  const items = await mapOrderItems(payload.data.items);
  const pricing = await buildPricing(items, payload.data.pincode);

  return res.json({ pricing, items });
});

const placeOrder = asyncHandler(async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.issues });
  }

  if (!parsed.data.codConfirmed) {
    return res.status(400).json({ message: "Please confirm COD order before placing." });
  }

  const items = await mapOrderItems(parsed.data.items);
  const pricing = await buildPricing(items, parsed.data.pincode);

  const order = await Order.create({
    ...parsed.data,
    customerMobile: req.customer?.mobile || parsed.data.customerPhone,
    customerEmail: parsed.data.customerEmail || "",
    items,
    pricing,
  });

  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } }
      )
    )
  );

  const alertStatus = await sendAdminOrderAlert(order);

  return res.status(201).json({
    message: "Order placed successfully",
    orderId: order._id,
    pricing,
    alertStatus,
  });
});


const getOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json({
    orderId: order._id,
    status: order.status,
    placedAt: order.createdAt,
    customerName: order.customerName,
    items: order.items.map(i => ({ name: i.name, quantity: i.quantity })),
    total: order.pricing?.total,
    deliveryAddress: `${order.addressLine}, ${order.city}, ${order.state}, ${order.pincode}`,
    lastUpdated: order.updatedAt,
  });
});

module.exports = {
  previewPricing,
  placeOrder,
  getOrderStatus,
};
