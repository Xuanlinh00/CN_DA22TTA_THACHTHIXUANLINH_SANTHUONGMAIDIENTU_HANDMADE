import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";
import toast from "react-hot-toast";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState({
    title: "",
    image: "",
    link: "",
    status: "Hiển thị",
  });

  const fetchBanners = async () => {
    try {
      const res = await api.get("/api/banners");
      setBanners(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách banner:", err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async () => {
    if (!newBanner.title.trim() || !newBanner.image.trim()) {
      return toast.error("Tiêu đề và ảnh không được để trống");
    }
    try {
      const res = await api.post("/api/banners", newBanner);
      toast.success("Thêm banner thành công");
      setBanners([...banners, res.data.data]);
      setNewBanner({ title: "", image: "", link: "", status: "Hiển thị" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi thêm banner");
    }
  };

  const updateBanner = async (id, field, value) => {
    try {
      await api.put(`/api/banners/${id}`, { [field]: value });
      toast.success("Cập nhật banner thành công");
      setBanners(banners.map(b => b._id === id ? { ...b, [field]: value } : b));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật banner");
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá banner này?")) return;
    try {
      await api.delete(`/api/banners/${id}`);
      toast.success("Xoá banner thành công");
      setBanners(banners.filter(b => b._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xoá banner");
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải banner...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Quản lý banner</h1>

        {/* Form thêm banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Tiêu đề"
            value={newBanner.title}
            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="URL ảnh"
            value={newBanner.image}
            onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Liên kết"
            value={newBanner.link}
            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <button
            onClick={addBanner}
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
          >
            Thêm
          </button>
        </div>

        {/* Danh sách banner */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Liên kết</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">
                    <img
                      src={b.image || "/assets/banner-placeholder.jpg"}
                      alt={b.title}
                      className="w-32 h-16 object-cover rounded border"
                    />
                  </td>
                  <td className="px-4 py-3">{b.title}</td>
                  <td className="px-4 py-3">{b.link}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status || "Ẩn"}
                      onChange={(e) => updateBanner(b._id, "status", e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Hiển thị">Hiển thị</option>
                      <option value="Ẩn">Ẩn</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteBanner(b._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Không có banner nào.
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

export default AdminBanners;
