import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-[#FF6B35] text-2xl font-bold">Craftify</span>
          <span className="text-[#2D1E1E] font-medium">Handmade</span>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className="hover:text-[#FF6B35]">Trang chủ</NavLink>
          <NavLink to="/categories" className="hover:text-[#FF6B35]">Danh mục</NavLink>
          <NavLink to="/shops" className="hover:text-[#FF6B35]">Cửa hàng</NavLink>
          <NavLink to="/about" className="hover:text-[#FF6B35]">Giới thiệu</NavLink>
          <NavLink to="/contact" className="hover:text-[#FF6B35]">Liên hệ</NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/wishlist" title="Yêu thích" className="hover:text-[#FF6B35]">
            ♡
          </Link>
          <Link to="/cart" title="Giỏ hàng" className="hover:text-[#FF6B35]">
            🛍
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="px-3 py-1 rounded border hover:bg-[#FFFCFA]">
                Đăng nhập
              </Link>
              <Link to="/register" className="px-3 py-1 rounded bg-[#FF6B35] text-white hover:bg-[#e55a2b]">
                Đăng ký
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm">Xin chào, {user.name}</span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded border hover:bg-[#FFFCFA]"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
