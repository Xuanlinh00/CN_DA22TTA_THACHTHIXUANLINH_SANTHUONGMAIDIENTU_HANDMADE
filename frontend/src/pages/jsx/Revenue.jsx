import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../css/Revenue.css';

const formatCurrency = (n) => (n || 0).toLocaleString('vi-VN') + ' VND';
const toISODate = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

const Revenue = ({ userRole, shopIdContext }) => {
  // userRole: 'admin' hoặc 'vendor'
  // shopIdContext: shopId của vendor đang đăng nhập (nếu có)

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState(toISODate(new Date(new Date().setDate(new Date().getDate() - 30))));
  const [toDate, setToDate] = useState(toISODate(new Date()));
  const [groupBy, setGroupBy] = useState('day');
  const [mode, setMode] = useState(userRole); // admin hoặc vendor
  const [shopId, setShopId] = useState(shopIdContext || 'all');

  useEffect(() => {
    setLoading(true);
    const endpoint = mode === 'admin' ? '/api/admin/orders' : '/api/vendor/orders';
    axios.get(endpoint)
      .then(res => setOrders(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [mode]);

  const filtered = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return orders.filter(o => {
      const d = new Date(o.createdAt);
      const inRange = d >= from && d <= to;
      const paid = (o.orderStatus || '').toLowerCase() === 'completed' || o.isPaid === true;
      const shopOk = mode === 'admin'
        ? (shopId === 'all' ? true : (o.shop?._id === shopId || o.shopId === shopId))
        : true; // vendor chỉ xem shop của mình
      return inRange && paid && shopOk;
    });
  }, [orders, fromDate, toDate, shopId, mode]);

  const summary = useMemo(() => {
    const totalRevenue = filtered.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
    const orderCount = filtered.length;
    const aov = orderCount ? totalRevenue / orderCount : 0;

    const productMap = new Map();
    filtered.forEach(o => {
      (o.orderItems || []).forEach(it => {
        const key = it.product?._id || it.productId || it._id;
        const name = it.product?.name || it.name || 'Sản phẩm';
        const revenue = (Number(it.price) || 0) * (Number(it.quantity) || 0);
        const prev = productMap.get(key) || { name, revenue: 0, quantity: 0 };
        productMap.set(key, { name, revenue: prev.revenue + revenue, quantity: prev.quantity + (Number(it.quantity) || 0) });
      });
    });
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return { totalRevenue, orderCount, aov, topProducts };
  }, [filtered]);

  const grouped = useMemo(() => {
    const bucket = {};
    filtered.forEach(o => {
      const d = new Date(o.createdAt);
      const key = groupBy === 'day'
        ? toISODate(d)
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      bucket[key] = (bucket[key] || 0) + (Number(o.totalPrice) || 0);
    });
    const keys = Object.keys(bucket).sort();
    return keys.map(k => ({ period: k, revenue: bucket[k] }));
  }, [filtered, groupBy]);

  return (
    <div className="revenue-container">
      <h1 className="revenue-title">Thống kê doanh thu</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Từ ngày</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Đến ngày</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Nhóm theo</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Ngày</option>
            <option value="month">Tháng</option>
          </select>
        </div>
        {mode === 'admin' && (
          <div className="filter-group">
            <label>Chế độ</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Tổng doanh thu</h3>
              <p className="summary-value">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div className="summary-card">
              <h3>Số đơn</h3>
              <p className="summary-value">{summary.orderCount}</p>
            </div>
            <div className="summary-card">
              <h3>AOV</h3>
              <p className="summary-value">{formatCurrency(summary.aov)}</p>
            </div>
          </div>

          <div className="trend-card">
            <h2>Doanh thu theo {groupBy === 'day' ? 'ngày' : 'tháng'}</h2>
            <div className="trend-grid">
              {grouped.map((g, idx) => (
                <div key={idx} className="trend-row">
                  <span className="period">{g.period}</span>
                  <div className="bar-wrap">
                    <div
                      className="bar"
                      style={{ width: `${Math.min(100, (g.revenue / (summary.totalRevenue || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="rev">{formatCurrency(g.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="top-products">
            <h2>Top sản phẩm</h2>
            {summary.topProducts.map((p, i) => (
              <div key={i} className="top-item">
                <span className="rank">#{i + 1}</span>
                <span className="pname">{p.name}</span>
                <span className="prevenue">{formatCurrency(p.revenue)}</span>
                <span className="pqty">{p.quantity} sp</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Revenue;
