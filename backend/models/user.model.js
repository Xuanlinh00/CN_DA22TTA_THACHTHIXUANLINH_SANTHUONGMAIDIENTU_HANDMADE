const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import thư viện mã hóa

// 1. Định nghĩa Schema (Cấu trúc CSDL)
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, // Email không được trùng
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['customer', 'vendor'], // Chỉ chấp nhận 1 trong 2 giá trị
            default: 'customer',
        },
    },
    {
        timestamps: true, // Tự động thêm 2 trường: createdAt và updatedAt
    }
);

// 2. Tự động MÃ HÓA mật khẩu TRƯỚC KHI lưu
userSchema.pre('save', async function (next) {
    // Chỉ mã hóa khi mật khẩu được thay đổi (hoặc tạo mới)
    if (!this.isModified('password')) {
        next();
    }

    // "Băm" mật khẩu
    const salt = await bcrypt.genSalt(10); // Tạo "muối"
    this.password = await bcrypt.hash(this.password, salt); // Mã hóa
});

// 3. Thêm một hàm (method) để so sánh mật khẩu khi đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 4. Tạo và export Model
const User = mongoose.model('User', userSchema);
module.exports = User;