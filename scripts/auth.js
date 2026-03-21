/**
 * ==========================================
 * GLOBAL CONFIGURATION & SECURITY GUARD
 * Acts as the application's entry point for environment 
 * switching, authentication, and UI persistence.
 * ==========================================
 */

// 1. DYNAMIC API BASE URL CONFIGURATION
// Automatically switches between local development and production environments.
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8081' 
    : 'https://finance-tracker-backend-9qsm.onrender.com';

// ==========================================
// PART 1: LOGIC (Unit Test)
// ==========================================

/**
 * Evaluates the expiration status of a JSON Web Token (JWT).
 * @param {string|null} token - The base64 encoded JWT.
 * @param {number} currentTimeInSeconds - The current epoch time in seconds.
 * @returns {boolean} True if the token is invalid, missing, or expired; otherwise false.
 */
function isTokenExpired(token, currentTimeInSeconds) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < currentTimeInSeconds;
    } catch (e) {
        return true; 
    }
}

/**
 * Determines the appropriate routing action based on session validity and current page context.
 * @param {boolean} isExpired - The expiration state of the current session.
 * @param {boolean} isAuthPage - Indicates if the user is currently on an authentication page.
 * @returns {string} The designated action directive ('LOGOUT_AND_REDIRECT', 'GO_TO_DASHBOARD', or 'STAY').
 */
function getSecurityAction(isExpired, isAuthPage) {

    if (isExpired && !isAuthPage) 
        return 'LOGOUT_AND_REDIRECT';
    if (!isExpired && isAuthPage) 
        return 'GO_TO_DASHBOARD';
    return 'STAY';
}

// ==========================================
// PART 2: IMPURE WRAPPER (Browser API Interoperability)
// ==========================================

/**
 * Validates the user's authentication state and manages routing permissions.
 * Prevents unauthorized access to protected routes and redirects authenticated 
 * users away from login pages.
 */
function checkSecurityGuard() {
    const token = localStorage.getItem('jwt_token');
    const isAuthPage = window.location.pathname.includes('login.html');
    const now = Date.now() / 1000;

    const expired = isTokenExpired(token, now);
    const action = getSecurityAction(expired, isAuthPage);

    if (action === 'LOGOUT_AND_REDIRECT') {

        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    } 
    else if (action === 'GO_TO_DASHBOARD') {
        window.location.href = 'index.html';
    }
}

// ==========================================
// PART 3: EXPORT FOR JEST
// ==========================================

// Module export bridge for Node.js (Jest) testing environment compatibility.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        isTokenExpired, 
        getSecurityAction,
        toggleAuth,
        logout,
    };
}

// Immediate execution upon script loading (only in real browser, prevented in Jest)
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    checkSecurityGuard();
    document.addEventListener("DOMContentLoaded", applyGlobalAppearance);
}

/**
 * Standardized global logout procedure.
 * Clears local session storage and redirects to the authentication gateway.
 */
function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}

/**
 * Toggles the visibility of authentication boxes (Login vs Register).
 */
function toggleAuth() {
    document.getElementById('login-box').classList.toggle('hidden');
    document.getElementById('register-box').classList.toggle('hidden');
}

/**
 * Persists and applies global UI appearance settings based on user preferences stored in localStorage.
 * Manages background effects (Orbs) and Glassmorphism styling.
 */
function applyGlobalAppearance() {
    // 1. Background Ambient Effects (Orbs) Configuration
    const showOrbs = localStorage.getItem('app_orbs');
    const orbsElements = document.querySelectorAll('.orb');
    
    if (showOrbs === 'false') {
        orbsElements.forEach(el => el.style.display = 'none');
    } else {
        orbsElements.forEach(el => el.style.display = 'block');
    }

    // 2. Glassmorphism Visual Styles (Transparency & Backdrop Filters)
    const enableGlass = localStorage.getItem('app_glass');
    const glassCards = document.querySelectorAll('.glass-card, .sidebar, .navbar');
    
    if (enableGlass === 'false') {
        glassCards.forEach(el => {
            el.style.backdropFilter = 'none';
            el.style.backgroundColor = 'rgba(15, 23, 42, 0.95)'; // Fallback to high-opacity solid background
        });
    } else {
        glassCards.forEach(el => {
            el.style.backdropFilter = ''; // Revert to stylesheet default (blur effect)
            el.style.backgroundColor = '';
        });
    }
}

// Apply appearance settings immediately after the DOM is fully constructed.
document.addEventListener("DOMContentLoaded", applyGlobalAppearance);