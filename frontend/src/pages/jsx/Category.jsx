import React from 'react';

const Category = () => {
  const categories = [
    { name: "Trang Sức", icon: "Gem" },
    { name: "Thời Trang", icon: "Shirt" },
    { name: "Trang Trí", icon: "Home" },
    { name: "Gốm Sứ", icon: "Coffee" },
    { name: "Sổ Tay", icon: "Book" },
    { name: "Quà Tặng", icon: "Gift" },
    { name: "Phụ Kiện", icon: "Watch" },
    { name: "Đồ Da", icon: "Briefcase" }
  ];

  return (
    <div className="min-h-screen bg-[#FFFCFA] py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-center text-6xl font-bold text-[#FF853F] mb-6">
          Khám Phá Theo Sở Thích
        </h1>
        <p className="text-center text-2xl text-[#2D1E1E] mb-16">
          Tìm kiếm sản phẩm handmade theo chủ đề bạn yêu thích
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white rounded-3xl shadow-2xl p-12 text-center hover:scale-110 hover:shadow-3xl transition-all duration-500 cursor-pointer border-2 border-orange-100"
            >
              <div className="text-6xl mb-6">{cat.icon}</div>
              <p className="text-2xl font-bold text-[#2D1E1E]">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;