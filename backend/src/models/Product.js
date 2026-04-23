const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

    category: {
      type: String,
      required: true,
      enum: ["Kurti", "Dupatta", "Plazo", "Bath Towel", "Face Towel"],
    },

    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    compareAtPrice: { type: Number, min: 0 },

    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true, uppercase: true },

    images: [{ type: String }],
    tags: [{ type: String }],

    isSummerFriendly: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0, min: 0 },

    description: { type: String, default: "" },

    sizes: [{ type: String, required: true }],

    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true }
      }
    ],

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },

    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// ✅ Virtual MUST be outside schema
productSchema.virtual("discountPercentage").get(function () {
  if (this.price && this.discountPrice && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

module.exports = mongoose.model("Product", productSchema);