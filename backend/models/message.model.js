const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Người gửi
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'shop_owner', 'admin'],
    required: true
  },

  // Người nhận
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientRole: {
    type: String,
    enum: ['user', 'shop_owner', 'admin'],
    required: true
  },

  // Nội dung tin nhắn
  content: {
    type: String,
    required: true,
    trim: true
  },

  // Liên kết với đơn hàng (nếu có)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

  // Liên kết với sản phẩm (nếu có)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },

  // Liên kết với shop (nếu có)
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },

  // Trạng thái đọc
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  // Attachment (nếu có)
  attachments: [{
    type: String, // URL của file
    name: String
  }],

  // Loại tin nhắn
  type: {
    type: String,
    enum: ['text', 'order_inquiry', 'product_inquiry', 'complaint', 'support'],
    default: 'text'
  }

}, { timestamps: true });

// Index để tìm kiếm nhanh
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
