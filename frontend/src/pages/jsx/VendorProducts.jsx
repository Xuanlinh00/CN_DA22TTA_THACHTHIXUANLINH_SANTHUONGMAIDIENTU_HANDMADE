import React, { useEffect, useState } from "react";
import LayoutVendor from "../../components/jsx/LayoutVendor";

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/vendor/products`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== id));
        setMessage("✅ Đã xoá sản phẩm.");
      } else {
        setMessage("❌ Không thể xoá sản phẩm.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi kết nối server.");
    }
  };

  return (
    <LayoutVendor>
      <h2 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-[#FF6B35] text-white">
              <th className="p-2">Hình</th>
              <th className="p-2">Tên</th>
              <th className="p-2">Giá</th>
              <th className="p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-t">
                <td className="p-2"><img src={p.image} alt={p.name} width="60" /></td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.price.toLocaleString()}đ</td>
                <td className="p-2 space-x-2">
                  <a href={`/vendor/edit-product/${p._id}`} className="btn-small">Sửa</a>
                  <button onClick={() => handleDelete(p._id)} className="btn-small btn-danger">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </LayoutVendor>
  );
};

export default VendorProducts;
