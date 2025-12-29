import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-amber-800 to-orange-700 text-amber-100 mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-sans font-bold text-white mb-4">Craftify</h3>
            <p className="text-base text-amber-200 mb-4 leading-relaxed">
              Nền tảng mua bán đồ handmade uy tín, kết nối người thợ thủ công với khách hàng yêu thích sản phẩm độc đáo.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/xlinggggg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-amber-300 transition-colors"
                title="Facebook"
              >
                <FiFacebook size={24} />
              </a>
              <a 
                href="https://www.instagram.com/xlinhhhh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-amber-300 transition-colors"
                title="Instagram"
              >
                <FiInstagram size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-3 text-base">
              <li>
                <Link to="/products" className="hover:text-amber-300 transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-amber-300 transition-colors">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-amber-300 transition-colors">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-3 text-base">
              <li>
                <Link to="/help" className="hover:text-amber-300 transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-amber-300 transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-amber-300 transition-colors">
                  Đổi trả hàng
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-300 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Thông tin liên hệ</h4>
            <ul className="space-y-3 text-base">
              <li className="flex items-center space-x-3">
                <FiPhone size={20} />
                <a href="tel:0974706719" className="hover:text-amber-300 transition-colors">
                  0974706719
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail size={20} />
                <a href="mailto:xlinhhhh04@gmail.com" className="hover:text-amber-300 transition-colors">
                  xlinhhhh04@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-8">
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-white mb-2">
              Thạch Thị Xuân Linh
            </p>
            <p className="text-lg text-amber-200">
              DA22TTA - 110122013
            </p>
          </div>
          <div className="text-center text-base text-amber-300">
            <p>&copy; 2024 Craftify - Nền tảng handmade uy tín</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
