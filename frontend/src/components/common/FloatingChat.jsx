import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMessageCircle, FiX, FiSend, FiChevronDown } from 'react-icons/fi';
import { messageService } from '../../services/messageService';
import { formatDateTime } from '../../utils/formatters';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Lấy danh sách cuộc trò chuyện
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations-floating'],
    queryFn: () => messageService.getConversations(),
    refetchInterval: 5000,
    enabled: isOpen
  });

  // Gửi tin nhắn
  const sendMutation = useMutation({
    mutationFn: (data) => messageService.sendMessage(data),
    onSuccess: () => {
      setMessageContent('');
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
      // Refresh tin nhắn mỗi 2 giây
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
  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent-600 text-white rounded-full shadow-lg hover:bg-accent-700 transition-all flex items-center justify-center z-40 hover:scale-110"
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
      <div className="flex items-center justify-between p-4 border-b border-primary-200 bg-accent-600 text-white rounded-t-lg">
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
          <div className="flex items-center justify-between p-3 border-b border-primary-200">
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

          {/* Messages */}
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

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-primary-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="px-3 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 flex items-center"
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
