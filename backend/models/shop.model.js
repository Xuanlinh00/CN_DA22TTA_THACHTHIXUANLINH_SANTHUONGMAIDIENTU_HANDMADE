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
        },
        description: {
            type: String,
            required: true,
        },
        // === THÊM TỪ ERD (Handmadeshop.png) ===
        address: { 
            type: String, 
            required: true 
        },
        phone: { 
            type: String, 
            required: true 
        },
        avatar: { // (Đã có trong code của bạn)
            type: String,
            default: '/images/default-shop-avatar.png', 
        },
        coverImage: { 
            type: String, 
            default: '/images/default-shop-cover.png' 
        },
        // ===================================
        status: { // (Đã có trong code của bạn)
            type: String,
            enum: ['pending', 'active', 'rejected'],
            default: 'pending', 
        },
    },
    {
        timestamps: true,
    }
);

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;