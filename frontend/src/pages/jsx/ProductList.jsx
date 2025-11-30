import React, { useEffect, useState } from "react";
import "../css/ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="product-list-container">
      <h2 className="page-title">Danh Sách Sản Phẩm</h2>
      <div className="products-grid">
        {products.map((p) => (
          <div className="product-card" key={p._id}>
            <div className="product-image">
              <img src={p.image} alt={p.name} />
              {p.isHot && <span className="product-badge">Hot</span>}
            </div>
            <div className="product-info">
              <h3 className="product-title">{p.name}</h3>
              <div className="product-price">{p.price}đ</div>
              <div className="product-actions">
                <a href={`/product/${p._id}`} className="btn-orange">Xem Chi Tiết</a>
                <button className="btn-cart">Thêm vào giỏ</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
