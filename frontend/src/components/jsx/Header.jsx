import React, { useContext, useState } from "react";
import "../css/Header.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <a href="/" className="logo">
          <i className="fas fa-gift"></i> CRAFTIFY
        </a>

        <div className="search-bar">
          <input type="text" placeholder="Tìm kiếm sản phẩm handmade, cửa hàng..." />
          <button><i className="fas fa-search"></i></button>
        </div>

        <div className="header-actions">
          <a href="/wishlist" title="Yêu thích"><i className="far fa-heart"></i></a>

          <div className="user-menu">
            <i
              className="far fa-user"
              onClick={() => setOpen(!open)}
              style={{ cursor: "pointer" }}
            ></i>
            {open && (
              <div className="dropdown">
                {user ? (
                  <>
                    <p className="dropdown-user">👤 {user.name} ({user.role})</p>
                    <a href="/profile">Trang cá nhân</a>
                    {user.role === "admin" && <a href="/admin">Quản trị</a>}
                    {user.role === "vendor" && <a href="/vendor">Người bán</a>}
                    <button onClick={handleLogout} className="btn-orange">Đăng xuất</button>
                  </>
                ) : (
                  <>
                    <a href="/login">Đăng nhập</a>
                    <a href="/register">Đăng ký</a>
                  </>
                )}
              </div>
            )}
          </div>

          <a href="/cart" title="Giỏ hàng">
            <i className="fas fa-shopping-bag"></i>
            <span className="cart-badge">3</span>
          </a>
        </div>
      </div>

      <nav className="nav-bar">
        <div className="nav-content">
          <a href="/">Trang Chủ</a>
          <a href="/products">Cửa Hàng</a>
          <a href="/products?new=true">Sản Phẩm Mới</a>
          <a href="/products?trend=true">Xu Hướng</a>
          <a href="/vendor">Bán Hàng</a>
          <a href="/contact">Hỗ Trợ</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
