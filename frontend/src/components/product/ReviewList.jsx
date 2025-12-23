import { FiStar } from 'react-icons/fi';
import { formatDateTime } from '../../utils/formatters';

const ReviewList = ({ reviews = [] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-primary-600">
        Chưa có đánh giá nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, idx) => (
        <div key={idx} className="border-b border-primary-200 pb-4 last:border-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-primary-900">{review.name}</p>
              <p className="text-xs text-primary-600">
                {formatDateTime(review.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={16}
                  className={
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-primary-300'
                  }
                />
              ))}
              <span className="text-sm font-medium text-primary-900 ml-1">
                {review.rating}
              </span>
            </div>
          </div>
          <p className="text-primary-700 text-sm">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
