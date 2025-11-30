import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "../css/Layout.css";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
