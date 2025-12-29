import axios from '../utils/axios';

export const messageService = {
  // Gửi tin nhắn
  sendMessage: async (data) => {
    const response = await axios.post('/messages', data);
    return response.data;
  },

  // Lấy danh sách cuộc trò chuyện
  getConversations: async () => {
    const response = await axios.get('/messages/conversations');
    return response.data;
  },

  // Lấy tin nhắn trong cuộc trò chuyện
  getMessages: async (recipientId, params = {}) => {
    if (!recipientId) {
      throw new Error('recipientId là bắt buộc');
    }
    const response = await axios.get(`/messages/${recipientId}`, { params });
    return response.data;
  },

  // Đánh dấu tin nhắn là đã đọc
  markAsRead: async (messageId) => {
    const response = await axios.patch(`/messages/${messageId}/read`);
    return response.data;
  },

  // Xóa tin nhắn
  deleteMessage: async (messageId) => {
    const response = await axios.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Lấy số tin nhắn chưa đọc
  getUnreadCount: async () => {
    const response = await axios.get('/messages/unread-count');
    return response.data;
  }
};
