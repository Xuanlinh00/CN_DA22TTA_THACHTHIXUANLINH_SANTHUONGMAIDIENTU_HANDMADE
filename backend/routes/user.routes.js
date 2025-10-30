const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
} = require('../controllers/user.controller.js'); // Import Controller

// Định nghĩa các đường dẫn
// Khi có request POST đến /register, nó sẽ gọi hàm registerUser
router.post('/register', registerUser);

// Khi có request POST đến /login, nó sẽ gọi hàm loginUser
router.post('/login', loginUser);

module.exports = router;