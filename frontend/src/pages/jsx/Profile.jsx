import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Gọi API lấy thông tin user
    axios.get('/api/users/profile')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gọi API cập nhật profile
    axios.put('/api/users/profile', profile)
      .then(() => alert('Cập nhật thành công!'))
      .catch(err => console.error(err));
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Thông tin cá nhân</h1>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Họ và tên</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          required
        />

        <label>Số điện thoại</label>
        <input
          type="text"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
        />

        <button type="submit" className="profile-btn">Cập nhật</button>
      </form>
    </div>
  );
};

export default Profile;
