import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ✅ Sửa: Xóa FiPaperclip không được sử dụng
import { FiMessageCircle, FiX, FiSend, FiChevronDown, FiPaperclip } from 'react-icons/fi';
import { messageService } from '../../services/messageService';
import { productService } from '../../services/productService';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-product.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
  return `${baseUrl}${imagePath}`;
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [attachedProduct, setAttachedProduct] = useState(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  console.log('💬 FloatingChat rendered:', { isOpen, showProductSearch, selectedConversation: !!selectedConversation });

  // Lấy danh sách cuộc trò chuyện
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations-floating'],
    queryFn: () => messageService.getConversations(),
    refetchInterval: 5000,
    enabled: isOpen
  });

  // Tìm kiếm sản phẩm
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-search'],
    queryFn: () => productService.getAll({ limit: 100 }),
    enabled: showProductSearch,
    staleTime: 5 * 60 * 1000 // Cache 5 phút
  });

  useEffect(() => {
    console.log('📦 productsData:', { loaded: !!productsData?.data, count: productsData?.data?.length, isLoading: isLoadingProducts });
    if (productsData?.data && productSearch.length > 0) {
      const filtered = productsData.data.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      );
      console.log('🔍 Tìm kiếm sản phẩm:', { productSearch, total: productsData.data.length, filtered: filtered.length, results: filtered });
      setSearchResults(filtered);
    } else if (productsData?.data && productSearch.length === 0) {
      console.log('📦 Tất cả sản phẩm:', productsData.data.length);
      setSearchResults([]);
    }
  }, [productsData, productSearch, isLoadingProducts]);

  // Gửi tin nhắn
  const sendMutation = useMutation({
    mutationFn: (data) => messageService.sendMessage(data),
    onSuccess: () => {
      setMessageContent('');
      setAttachedProduct(null);
      loadMessages();
      queryClient.invalidateQueries(['conversations-floating']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gửi tin nhắn thất bại');
    }
  });

  // Load tin nhắn
  const loadMessages = async () => {
    if (!selectedConversation?.userId) return;
    try {
      setIsLoadingMessages(true);
      const response = await messageService.getMessages(selectedConversation.userId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Lỗi tải tin nhắn:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load tin nhắn khi chọn cuộc trò chuyện
  useEffect(() => {
    if (selectedConversation?.userId) {
      loadMessages();
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation?.userId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim() && !attachedProduct) {
      toast.error('Vui lòng nhập nội dung tin nhắn hoặc đính kèm sản phẩm');
      return;
    }

    const payload = {
      recipientId: selectedConversation.userId,
      content: messageContent || (attachedProduct ? `Xin hỏi về sản phẩm: ${attachedProduct.name}` : '')
    };

    if (attachedProduct) {
      payload.productId = attachedProduct._id;
    }

    sendMutation.mutate(payload);
  };

  const conversations = conversationsData?.data || [];
  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Nút chat nổi
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent-600 text-white rounded-full shadow-2xl hover:bg-accent-700 transition-all flex items-center justify-center z-50 hover:scale-110"
        title="Mở chat"
      >
        <div className="relative">
          <FiMessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-primary-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-200 bg-accent-600 text-white rounded-t-lg flex-shrink-0">
        <h3 className="font-semibold">Tin nhắn</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setSelectedConversation(null);
          }}
          className="text-white hover:bg-accent-700 p-1 rounded"
        >
          <FiX size={20} />
        </button>
      </div>

      {!selectedConversation ? (
        // Danh sách cuộc trò chuyện
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-primary-600">
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full text-left p-3 hover:bg-primary-50 rounded-lg transition-colors border border-primary-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary-900 truncate text-sm">
                        {conv.user.name}
                      </p>
                      <p className="text-xs text-primary-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-accent-600 text-white text-xs rounded-full flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Chat view
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-primary-200 flex-shrink-0">
            <button
              onClick={() => setSelectedConversation(null)}
              className="text-primary-600 hover:text-primary-900"
            >
              <FiChevronDown size={20} className="rotate-90" />
            </button>
            <h4 className="font-semibold text-primary-900 text-sm flex-1 text-center">
              {selectedConversation.user.name}
            </h4>
            <div className="w-5" />
          </div>

          {/* Main Content Area */}
          {!showProductSearch ? (
            // Messages view
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full text-primary-600 text-sm">
                  <p>Đang tải...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-primary-600 text-sm">
                  <p>Chưa có tin nhắn</p>
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
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          isCurrentUserMessage
                            ? 'bg-accent-600 text-white'
                            : 'bg-primary-100 text-primary-900'
                        }`}
                      >
                        {/* Hiển thị sản phẩm đính kèm */}
                        {msg.product && (
                          <div className={`mb-2 pb-2 border-b ${
                            isCurrentUserMessage
                              ? 'border-accent-500'
                              : 'border-primary-300'
                          }`}>
                            <div className="flex gap-2">
                              {msg.product.images?.[0] && (
                                <img
                                  src={getImageUrl(msg.product.images[0])}
                                  alt={msg.product.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = '/default-product.jpg';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs truncate">
                                  {msg.product.name}
                                </p>
                                <p className={`text-xs ${
                                  isCurrentUserMessage
                                    ? 'text-accent-100'
                                    : 'text-primary-600'
                                }`}>
                                  {formatCurrency(msg.product.price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
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
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            // Product Search view
            <div className="flex-1 flex flex-col overflow-hidden bg-primary-50 p-3">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-2 py-1 border border-primary-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2 flex-shrink-0"
                autoFocus
              />
              <div className="flex-1 overflow-y-auto space-y-1">
                {productSearch.length === 0 && (
                  <p className="text-xs text-primary-600 text-center py-4">Nhập tên sản phẩm để tìm kiếm</p>
                )}
                {productSearch.length > 0 && searchResults.length === 0 && (
                  <p className="text-xs text-primary-600 text-center py-4">Không tìm thấy sản phẩm</p>
                )}
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => {
                      setAttachedProduct(product);
                      setShowProductSearch(false);
                      setProductSearch('');
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2 hover:bg-primary-100 rounded text-xs border border-primary-200 flex items-center gap-2 bg-white"
                  >
                    {product.images?.[0] && (
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-6 h-6 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          e.target.src = '/default-product.jpg';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-primary-900">
                        {product.name}
                      </p>
                      <p className="text-primary-600 text-xs">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attached Product Preview */}
          {attachedProduct && (
            <div className="px-3 py-2 bg-accent-50 border-t border-accent-200 flex items-center gap-2 flex-shrink-0">
              {attachedProduct.images?.[0] && (
                <img
                  src={getImageUrl(attachedProduct.images[0])}
                  alt={attachedProduct.name}
                  className="w-8 h-8 object-cover rounded"
                  onError={(e) => {
                    e.target.src = '/default-product.jpg';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-accent-900 truncate">
                  {attachedProduct.name}
                </p>
                <p className="text-xs text-accent-700">
                  {formatCurrency(attachedProduct.price)}
                </p>
              </div>
              <button
                onClick={() => setAttachedProduct(null)}
                className="text-accent-600 hover:text-accent-900 flex-shrink-0"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-primary-200 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowProductSearch(!showProductSearch)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center flex-shrink-0 ${
                  showProductSearch
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                }`}
                title="Đính kèm sản phẩm"
              >
                <FiPaperclip size={16} />
              </button>
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="px-3 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 flex items-center flex-shrink-0"
              >
                <FiSend size={16} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default FloatingChat;
