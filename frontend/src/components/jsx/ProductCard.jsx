import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product, onWishlist, onAddToCart }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden group">
      {/* Ảnh sản phẩm */}
      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0] || product.image || "/assets/sample-bag.jpg"}
          alt={product.name}
          className="w-full h-44 object-cover"
        />
      </Link>

      {/* Nội dung */}
      <div className="p-3">
        <Link
          to={`/product/${product._id}`}
          className="font-medium line-clamp-1 group-hover:text-[#FF6B35]"
        >
          {product.name}
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[#FF6B35] font-semibold">
            {product.price ? product.price.toLocaleString("vi-VN") : "Liên hệ"} VND
          </span>
          <span className="text-xs text-gray-500">{product?.shop?.shopName}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-[#FF6B35] text-white text-sm px-3 py-2 rounded hover:bg-[#e55a2b]"
            >
              Thêm giỏ
            </button>
          )}
          {onWishlist && (
            <button
              onClick={() => onWishlist(product)}
              className="border border-[#FF6B35] text-[#FF6B35] text-sm px-3 py-2 rounded hover:bg-[#FF6B35] hover:text-white"
            >
              Xoá
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
