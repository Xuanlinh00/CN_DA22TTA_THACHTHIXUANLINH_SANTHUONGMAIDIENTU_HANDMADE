import React, { useEffect, useState } from "react";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/products")
      .then(res => res.json())
      .then(data => { if (data.success) setProducts(data.data); });
  }, []);

  return (
    <LayoutAdmin>
      <h2>📦 Quản lý Sản phẩm</h2>
      <ul>
        {products.map(p => <li key={p._id}>{p.name} - {p.price}đ</li>)}
      </ul>
    </LayoutAdmin>
  );
};

export default AdminProducts;
