import React from "react";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <p>&copy; 2025 CRAFTIFY - Sàn TMĐT Handmade Việt Nam</p>
        <div className="footer-links">
          <a href="/policy">Chính sách</a>
          <a href="/contact">Liên hệ</a>
          <a href="/about">Giới thiệu</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
