import { useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

const ReviewForm = ({ item, orderId, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: () =>
      productService.addReview(item.product._id, {
        rating,
        comment,
        orderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      toast.success('Đánh giá thành công');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Đánh giá thất bại');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    reviewMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary-900">
            Đánh giá: {item.product?.name}
          </h3>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-900"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Đánh giá
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <FiStar
                    size={32}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-primary-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-primary-600 mt-1">
              {rating} / 5 sao
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Nhận xét
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-primary-300 text-primary-900 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={reviewMutation.isPending}
              className="flex-1 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50"
            >
              {reviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
