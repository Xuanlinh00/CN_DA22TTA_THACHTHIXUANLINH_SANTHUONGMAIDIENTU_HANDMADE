// backend/db.js
const mysql = require('mysql2/promise'); // <-- PHẢI CÓ 'mysql2' và '/promise'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Mật khẩu của bạn
    database: 'handmade_market',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; // Xuất ra pool để server.js dùng