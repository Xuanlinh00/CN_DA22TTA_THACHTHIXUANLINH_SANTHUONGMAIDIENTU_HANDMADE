import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct({
            ...data.data,
            images: [], // reset để upload ảnh mới
          });
          setImagePreviews(data.data.images || []);
        } else {
          setMessage("❌ Không tìm thấy sản phẩm.");
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({ ...prev, images: [...prev.images, ...files] }));

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setProduct({
      ...product,
      images: product.images.filter((_, i) => i !== index),
    });
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", product.name);
      fd.append("description", product.description);
      fd.append("price", product.price);
      fd.append("stockQuantity", product.stockQuantity);
      product.images.forEach((img) => fd.append("images", img));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Đã cập nhật sản phẩm.");
        setTimeout(() => navigate("/vendor/products"), 1500);
      } else {
        setMessage("❌ Không thể cập nhật sản phẩm.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi kết nối server.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#2D1E1E] mb-8">Sửa sản phẩm</h1>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-lg space-y-8">
        <div>
          <label className="block text-lg font-medium mb-3">Ảnh sản phẩm</label>
          <div className="grid grid-cols-4 gap-4">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative group">
                <img src={src} alt="" className="w-full h-40 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="border-2 border-dashed border-[#FF6B35] rounded-lg h-40 flex items-center justify-center cursor-pointer hover:bg-[#FFF5F0]">
              <span className="text-[#FF6B35] text-4xl">+</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Tên sản phẩm"
          value={product.name}
          onChange={handleChange}
          className="w-full p-4 border rounded-lg text-lg"
          required
        />
        <textarea
          name="description"
          placeholder="Mô tả chi tiết..."
          rows="6"
          value={product.description}
          onChange={handleChange}
          className="w-full p-4 border rounded-lg"
        ></textarea>
        <div className="grid grid-cols-2 gap-6">
          <input
            type="number"
            name="price"
            placeholder="Giá bán (VNĐ)"
            value={product.price}
            onChange={handleChange}
            className="w-full p-4 border rounded-lg"
          />
          <input
            type="number"
            name="stockQuantity"
            placeholder="Số lượng tồn kho"
            value={product.stockQuantity}
            onChange={handleChange}
            className="w-full p-4 border rounded-lg"
          />
        </div>

        {message && <p className="text-green-600">{message}</p>}

        <div className="flex justify-end gap-4">
          <button type="button" className="border-2 border-gray-400 px-8 py-4 rounded-lg font-bold">
            Hủy
          </button>
          <button type="submit" className="bg-[#FF6B35] text-white px-10 py-4 rounded-lg font-bold hover:bg-[#e55a2b]">
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
