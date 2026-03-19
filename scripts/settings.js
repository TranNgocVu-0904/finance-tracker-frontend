document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('jwt_token');
    
    // BẢO MẬT: Nếu không có token, đá về trang đăng nhập
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // 1. Load thông tin người dùng ngay khi vào trang
    fetchProfileData(token);
    loadAppearanceToForm();
    loadNotificationToForm();

    // 2. Xử lý chuyển Tab (Profile, Security, etc.)
    const navLinks = document.querySelectorAll('.settings-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.settings-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
});

// HÀM LẤY DỮ LIỆU THẬT TỪ DATABASE
async function fetchProfileData(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            
            // Đổ dữ liệu vào các ô input (Dùng chuỗi rỗng "" nếu DB chưa có dữ liệu)
            document.getElementById('first-name').value = user.firstName || "";
            document.getElementById('last-name').value = user.lastName || "";
            document.getElementById('display-email').value = user.email || "";
            document.getElementById('phone-number').value = user.phone || "";
            document.getElementById('bio-textarea').value = user.bio || "";
            
            // Cập nhật Header Profile
            document.getElementById('profile-name').innerText = user.name || "User";
            document.getElementById('profile-email').innerText = user.email || "No email yet";
            
            // Tạo chữ cái viết tắt cho Avatar (Ví dụ: Trần Ngọc Vũ -> TV)
            if (user.name) {
                const nameParts = user.name.split(" ");
                let initials = nameParts[0].charAt(0);
                if (nameParts.length > 1) {
                    initials += nameParts[nameParts.length - 1].charAt(0);
                }
                // Thay thế cả những node text bên trong để không làm mất icon Edit SVG
                const avatarDiv = document.getElementById('profile-avatar-text');
                avatarDiv.childNodes[0].nodeValue = initials.toUpperCase() + " ";
            }
            
            // THÊM ĐOẠN NÀY VÀO ĐỂ HIỂN THỊ NGÀY ĐĂNG KÝ
            if (user.createdAt) {
                const date = new Date(user.createdAt); // Biến tên là "date"
                const formattedDate = date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                const regDateEl = document.getElementById('registration-date');
                if (regDateEl) {
                    regDateEl.innerText = formattedDate;
                }
                // ==========================================
                // TÍNH TOÁN SỐ NGÀY ĐỒNG HÀNH
                // ==========================================
                const today = new Date();
                
                // Đã sửa regDate thành date cho khớp với khai báo ở trên
                const diffTime = today.getTime() - date.getTime(); 
                
                // Quy đổi từ mili-giây ra số ngày (làm tròn lên)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                const durationEl = document.getElementById('usage-duration');
                if (durationEl) {
                    if (diffDays <= 1) {
                        durationEl.innerHTML = `<img src="assets/gif/hurray.gif" alt="Hurray icon" class="w-8 h-8 inline-block mr-2 pb-1 object-contain">New member joined today`;
                    } else {
                        durationEl.innerHTML = `<img src="assets/gif/fire.gif" alt="Fire icon" class="w-8 h-8 inline-block mr-2 pb-1 object-contain">We have been together: <span class="text-white font-bold">${diffDays} days</span>`;
                    }
                }
            }
        
        } else {
            // Nếu Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        }
    } catch (error) { 
        console.error("Profile loading error:", error); 
    }
}

async function saveProfileChanges() {
    const token = localStorage.getItem('jwt_token');
    const saveBtn = document.querySelector('button[onclick="saveProfileChanges()"]');
    
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    // LOGIC MỚI: Chỉ đưa vào JSON những trường có giá trị (Partial Update)
    const updatedData = {};
    
    const firstName = document.getElementById('first-name').value.trim();
    if (firstName) updatedData.firstName = firstName;
    
    const lastName = document.getElementById('last-name').value.trim();
    if (lastName) updatedData.lastName = lastName;
    
    const phone = document.getElementById('phone-number').value.trim();
    if (phone) updatedData.phone = phone;
    
    const bio = document.getElementById('bio-textarea').value.trim();
    if (bio) updatedData.bio = bio;

    try {
        const response = await fetch(`${API_BASE_URL}/users/update`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            // Chỉ gửi những data có thay đổi
            body: JSON.stringify(updatedData) 
        });

        if (response.ok) {
            alert("Update successful!");
            location.reload(); 
        } else {
            alert("Update failed, please try again.");
        }
    } catch (error) { 
        console.error("Connection error:", error); 
        alert("Unable to load the data at this time. Please try again later!");
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}
// HÀM ĐỔI MẬT KHẨU
async function changePassword() {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // 1. Kiểm tra Validate ở Frontend cho nhanh
    if (!oldPassword || !newPassword || !confirmPassword) {
        alert("Please fill in all fields!");
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert("The new password doesn't match!");
        return;
    }

    if (newPassword.length < 6) {
        alert("The new password must have at least 6 characters!");
        return;
    }

    const token = localStorage.getItem('jwt_token');
    const btn = document.getElementById('btn-change-password');
    const originalText = btn.innerText;
    
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/users/change-password`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Password changed successfully! Please log in again.");
            // Xóa token và bắt đăng nhập lại để đảm bảo an toàn
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        } else {
            alert("Lỗi: " + (data.message || "Unable to change password"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server connection error");
    } finally {
        // Reset lại form và nút
        document.getElementById('old-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
// HÀM LƯU CÀI ĐẶT GIAO DIỆN
function saveAppearanceSettings() {
    const glass = document.getElementById('glass-toggle').checked;
    const orbs = document.getElementById('orbs-toggle').checked;

    // Ép "chết" 2 giá trị này trong bộ nhớ luôn, không cần đọc từ giao diện
    localStorage.setItem('app_theme', 'dark');
    localStorage.setItem('app_color', 'emerald');
    
    // Lưu trạng thái 2 nút gạt
    localStorage.setItem('app_glass', glass);
    localStorage.setItem('app_orbs', orbs);

    alert("Theme changes have been changed!");
    
    // Áp dụng ngay lập tức
    applyGlobalAppearance();
}

// HÀM HIỂN THỊ LẠI CÀI ĐẶT LÊN FORM SETTINGS
function loadAppearanceToForm() {
    // CHỈ cập nhật 2 nút gạt này
    if(localStorage.getItem('app_glass') !== null) {
        document.getElementById('glass-toggle').checked = localStorage.getItem('app_glass') === 'true';
    }
    if(localStorage.getItem('app_orbs') !== null) {
        document.getElementById('orbs-toggle').checked = localStorage.getItem('app_orbs') === 'true';
    }
}

// HÀM LƯU CÀI ĐẶT THÔNG BÁO (Bị thiếu)
function saveNotificationSettings() {
    const push = document.getElementById('push-toggle').checked;
    const sound = document.getElementById('sound-toggle').checked;

    // Lưu trạng thái vào bộ nhớ dùng chung
    localStorage.setItem('app_push', push);
    localStorage.setItem('app_sound', sound);

    // Báo cáo người dùng
    alert("Notification settings have been saved!");
    
    // Phát âm thanh mặc định để test loa
    playAppSound('success'); 
}

function togglePushNotification() {
    const isPushEnabled = document.getElementById('push-toggle').checked;
    
    if (isPushEnabled) {
        // 1. NGHE THỬ TRỰC TIẾP: Phát ngay tiếng Pop bằng Audio (bỏ qua check localStorage)
        const audio = new Audio('assets/sounds/dragon-studio-new-notification-3-398649.mp3');
        audio.play().catch(e => console.log(e));
        
        // 2. Việc xin quyền và hiện Popup cứ để nó chạy chậm ở phía sau
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Finance Tracker", { body: "Notifications are turned on!" });
            }
        });
    }
}

function toggleIncomeNotification(){
    const isCheckEnabled = document.getElementById('sound-toggle').checked;

    if (isCheckEnabled) {
        // Dùng thẳng Audio để nghe thử tức thì, bỏ qua việc kiểm tra localStorage
        const audio = new Audio('assets/sounds/freesound_community-news-ting-6832.mp3');
        audio.play().catch(e => console.log(e));
    }
}

// HÀM HIỂN THỊ CÀI ĐẶT THÔNG BÁO LÊN FORM
function loadNotificationToForm() {
    // Nếu chưa có dữ liệu (!== 'false') thì checkbox sẽ tự động được checked
    document.getElementById('sound-toggle').checked = localStorage.getItem('app_sound') !== 'false';
    document.getElementById('push-toggle').checked = localStorage.getItem('app_push') !== 'false';
}