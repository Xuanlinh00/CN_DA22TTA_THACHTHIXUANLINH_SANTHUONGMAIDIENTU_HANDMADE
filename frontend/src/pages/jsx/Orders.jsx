import React, { useState } from "react";
import Layout from "../../components/jsx/Layout";
import "../css/Orders.css";

const Orders = () => {
  const [orders] = useState([
    { id: "ORD001", date: "2025-11-30", total: 370000, status: "Đang xử lý" },
    { id: "ORD002", date: "2025-11-28", total: 120000, status: "Hoàn thành" },
  ]);

  return (
    <Layout>
      <section className="orders">
        <h2>📦 Đơn Hàng Của Tôi</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.date}</td>
                <td>{o.total}đ</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
};

export default Orders;
