import React from "react";
import "../css/ProductCard.css";

const ProductCard = ({ product, onWishlist }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="product-badge">Hot</span>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price">{product.price}đ</div>
        <button 
          className="btn-orange" 
          onClick={() => onWishlist(product)}
        >
          ❤️ Yêu thích
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
