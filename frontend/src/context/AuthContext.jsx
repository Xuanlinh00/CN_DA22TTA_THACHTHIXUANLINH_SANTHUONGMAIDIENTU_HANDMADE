import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api"; // axios instance bạn đã cấu hình
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // { _id, name, email, role }
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user khi app load (nếu có cookie JWT)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        if (res?.data?.data) {
          setUser(res.data.data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      if (res?.data?.data) {
        setUser(res.data.data);
        toast.success("Đăng nhập thành công!");
        return true;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    }
    return false;
  };

  // Đăng ký
  const register = async (name, email, password) => {
    try {
      const res = await api.post("/api/auth/register", { name, email, password });
      if (res?.data?.data) {
        setUser(res.data.data);
        toast.success("Đăng ký thành công!");
        return true;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đăng ký thất bại");
    }
    return false;
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      toast.success("Đăng xuất thành công!");
    } catch {
      toast.error("Không thể đăng xuất");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
