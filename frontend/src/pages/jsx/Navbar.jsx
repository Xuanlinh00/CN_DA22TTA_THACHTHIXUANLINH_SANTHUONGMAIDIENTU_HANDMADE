import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Handmade Shop</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Trang chủ</Link></li>
        <li><Link to="/products">Sản phẩm</Link></li>
        <li><Link to="/cart">Giỏ hàng</Link></li>
        <li><Link to="/orders">Đơn hàng</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/vendor/dashboard">Vendor</Link></li>
        <li><Link to="/admin/dashboard">Admin</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
