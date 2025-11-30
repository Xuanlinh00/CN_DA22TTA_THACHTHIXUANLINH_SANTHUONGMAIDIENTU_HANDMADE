import React, { useEffect, useState } from "react";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/users")
      .then(res => res.json())
      .then(data => { if (data.success) setUsers(data.data); });
  }, []);

  return (
    <LayoutAdmin>
      <h2>👥 Quản lý Người dùng</h2>
      <ul>
        {users.map(u => <li key={u._id}>{u.name} - {u.email}</li>)}
      </ul>
    </LayoutAdmin>
  );
};

export default AdminUsers;
