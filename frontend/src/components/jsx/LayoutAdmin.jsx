import React from "react";
import Sidebar from "./Sidebar";
import "../css/LayoutAdmin.css";

const LayoutAdmin = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar role="admin" />
      <main className="admin-content">{children}</main>
    </div>
  );
};

export default LayoutAdmin;
