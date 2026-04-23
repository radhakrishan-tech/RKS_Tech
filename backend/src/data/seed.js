require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const DeliveryZone = require("../models/DeliveryZone");
const { connectDB } = require("../config/db");

const seedProducts = [
  { name: "Cotton Breeze Kurti", category: "Kurti", price: 899, discountPrice: 749, stock: 18, tags: ["cotton", "daily wear"], isSummerFriendly: true },
  { name: "Royal Indigo Kurti", category: "Kurti", price: 1199, discountPrice: 999, stock: 12, tags: ["festival", "printed"], isSummerFriendly: true },
  { name: "Rosewood Straight Kurti", category: "Kurti", price: 1099, discountPrice: 899, stock: 9, tags: ["office", "elegant"], isSummerFriendly: false },
  { name: "Sunset Block Dupatta", category: "Dupatta", price: 699, discountPrice: 549, stock: 20, tags: ["block print", "ethnic"], isSummerFriendly: true },
  { name: "Ikat Weave Dupatta", category: "Dupatta", price: 799, discountPrice: 649, stock: 16, tags: ["ikat", "soft"], isSummerFriendly: true },
  { name: "Classic Comfort Plazo", category: "Plazo", price: 899, discountPrice: 749, stock: 22, tags: ["stretch", "daily"], isSummerFriendly: true },
  { name: "CloudSoft Bath Towel", category: "Bath Towel", price: 499, discountPrice: 419, stock: 30, tags: ["absorbent", "premium cotton"], isSummerFriendly: true },
];

const products = seedProducts.map((item, index) => {
  const slug = item.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  return {
    ...item,
    slug,
    compareAtPrice: item.price,
    sku: `TEST-${String(index + 1).padStart(3, "0")}`,
    images: [`https://picsum.photos/seed/rks-${index + 1}/720/900`],
    description: `${item.name} test product for admin filter and search validation.`,
    active: true,
  };
});

const localPincodes = ["122001", "122002", "122003", "122004"];

async function seed() {
  try {
    await connectDB();
    await Product.deleteMany({});
    await DeliveryZone.deleteMany({});

    await Product.insertMany(products);
    await DeliveryZone.insertMany(localPincodes.map((pincode) => ({ pincode, isLocal: true })));

    console.log("Seed completed");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
