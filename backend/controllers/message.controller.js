const Message = require('../models/message.model');
const User = require('../models/user.model');

// 1. Gửi tin nhắn
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, type = 'text', orderId, productId, shopId } = req.body;

    console.log('📨 Backend nhận tin nhắn:', { recipientId, content, productId, type });

    // Kiểm tra người gửi
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
    }

    // Không cho phép gửi tin nhắn cho chính mình
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể gửi tin nhắn cho chính mình' });
    }

    // Kiểm tra recipient tồn tại
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Người nhận không tồn tại' });
    }

    // Tạo tin nhắn
    const messageData = {
      sender: req.user._id,
      senderRole: req.user.role,
      recipient: recipientId,
      recipientRole: recipient.role,
      content,
      type,
      order: orderId,
      shop: shopId
    };
    
    // Chỉ thêm product nếu có productId
    if (productId) {
      messageData.product = productId;
    }
    
    const message = new Message(messageData);

    await message.save();
    
    // Populate dữ liệu
    await message.populate('sender', 'name avatar role');
    await message.populate('recipient', 'name avatar role');
    
    // Chỉ populate product nếu có productId
    if (message.product) {
      await message.populate({
        path: 'product',
        select: 'name price images description stockQuantity material customizable'
      });
    }

    console.log('✅ Tin nhắn đã lưu:', { id: message._id, product: message.product });
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Lấy danh sách cuộc trò chuyện
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy tin nhắn mới nhất từ mỗi cuộc trò chuyện
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          lastMessageSender: { $first: '$sender' }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar',
            role: '$user.role'
          },
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1
        }
      }
    ]);

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Lấy tin nhắn trong cuộc trò chuyện
const getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    // Kiểm tra recipientId hợp lệ
    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ID người nhận' });
    }

    // Lấy tin nhắn giữa 2 người
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .populate({
        path: 'product',
        select: 'name price images description stockQuantity material customizable'
      })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Đánh dấu tin nhắn là đã đọc (chỉ tin nhắn nhận được)
    await Message.updateMany(
      { sender: recipientId, recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ 
      success: true, 
      data: messages,
      pagination: { page, limit, total: messages.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Đánh dấu tin nhắn là đã đọc
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Xóa tin nhắn
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Tin nhắn không tồn tại' });
    }

    // Chỉ người gửi mới có thể xóa
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa tin nhắn này' });
    }

    await message.deleteOne();
    res.json({ success: true, message: 'Tin nhắn đã được xóa' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Lấy số tin nhắn chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  getUnreadCount
};
