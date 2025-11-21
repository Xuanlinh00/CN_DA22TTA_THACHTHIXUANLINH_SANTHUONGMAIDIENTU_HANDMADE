const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    shopName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: [/.+\@.+\..+/, 'Email không hợp lệ'],
    },
    avatar: {
      type: String,
      default: '/images/default-shop-avatar.png',
    },
    coverImage: {
      type: String,
      default: '/images/default-shop-cover.png',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh theo tên
shopSchema.index({ shopName: 1 });

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;
