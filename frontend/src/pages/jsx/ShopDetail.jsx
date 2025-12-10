import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

const ShopDetail = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await api.get(`/api/shops/${id}`);
        setShop(res.data.data);

        const prodRes = await api.get(`/api/products?shop=${id}&limit=12`);
        setProducts(prodRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchShop();
  }, [id]);

  if (!shop) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-12 bg-[#FFFCFA]">
      {/* Banner gian hàng */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src={shop.avatar || "/assets/shop-avatar.jpg"}
            alt={shop.shopName}
            className="w-40 h-40 rounded-full object-cover border-4 border-[#FF6B35]"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold text-[#2D1E1E]">{shop.shopName}</h1>
            <p className="text-gray-600 mt-2">{shop.bio || "Gian hàng handmade chất lượng cao"}</p>
            <div className="flex gap-6 mt-4 justify-center md:justify-start">
              <div>
                <p className="text-2xl font-bold text-[#FF6B35]">{products.length}</p>
                <p className="text-sm">Sản phẩm</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#FF6B35]">4.9 ★</p>
                <p className="text-sm">Đánh giá</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#FF6B35]">2.1k</p>
                <p className="text-sm">Người theo dõi</p>
              </div>
            </div>
            <button className="mt-6 bg-[#FF6B35] text-white px-8 py-3 rounded-lg hover:bg-[#e55a2b]">
              Theo dõi gian hàng
            </button>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {["products", "about", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium text-lg border-b-4 transition ${
                activeTab === tab
                  ? "border-[#FF6B35] text-[#FF6B35]"
                  : "border-transparent text-gray-600"
              }`}
            >
              {tab === "products" && "Sản phẩm"}
              {tab === "about" && "Giới thiệu"}
              {tab === "reviews" && "Đánh giá"}
            </button>
          ))}
        </div>
      </div>

      {/* Nội dung tab */}
      {activeTab === "products" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="bg-white rounded-xl shadow hover:shadow-xl transition group"
            >
              <img
                src={p.images?.[0] || "/placeholder.jpg"}
                alt={p.name}
                className="w-full h-56 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h3 className="font-medium group-hover:text-[#FF6B35] line-clamp-2">{p.name}</h3>
                <p className="text-[#FF6B35] font-bold mt-2">
                  {p.price ? p.price.toLocaleString("vi-VN") : "Liên hệ"}₫
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "about" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <p>{shop.bio || "Thông tin gian hàng đang cập nhật."}</p>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Chưa có đánh giá nào.</p>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;
