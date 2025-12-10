// src/pages/jsx/About.jsx – BỐ CỤC ĐẸP LUNG LINH!!!
import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-6 py-16 max-w-5xl">
      <h1 className="text-5xl font-bold text-[#2D1E1E] text-center mb-12">Giới Thiệu Craftiey</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="order-2 md:order-1">
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Craftiey được thành lập với mong muốn mang đến cho khách hàng những sản phẩm thủ công tinh tế, độc đáo và mang đậm dấu ấn cá nhân. Chúng tôi tin rằng mỗi sản phẩm handmade đều chứa đựng tình cảm và sự sáng tạo của người nghệ nhân.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Sứ mệnh của chúng tôi là kết nối những người yêu thích đồ thủ công với các nghệ nhân tài năng, đồng thời tạo ra một cộng đồng nơi giá trị truyền thống và sự sáng tạo hiện đại được hòa quyện.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed">
            Hãy cùng chúng tôi lan tỏa tình yêu dành cho những sản phẩm thủ công và tạo nên phong cách sống ấm áp, gần gũi và đầy cảm hứng.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <img src="/images/about-main.jpg" alt="Handmade Shop" className="w-full h-96 object-cover rounded-3xl shadow-2xl" />
        </div>
      </div>

      <div className="bg-[#FFE8D6] p-10 rounded-3xl shadow-xl">
        <h2 className="text-4xl font-bold text-[#2D1E1E] text-center mb-10">Giá Trị Cốt Lõi</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xl text-gray-700">
          <li className="flex items-center gap-4">✨ Sáng tạo và độc đáo</li>
          <li className="flex items-center gap-4">🤝 Kết nối cộng đồng</li>
          <li className="flex items-center gap-4">🌱 Bền vững và thân thiện môi trường</li>
          <li className="flex items-center gap-4">❤️ Tình yêu và tâm huyết trong từng sản phẩm</li>
        </ul>
      </div>
    </div>
  );
};

export default About;