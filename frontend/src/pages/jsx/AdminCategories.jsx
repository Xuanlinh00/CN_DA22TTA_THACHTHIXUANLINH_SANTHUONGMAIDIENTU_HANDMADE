import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";
import toast from "react-hot-toast";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return toast.error("Tên danh mục không được để trống");
    try {
      const res = await api.post("/api/categories", { name: newCategory });
      toast.success("Thêm danh mục thành công");
      setCategories([...categories, res.data.data]);
      setNewCategory("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi thêm danh mục");
    }
  };

  const updateCategory = async (id, name) => {
    try {
      await api.put(`/api/categories/${id}`, { name });
      toast.success("Cập nhật danh mục thành công");
      setCategories(categories.map(c => c._id === id ? { ...c, name } : c));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật danh mục");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá danh mục này?")) return;
    try {
      await api.delete(`/api/categories/${id}`);
      toast.success("Xoá danh mục thành công");
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xoá danh mục");
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải danh mục...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Quản lý danh mục</h1>

        {/* Form thêm danh mục */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Tên danh mục mới"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            onClick={addCategory}
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
          >
            Thêm
          </button>
        </div>

        {/* Danh sách danh mục */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Tên danh mục</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCategory(c._id, e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteCategory(c._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center py-6 text-gray-500">
                    Không có danh mục nào.
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

export default AdminCategories;
