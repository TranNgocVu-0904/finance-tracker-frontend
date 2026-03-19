// ==========================================
// 1. LOGIN HÀM CHÍNH
// ==========================================
async function login() {
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    
    const passwordEl = document.getElementById('password');
    const passwordError = document.getElementById('password-error');

    // Reset UI state
    passwordError.classList.add('hidden');
    passwordEl.classList.remove('border-[#ef4444]', 'focus:border-[#ef4444]');

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput, password: passwordInput })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwt_token', data.token); 
            
            showToast("Login successful! Welcome back.", "success");
            setTimeout(() => { window.location.href = 'index.html'; }, 800); 
        } else {
            const errorData = await response.json();
            // Cập nhật thông báo lỗi ngay dưới ô input
            passwordError.classList.remove('hidden');
            passwordError.querySelector('span').innerText = errorData.message || "Invalid email or password.";
            passwordEl.classList.add('border-[#ef4444]', 'focus:border-[#ef4444]');
            
            // Hiện Toast báo lỗi
            showToast(errorData.message || "Invalid credentials.", "error");
        }
    } catch (error) {
        console.error("System error:", error);
        showToast("Server connection error. Please try again later.", "error");
    }
}

// ==========================================
// 2. XỬ LÝ QUÊN MẬT KHẨU
// ==========================================
async function handleForgotPassword() {
    const email = document.getElementById('forgot-email').value;
    const forgotBtn = document.getElementById('forgot-btn');
    const forgotMsg = document.getElementById('forgot-msg');

    if (!email) {
        showToast("Please enter your email address.", "info");
        return;
    }

    forgotBtn.innerText = "Sending...";
    forgotBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        
        forgotMsg.classList.remove('hidden');
        if (response.ok) {
            forgotMsg.innerText = data.message;
            forgotMsg.className = "text-emerald-400 text-[13px] font-medium mt-2";
            forgotBtn.innerText = "Sent Successfully";
            showToast("Recovery email has been sent.", "success");
        } else {
            forgotMsg.innerText = data.message || "An error occurred.";
            forgotMsg.className = "text-[#ef4444] text-[13px] font-medium mt-2";
            forgotBtn.innerText = "Send Recovery Request";
            forgotBtn.disabled = false;
            showToast(data.message || "Could not process request.", "error");
        }
    } catch (error) {
        showToast("Connection failed. Please check your network.", "error");
        forgotBtn.disabled = false;
        forgotBtn.innerText = "Send Recovery Request";
    }
}

// ==========================================
// 3. XỬ LÝ ĐĂNG KÝ
// ==========================================
async function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const regMessage = document.getElementById('reg-message');
    const registerBtn = document.querySelector('#register-box button');

    regMessage.innerText = "";
    regMessage.className = "text-center mb-4 font-bold text-sm mt-2";

    // Validations
    if (!name || !email || !password || !confirmPassword) {
        showToast("Please fill in all required fields.", "info");
        regMessage.innerText = "Missing required information.";
        regMessage.classList.add('text-[#ef4444]');
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        regMessage.innerText = "Confirm password does not match.";
        regMessage.classList.add('text-[#ef4444]');
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters.", "info");
        regMessage.innerText = "Password too short.";
        regMessage.classList.add('text-[#ef4444]');
        return;
    }

    const originalText = registerBtn.innerText;
    registerBtn.innerText = "Processing...";
    registerBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password })
        });

        if (response.ok) {
            showToast("Registration successful!", "success");
            regMessage.innerText = "Success! Redirecting to login...";
            regMessage.classList.add('text-emerald-400');
            
            setTimeout(() => {
                showLogin();
                document.getElementById('email').value = email;
                regMessage.innerText = ""; 
            }, 2000);
        } else {
            const errorData = await response.json();
            showToast(errorData.message || "Registration failed.", "error");
            regMessage.innerText = errorData.message || "Registration failed.";
            regMessage.classList.add('text-[#ef4444]');
        }
    } catch (error) {
        showToast("Could not connect to the server.", "error");
        regMessage.innerText = "Connection error.";
        regMessage.classList.add('text-[#ef4444]');
    } finally {
        registerBtn.innerText = originalText;
        registerBtn.disabled = false;
    }
}