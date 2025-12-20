import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-amber-800 to-orange-700 text-amber-100 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-sans font-bold text-white mb-4">Craftify</h3>
            <p className="text-sm text-amber-200 mb-4">
              Nền tảng mua bán đồ handmade uy tín, kết nối người thợ thủ công với khách hàng yêu thích sản phẩm độc đáo.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-amber-300 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="hover:text-amber-300 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="hover:text-amber-300 transition-colors">
                <FiTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm">
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
                <Link to="/about" className="hover:text-amber-300 transition-colors">
                  Về chúng tôi
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
            <h4 className="font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
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
            <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <FiMapPin className="mt-1 flex-shrink-0" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail />
                <span>support@craftify.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-8 text-center text-sm text-amber-300">
          <p>&copy; Thạch Thị Xuân Linh - DA22TTA - 110122013</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
