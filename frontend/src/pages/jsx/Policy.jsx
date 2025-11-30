import React from "react";
import "../css/Policy.css";

const Policy = () => {
  return (
    <div className="policy-container">
      <h2 className="page-title">Chính Sách & Điều Khoản</h2>

      <section className="policy-section">
        <h3>Chính Sách Bảo Mật</h3>
        <p>
          CRAFTIFY cam kết bảo mật thông tin cá nhân của khách hàng. 
          Dữ liệu sẽ chỉ được sử dụng cho mục đích giao dịch và chăm sóc khách hàng.
        </p>
      </section>

      <section className="policy-section">
        <h3>Điều Khoản Sử Dụng</h3>
        <p>
          Khi sử dụng dịch vụ của CRAFTIFY, bạn đồng ý tuân thủ các quy định về mua bán, 
          không đăng tải sản phẩm vi phạm pháp luật hoặc bản quyền.
        </p>
      </section>

      <section className="policy-section">
        <h3>Chính Sách Đổi Trả</h3>
        <p>
          Khách hàng có thể đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng, 
          với điều kiện sản phẩm còn nguyên vẹn và chưa qua sử dụng.
        </p>
      </section>
    </div>
  );
};

export default Policy;
