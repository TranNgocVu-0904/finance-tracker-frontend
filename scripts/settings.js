/**
 * ==========================================
 * USER SETTINGS & PROFILE CONTROLLER
 * Manages profile updates, security credentials, 
 * UI persistence, and notification preferences.
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('jwt_token');
    
    // SECURITY GUARD: Redirect to authentication gateway if the session token is missing
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize user data and form states upon document readiness
    fetchProfileData(token);
    loadAppearanceToForm();
    loadNotificationToForm();

    // TAB NAVIGATION LOGIC: Handles transitions between Profile, Security, and Settings modules
    const navLinks = document.querySelectorAll('.settings-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            // Update active navigational state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Toggle content visibility for the selected fragment
            document.querySelectorAll('.settings-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
});

/**
 * Retrieves the current user's comprehensive profile data from the backend.
 * Synchronizes input fields and calculates account duration metrics.
 */
async function fetchProfileData(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            
            // Populate input fields with retrieved data; default to empty strings if null
            document.getElementById('first-name').value = user.firstName || "";
            document.getElementById('last-name').value = user.lastName || "";
            document.getElementById('display-email').value = user.email || "";
            document.getElementById('phone-number').value = user.phone || "";
            document.getElementById('bio-textarea').value = user.bio || "";
            
            // Synchronize header profile metadata
            document.getElementById('profile-name').innerText = user.name || "User";
            document.getElementById('profile-email').innerText = user.email || "No email associated";
            
            // AVATAR GENERATION: Construct initials from the user's full name (e.g., Tran Ngoc Vu -> TV)
            if (user.name) {
                const nameParts = user.name.split(" ");
                let initials = nameParts[0].charAt(0);
                if (nameParts.length > 1) {
                    initials += nameParts[nameParts.length - 1].charAt(0);
                }
                const avatarDiv = document.getElementById('profile-avatar-text');
                // Update only the text node to preserve any sibling SVG icons
                avatarDiv.childNodes[0].nodeValue = initials.toUpperCase() + " ";
            }
            
            // ACCOUNT LONGEVITY METRICS
            if (user.createdAt) {
                const registrationDate = new Date(user.createdAt);
                const formattedDate = registrationDate.toLocaleDateString('en-US', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
                
                const regDateEl = document.getElementById('registration-date');
                if (regDateEl) regDateEl.innerText = formattedDate;

                // CHRONOLOGICAL CALCULATION: Determine total days since account creation
                const today = new Date();
                const diffTime = today.getTime() - registrationDate.getTime(); 
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                const durationEl = document.getElementById('usage-duration');
                if (durationEl) {
                    if (diffDays <= 1) {
                        durationEl.innerHTML = `<img src="assets/gif/hurray.gif" alt="Join icon" class="w-8 h-8 inline-block mr-2 pb-1 object-contain">New member joined today`;
                    } else {
                        durationEl.innerHTML = `<img src="assets/gif/fire.gif" alt="Loyalty icon" class="w-8 h-8 inline-block mr-2 pb-1 object-contain">Partnership duration: <span class="text-white font-bold">${diffDays} days</span>`;
                    }
                }
            }
        
        } else {
            // Invalidate session upon authentication failure (e.g., expired token)
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        }
    } catch (error) { 
        console.error("Critical error during profile synchronization:", error); 
    }
}

/**
 * Persists profile modifications using a Partial Update strategy.
 */
async function saveProfileChanges() {
    const token = localStorage.getItem('jwt_token');
    const saveBtn = document.querySelector('button[onclick="saveProfileChanges()"]');
    
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Persisting Data...";
    saveBtn.disabled = true;

    // Construct update payload containing only non-empty fields
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
            body: JSON.stringify(updatedData) 
        });

        if (response.ok) {
            showToast("Profile successfully updated!", "success");
            setTimeout(() => location.reload(), 1000); 
        } else {
            showToast("Update failed. Please verify the input data.", "error");
        }
    } catch (error) { 
        console.error("Connection failure during profile update:", error); 
        showToast("Unable to communicate with the server. Please try again later.", "error");
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}

/**
 * Handles security credential rotation (Password Change).
 * Enforces strict client-side validation before dispatching to the server.
 */
async function changePassword() {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Step 1: Client-Side Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
        showToast("Please populate all authentication fields.", "info");
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast("The new passwords do not match.", "error");
        return;
    }

    if (newPassword.length < 6) {
        showToast("The new password must contain at least 6 characters.", "info");
        return;
    }

    const token = localStorage.getItem('jwt_token');
    const btn = document.getElementById('btn-change-password');
    const originalText = btn.innerText;
    
    btn.innerText = "Authorizing Change...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/users/change-password`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Security credentials updated. Re-authentication required.", "success");
            // Terminate session to force a fresh login with the new credentials
            localStorage.removeItem('jwt_token');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            showToast(data.message || "Credential update failed.", "error");
        }
    } catch (error) {
        console.error("Password rotation error:", error);
        showToast("Server connection failure.", "error");
    } finally {
        // Clear sensitive inputs post-attempt
        document.getElementById('old-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

/**
 * PERSISTENCE LAYER: Appearance & Personalization
 */
function saveAppearanceSettings() {
    const glass = document.getElementById('glass-toggle').checked;
    const orbs = document.getElementById('orbs-toggle').checked;

    // Persist UI states to LocalStorage
    localStorage.setItem('app_theme', 'dark');
    localStorage.setItem('app_color', 'emerald');
    localStorage.setItem('app_glass', glass);
    localStorage.setItem('app_orbs', orbs);

    showToast("UI preferences have been localized.", "success");
    applyGlobalAppearance(); // Immediate re-rendering of the UI
}

function loadAppearanceToForm() {
    if(localStorage.getItem('app_glass') !== null) {
        document.getElementById('glass-toggle').checked = localStorage.getItem('app_glass') === 'true';
    }
    if(localStorage.getItem('app_orbs') !== null) {
        document.getElementById('orbs-toggle').checked = localStorage.getItem('app_orbs') === 'true';
    }
}

/**
 * PERSISTENCE LAYER: Notifications & Auditory Feedback
 */
function saveNotificationSettings() {
    const push = document.getElementById('push-toggle').checked;
    const sound = document.getElementById('sound-toggle').checked;

    localStorage.setItem('app_push', push);
    localStorage.setItem('app_sound', sound);

    showToast("Notification settings archived.", "success");
    if (typeof playAppSound === 'function') playAppSound('success'); 
}

function togglePushNotification() {
    const isPushEnabled = document.getElementById('push-toggle').checked;
    if (isPushEnabled) {
        // Trigger auditory test feedback
        const audio = new Audio('assets/sounds/dragon-studio-new-notification-3-398649.mp3');
        audio.play().catch(e => console.warn("Audio playback inhibited:", e));
        
        // Handle Browser Notification Permissions
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Finance Tracker", { body: "System alerts are now enabled." });
            }
        });
    }
}

function toggleIncomeNotification(){
    const isSoundEnabled = document.getElementById('sound-toggle').checked;
    if (isSoundEnabled) {
        const audio = new Audio('assets/sounds/freesound_community-news-ting-6832.mp3');
        audio.play().catch(e => console.warn("Audio playback inhibited:", e));
    }
}

function loadNotificationToForm() {
    document.getElementById('sound-toggle').checked = localStorage.getItem('app_sound') !== 'false';
    document.getElementById('push-toggle').checked = localStorage.getItem('app_push') !== 'false';
}