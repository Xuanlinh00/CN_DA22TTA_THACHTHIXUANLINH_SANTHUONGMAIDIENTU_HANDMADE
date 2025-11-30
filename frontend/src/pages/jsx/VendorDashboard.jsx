import React, { useEffect, useState } from "react";
import LayoutVendor from "../../components/jsx/LayoutVendor"; // dùng layout riêng
import "../css/VendorDashboard.css";

const VendorDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", image: "" });

  useEffect(() => {
    fetch("http://localhost:5000/api/vendor/products")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/vendor/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Thêm sản phẩm thành công!");
          setProducts([...products, data.data]);
        }
      });
  };

  return (
    <LayoutVendor>
      <div className="vendor-dashboard">
        <h2 className="page-title">Quản Lý Người Bán</h2>

        <form onSubmit={handleSubmit} className="vendor-form">
          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Giá"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Link ảnh"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <button type="submit" className="btn-orange">Thêm Sản Phẩm</button>
        </form>

        <div className="products-grid">
          {products.map((p) => (
            <div className="product-card" key={p._id}>
              <img src={p.image} alt={p.name} />
              <h3>{p.name}</h3>
              <p>{p.price}đ</p>
            </div>
          ))}
        </div>
      </div>
    </LayoutVendor>
  );
};

export default VendorDashboard;
