import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AutoLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCFA]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default AutoLayout;
