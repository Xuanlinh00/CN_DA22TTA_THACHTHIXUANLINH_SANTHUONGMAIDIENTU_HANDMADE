import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { MdStorefront, MdDashboard } from 'react-icons/md';
import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-800 flex items-center justify-center bg-white flex-shrink-0">
              <img 
                src="/LOGO.png" 
                alt="Craftify Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:inline text-2xl font-display font-bold text-primary-800">
              Craftify
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm handmade..."
                className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-primary-700 hover:text-primary-900 font-medium">
              Sản phẩm
            </Link>
            <Link to="/shops" className="text-primary-700 hover:text-primary-900 font-medium">
              Cửa hàng
            </Link>

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative text-primary-700 hover:text-primary-900">
                  <FiShoppingCart size={24} />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Link>

                {/* Dashboard Links */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-primary-700 hover:text-primary-900"
                  >
                    <MdDashboard size={20} />
                    <span>Admin</span>
                  </Link>
                )}

                {user?.role === 'shop_owner' && (
                  <Link
                    to="/shop-dashboard"
                    className="flex items-center space-x-1 text-primary-700 hover:text-primary-900"
                  >
                    <MdStorefront size={20} />
                    <span>Shop</span>
                  </Link>
                )}

                {user?.role === 'user' && (
                  <Link
                    to="/create-shop"
                    className="flex items-center space-x-1 text-accent-600 hover:text-accent-700 font-medium"
                  >
                    <MdStorefront size={20} />
                    <span>Mở shop</span>
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-primary-700 hover:text-primary-900">
                    <FiUser size={20} />
                    <span className="font-medium">{user?.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-primary-700 hover:bg-primary-50"
                    >
                      Tài khoản
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-primary-700 hover:bg-primary-50"
                    >
                      Đơn hàng
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-primary-50 flex items-center space-x-2"
                    >
                      <FiLogOut />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-primary-700 hover:text-primary-900 font-medium">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary-700"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-200">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
              </div>
            </form>

            <div className="space-y-2">
              <Link
                to="/products"
                className="block py-2 text-primary-700 hover:text-primary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/shops"
                className="block py-2 text-primary-700 hover:text-primary-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Cửa hàng
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="block py-2 text-primary-700 hover:text-primary-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giỏ hàng ({getItemCount()})
                  </Link>
                  <Link
                    to="/profile"
                    className="block py-2 text-primary-700 hover:text-primary-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tài khoản
                  </Link>
                  <Link
                    to="/orders"
                    className="block py-2 text-primary-700 hover:text-primary-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block py-2 text-primary-700 hover:text-primary-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === 'shop_owner' && (
                    <Link
                      to="/shop-dashboard"
                      className="block py-2 text-primary-700 hover:text-primary-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Shop Dashboard
                    </Link>
                  )}
                  {user?.role === 'user' && (
                    <Link
                      to="/create-shop"
                      className="block py-2 text-accent-600 hover:text-accent-700 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🏪 Mở shop của bạn
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-red-600"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-primary-700 hover:text-primary-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 text-primary-700 hover:text-primary-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
