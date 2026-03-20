// ==========================================
// 1. PRIMARY AUTHENTICATION HANDLER
// ==========================================
async function login() {
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    
    const passwordEl = document.getElementById('password');
    const passwordError = document.getElementById('password-error');

    // Reset UI validation states
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
            
            // Persist the JWT token in local storage for session management
            localStorage.setItem('jwt_token', data.token); 
            
            showToast("Authentication successful. Welcome back.", "success");
            setTimeout(() => { window.location.href = 'index.html'; }, 800); 
        } 
        else {
            const errorData = await response.json();
            
            // Update inline validation error messages
            passwordError.classList.remove('hidden');
            passwordError.querySelector('span').innerText = errorData.message || "Invalid email or password";
            passwordEl.classList.add('border-[#ef4444]', 'focus:border-[#ef4444]');
            
            // Trigger global error notification
            showToast(errorData.message || "Invalid credentials", "error");
        }
    } 
    catch (error) {
        console.error("System error during authentication:", error);
        showToast("Server connection error. Please try again later!!!", "error");
    }
}

// ==========================================
// 2. PASSWORD RECOVERY HANDLER
// ==========================================
async function handleForgotPassword() {
    const email = document.getElementById('forgot-email').value;
    const forgotBtn = document.getElementById('forgot-btn');
    const forgotMsg = document.getElementById('forgot-msg');

    if (!email) {
        showToast("Please provide a valid email address.", "info");
        return;
    }

    // Disable the trigger button to prevent duplicate submissions
    forgotBtn.innerText = "Processing...";
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
            forgotBtn.innerText = "Recovery Email Sent";
            showToast("A password recovery link has been dispatched", "success");
        } 
        else {
            forgotMsg.innerText = data.message || "An error occurred during the request.";
            forgotMsg.className = "text-[#ef4444] text-[13px] font-medium mt-2";
            forgotBtn.innerText = "Send Recovery Request";
            forgotBtn.disabled = false;
            showToast(data.message || "Unable to process the recovery request", "error");
        }
    } 
    catch (error) {
        showToast("Network failure. Please verify your connection", "error");
        forgotBtn.disabled = false;
        forgotBtn.innerText = "Send Recovery Request";
    }
}

// ==========================================
// 3. UI STATE TRANSITIONS
// ==========================================

// Transitions the view back to the primary login interface
function showLogin() {
    document.getElementById('login-box').classList.remove('hidden');
    document.getElementById('register-box').classList.add('hidden');
    document.getElementById('forgot-box').classList.add('hidden');
    
    document.getElementById('auth-title').innerText = "Welcome back!";
    
    document.getElementById('auth-subtitle').innerText = "Log in to Finance Tracker"; 
}

// Transitions the view to the password recovery interface
function showForgot() {
    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('forgot-box').classList.remove('hidden');
}

// ==========================================
// 4. USER REGISTRATION HANDLER
// ==========================================

async function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const regMessage = document.getElementById('reg-message');
    const registerBtn = document.querySelector('#register-box button');

    // Reset validation message states
    regMessage.innerText = "";
    regMessage.className = "text-center mb-4 font-bold text-sm mt-2";

    // Pre-flight client-side validations
    if (!name || !email || !password || !confirmPassword) {
        showToast("Please fill all required fields", "info");
        regMessage.innerText = "Missing required information";
        regMessage.classList.add('text-[#ef4444]');
        return;
    }

    if (password !== confirmPassword) {
        showToast("The passwords provided do not match", "error");
        regMessage.innerText = "Password mismatch";
        regMessage.classList.add('text-[#ef4444]');
        return;
    }

    if (password.length < 6) {
        showToast("The password must contain a minimum of 6 characters", "info");
        regMessage.innerText = "Insufficient password length";
        regMessage.classList.add('text-[#ef4444]');
        return;
    }

    const originalText = registerBtn.innerText;
    registerBtn.innerText = "Provisioning Account...";
    registerBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password })
        });

        if (response.ok) {

            showToast("Account successfully provisioned!", "success");
            regMessage.innerText = "Success! Rerouting to authentication gateway...";
            regMessage.classList.add('text-emerald-400');
            
            setTimeout(() => {
                showLogin();
                document.getElementById('email').value = email; // Auto-fill email for convenience
                regMessage.innerText = ""; 
            }, 2000);
        } 
        else {
            const errorData = await response.json();
            showToast(errorData.message || "Account provisioning failed", "error");
            regMessage.innerText = errorData.message || "Registration failed";
            regMessage.classList.add('text-[#ef4444]');
        }
    } 
    catch (error) {
        showToast("Unable to establish server connection", "error");
        regMessage.innerText = "Network connection error";
        regMessage.classList.add('text-[#ef4444]');
    } 
    finally {
        // Restore button state unconditionally
        registerBtn.innerText = originalText;
        registerBtn.disabled = false;
    }
}