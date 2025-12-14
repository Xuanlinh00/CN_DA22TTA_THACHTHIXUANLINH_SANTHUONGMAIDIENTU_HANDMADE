const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Cấu hình multer giống như trong product.controller.js
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

console.log('✅ Multer configuration loaded');
console.log('📁 Upload destination: uploads/products/');
console.log('📦 Max file size: 5MB');
console.log('🖼️  Accepted types: image/*');
