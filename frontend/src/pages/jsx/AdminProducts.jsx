import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Xoá sản phẩm thành công");
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xoá sản phẩm");
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải sản phẩm...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2D1E1E]">Quản lý sản phẩm</h1>
          <Link
            to="/admin/products/create"
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
          >
            ➕ Thêm sản phẩm
          </Link>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left">Giá</th>
                <th className="px-4 py-3 text-left">Shop</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">
                    <img
                      src={p.images?.[0] || "/assets/sample-bag.jpg"}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.price?.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="px-4 py-3">{p.shop?.shopName}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <Link
                      to={`/admin/products/edit/${p._id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Không có sản phẩm nào.
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

export default AdminProducts;
