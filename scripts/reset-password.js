async function handleResetPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMsg = document.getElementById('error-msg'); // Vẫn giữ để hiện text inline nếu muốn
    const resetBtn = document.getElementById('reset-btn');

    // 1. Lấy Token từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // 2. Kiểm tra nhanh ở Frontend (Dùng showToast loại 'info' và 'error')
    if (!token) {
        showToast("Verification token not found. Please check your email.", "error");
        return;
    }

    if (!newPassword || !confirmPassword) {
        showToast("Please fill in all fields.", "info");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("The new password does not match.", "info");
        return;
    }

    if (newPassword.length < 6) {
        showToast("Password must be at least 6 characters long.", "info");
        return;
    }

    // 3. Hiệu ứng Loading
    if (errorMsg) errorMsg.classList.add('hidden');
    const originalText = resetBtn.innerText;
    resetBtn.innerText = "Updating...";
    resetBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: token, 
                newPassword: newPassword 
            })
        });

        if (response.ok) {
            resetBtn.innerText = "Success!";
            resetBtn.style.backgroundColor = "#10b981";
            
            // Hiện Toast thành công
            showToast("Password updated successfully!", "success");
            
            // Đợi 2 giây để user kịp nhìn thông báo rồi mới chuyển trang
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            const data = await response.json();
            const errorText = data.message || "The link has expired or is invalid.";
            
            showToast(errorText, "error");
            
            // Vẫn hiện text đỏ ở form để user dễ đọc
            if (errorMsg) {
                errorMsg.querySelector('span').innerText = errorText;
                errorMsg.classList.remove('hidden');
            }
            
            resetBtn.innerText = originalText;
            resetBtn.disabled = false;
        }
    } catch (error) {
        showToast("Server connection failed. Please try again.", "error");
        resetBtn.innerText = originalText;
        resetBtn.disabled = false;
    }
}
