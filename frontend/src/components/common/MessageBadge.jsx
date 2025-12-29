import { useQuery } from '@tanstack/react-query';
import { FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { messageService } from '../../services/messageService';

const MessageBadge = () => {
  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => messageService.getUnreadCount(),
    refetchInterval: 5000 // Refresh mỗi 5 giây
  });

  const unreadCount = data?.data?.unreadCount || 0;

  return (
    <Link
      to="/messages"
      className="relative p-2 text-primary-700 hover:text-primary-900 transition-colors"
      title="Tin nhắn"
    >
      <FiMessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default MessageBadge;
