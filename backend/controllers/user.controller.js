const User = require('../models/user.model.js');
const generateToken = require('../utils/generateToken.js');

// @desc    Đăng ký user mới
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    // 1. Lấy thông tin từ request (BỎ 'role' ra, user không được tự chọn)
    const { name, email, password } = req.body;

    try {
        // 2. Kiểm tra xem email đã tồn tại chưa
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400); // 400 = Bad Request
            throw new Error('Email đã được sử dụng');
        }

        // --- LOGIC MỚI CHO 3 VAI TRÒ (THEO ĐỀ CƯƠNG) ---
        // Tự động gán vai trò dựa trên email
        let role = 'customer'; // Mặc định là customer
        
        // Giả sử email admin đặc biệt, chỉ có 1
        // (Bạn có thể thay đổi email này trong file .env sau)
        if (email === 'admin@gmail.com') { 
            role = 'admin';
        }
        // (Vai trò 'vendor' sẽ được gán sau khi họ tạo shop)
        // ----------------------------------------------

        // 3. Nếu chưa tồn tại, tạo user mới
        // (Mật khẩu sẽ tự động được mã hóa nhờ 'pre.save' trong Model)
        const user = await User.create({
            name,
            email,
            password,
            role, // Gán vai trò đã được kiểm soát
        });

        // 4. Nếu tạo thành công, tạo Token và gửi về cookie
        if (user) {
            generateToken(res, user._id); // Gửi token qua cookie

            // 5. Trả về thông tin user (không bao gồm mật khẩu)
            res.status(201).json({ // 201 = Created
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: "Đăng ký thành công!"
            });
        } else {
            res.status(400);
            throw new Error('Thông tin user không hợp lệ');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Đăng nhập (Xác thực) user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    // 1. Lấy email và password từ request
    const { email, password } = req.body;

    try {
        // 2. Tìm user bằng email
        const user = await User.findOne({ email });

        // 3. Nếu user tồn tại VÀ mật khẩu khớp
        // (Hàm matchPassword đã được tạo trong Model)
        if (user && (await user.matchPassword(password))) {
            
            // 4. Tạo Token và gửi về cookie
            generateToken(res, user._id);

            // 5. Trả về thông tin user
            res.status(200).json({ // 200 = OK
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: "Đăng nhập thành công!"
            });
        } else {
            // Nếu user không tồn tại hoặc sai mật khẩu
            res.status(401); // 401 = Unauthorized
            throw new Error('Email hoặc mật khẩu không chính xác');
        }
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// 6. Export các hàm này ra
module.exports = {
    registerUser,
    loginUser,
};