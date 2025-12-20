import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingBag, FiSettings, FiTrendingUp } from 'react-icons/fi';

const ShopLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/shop-dashboard',
      icon: FiHome,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/shop-dashboard/products',
      icon: FiPackage,
      label: 'Sản phẩm'
    },
    {
      path: '/shop-dashboard/orders',
      icon: FiShoppingBag,
      label: 'Đơn hàng'
    },
    {
      path: '/shop-dashboard/settings',
      icon: FiSettings,
      label: 'Cài đặt'
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
                <FiTrendingUp className="mr-2" />
                Quản lý Shop
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

export default ShopLayout;