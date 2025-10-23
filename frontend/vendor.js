// vendor.js

// Lấy thông tin đã lưu
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
const API_URL = 'http://localhost:3001/api';

// === BẢO VỆ TRANG ===
// Chạy ngay lập tức
(function checkVendorAccess() {
    if (!token || !user) {
        // 1. Chưa đăng nhập
        alert('Bạn phải đăng nhập để vào trang này!');
        window.location.href = 'login.html';
    } else if (user.role !== 'vendor') {
        // 2. Đã đăng nhập, nhưng không phải vendor
        alert('Chỉ người bán (Vendor) mới có thể vào trang này!');
        window.location.href = 'index.html'; // Đuổi về trang chủ
    }
    // Nếu là vendor thì không làm gì, cho ở lại
})();

// === XỬ LÝ FORM ĐĂNG SẢN PHẨM ===
const productForm = document.getElementById('product-form');

if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Ngăn form gửi
        
        const messageEl = document.getElementById('message');

        // Lấy dữ liệu từ form
        const productData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            stock_quantity: parseInt(document.getElementById('stock_quantity').value),
            category_id: parseInt(document.getElementById('category_id').value)
        };

        try {
            // Gửi request đến API, CÓ KÈM TOKEN
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Gửi "vé thông hành" (Token)
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (response.ok) { // 201 Created
                messageEl.textContent = 'Đăng sản phẩm thành công!';
                messageEl.style.color = 'green';
                productForm.reset(); // Xóa trắng form
            } else {
                // Lỗi từ server (ví dụ: category_id không tồn tại, v.v.)
                messageEl.textContent = 'Lỗi: ' + data.message;
                messageEl.style.color = 'red';
            }

        } catch (error) {
            console.error('Lỗi khi đăng sản phẩm:', error);
            messageEl.textContent = 'Lỗi kết nối. Không thể đăng sản phẩm.';
            messageEl.style.color = 'red';
        }
    });
}