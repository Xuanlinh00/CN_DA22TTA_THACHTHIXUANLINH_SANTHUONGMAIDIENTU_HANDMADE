import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSend, FiX, FiSearch } from 'react-icons/fi';
import { messageService } from '../../services/messageService';
import { formatDateTime } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import ShopLayout from '../../components/layout/ShopLayout';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

// Helper function để xử lý URL hình ảnh
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-product.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
  return `${baseUrl}${imagePath}`;
};

const ShopMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Lấy danh sách cuộc trò chuyện
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['shop-conversations'],
    queryFn: () => messageService.getConversations(),
    refetchInterval: 3000
  });

  // Lấy tin nhắn trong cuộc trò chuyện
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['shop-messages', selectedConversation?.userId],
    queryFn: () => messageService.getMessages(selectedConversation?.userId),
    enabled: !!selectedConversation?.userId,
    refetchInterval: 2000
  });

  // Gửi tin nhắn
  const sendMutation = useMutation({
    mutationFn: (data) => messageService.sendMessage(data),
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries(['shop-messages', selectedConversation?.userId]);
      queryClient.invalidateQueries(['shop-conversations']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gửi tin nhắn thất bại');
    }
  });

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.data]);

  // Cập nhật sản phẩm khi có tin nhắn mới
  useEffect(() => {
    if (messagesData?.data && messagesData.data.length > 0) {
      const productMsg = messagesData.data.find(msg => msg.product);
      if (productMsg?.product) {
        setCurrentProduct(productMsg.product);
      }
    }
  }, [messagesData?.data]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      toast.error('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    sendMutation.mutate({
      recipientId: selectedConversation.userId,
      content: messageContent
    });
  };

  const conversations = conversationsData?.data || [];
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const messages = messagesData?.data || [];

  if (conversationsLoading) return <Loading fullScreen />;

  return (
    <ShopLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Danh sách cuộc trò chuyện */}
        <div className="card p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-primary-900 mb-4">Tin nhắn</h2>
          
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-primary-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-primary-600">
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedConversation?.userId === conv.userId
                      ? 'bg-primary-100 border-l-4 border-primary-700'
                      : 'hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary-900 truncate">
                        {conv.user.name}
                      </p>
                      <p className="text-sm text-primary-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary-500 mt-1">
                    {formatDateTime(conv.lastMessageTime)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Khu vực chat */}
        {selectedConversation ? (
          <div className="lg:col-span-2 card p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-primary-200">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-primary-900">
                  {selectedConversation.user.name}
                </h2>
                <p className="text-sm text-primary-600">Khách hàng</p>
                {/* Hiển thị sản phẩm đang thảo luận */}
                {currentProduct && (
                  <div className="mt-2 p-2 bg-accent-50 rounded border border-accent-200 flex items-center gap-2">
                    {currentProduct.images?.[0] && (
                      <img
                        src={getImageUrl(currentProduct.images[0])}
                        alt={currentProduct.name}
                        className="w-8 h-8 object-cover rounded"
                        onError={(e) => {
                          e.target.src = '/default-product.jpg';
                        }}
                      />
                    )}
                    <p className="text-xs text-accent-700 font-semibold">
                      💬 Thảo luận về: <span className="text-accent-900">{currentProduct.name}</span>
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-primary-600 hover:text-primary-900"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Tin nhắn */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loading />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-primary-600">
                  <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isCurrentUserMessage = msg.sender._id === currentUser?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isCurrentUserMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className="max-w-md">
                        {/* Thông tin sản phẩm nếu có */}
                        {msg.product && (
                          <div className={`mb-2 border rounded-lg p-3 shadow-sm ${
                            isCurrentUserMessage
                              ? 'bg-accent-50 border-accent-200'
                              : 'bg-white border-primary-200'
                          }`}>
                            <div className="flex gap-3">
                              {msg.product.images?.[0] && (
                                <img
                                  src={getImageUrl(msg.product.images[0])}
                                  alt={msg.product.name}
                                  className="w-16 h-16 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = '/default-product.jpg';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold truncate text-sm ${
                                  isCurrentUserMessage
                                    ? 'text-accent-900'
                                    : 'text-primary-900'
                                }`}>
                                  {msg.product.name}
                                </h4>
                                <p className="text-accent-600 font-bold text-sm">
                                  {msg.product.price?.toLocaleString('vi-VN')} ₫
                                </p>
                                <p className={`text-xs mt-1 ${
                                  isCurrentUserMessage
                                    ? 'text-accent-700'
                                    : 'text-primary-600'
                                }`}>
                                  Tồn kho: {msg.product.stockQuantity}
                                </p>
                                {msg.product.material && (
                                  <p className={`text-xs ${
                                    isCurrentUserMessage
                                      ? 'text-accent-700'
                                      : 'text-primary-600'
                                  }`}>
                                    Chất liệu: {msg.product.material}
                                  </p>
                                )}
                                {msg.product.customizable && (
                                  <p className="text-xs text-accent-600 font-semibold">
                                    ✓ Có thể tùy chỉnh
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Tin nhắn */}
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isCurrentUserMessage
                              ? 'bg-accent-600 text-white'
                              : 'bg-primary-100 text-primary-900'
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            isCurrentUserMessage
                              ? 'text-accent-100'
                              : 'text-primary-600'
                          }`}>
                            {formatDateTime(msg.createdAt)}
                            {msg.isRead && isCurrentUserMessage && ' ✓✓'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-primary-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiSend size={18} />
                  Gửi
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 card p-4 flex items-center justify-center text-primary-600">
            <div className="text-center">
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
};

export default ShopMessages;
