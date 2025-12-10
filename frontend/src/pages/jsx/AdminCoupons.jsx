import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";
import toast from "react-hot-toast";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: 0,
    expiry: "",
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/api/coupons");
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách mã giảm giá:", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const addCoupon = async () => {
    if (!newCoupon.code.trim()) return toast.error("Mã giảm giá không được để trống");
    try {
      const res = await api.post("/api/coupons", newCoupon);
      toast.success("Thêm mã giảm giá thành công");
      setCoupons([...coupons, res.data.data]);
      setNewCoupon({ code: "", discount: 0, expiry: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi thêm mã giảm giá");
    }
  };

  const updateCoupon = async (id, field, value) => {
    try {
      await api.put(`/api/coupons/${id}`, { [field]: value });
      toast.success("Cập nhật mã giảm giá thành công");
      setCoupons(coupons.map(c => c._id === id ? { ...c, [field]: value } : c));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật mã giảm giá");
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá mã giảm giá này?")) return;
    try {
      await api.delete(`/api/coupons/${id}`);
      toast.success("Xoá mã giảm giá thành công");
      setCoupons(coupons.filter(c => c._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xoá mã giảm giá");
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải mã giảm giá...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Quản lý mã giảm giá</h1>

        {/* Form thêm mã giảm giá */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Mã giảm giá"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Giảm (%)"
            value={newCoupon.discount}
            onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            value={newCoupon.expiry}
            onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <button
            onClick={addCoupon}
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
          >
            Thêm
          </button>
        </div>

        {/* Danh sách mã giảm giá */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Giảm (%)</th>
                <th className="px-4 py-3 text-left">Ngày hết hạn</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">{c.code}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={c.discount}
                      onChange={(e) => updateCoupon(c._id, "discount", Number(e.target.value))}
                      className="border rounded px-2 py-1 w-20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={c.expiry?.substring(0, 10)}
                      onChange={(e) => updateCoupon(c._id, "expiry", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteCoupon(c._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    Không có mã giảm giá nào.
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

export default AdminCoupons;
