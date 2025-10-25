// frontend/app.js

// Chạy code khi trang web đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
    checkLoginStatus(); 
    
    // 2. TẢI SẢN PHẨM
    fetchAndDisplayProducts();
});

// =============================================
// HÀM KIỂM TRA ĐĂNG NHẬP (Bản đầy đủ)
// =============================================
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const nav = document.querySelector('header nav');
    if (!nav) return;

    if (token && user) {
        // ĐÃ ĐĂNG NHẬP
        
        // 1. Tạo HTML cơ bản
        let navHTML = `
            <span>Chào, <strong>${user.name}</strong>!</span>
        `;

        // 2. Nếu là VENDOR, thêm link "Kênh Bán Hàng"
        if (user.role === 'vendor') {
            navHTML += `<a href="vendor.html">Kênh Bán Hàng</a>`;
        }

        // 3. Thêm nút "Đăng xuất"
        navHTML += `<a href="#" id="logout-button">Đăng xuất</a>`;

        // 4. Cập nhật header
        nav.innerHTML = navHTML;
        
        // 5. Gắn sự kiện cho nút "Đăng xuất"
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload(); 
            });
        }
    } else {
        // CHƯA ĐĂNG NHẬP
        nav.innerHTML = `
            <a href="/">Trang chủ</a>
            <a href="login.html">Đăng nhập</a>
            <a href="register.html">Đăng ký</a>
        `;
    }
}

// =============================================
// HÀM LẤY SẢN PHẨM (Bản sửa lỗi)
// =============================================
async function fetchAndDisplayProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return; 

    const API_URL = 'http://localhost:3001/api/products';

    try {
        productGrid.innerHTML = '<p>Đang tải sản phẩm...</p>';

        const response = await fetch(API_URL);

        // Kiểm tra xem server có trả về lỗi 4xx/5xx không
        if (!response.ok) {
            // Ném lỗi này vào khối catch
            throw new Error('Server báo lỗi: ' + response.statusText); 
        }

        const products = await response.json();
        
        // 2. Gọi hàm để "vẽ" sản phẩm
        displayProducts(products);

    } catch (error) {
        // Bắt lỗi (từ 'throw' ở trên hoặc lỗi mạng)
        console.error('Lỗi khi tải sản phẩm:', error);
        productGrid.innerHTML = '<p style="color: red;">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
    }
}

// =============================================
// HÀM "VẼ" SẢN PHẨM (An toàn hơn)
// =============================================
function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';

    // === THÊM KIỂM TRA AN TOÀN ===
    // Trực tiếp sửa lỗi 'forEach is not a function'
    if (!Array.isArray(products) || products.length === 0) {
        productGrid.innerHTML = '<p>Chưa có sản phẩm nào.</p>';
        return;
    }
    // =============================

    // Lặp qua từng sản phẩm và tạo HTML
    products.forEach(product => {
        const price = Number(product.price).toLocaleString('vi-VN');
        const imageUrl = product.image_url || 'https://via.placeholder.com/300';
        const productLink = document.createElement('a');
        productLink.href = `product_detail.html?id=${product.id}`;
        productLink.className = 'product-card';

        productLink.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-shop">Bởi: ${product.shop_name}</p>
                <span class="current-price">${price}đ</span>
            </div>
        `;
        
        productGrid.appendChild(productLink);
    });
}