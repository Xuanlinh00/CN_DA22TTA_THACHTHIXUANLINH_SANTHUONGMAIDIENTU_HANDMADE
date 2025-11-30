// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// import api from "../../utils/api";
// import "../css/ProductDetail.css";

// const ProductDetail = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [related, setRelated] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProductData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         // Lấy thông tin sản phẩm
//         const productRes = await api.get(`/api/products/${id}`);
//         if (productRes.data?.success) {
//           setProduct(productRes.data.data);
//         } else if (productRes.data) {
//           // Mock data từ api.js
//           setProduct(productRes.data);
//         }

//         // Lấy sản phẩm liên quan
//         const relatedRes = await api.get(`/api/products/related/${id}`);
//         if (relatedRes.data?.success) {
//           setRelated(relatedRes.data.data);
//         } else if (Array.isArray(relatedRes.data)) {
//           setRelated(relatedRes.data);
//         }
//       } catch (err) {
//         console.error("Lỗi khi tải sản phẩm:", err);
//         setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductData();
//   }, [id]);

//   // Hiển thị loading
//   if (loading) {
//     return (
//       <div className="product-detail-container">
//         <p style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
//           Đang tải sản phẩm...
//         </p>
//       </div>
//     );
//   }

//   // Hiển thị lỗi
//   if (error) {
//     return (
//       <div className="product-detail-container">
//         <p style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
//           {error}
//         </p>
//       </div>
//     );
//   }

//   // Không có sản phẩm
//   if (!product) {
//     return (
//       <div className="product-detail-container">
//         <p style={{ textAlign: 'center', padding: '50px' }}>
//           Không tìm thấy sản phẩm này.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="product-detail-container">
//       <div className="product-detail">
//         {/* Ảnh sản phẩm */}
//         <div className="product-images">
//           <img className="main-image" src={product.image} alt={product.name} />
//           {product.gallery && product.gallery.length > 0 && (
//             <div className="thumbnail-row">
//               {product.gallery.map((img, i) => (
//                 <img key={i} className="thumbnail" src={img} alt={`Ảnh ${i + 1}`} />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Thông tin sản phẩm */}
//         <div className="product-info">
//           <h2 className="product-title">{product.name}</h2>
//           <div className="product-meta">
//             <span className="product-price">{product.price?.toLocaleString('vi-VN')}đ</span>
//             {product.rating && (
//               <span className="product-rating">
//                 <i className="fas fa-star"></i> {product.rating}
//               </span>
//             )}
//             {product.sold && (
//               <span className="product-sold">{product.sold} đã bán</span>
//             )}
//           </div>
//           <p className="product-description">{product.description}</p>

//           {/* Chọn màu / size / số lượng */}
//           <div className="product-options">
//             {product.colors && product.colors.length > 0 && (
//               <>
//                 <label>Màu sắc:</label>
//                 <select>
//                   {product.colors.map((c, i) => (
//                     <option key={i}>{c}</option>
//                   ))}
//                 </select>
//               </>
//             )}

//             {product.sizes && product.sizes.length > 0 && (
//               <>
//                 <label>Kích thước:</label>
//                 <select>
//                   {product.sizes.map((s, i) => (
//                     <option key={i}>{s}</option>
//                   ))}
//                 </select>
//               </>
//             )}

//             <label>Số lượng:</label>
//             <input type="number" min="1" defaultValue="1" />
//           </div>

//           {/* Nút hành động */}
//           <div className="product-actions">
//             <button className="btn-orange">Thêm vào giỏ</button>
//             <button className="btn-buy">Mua ngay</button>
//           </div>
//         </div>
//       </div>

//       {/* Đánh giá sản phẩm */}
//       <div className="review-section">
//         <h3>Đánh Giá Sản Phẩm</h3>
//         <div className="review-summary">
//           <span className="rating-score">
//             <i className="fas fa-star"></i> {product.rating || 0} / 5
//           </span>
//           <span className="rating-count">
//             {product.reviews?.length || 0} đánh giá
//           </span>
//         </div>

//         {product.reviews && product.reviews.length > 0 ? (
//           <div className="review-list">
//             {product.reviews.map((r, i) => (
//               <div className="review-item" key={i}>
//                 <strong>{r.user}</strong>
//                 <span className="stars">{"⭐".repeat(r.rating)}</span>
//                 <p>{r.comment}</p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p style={{ fontStyle: 'italic', color: '#666' }}>
//             Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
//           </p>
//         )}

//         <form className="review-form" onSubmit={(e) => e.preventDefault()}>
//           <h4>Gửi đánh giá của bạn</h4>
//           <input type="text" placeholder="Tên của bạn" required />
//           <select>
//             <option value="5">5 sao</option>
//             <option value="4">4 sao</option>
//             <option value="3">3 sao</option>
//             <option value="2">2 sao</option>
//             <option value="1">1 sao</option>
//           </select>
//           <textarea placeholder="Nội dung đánh giá" required></textarea>
//           <button type="submit" className="btn-orange">Gửi đánh giá</button>
//         </form>
//       </div>

//       {/* Hỏi đáp khách hàng */}
//       <div className="qa-section">
//         <h3>Hỏi Đáp Về Sản Phẩm</h3>
        
//         {product.questions && product.questions.length > 0 ? (
//           <div className="qa-list">
//             {product.questions.map((q, i) => (
//               <div className="qa-item" key={i}>
//                 <p><strong>❓ {q.question}</strong></p>
//                 {q.answer ? (
//                   <p><strong>✅ Trả lời:</strong> {q.answer}</p>
//                 ) : (
//                   <p><em>Đang chờ phản hồi từ shop...</em></p>
//                 )}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p style={{ fontStyle: 'italic', color: '#666' }}>
//             Chưa có câu hỏi nào. Hãy đặt câu hỏi đầu tiên!
//           </p>
//         )}

//         <form className="qa-form" onSubmit={(e) => e.preventDefault()}>
//           <h4>Gửi câu hỏi về sản phẩm</h4>
//           <input type="text" placeholder="Tên của bạn" required />
//           <textarea placeholder="Câu hỏi của bạn" required></textarea>
//           <button type="submit" className="btn-orange">Gửi câu hỏi</button>
//         </form>
//       </div>

//       {/* Gợi ý sản phẩm cùng loại */}
//       {related && related.length > 0 && (
//         <div className="related-products">
//           <h3>Sản phẩm cùng loại</h3>
//           <div className="products-grid">
//             {related.map((p) => (
//               <div className="product-card" key={p._id}>
//                 <img src={p.image} alt={p.name} />
//                 <h4>{p.name}</h4>
//                 <p>{p.price?.toLocaleString('vi-VN')}đ</p>
//                 <a href={`/product/${p._id}`} className="btn-orange">Xem</a>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductDetail;

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../css/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ GỌI API VỚI CỔNG 8000
        const productRes = await fetch(`http://localhost:8000/api/products/${id}`);
        const productData = await productRes.json();
        
        if (productData.success) {
          setProduct(productData.data);
        }

        // Lấy sản phẩm liên quan
        const relatedRes = await fetch(`http://localhost:8000/api/products/related/${id}`);
        const relatedData = await relatedRes.json();
        
        if (relatedData.success) {
          setRelated(relatedData.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải sản phẩm. Vui lòng kiểm tra backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-container">
        <p style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          ⏳ Đang tải sản phẩm...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <p style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          ❌ {error}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <p style={{ textAlign: 'center', padding: '50px' }}>
          ❓ Không tìm thấy sản phẩm.
        </p>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        {/* Ảnh sản phẩm */}
        <div className="product-images">
          <img className="main-image" src={product.image} alt={product.name} />
          {product.gallery && product.gallery.length > 0 && (
            <div className="thumbnail-row">
              {product.gallery.map((img, i) => (
                <img key={i} className="thumbnail" src={img} alt={`Ảnh ${i + 1}`} />
              ))}
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="product-info">
          <h2 className="product-title">{product.name}</h2>
          <div className="product-meta">
            <span className="product-price">{product.price?.toLocaleString('vi-VN')}đ</span>
            {product.rating && (
              <span className="product-rating">
                <i className="fas fa-star"></i> {product.rating}
              </span>
            )}
            {product.sold && (
              <span className="product-sold">{product.sold} đã bán</span>
            )}
          </div>
          <p className="product-description">{product.description}</p>

          {/* Chọn màu / size / số lượng */}
          <div className="product-options">
            {product.colors && product.colors.length > 0 && (
              <>
                <label>Màu sắc:</label>
                <select>
                  {product.colors.map((c, i) => (
                    <option key={i}>{c}</option>
                  ))}
                </select>
              </>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <>
                <label>Kích thước:</label>
                <select>
                  {product.sizes.map((s, i) => (
                    <option key={i}>{s}</option>
                  ))}
                </select>
              </>
            )}

            <label>Số lượng:</label>
            <input type="number" min="1" defaultValue="1" />
          </div>

          {/* Nút hành động */}
          <div className="product-actions">
            <button className="btn-orange">Thêm vào giỏ</button>
            <button className="btn-buy">Mua ngay</button>
          </div>
        </div>
      </div>

      {/* Gợi ý sản phẩm cùng loại */}
      {related && related.length > 0 && (
        <div className="related-products">
          <h3>Sản phẩm cùng loại</h3>
          <div className="products-grid">
            {related.map((p) => (
              <div className="product-card" key={p._id}>
                <img src={p.image} alt={p.name} />
                <h4>{p.name}</h4>
                <p>{p.price?.toLocaleString('vi-VN')}đ</p>
                <Link to={`/product/${p._id}`} className="btn-orange">Xem</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

