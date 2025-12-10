// src/pages/jsx/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        const data = res.data.data; // ✅ lấy đúng field
        setProduct(data);
        setMainImage(data.images?.[0] || "/placeholder.jpg");

        // Lấy sản phẩm liên quan
        const relatedRes = await api.get(`/api/products?shop=${data.shop._id}&limit=8`);
        const relatedData = relatedRes.data.data || [];
        setRelatedProducts(relatedData.filter((p) => p._id !== data._id).slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post("/api/cart/add", { productId: id, quantity }); // ✅ đúng endpoint
      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      alert("Không thể thêm vào giỏ hàng");
    }
  };

  if (loading || !product) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-[#FFFCFA]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Ảnh sản phẩm */}
        <div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img src={mainImage} alt={product.name} className="w-full h-96 object-cover" />
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            {product.images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb ${idx}`}
                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                  mainImage === img ? "border-[#FF6B35] shadow-md" : "border-gray-200"
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div>
          <h1 className="text-4xl font-bold text-[#2D1E1E]">{product.name}</h1>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-3xl font-bold text-[#FF6B35]">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            {product.oldPrice && (
              <span className="text-xl line-through text-gray-500">
                {product.oldPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Cửa hàng:</span>
            <Link
              to={`/shop/${product.shop._id}`}
              className="font-medium text-[#FF6B35] hover:underline"
            >
              {product.shop.shopName}
            </Link>
          </div>
          <p className="mt-6 text-[#2D1E1E] leading-relaxed">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-[#2D1E1E] rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-6 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <button
              onClick={addToCart}
              className="flex-1 bg-[#FF6B35] text-white font-bold py-4 rounded-lg hover:bg-[#e55a2b] transition shadow-lg"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Đánh giá */}
      <div className="mt-20 border-t pt-12">
        <h2 className="text-3xl font-bold text-[#2D1E1E] mb-8">Đánh giá sản phẩm</h2>
        {/* ... giữ nguyên form đánh giá */}
      </div>

      {/* Sản phẩm liên quan */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-[#2D1E1E] mb-8">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="bg-white rounded-xl shadow hover:shadow-xl transition group"
            >
              <img
                src={p.images?.[0] || "/placeholder.jpg"} // ✅ fallback
                alt={p.name}
                className="w-full h-56 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h3 className="font-medium text-[#2D1E1E] group-hover:text-[#FF6B35]">
                  {p.name}
                </h3>
                <p className="text-[#FF6B35] font-bold mt-1">
                  {p.price.toLocaleString("vi-VN")}₫
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
