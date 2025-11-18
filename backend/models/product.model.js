const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Shop',
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Category',
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        // === THÊM TỪ ERD (Handmadeshop.png) ===
        material: { 
            type: String 
        },
        // ===================================
        image: {
            type: String,
            required: true,
            default: '/images/default-product.png',
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        stockQuantity: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;