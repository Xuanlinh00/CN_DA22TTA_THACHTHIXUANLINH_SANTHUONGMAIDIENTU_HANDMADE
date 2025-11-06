const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        // Liên kết đến chủ shop (để biết ai sở hữu sản phẩm này)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        // Liên kết đến shop (để biết sản phẩm thuộc shop nào)
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Shop',
        },
        // Liên kết đến danh mục
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
        // (Chúng ta có thể thêm trường 'reviews' sau)
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;