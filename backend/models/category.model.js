const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
      unique: true,
      minlength: [2, 'Tên danh mục phải có ít nhất 2 ký tự'],
      maxlength: [50, 'Tên danh mục không được vượt quá 50 ký tự'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true, // tự động thêm createdAt, updatedAt
  }
);

module.exports = mongoose.model('Category', categorySchema);
