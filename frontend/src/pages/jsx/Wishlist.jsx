import React, { useState } from "react";
import Layout from "../../components/jsx/Layout";
import ProductCard from "../../components/jsx/ProductCard";
import "../css/Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  const removeFromWishlist = (product) => {
    setWishlist(wishlist.filter(p => p._id !== product._id));
  };

  return (
    <Layout>
      <section className="wishlist">
        <div className="section-header">
          <span className="section-tag">Yêu Thích</span>
          <h2 className="section-title">Danh Sách Sản Phẩm Yêu Thích</h2>
        </div>
        <div className="wishlist-grid">
          {wishlist.length === 0 ? (
            <p>Chưa có sản phẩm nào trong danh sách yêu thích.</p>
          ) : (
            wishlist.map((p) => (
              <ProductCard 
                key={p._id} 
                product={p} 
                onWishlist={removeFromWishlist} 
              />
            ))
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;
