import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#2D1E1E] text-[#FFFCFA] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1 */}
        <div>
          <h4 className="text-xl font-bold mb-4 text-white">Craftify Handmade</h4>
          <p className="text-sm leading-relaxed">
            Sàn thương mại điện tử dành riêng cho sản phẩm handmade. Kết nối nghệ nhân và khách hàng yêu thích sự độc đáo.
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-xl font-bold mb-4 text-white">Liên kết nhanh</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-[#FF6B35]">Giới thiệu</Link></li>
            <li><Link to="/policy" className="hover:text-[#FF6B35]">Chính sách</Link></li>
            <li><Link to="/contact" className="hover:text-[#FF6B35]">Liên hệ</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-xl font-bold mb-4 text-white">Theo dõi chúng tôi</h4>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF6B35] text-white hover:bg-[#e55a2b]">F</a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF6B35] text-white hover:bg-[#e55a2b]">I</a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF6B35] text-white hover:bg-[#e55a2b]">T</a>
          </div>
        </div>
      </div>

      <div className="text-center border-t border-[#8C6E63] py-4 text-sm">
        © 2025 Craftify Handmade. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
