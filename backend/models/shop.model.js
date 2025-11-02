const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
    {
        // Liên kết đến user (chủ shop)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // 'User' là tên Model user của chúng ta
            unique: true, // Đảm bảo 1 user chỉ có 1 shop
        },
        shopName: {
            type: String,
            required: true,
            unique: true, // Tên shop không được trùng
        },
        description: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: '/images/default-shop.png', // Ảnh đại diện mặc định
        },
        // === THÊM TRƯỜNG MỚI THEO ĐỀ CƯƠNG ===
        status: {
            type: String,
            enum: ['pending', 'active', 'rejected'],
            default: 'pending', // Mặc định là 'chờ duyệt'
        },
        // ===================================
    },
    {
        timestamps: true,
    }
);

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;