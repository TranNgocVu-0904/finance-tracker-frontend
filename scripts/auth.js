// Sau này chỉ cần sửa đúng 1 dòng này là xong
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8080/api/v1' 
    : 'https://finance-tracker-backend.onrender.com'; // Địa chỉ server thật sau này
    
function toggleAuth() {
    document.getElementById('login-box').classList.toggle('hidden');
    document.getElementById('register-box').classList.toggle('hidden');
}
function checkSecurityGuard() {
    const token = localStorage.getItem('jwt_token');
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('login.html');

    // 1. Kiểm tra trạng thái Token (Còn hạn hay đã hết hạn/không có)
    let isTokenExpired = true;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            isTokenExpired = payload.exp < Date.now() / 1000;
        } catch (e) {
            isTokenExpired = true; // Token lỗi định dạng thì coi như hết hạn
        }
    }

    // 2. LOGIC ĐIỀU HƯỚNG
    
    // TH1: Token hết hạn/Không có VÀ đang ở trang nội bộ -> Đuổi về Login
    if (isTokenExpired && !isAuthPage) {
        localStorage.removeItem('jwt_token'); // Dọn dẹp cho sạch
        window.location.href = 'login.html';
    } 
    // TH2: Token CÒN HẠN VÀ lỡ tay vào trang Login -> Mời vào Dashboard (Cái này bạn đang thiếu nè!)
    else if (!isTokenExpired && isAuthPage) {
        window.location.href = 'index.html';
    }
}

// Chạy ngay khi thẻ <head> gọi file này
checkSecurityGuard();

// Hàm Đăng xuất dùng chung cho mọi trang
function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}
// Hàm này sẽ đọc localStorage và thay đổi CSS/HTML
function applyGlobalAppearance() {
    // 1. Xử lý bật/tắt Quả cầu nền (Orbs)
    const showOrbs = localStorage.getItem('app_orbs');
    const orbsElements = document.querySelectorAll('.orb');
    if (showOrbs === 'false') {
        orbsElements.forEach(el => el.style.display = 'none');
    } else {
        orbsElements.forEach(el => el.style.display = 'block');
    }

    // 2. Xử lý bật/tắt hiệu ứng kính mờ (Glassmorphism)
    const enableGlass = localStorage.getItem('app_glass');
    const glassCards = document.querySelectorAll('.glass-card, .sidebar, .navbar');
    if (enableGlass === 'false') {
        glassCards.forEach(el => {
            el.style.backdropFilter = 'none';
            el.style.backgroundColor = 'rgba(15, 23, 42, 0.95)'; // Màu nền đặc không xuyên thấu
        });
    } else {
        glassCards.forEach(el => {
            el.style.backdropFilter = ''; // Trả về CSS mặc định
            el.style.backgroundColor = '';
        });
    }

    // (Phase 2: Chế độ Light Mode và Đổi màu nút bấm sẽ cần cấu hình CSS Variables sâu hơn trong Tailwind)
}

// Lắng nghe sự kiện: Ngay khi trang vừa load xong là áp dụng giao diện liền
document.addEventListener("DOMContentLoaded", applyGlobalAppearance);