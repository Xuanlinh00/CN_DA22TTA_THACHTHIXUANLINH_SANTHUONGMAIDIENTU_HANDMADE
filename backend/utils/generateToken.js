const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    // Tạo token với thông tin userId
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token hết hạn sau 30 ngày
    });

    // Gửi token về qua cookie (an toàn hơn lưu ở localStorage)
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Chỉ dùng HTTPS khi deploy
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });
};

module.exports = generateToken;