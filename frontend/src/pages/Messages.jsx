import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { FiSend, FiX, FiSearch, FiMessageCircle } from 'react-icons/fi';
import { messageService } from '../services/messageService';
import { shopService } from '../services/shopService';
import { formatDateTime } from '../utils/formatters';
import Loading from '../components/common/Loading';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

// Helper function để xử lý URL hình ảnh
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-product.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
  return `${baseUrl}${imagePath}`;
};

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Lấy productId từ URL params
  const productId = searchParams.get('product');
  
  console.log('📍 URL params:', { shop: searchParams.get('shop'), product: productId });

  // Lấy danh sách cuộc trò chuyện
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
    refetchInterval: 3000 // Refresh mỗi 3 giây
  });

  // Lấy thông tin shop nếu có shop param
  const shopId = searchParams.get('shop');
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop-info', shopId],
    queryFn: () => shopService.getById(shopId),
    enabled: !!shopId,
  });

  // Nếu có shop param, tìm shop owner trong conversations hoặc tạo cuộc trò chuyện mới
  useEffect(() => {
    if (shopId && shopData?.data) {
      const shopOwner = shopData.data.owner;
      if (shopOwner) {
        // Tìm xem đã có cuộc trò chuyện với shop owner này chưa
        const existingConversation = conversationsData?.data?.find(conv => 
          conv.userId === shopOwner._id
        );
        
        if (existingConversation) {
          setSelectedConversation(existingConversation);
        } else {
          // Tạo cuộc trò chuyện mới (chưa lưu vào DB, chỉ hiển thị UI)
          setSelectedConversation({
            userId: shopOwner._id,
            user: shopOwner,
            lastMessage: '',
            lastMessageTime: new Date(),
            unreadCount: 0,
            productId: productId
          });
        }
      }
    }
  }, [shopId, shopData?.data, conversationsData?.data, productId]);

  // Lấy tin nhắn trong cuộc trò chuyện
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.userId],
    queryFn: () => messageService.getMessages(selectedConversation?.userId),
    enabled: !!selectedConversation?.userId,
    refetchInterval: 2000 // Refresh mỗi 2 giây
  });

  // Gửi tin nhắn
  const sendMutation = useMutation({
    mutationFn: (data) => messageService.sendMessage(data),
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries(['messages', selectedConversation?.userId]);
      queryClient.invalidateQueries(['conversations']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gửi tin nhắn thất bại');
    }
  });

  // Scroll to bottom khi có tin nhắn mới
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

    const recipientId = selectedConversation?.userId;
    if (!recipientId) {
      toast.error('Không tìm thấy người nhận');
      return;
    }

    // Sử dụng productId từ URL params hoặc từ selectedConversation
    const finalProductId = productId || selectedConversation?.productId;
    console.log('📤 Gửi tin nhắn với productId:', finalProductId);
    const payload = {
      recipientId,
      content: messageContent
    };
    
    // Chỉ gửi productId nếu có
    if (finalProductId) {
      payload.productId = finalProductId;
    }
    
    sendMutation.mutate(payload);
  };

  const conversations = conversationsData?.data || [];
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const messages = messagesData?.data || [];

  if (conversationsLoading || (shopId && shopLoading)) return <Loading fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Tin nhắn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Danh sách cuộc trò chuyện */}
        <div className="card p-4 flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-primary-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-primary-600">
                <FiMessageCircle className="mx-auto mb-2" size={32} />
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
                  {selectedConversation?.user.name}
                </h2>
                <p className="text-sm text-primary-600">
                  {selectedConversation?.user.role === 'shop_owner' ? 'Chủ cửa hàng' : 'Khách hàng'}
                </p>
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
                onClick={() => {
                  setSelectedConversation(null);
                }}
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
                  console.log('💬 Tin nhắn:', { id: msg._id, product: msg.product, productId: msg.product?._id });
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isCurrentUserMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-sm px-4 py-3 rounded-lg ${
                          isCurrentUserMessage
                            ? 'bg-accent-600 text-white'
                            : 'bg-primary-100 text-primary-900'
                        }`}
                      >
                        {/* Hiển thị thông tin sản phẩm nếu có */}
                        {msg.product && (
                          <div className={`mb-3 pb-3 border-b ${
                            isCurrentUserMessage
                              ? 'border-accent-500'
                              : 'border-primary-300'
                          }`}>
                            <div className="flex gap-2">
                              {msg.product.images && msg.product.images[0] && (
                                <img
                                  src={getImageUrl(msg.product.images[0])}
                                  alt={msg.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = '/default-product.jpg';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {msg.product.name}
                                </p>
                                <p className={`text-xs ${
                                  isCurrentUserMessage
                                    ? 'text-accent-100'
                                    : 'text-primary-600'
                                }`}>
                                  Giá: {msg.product.price?.toLocaleString('vi-VN')} đ
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Nội dung tin nhắn */}
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          isCurrentUserMessage
                            ? 'text-accent-100'
                            : 'text-primary-600'
                        }`}>
                          {formatDateTime(msg.createdAt)}
                          {msg.isRead && isCurrentUserMessage && ' ✓✓'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Luôn hiển thị */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-primary-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
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
              <FiMessageCircle className="mx-auto mb-4" size={48} />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
