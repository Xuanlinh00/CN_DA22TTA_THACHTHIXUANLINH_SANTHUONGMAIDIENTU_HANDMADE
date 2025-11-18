const mongoose = require('mongoose');

// Schema con (subdocument) cho các món hàng (từ ORDER_ITEMS)
const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // Giá tại thời điểm mua
    subtotal: { type: Number, required: true },
});

// Schema chính cho Đơn hàng
const orderSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Khách hàng
        
        orderItems: [orderItemSchema], // (Từ bảng ORDER_ITEMS)

        shippingInfo: { // (Từ bảng SHIPPING_METHODS)
            provider: { type: String, required: true }, // Tên API Giao Hàng (ví dụ: GHTK)
            shippingFee: { type: Number, required: true, default: 0 },
        },
        
        paymentInfo: { // (Từ bảng PAYMENTS)
            method: { type: String, default: 'VNPAY' }, // (Đề cương yêu cầu VNPAY)
            status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
            paidAt: { type: Date }, 
        },
        
        totalPrice: { type: Number, required: true }, // (Tổng tiền hàng + phí ship)
        
        commissionInfo: { // (Từ bảng COMMISSION_TRACKING)
            commissionAmount: { type: Number, required: true, default: 0 },
            revenueAmount: { type: Number, required: true, default: 0 }, // Doanh thu của shop
            status: { type: String, enum: ['pending', 'paid_out'], default: 'pending' }
        },
        
        orderStatus: { // Trạng thái xử lý đơn (từ bảng ORDERS)
            type: String,
            enum: ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled'],
            default: 'pending_payment',
        },
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;