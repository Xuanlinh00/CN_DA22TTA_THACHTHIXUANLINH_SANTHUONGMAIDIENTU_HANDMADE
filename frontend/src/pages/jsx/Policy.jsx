// src/pages/jsx/Policy.jsx
import React from "react";

const Policy = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl font-bold text-center text-[#2D1E1E]">Chính sách & Quy định</h1>

      <div className="mt-12 space-y-12 prose prose-lg">
        <section>
          <h2 className="text-3xl font-bold text-[#FF6B35]">1. Chính sách đổi trả</h2>
          <p className="mt-4">Sản phẩm được đổi trả trong vòng 7 ngày nếu có lỗi từ nghệ nhân.</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-[#FF6B35]">2. Chính sách vận chuyển</h2>
          <p>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</p>
          <p>Thời gian giao hàng: 2-5 ngày làm việc</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-[#FF6B35]">3. Chính sách bảo mật</h2>
          <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo tiêu chuẩn cao nhất.</p>
        </section>
      </div>
    </div>
  );
};

export default Policy;