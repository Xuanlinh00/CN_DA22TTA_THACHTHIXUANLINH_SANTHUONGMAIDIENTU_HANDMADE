import React, { useState, useEffect } from "react";
import AutoLayout from "../../components/jsx/AutoLayout";
import ProductCard from "../../components/jsx/ProductCard";
import api from "../../utils/api";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  // Lấy dữ liệu wishlist từ API khi load trang
  useEffect(() => {
    api.get("/api/wishlist")
      .then((res) => setWishlist(res.data.data || []))
      .catch((err) => {
        console.error("Lỗi lấy wishlist:", err);
        setWishlist([]);
      });
  }, []);

  // Hàm xoá khỏi wishlist
  const removeFromWishlist = async (product) => {
    try {
      await api.delete(`/api/wishlist/${product._id}`);
      setWishlist(wishlist.filter((p) => p._id !== product._id));
    } catch (err) {
      console.error("Không thể xoá khỏi wishlist:", err);
    }
  };

  return (
    <AutoLayout>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-block bg-[#FF6B35] text-white px-4 py-1 rounded-full text-sm font-semibold">
            Yêu Thích
          </span>
          <h2 className="text-3xl font-bold text-[#2D1E1E] mt-4">
            Danh Sách Sản Phẩm Yêu Thích
          </h2>
        </div>

        {wishlist.length === 0 ? (
          <p className="text-center text-gray-600">
            Chưa có sản phẩm nào trong danh sách yêu thích.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {wishlist.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onWishlist={removeFromWishlist}
              />
            ))}
          </div>
        )}
      </section>
    </AutoLayout>
  );
};

export default Wishlist;
