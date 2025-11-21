import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ProductDetail.css';

const ProductDetail = ({ match }) => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const productId = match.params.id;

    // Gọi API lấy chi tiết sản phẩm
    axios.get(`/api/products/${productId}`)
      .then(res => {
        setProduct(res.data);
        setMainImage(res.data.images[0]); // ảnh chính
      })
      .catch(err => console.error(err));

    // Gọi API lấy sản phẩm liên quan
    axios.get(`/api/products/${productId}/related`)
      .then(res => setRelatedProducts(res.data))
      .catch(err => console.error(err));
  }, [match.params.id]);

  if (!product) return <p>Đang tải...</p>;

  return (
    <div className="detail-container">
      <div className="detail-main">
        {/* Bên trái: hình ảnh */}
        <div className="detail-images">
          <img src={mainImage} alt={product.name} className="main-img" />
          <div className="thumbs">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`thumb-${index}`}
                className={`thumb-img ${mainImage === img ? 'active' : ''}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Bên phải: thông tin sản phẩm */}
        <div className="detail-info">
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-price">{product.price} VND</p>
          <p className="detail-desc">{product.description}</p>
          <button className="add-cart-btn">Thêm vào giỏ hàng</button>
        </div>
      </div>

      {/* Phía dưới: sản phẩm liên quan */}
      <div className="related-section">
        <h2 className="related-title">Sản phẩm liên quan</h2>
        <div className="related-grid">
          {relatedProducts.map(rp => (
            <div key={rp._id} className="related-card">
              <img src={rp.image} alt={rp.name} className="related-img" />
              <h3>{rp.name}</h3>
              <p>{rp.price} VND</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
