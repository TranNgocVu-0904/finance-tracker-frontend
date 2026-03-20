/**
 * ==========================================
 * PASSWORD RESET HANDLER
 * Manages the final stage of the password recovery lifecycle by
 * validating tokens and updating user credentials.
 * ==========================================
 */
async function handleResetPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMsg = document.getElementById('error-msg'); // Inline error container
    const resetBtn = document.getElementById('reset-btn');

    // 1. TOKEN EXTRACTION FROM URL PARAMETERS
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // 2. PRE-FLIGHT CLIENT-SIDE VALIDATIONS
    if (!token) {
        showToast("Verification token not found. Please check your recovery email!", "error");
        return;
    }

    if (!newPassword || !confirmPassword) {
        showToast("Please populate all required fields", "info");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("The new passwords provided do not match", "info");
        return;
    }

    if (newPassword.length < 6) {
        showToast("The password must contain a minimum of 6 characters", "info");
        return;
    }

    // 3. UI LOADING STATE INITIALIZATION
    if (errorMsg) errorMsg.classList.add('hidden');
    const originalText = resetBtn.innerText;
    resetBtn.innerText = "Updating Credentials...";
    resetBtn.disabled = true;

    try {
        // 4. ASYNCHRONOUS POST REQUEST TO BACKEND GATEWAY
        const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: token, 
                newPassword: newPassword 
            })
        });

        if (response.ok) {
            // Update button state to reflect a successful transaction
            resetBtn.innerText = "Success!";
            resetBtn.style.backgroundColor = "#10b981";
            
            showToast("Password updated successfully!", "success");
            
            // Allow a 2-second buffer for the user to read the notification before redirection
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            const data = await response.json();
            const errorText = data.message || "The recovery link has expired or is invalid";
            
            showToast(errorText, "error");
            
            // Render detailed error feedback within the form context
            if (errorMsg) {
                errorMsg.querySelector('span').innerText = errorText;
                errorMsg.classList.remove('hidden');
            }
            
            // Revert UI state for subsequent attempts
            resetBtn.innerText = originalText;
            resetBtn.disabled = false;
        }
    } catch (error) {
        console.error("Password reset network error:", error);
        showToast("Server connection failure. Please attempt the request again", "error");
        
        resetBtn.innerText = originalText;
        resetBtn.disabled = false;
    }
}