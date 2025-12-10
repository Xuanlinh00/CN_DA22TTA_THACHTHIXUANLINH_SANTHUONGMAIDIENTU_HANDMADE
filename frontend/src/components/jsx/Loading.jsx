import React from "react";

const Loading = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFFCFA]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF6B35] mx-auto mb-6"></div>
        <p className="text-xl text-[#2D1E1E]">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
