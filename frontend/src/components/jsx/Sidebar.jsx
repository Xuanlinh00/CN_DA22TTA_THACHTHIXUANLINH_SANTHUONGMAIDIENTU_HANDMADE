const Sidebar = ({ role }) => {
  return (
    <aside className="sidebar">
      <h3>{role === "admin" ? "Admin Panel" : "Vendor Panel"}</h3>
      <ul>
        {role === "admin" ? (
          <>
            <li><a href="/admin/users">Người dùng</a></li>
            <li><a href="/admin/shops">Cửa hàng</a></li>
            <li><a href="/admin/products">Sản phẩm</a></li>
            <li><a href="/admin/orders">Đơn hàng</a></li>
          </>
        ) : (
          <>
            <li><a href="/vendor/products">Sản phẩm của tôi</a></li>
            <li><a href="/vendor/orders">Đơn hàng</a></li>
            <li><a href="/vendor/stats">Thống kê</a></li>
          </>
        )}
      </ul>
    </aside>
  );
};
export default Sidebar;