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

/**
 * Validates the user's authentication state and manages routing permissions.
 * Prevents unauthorized access to protected routes and redirects authenticated 
 * users away from login pages.
 */
function checkSecurityGuard() {
    const token = localStorage.getItem('jwt_token');
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('login.html');

    // Step 1: Token Lifecycle Validation (JWT Payload Decoding)
    let isTokenExpired = true;
    if (token) {
        try {
            // Extract and decode the JWT payload to verify the expiration timestamp (exp)
            const payload = JSON.parse(atob(token.split('.')[1]));
            isTokenExpired = payload.exp < Date.now() / 1000;
        } catch (e) {
            console.error("Invalid token format detected.");
            isTokenExpired = true; 
        }
    }

    // Step 2: Routing Logic Enforcement
    
    // CASE 1: Token is expired or missing while accessing protected resources.
    if (isTokenExpired && !isAuthPage) {
        localStorage.removeItem('jwt_token'); // Purge corrupted or expired credentials
        window.location.href = 'login.html';
    } 
    // CASE 2: Active session detected while on the authentication page.
    // Automatically reroutes to the dashboard to prevent redundant logins.
    else if (!isTokenExpired && isAuthPage) {
        window.location.href = 'index.html';
    }
}

// Immediate execution upon script loading to secure the route before rendering.
checkSecurityGuard();

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