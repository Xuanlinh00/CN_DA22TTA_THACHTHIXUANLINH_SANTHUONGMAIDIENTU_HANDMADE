// app.js
// app.js

// ... (code trên cùng) ...

function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const nav = document.querySelector('header nav');
    if (!nav) return;

    if (token && user) {
        // === SỬA TỪ ĐÂY ===

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

        // === SỬA ĐẾN ĐÂY ===
        
        // Gắn sự kiện cho nút "Đăng xuất" (Giữ nguyên)
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
        // Giữ nguyên link cũ nếu chưa đăng nhập
        nav.innerHTML = `
            <a href="/">Trang chủ</a>
            <a href="login.html">Đăng nhập</a>
            <a href="register.html">Đăng ký</a>
        `;
    }
}

// ... (code fetchAndDisplayProducts và displayProducts giữ nguyên) ...
// Chạy code khi trang web đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayProducts();
});

// 1. Hàm lấy dữ liệu sản phẩm từ API back-end
async function fetchAndDisplayProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return; // Dừng lại nếu không tìm thấy grid

    const API_URL = 'http://localhost:3001/api/products';

    try {
        productGrid.innerHTML = '<p>Đang tải sản phẩm...</p>';

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Lỗi mạng: ' + response.statusText);
        }
        const products = await response.json();

        // 2. Gọi hàm để "vẽ" sản phẩm
        displayProducts(products);

    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        productGrid.innerHTML = '<p style="color: red;">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
    }
}

// 3. Hàm "vẽ" sản phẩm (dùng class CSS của file style.css)
function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    
    // Xóa chữ "Đang tải..."
    productGrid.innerHTML = '';

    // Nếu không có sản phẩm nào
    if (products.length === 0) {
        productGrid.innerHTML = '<p>Chưa có sản phẩm nào.</p>';
        return;
    }

    // Lặp qua từng sản phẩm và tạo HTML
    products.forEach(product => {
        // Định dạng giá tiền
        const price = Number(product.price).toLocaleString('vi-VN');
        
        // Ảnh (nếu không có ảnh thì dùng ảnh mẫu)
        const imageUrl = product.image_url || 'https://via.placeholder.com/300';

        // Tạo một thẻ <a> bọc ngoài (để click vào được)
        const productLink = document.createElement('a');
        productLink.href = `product_detail.html?id=${product.id}`; // (Chúng ta sẽ làm trang này sau)
        productLink.className = 'product-card'; // Dùng class CSS

        // Đây là nội dung HTML bên trong thẻ <a>
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
        
        // Chèn thẻ sản phẩm vào lưới
        productGrid.appendChild(productLink);
    });
}
// app.js

// Chạy code khi trang web đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP (Hàm mới)
    checkLoginStatus(); 
    
    // 2. TẢI SẢN PHẨM (Hàm cũ)
    fetchAndDisplayProducts();
});

// =============================================
// == HÀM MỚI: KIỂM TRA ĐĂNG NHẬP ==
// =============================================
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Tìm đến thanh <nav> trên header
    const nav = document.querySelector('header nav');
    if (!nav) return;

    if (token && user) {
        // Nếu ĐÃ đăng nhập:
        // 1. Xóa link "Đăng nhập" / "Đăng ký"
        nav.innerHTML = ''; // Xóa sạch link cũ
        
        // 2. Hiển thị lời chào + nút Đăng xuất
        nav.innerHTML = `
            <span>Chào, <strong>${user.name}</strong>!</span>
            <a href="#" id="logout-button">Đăng xuất</a>
        `;

        // 3. Gắn sự kiện cho nút "Đăng xuất"
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Xóa thông tin đã lưu
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Tải lại trang
                window.location.reload(); 
            });
        }
    } else {
        // Nếu CHƯA đăng nhập, thì cứ để nguyên link cũ
        // (Không cần làm gì cả)
    }
}


// =============================================
// == HÀM CŨ CỦA BẠN (LẤY SẢN PHẨM) ==
// =============================================
async function fetchAndDisplayProducts() {
    // ... (Toàn bộ code fetchAndDisplayProducts và displayProducts của bạn) ...
    // ... (Giữ nguyên không thay đổi) ...
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return; 

    const API_URL = 'http://localhost:3001/api/products';

    try {
        productGrid.innerHTML = '<p>Đang tải sản phẩm...</p>';
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Lỗi mạng: ' + response.statusText);
        }
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        productGrid.innerHTML = '<p style="color: red;">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
    }
}

function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';
    if (products.length === 0) {
        productGrid.innerHTML = '<p>Chưa có sản phẩm nào.</p>';
        return;
    }
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