import React from 'react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3 className="footer-logo">Handmade Shop</h3>
        <p className="footer-text">
          Nơi kết nối những sản phẩm thủ công tinh tế và độc đáo.
        </p>
        <ul className="footer-links">
          <li><a href="/about">Giới thiệu</a></li>
          <li><a href="/contact">Liên hệ</a></li>
          <li><a href="/policy">Địa chỉ</a></li>
        </ul>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Handmade Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
