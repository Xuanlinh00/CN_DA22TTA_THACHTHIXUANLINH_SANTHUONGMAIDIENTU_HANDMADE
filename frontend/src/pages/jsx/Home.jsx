import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Gọi API lấy danh sách sản phẩm
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-title">Sản phẩm nổi bật</h1>
      <div className="product-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} className="product-img" />
            <h3>{product.name}</h3>
            <p>{product.price} VND</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
