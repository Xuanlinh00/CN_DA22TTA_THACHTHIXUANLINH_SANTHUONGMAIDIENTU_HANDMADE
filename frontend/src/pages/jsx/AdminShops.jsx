import React, { useEffect, useState } from "react";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";

const AdminShops = () => {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/shops")
      .then(res => res.json())
      .then(data => { if (data.success) setShops(data.data); });
  }, []);

  return (
    <LayoutAdmin>
      <h2>🏪 Quản lý Cửa hàng</h2>
      <ul>
        {shops.map(s => <li key={s._id}>{s.name}</li>)}
      </ul>
    </LayoutAdmin>
  );
};

export default AdminShops;
