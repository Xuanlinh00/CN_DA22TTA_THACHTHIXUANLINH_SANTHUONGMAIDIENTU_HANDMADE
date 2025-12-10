import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";
import toast from "react-hot-toast";

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    try {
      const res = await api.get("/api/shops");
      setShops(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách gian hàng:", err);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/shops/${id}`, { status });
      toast.success("Cập nhật trạng thái gian hàng thành công");
      setShops(shops.map(s => s._id === id ? { ...s, status } : s));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const deleteShop = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá gian hàng này?")) return;
    try {
      await api.delete(`/api/shops/${id}`);
      toast.success("Xoá gian hàng thành công");
      setShops(shops.filter(s => s._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xoá gian hàng");
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải gian hàng...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Quản lý gian hàng</h1>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Tên gian hàng</th>
                <th className="px-4 py-3 text-left">Chủ shop</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <tr key={s._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">
                    <img
                      src={s.avatar || "/assets/shop-placeholder.jpg"}
                      alt={s.shopName}
                      className="w-16 h-16 object-cover rounded-full border-2 border-[#FF6B35]"
                    />
                  </td>
                  <td className="px-4 py-3">{s.shopName}</td>
                  <td className="px-4 py-3">{s.owner?.name} ({s.owner?.email})</td>
                  <td className="px-4 py-3">{s.status || "Chưa duyệt"}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <select
                      value={s.status || "Chưa duyệt"}
                      onChange={(e) => updateStatus(s._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Chưa duyệt">Chưa duyệt</option>
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Khoá">Khoá</option>
                    </select>
                    <button
                      onClick={() => deleteShop(s._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {shops.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Không có gian hàng nào.
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

export default AdminShops;
