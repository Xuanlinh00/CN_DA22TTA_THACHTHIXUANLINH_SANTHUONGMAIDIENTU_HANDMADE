const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

// Đăng ký
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

    let role = 'customer';
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

// Đăng nhập
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

// Đăng xuất
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

// Lấy profile
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

// Cập nhật profile
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

module.exports = { registerUser, loginUser, logoutUser, getProfile, updateProfile };
