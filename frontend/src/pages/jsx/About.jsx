import React from 'react';
import '../css/About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">Giới thiệu Handmade Shop</h1>
      <div className="about-content">
        <div className="about-text">
          <p>
            Handmade Shop được thành lập với mong muốn mang đến cho khách hàng những sản phẩm thủ công tinh tế,
            độc đáo và mang đậm dấu ấn cá nhân. Chúng tôi tin rằng mỗi sản phẩm handmade đều chứa đựng tình cảm
            và sự sáng tạo của người nghệ nhân.
          </p>
          <p>
            Sứ mệnh của chúng tôi là kết nối những người yêu thích đồ thủ công với các nghệ nhân tài năng,
            đồng thời tạo ra một cộng đồng nơi giá trị truyền thống và sự sáng tạo hiện đại được hòa quyện.
          </p>
          <p>
            Hãy cùng chúng tôi lan tỏa tình yêu dành cho những sản phẩm thủ công và tạo nên phong cách sống
            ấm áp, gần gũi và đầy cảm hứng.
          </p>
        </div>
        <div className="about-image">
          <img src="/images/about-main.jpg" alt="Handmade Shop" />
        </div>
      </div>

      <div className="about-values">
        <h2 className="values-title">Giá trị cốt lõi</h2>
        <ul>
          <li>✨ Sáng tạo và độc đáo</li>
          <li>🤝 Kết nối cộng đồng</li>
          <li>🌱 Bền vững và thân thiện môi trường</li>
          <li>❤️ Tình yêu và tâm huyết trong từng sản phẩm</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
