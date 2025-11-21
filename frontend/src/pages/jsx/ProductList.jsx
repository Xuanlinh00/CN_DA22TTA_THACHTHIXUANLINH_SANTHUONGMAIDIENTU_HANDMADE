import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Gọi API lấy danh sách sản phẩm
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="productlist-container">
      <h1 className="productlist-title">Danh sách sản phẩm</h1>
      {products.length === 0 ? (
        <p className="empty-msg">Chưa có sản phẩm nào</p>
      ) : (
        <div className="productlist-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.image} alt={product.name} className="product-img" />
              <h3>{product.name}</h3>
              <p>{product.price} VND</p>
              <button className="buy-btn">Xem chi tiết</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
