// src/pages/jsx/Contact.jsx
import React from "react";

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold text-center text-[#2D1E1E]">Liên hệ với Craftiey</h1>
      <p className="text-center mt-6 text-xl text-gray-700 max-w-3xl mx-auto">
        Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy gửi tin nhắn hoặc liên hệ qua các kênh dưới đây!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
        <div className="bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-8">Gửi tin nhắn cho chúng tôi</h2>
          <form className="space-y-6">
            <input placeholder="Họ tên" className="w-full p-4 border rounded-lg" required />
            <input type="email" placeholder="Email" className="w-full p-4 border rounded-lg" required />
            <input placeholder="Tiêu đề" className="w-full p-4 border rounded-lg" />
            <textarea rows="6" placeholder="Nội dung tin nhắn..." className="w-full p-4 border rounded-lg"></textarea>
            <button type="submit" className="w-full bg-[#FF6B35] text-white font-bold py-4 rounded-lg hover:bg-[#e55a2b]">
              Gửi tin nhắn
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow">
            <h3 className="text-xl font-bold">Thông tin liên hệ</h3>
            <div className="mt-6 space-y-4 text-lg">
              <p><strong>Email:</strong> support@craftiey.vn</p>
              <p><strong>Hotline:</strong> 1900.1234 (8h-22h)</p>
              <p><strong>Địa chỉ:</strong> 123 Đường Handmade, Q. Craft, TP. HCM</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <h3 className="text-xl font-bold mb-4">Thời gian làm việc</h3>
            <p>Thứ 2 - Thứ 6: 8:00 - 21:00</p>
            <p>Thứ 7, CN & Lễ: 9:00 - 20:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;