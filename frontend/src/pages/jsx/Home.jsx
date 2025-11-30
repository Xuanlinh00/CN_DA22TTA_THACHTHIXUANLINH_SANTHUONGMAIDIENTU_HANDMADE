import React, { useEffect, useState } from "react";
import Layout from "../../components/jsx/Layout";
import "../css/Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <Layout>
      <section className="hero">
        {/* Hero content như bạn đã viết */}
      </section>

      <section className="categories">
        {/* Categories như bạn đã viết */}
      </section>

      <section className="products">
        <div className="section-header">
          <span className="section-tag">Sản Phẩm</span>
          <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
        </div>
        <div className="products-grid">
          {products.map((p) => (
            <div className="product-card" key={p._id}>
              <div className="product-image">
                <img src={p.image} alt={p.name} />
                <span className="product-badge">Hot</span>
              </div>
              <div className="product-info">
                <h3 className="product-title">{p.name}</h3>
                <div className="product-price">{p.price}đ</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        {/* CTA như bạn đã viết */}
      </section>
    </Layout>
  );
};

export default Home;
