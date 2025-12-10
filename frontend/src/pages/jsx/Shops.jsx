// src/pages/jsx/Shops.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const Shops = () => {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api.get("/api/shops")
      .then((res) => setShops(res.data.data || []))
      .catch((err) => {
        console.error("Lỗi lấy danh sách shops:", err);
        setShops([]);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-[#2D1E1E] mb-12">
        Tất cả gian hàng trên Craftify
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {shops.map((shop) => (
          <Link
            key={shop._id}
            to={`/shop/${shop._id}`}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition text-center p-6"
          >
            <img
              src={shop.avatar || "/assets/shop-placeholder.jpg"}
              alt={shop.shopName}
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#FF6B35]"
            />
            <h3 className="mt-4 text-xl font-bold text-[#2D1E1E]">{shop.shopName}</h3>
            <p className="text-gray-600 text-sm mt-2">
              {shop.productCount ? shop.productCount : 0} sản phẩm
            </p>
            <p className="text-[#FF6B35] font-medium mt-2">4.9 ★</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shops;
