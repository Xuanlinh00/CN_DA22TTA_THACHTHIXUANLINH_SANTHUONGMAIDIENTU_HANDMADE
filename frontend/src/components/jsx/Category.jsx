import React from 'react';

const Category = () => {
  const categories = [
    "Trang Sức", "Thời Trang", "Trang Trí Nhà", "Gốm Sứ", 
    "Sổ Tay", "Quà Tặng", "Phụ Kiện", "Đồ Da"
  ];

  return (
    <div className="min-h-screen bg-[#FFFCFA] py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-6xl font-bold text-[#FF853F] mb-6">
          Khám Phá Theo Sở Thích
        </h1>
        <p className="text-2xl text-[#2D1E1E] mb-16">
          Tìm kiếm sản phẩm handmade theo chủ đề bạn yêu thích
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="bg-white p-12 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-500 cursor-pointer border border-orange-100"
            >
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-28 h-28 mx-auto mb-6" />
              <p className="text-2xl font-bold text-[#2D1E1E]">{cat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;