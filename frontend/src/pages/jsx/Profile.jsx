import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import AutoLayout from "../../components/jsx/AutoLayout";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const updateProfile = () => {
    // TODO: gọi API cập nhật thông tin
    alert("Thông tin đã được cập nhật!");
  };

  return (
    <AutoLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#2D1E1E]">Hồ sơ cá nhân</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {/* Avatar + Info */}
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <img
              src={user?.avatar || "/assets/user-placeholder.jpg"}
              alt={user?.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-[#FF6B35] object-cover"
            />
            <h2 className="text-2xl font-bold">{user?.name || "Khách hàng"}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="mt-2 text-sm bg-[#FF6B35] text-white inline-block px-4 py-1 rounded-full">
              {user?.role === "vendor" ? "Người bán" : "Khách hàng"}
            </p>
          </div>

          {/* Form + Stats */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow">
              <h3 className="text-xl font-bold mb-6">Thông tin cá nhân</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Họ tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-2 p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-2 p-3 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium">Địa chỉ</label>
                  <textarea
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full mt-2 p-3 border rounded-lg"
                  ></textarea>
                </div>
              </div>
              <button
                onClick={updateProfile}
                className="mt-6 bg-[#FF6B35] text-white px-8 py-3 rounded-lg hover:bg-[#e55a2b]"
              >
                Cập nhật thông tin
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <Link to="/orders" className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg">
                <p className="text-3xl font-bold text-[#FF6B35]">12</p>
                <p>Đơn hàng</p>
              </Link>
              <Link to="/wishlist" className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg">
                <p className="text-3xl font-bold text-[#FF6B35]">8</p>
                <p>Yêu thích</p>
              </Link>
              <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg cursor-pointer">
                <p className="text-3xl font-bold text-[#FF6B35]">3</p>
                <p>Đánh giá</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AutoLayout>
  );
};

export default Profile;
