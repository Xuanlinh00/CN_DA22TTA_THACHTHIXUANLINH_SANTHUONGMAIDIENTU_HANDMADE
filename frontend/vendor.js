// vendor.js

// Helper: an toàn khi parse JSON (tránh lỗi khi server trả về body rỗng)
async function safeParseJSON(response) {
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}

// Helper: show message element (scoped to a container)
function showMessage(container, text, color = 'red') {
    if (!container) return;
    container.textContent = text;
    container.style.color = color;
}

(function () {
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
        const msgEl = productForm.querySelector('#message');

        productForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Ngăn form gửi
            
            // Lấy dữ liệu từ form
            const productData = {
                name: document.getElementById('name').value,
                description: document.getElementById('description').value,
                price: parseFloat(document.getElementById('price').value),
                stock_quantity: parseInt(document.getElementById('stock_quantity').value),
                category_id: parseInt(document.getElementById('category_id').value)
            };

            // Kiểm tra dữ liệu cơ bản
            if (!productData.name || !productData.price || !productData.category_id) {
                showMessage(msgEl, 'Vui lòng nhập Tên, Giá và ID Danh mục.', 'red');
                return;
            }

            try {
                // Gửi request đến API, CÓ KÈM TOKEN
                const response = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Gửi "vé thông hành"
                    },
                    body: JSON.stringify(productData)
                });

                const data = await safeParseJSON(response);

                if (response.ok) { // 201 Created
                    showMessage(msgEl, 'Đăng sản phẩm thành công!', 'green');
                    productForm.reset(); // Xóa trắng form
                } else {
                    // Lỗi từ server (ví dụ: category_id không tồn tại, v.v.)
                    const err = (data && data.message) ? data.message : `Lỗi server (${response.status})`;
                    showMessage(msgEl, `Lỗi: ${err}`, 'red');
                }

            } catch (error) {
                console.error('Lỗi khi đăng sản phẩm:', error);
                showMessage(msgEl, 'Lỗi kết nối. Không thể đăng sản phẩm.', 'red');
            }
        });
    }
})();