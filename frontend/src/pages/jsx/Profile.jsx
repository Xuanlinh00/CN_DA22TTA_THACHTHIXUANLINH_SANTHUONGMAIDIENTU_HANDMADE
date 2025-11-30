import React, { useEffect, useState } from "react";
import "../css/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", address: "" });

  useEffect(() => {
    fetch("http://localhost:5000/api/users/me")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
          setForm({
            name: data.data.name,
            email: data.data.email,
            address: data.data.address || "",
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Cập nhật hồ sơ thành công!");
          setUser(data.data);
        } else {
          alert("Có lỗi xảy ra khi cập nhật");
        }
      });
  };

  if (!user) return <p>Đang tải hồ sơ...</p>;

  return (
    <div className="profile-container">
      <h2 className="page-title">Hồ Sơ Cá Nhân</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <input
          type="text"
          placeholder="Tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <button type="submit" className="btn-orange">Cập Nhật</button>
      </form>
    </div>
  );
};

export default Profile;
