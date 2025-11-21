import React from 'react';
import '../css/Policy.css';

const Policy = () => {
  return (
    <div className="policy-container">
      <h1 className="policy-title">Chính sách của Handmade Shop</h1>
      <div className="policy-section">
        <h2>1. Chính sách mua hàng</h2>
        <p>
          Khách hàng có thể đặt mua sản phẩm trực tuyến qua website. Mọi đơn hàng sẽ được xác nhận qua email hoặc điện thoại.
        </p>
      </div>

      <div className="policy-section">
        <h2>2. Chính sách giao hàng</h2>
        <p>
          Chúng tôi giao hàng toàn quốc trong vòng 3-5 ngày làm việc. Phí vận chuyển sẽ được tính tùy khu vực.
        </p>
      </div>

      <div className="policy-section">
        <h2>3. Chính sách đổi trả</h2>
        <p>
          Sản phẩm được phép đổi trả trong vòng 7 ngày kể từ khi nhận hàng nếu có lỗi từ nhà sản xuất.
        </p>
      </div>

      <div className="policy-section">
        <h2>4. Chính sách bảo hành</h2>
        <p>
          Một số sản phẩm handmade có chế độ bảo hành riêng. Vui lòng liên hệ bộ phận chăm sóc khách hàng để biết thêm chi tiết.
        </p>
      </div>

      <div className="policy-section">
        <h2>5. Chính sách bảo mật</h2>
        <p>
          Handmade Shop cam kết bảo mật thông tin cá nhân của khách hàng và không chia sẻ cho bên thứ ba.
        </p>
      </div>
    </div>
  );
};

export default Policy;
