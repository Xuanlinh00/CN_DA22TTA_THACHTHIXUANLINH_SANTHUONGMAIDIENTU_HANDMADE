import React from "react";
import Sidebar from "./Sidebar";
import "../css/LayoutVendor.css";

const LayoutVendor = ({ children }) => {
  return (
    <div className="vendor-layout">
      <Sidebar role="vendor" />
      <main className="vendor-content">{children}</main>
    </div>
  );
};

export default LayoutVendor;
