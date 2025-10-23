// auth.js

// Địa chỉ API back-end
const API_URL = 'http://localhost:3001/api';

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

// IIFE to avoid leaking variables to global scope
(function () {
    // ------------------ Register ------------------
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const msgEl = registerForm.querySelector('#message');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = registerForm.querySelector('#name')?.value?.trim();
            const email = registerForm.querySelector('#email')?.value?.trim();
            const password = registerForm.querySelector('#password')?.value;
            const roleEl = registerForm.querySelector('#role');
            const role = roleEl ? roleEl.value : 'customer';

            if (!name || !email || !password) {
                showMessage(msgEl, 'Vui lòng điền đủ tên, email và mật khẩu.', 'red');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });

                const data = await safeParseJSON(res);

                if (res.ok) {
                    showMessage(msgEl, 'Đăng ký thành công! Chuyển đến đăng nhập...', 'green');
                    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
                } else {
                    const err = (data && data.message) ? data.message : `Lỗi server (${res.status})`;
                    showMessage(msgEl, `Lỗi: ${err}`, 'red');
                }

            } catch (err) {
                console.error('Register error:', err);
                showMessage(msgEl, 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.', 'red');
            }
        });
    }

    // ------------------ Login ------------------
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const msgEl = loginForm.querySelector('#message');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginForm.querySelector('#email')?.value?.trim();
            const password = loginForm.querySelector('#password')?.value;

            if (!email || !password) {
                showMessage(msgEl, 'Vui lòng nhập email và mật khẩu.', 'red');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await safeParseJSON(res);

                if (res.ok && data) {
                    if (data.token) localStorage.setItem('token', data.token);
                    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

                    showMessage(msgEl, 'Đăng nhập thành công! Chuyển về trang chủ...', 'green');
                    setTimeout(() => { window.location.href = 'index.html'; }, 900);
                } else {
                    const err = (data && data.message) ? data.message : `Lỗi đăng nhập (${res.status})`;
                    showMessage(msgEl, `Lỗi: ${err}`, 'red');
                }

            } catch (err) {
                console.error('Login error:', err);
                showMessage(msgEl, 'Không thể kết nối tới máy chủ. Vui lòng thử lại.', 'red');
            }
        });
    }

})();