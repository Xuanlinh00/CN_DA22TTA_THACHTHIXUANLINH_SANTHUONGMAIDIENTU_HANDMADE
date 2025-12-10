import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.put(`/api/users/${id}`, { role });
      toast.success("Cập nhật quyền thành công");
      setUsers(users.map(u => u._id === id ? { ...u, role } : u));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật quyền");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá người dùng này?")) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success("Xoá người dùng thành công");
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xoá người dùng");
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải người dùng...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Quản lý người dùng</h1>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Quyền</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">Khách hàng</option>
                      <option value="vendor">Người bán</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    Không có người dùng nào.
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

export default AdminUsers;
