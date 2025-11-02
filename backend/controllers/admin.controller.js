const Shop = require('../models/shop.model.js');
const User = require('../models/user.model.js');

// @desc    Admin lấy tất cả shop đang chờ duyệt ('pending')
// @route   GET /api/admin/shops/pending
// @access  Private (Chỉ Admin)
const getPendingShops = async (req, res) => {
    try {
        // Tìm tất cả shop có status là 'pending'
        // .populate('user', 'name email') -> lấy kèm thông tin (tên, email) của chủ shop
        const shops = await Shop.find({ status: 'pending' }).populate(
            'user',
            'name email'
        );
        
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// @desc    Admin duyệt hoặc từ chối shop
// @route   PUT /api/admin/shops/approve/:id
// @access  Private (Chỉ Admin)
const approveShop = async (req, res) => {
    try {
        // Lấy shop bằng ID từ URL (ví dụ: /api/admin/shops/approve/abc12345)
        const shop = await Shop.findById(req.params.id);
        
        if (!shop) {
            res.status(404); // 404 = Not Found
            throw new Error('Không tìm thấy gian hàng');
        }
        
        // Lấy trạng thái mới từ body (sẽ là 'active' hoặc 'rejected')
        const { status } = req.body;
        
        if (status !== 'active' && status !== 'rejected') {
            res.status(400); // 400 = Bad Request
            throw new Error('Trạng thái không hợp lệ');
        }
        
        // Cập nhật trạng thái và lưu
        shop.status = status;
        await shop.save();
        
        // (Chúng ta có thể thêm logic gửi email thông báo cho Vendor ở đây sau)

        res.status(200).json({
            message: `Đã cập nhật trạng thái gian hàng thành '${status}'`,
            shop,
        });
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// (Chúng ta sẽ thêm API "quản trị người dùng" sau)

module.exports = {
    getPendingShops,
    approveShop,
};