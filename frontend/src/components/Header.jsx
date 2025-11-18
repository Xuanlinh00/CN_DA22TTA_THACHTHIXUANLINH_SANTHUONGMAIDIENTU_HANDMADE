import React from 'react';
import './Header.css'; // Import file CSS
// Chúng ta sẽ cần 'Link' để điều hướng trang
import { Link } from 'react-router-dom'; 

const Header = () => {
  return (
    <header className="header-container">
      {/* Phần Logo */}
      <div className="logo">
        <Link to="/">Handmade Heaven</Link>
      </div>

      {/* Phần Điều hướng chính (Giống mẫu) */}
      <nav className="main-nav">
        <ul>
          <li><Link to="/">TRANG CHỦ</Link></li>
          <li><Link to="/products">THỜI TRANG & PHỤ KIỆN</Link></li>
          <li><Link to="/shops">CHĂM SÓC TN</Link></li>
        </ul>
      </nav>

      {/* Phần Hành động (Tìm kiếm, Giỏ hàng, Đăng nhập) */}
      <div className="user-actions">
        <button>🔍</button> {/* Nút Tìm kiếm */}
        <Link to="/cart">🛒</Link> {/* Giỏ hàng */}
        <Link to="/login">👤</Link> {/* Đăng nhập */}
      </div>
    </header>
  );
};

export default Header;