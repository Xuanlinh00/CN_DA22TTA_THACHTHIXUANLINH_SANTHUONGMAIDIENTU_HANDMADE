import React, { useEffect, useState } from "react";
import LayoutVendor from "../../components/jsx/LayoutVendor";

const VendorProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/vendor/products")
      .then(res => res.json())
      .then(data => { if (data.success) setProducts(data.data); });
  }, []);

  return (
    <LayoutVendor>
      <h2>📦 Sản phẩm của tôi</h2>
      <ul>
        {products.map(p => <li key={p._id}>{p.name} - {p.price}đ</li>)}
      </ul>
    </LayoutVendor>
  );
};

export default VendorProducts;
