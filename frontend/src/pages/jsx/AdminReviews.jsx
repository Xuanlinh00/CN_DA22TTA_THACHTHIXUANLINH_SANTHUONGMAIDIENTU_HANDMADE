import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";
import toast from "react-hot-toast";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/api/reviews");
      setReviews(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách đánh giá:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/reviews/${id}`, { status });
      toast.success("Cập nhật trạng thái đánh giá thành công");
      setReviews(reviews.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá đánh giá này?")) return;
    try {
      await api.delete(`/api/reviews/${id}`);
      toast.success("Xoá đánh giá thành công");
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xoá đánh giá");
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải đánh giá...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Quản lý đánh giá</h1>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Sản phẩm/Gian hàng</th>
                <th className="px-4 py-3 text-left">Nội dung</th>
                <th className="px-4 py-3 text-left">Sao</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">{r.user?.name}</td>
                  <td className="px-4 py-3">{r.product?.name || r.shop?.shopName}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{r.comment}</td>
                  <td className="px-4 py-3">{r.rating} ⭐</td>
                  <td className="px-4 py-3">{r.status || "Chưa duyệt"}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <select
                      value={r.status || "Chưa duyệt"}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Chưa duyệt">Chưa duyệt</option>
                      <option value="Đã duyệt">Đã duyệt</option>
                      <option value="Ẩn">Ẩn</option>
                    </select>
                    <button
                      onClick={() => deleteReview(r._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    Không có đánh giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default AdminReviews;
