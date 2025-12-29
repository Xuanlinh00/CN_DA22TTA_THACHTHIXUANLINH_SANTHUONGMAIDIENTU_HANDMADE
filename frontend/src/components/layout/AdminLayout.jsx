import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiShoppingBag, FiPackage, FiMessageCircle, FiGrid } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      icon: FiHome,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/users',
      icon: FiUsers,
      label: 'Người dùng'
    },
    {
      path: '/admin/shops',
      icon: MdStorefront,
      label: 'Cửa hàng'
    },
    {
      path: '/admin/products',
      icon: FiPackage,
      label: 'Sản phẩm'
    },
    {
      path: '/admin/orders',
      icon: FiShoppingBag,
      label: 'Đơn hàng'
    },
    {
      path: '/admin/categories',
      icon: FiGrid,
      label: 'Danh mục'
    },
    {
      path: '/admin/messages',
      icon: FiMessageCircle,
      label: 'Tin nhắn'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center">
                <FiHome className="mr-2" />
                Quản lý Admin
              </h2>
              
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path, item.exact);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-primary-700 text-white'
                          : 'text-primary-700 hover:bg-primary-100'
                      }`}
                    >
                      <Icon className="mr-3" size={20} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
