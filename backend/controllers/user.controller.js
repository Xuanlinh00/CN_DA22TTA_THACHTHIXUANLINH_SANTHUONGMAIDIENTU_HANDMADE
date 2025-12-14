const crypto = require('crypto'); // Thư viện có sẵn của Node.js để tạo token
const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail'); // (Tuỳ chọn) Bạn cần file này để gửi mail thật

// 1. Đăng ký
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    let role = 'user';
    if (email === process.env.ADMIN_EMAIL) role = 'admin';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'Đăng ký thành công!',
      });
    } else {
      res.status(400).json({ message: 'Thông tin user không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Không thể đăng ký: ' + error.message });
  }
};

// 2. Đăng nhập
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'Đăng nhập thành công!',
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Không thể đăng nhập: ' + error.message });
  }
};

// 3. Đăng xuất
const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Đăng xuất thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể đăng xuất: ' + error.message });
  }
};

// 4. Lấy profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy thông tin cá nhân' });
  }
};

// 5. Cập nhật profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.name = req.body.name || user.name;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      user.email = req.body.email;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const { _id, name, email, role } = updatedUser;

    res.status(200).json({ _id, name, email, role, message: 'Cập nhật thông tin thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật: ' + error.message });
  }
};

// --- CÁC HÀM MỚI BỔ SUNG ---

// 6. Quên mật khẩu (Gửi email token)
// @route POST /api/users/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token và lưu vào DB
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Đặt thời gian hết hạn (ví dụ: 10 phút)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Tạo URL reset (Frontend URL)
    // Ví dụ: http://localhost:3000/reset-password/TOKEN_O_DAY
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;

    // --- GỬI EMAIL (Logic giả lập) ---
    // Nếu bạn chưa cấu hình Nodemailer, hãy dùng console.log để lấy token test
    console.log(`Email Reset Token: ${resetToken}`); 
    console.log(`Reset URL: ${resetUrl}`);

    /* // Nếu có file sendEmail, hãy bỏ comment dòng dưới:
    const message = `Bạn nhận được email này vì có yêu cầu đặt lại mật khẩu.\nLink đặt lại: ${resetUrl}`;
    try {
        await sendEmail({ email: user.email, subject: 'Password Reset Token', message });
        res.status(200).json({ success: true, message: 'Email đã được gửi' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(500).json({ message: 'Không thể gửi email' });
    } 
    */

    res.status(200).json({ 
        success: true, 
        message: 'Yêu cầu thành công. (Kiểm tra Console Log server để lấy link test nếu chưa cấu hình email)' 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Đặt lại mật khẩu mới
// @route PUT /api/users/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    // Hash token từ URL để so sánh với token trong DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Tìm user có token đó và token chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Đặt mật khẩu mới
    user.password = req.body.password;
    
    // Xoá token và thời gian hết hạn
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- 8. [ADMIN] LẤY TẤT CẢ USER ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 9. [ADMIN] XOÁ USER ---
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Không cho phép xoá Admin (tránh trường hợp tự xoá mình hoặc xoá admin khác tuỳ logic)
    if (user.role === 'admin') {
        return res.status(400).json({ message: 'Không thể xoá tài khoản Admin' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'Đã xoá người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  forgotPassword, 
  resetPassword,  
  getAllUsers, 
  deleteUser,
};