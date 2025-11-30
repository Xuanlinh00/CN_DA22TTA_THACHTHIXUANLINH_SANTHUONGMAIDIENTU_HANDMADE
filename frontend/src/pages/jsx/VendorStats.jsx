import React, { useEffect, useState } from "react";
import LayoutVendor from "../../components/jsx/LayoutVendor";

const VendorStats = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0 });

  useEffect(() => {
    fetch("http://localhost:5000/api/vendor/stats")
      .then(res => res.json())
      .then(data => { if (data.success) setStats(data.data); });
  }, []);

  return (
    <LayoutVendor>
      <h2>📊 Thống kê</h2>
      <p>Tổng doanh thu: {stats.revenue}đ</p>
      <p>Tổng đơn hàng: {stats.orders}</p>
    </LayoutVendor>
  );
};

export default VendorStats;
