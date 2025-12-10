import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("stockQuantity", formData.stockQuantity);
      images.forEach((img) => fd.append("images", img));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setMessage("✅ Đã thêm sản phẩm mới!");
        setTimeout(() => navigate("/vendor/products"), 1500);
      } else {
        setMessage("❌ Không thể thêm sản phẩm.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi kết nối server.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#2D1E1E] mb-8">Thêm sản phẩm mới</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-lg space-y-8"
      >
        <div>
          <label className="block text-lg font-medium mb-3">
            Ảnh sản phẩm (tối đa 8 ảnh)
          </label>
          <div className="grid grid-cols-4 gap-4">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt=""
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
            {imagePreviews.length < 8 && (
              <label className="border-2 border-dashed border-[#FF6B35] rounded-lg h-40 flex items-center justify-center cursor-pointer hover:bg-[#FFF5F0]">
                <span className="text-[#FF6B35] text-4xl">+</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Tên sản phẩm"
          className="w-full p-4 border rounded-lg text-lg"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả chi tiết..."
          rows="6"
          className="w-full p-4 border rounded-lg"
        ></textarea>
        <div className="grid grid-cols-2 gap-6">
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Giá bán (VNĐ)"
            className="w-full p-4 border rounded-lg"
          />
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            placeholder="Số lượng tồn kho"
            className="w-full p-4 border rounded-lg"
          />
        </div>

        {message && <p className="text-green-600">{message}</p>}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="border-2 border-gray-400 px-8 py-4 rounded-lg font-bold"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-[#FF6B35] text-white px-10 py-4 rounded-lg font-bold hover:bg-[#e55a2b]"
          >
            Đăng bán ngay
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
