// backend/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'day_la_khoa_bi_mat_cuc_ky_an_toan'; // Nên đưa vào biến môi trường

app.use(cors());
app.use(express.json());

/* === Helper Functions === */
const handleServerError = (res, error, message = 'Lỗi server') => {
    console.error(`ERROR: ${message}:`, error);
    res.status(500).json({ message, error: error.message });
};

/* === API Group 1: Authentication === */

// 1. Đăng ký
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name?.trim() || !email?.trim() || !password || !role) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [name, email, hashedPassword, role]
        );

        const userId = result.insertId;

        if (role === 'vendor') {
            await pool.execute(
                'INSERT INTO shops (user_id, shop_name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
                [userId, `${name}'s Shop`]
            );
        }
        
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email đã tồn tại' });
        }
        handleServerError(res, error, 'Lỗi đăng ký');
    }
});

// 2. Đăng nhập
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
        }

        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        handleServerError(res, error, 'Lỗi đăng nhập');
    }
});

/* === API Group 2: Public Routes === */

// 3. Lấy danh sách danh mục
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        handleServerError(res, error, 'Lỗi lấy danh mục');
    }
});

// 4. Lấy chi tiết một danh mục
app.get('/api/categories/:id', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM categories WHERE id = ?',
            [req.params.id]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        res.json(categories[0]);
    } catch (error) {
        handleServerError(res, error, 'Lỗi lấy chi tiết danh mục');
    }
});

// 5. Lấy sản phẩm (có phân trang và lọc)
app.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const search = req.query.search?.trim();
        
        let query = `
            SELECT p.*, s.shop_name, c.name as category_name
            FROM products p
            JOIN shops s ON p.shop_id = s.id
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        
        const params = [];

        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Get total count for pagination
        const [countResult] = await pool.execute(
            query.replace('p.*, s.shop_name, c.name as category_name', 'COUNT(*) as total'),
            params
        );
        const total = countResult[0].total;

        // Get paginated results
        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [products] = await pool.execute(query, params);

        res.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        handleServerError(res, error, 'Lỗi lấy danh sách sản phẩm');
    }
});

// 6. Lấy chi tiết một sản phẩm
app.get('/api/products/:id', async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT p.*, s.shop_name, s.id as shop_id, c.name as category_name
            FROM products p
            JOIN shops s ON p.shop_id = s.id
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.json(products[0]);
    } catch (error) {
        handleServerError(res, error, 'Lỗi lấy chi tiết sản phẩm');
    }
});

/* === API Group 3: Protected Routes (Vendor Only) === */

// 7. Tạo sản phẩm mới (Vendor only)
app.post('/api/products', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ message: 'Chỉ vendor mới được tạo sản phẩm' });
        }

        const { name, description, price, stock_quantity, category_id } = req.body;

        // Validate input
        if (!name?.trim() || !category_id || price === undefined || stock_quantity === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin sản phẩm bắt buộc' });
        }

        // Get shop_id for current vendor
        const [shops] = await pool.execute(
            'SELECT id FROM shops WHERE user_id = ?',
            [req.user.userId]
        );

        if (shops.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy shop cho vendor này' });
        }

        const [result] = await pool.execute(
            `INSERT INTO products 
            (shop_id, category_id, name, description, price, stock_quantity, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [shops[0].id, category_id, name, description, price, stock_quantity]
        );

        res.status(201).json({
            message: 'Tạo sản phẩm thành công!',
            productId: result.insertId
        });

    } catch (error) {
        handleServerError(res, error, 'Lỗi tạo sản phẩm');
    }
});

// 8. Cập nhật sản phẩm (Vendor only)
app.put('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ message: 'Chỉ vendor mới được cập nhật sản phẩm' });
        }

        const productId = req.params.id;
        const { name, description, price, stock_quantity, category_id } = req.body;

        // Verify product belongs to vendor's shop
        const [products] = await pool.execute(`
            SELECT p.* FROM products p
            JOIN shops s ON p.shop_id = s.id
            WHERE p.id = ? AND s.user_id = ?
        `, [productId, req.user.userId]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc không có quyền cập nhật' });
        }

        await pool.execute(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, 
                stock_quantity = ?, category_id = ?, updated_at = NOW()
            WHERE id = ?
        `, [name, description, price, stock_quantity, category_id, productId]);

        res.json({ message: 'Cập nhật sản phẩm thành công!' });

    } catch (error) {
        handleServerError(res, error, 'Lỗi cập nhật sản phẩm');
    }
});

// 9. Xóa sản phẩm (Vendor only)
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ message: 'Chỉ vendor mới được xóa sản phẩm' });
        }

        const productId = req.params.id;

        // Verify product belongs to vendor's shop
        const [products] = await pool.execute(`
            SELECT p.* FROM products p
            JOIN shops s ON p.shop_id = s.id
            WHERE p.id = ? AND s.user_id = ?
        `, [productId, req.user.userId]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc không có quyền xóa' });
        }

        await pool.execute('DELETE FROM products WHERE id = ?', [productId]);

        res.json({ message: 'Xóa sản phẩm thành công!' });

    } catch (error) {
        handleServerError(res, error, 'Lỗi xóa sản phẩm');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});