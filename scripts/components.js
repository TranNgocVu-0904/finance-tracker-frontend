// ==========================================
// 1. MODAL HTML TEMPLATES
// ==========================================

const creditsModalHTML = `
    <div id="credits-modal" onclick="if(event.target === this) closeCreditsModal()" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
        <div class="glass-card bg-[#132419]/95 border border-white/20 p-8 rounded-3xl shadow-xl w-[450px] max-w-[90vw]">
            
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-white">Resources</h3>
                <button onclick="closeCreditsModal()" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                
                <div class="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                        <p class="text-white font-medium text-sm">Animated Icons</p>
                        <p class="text-xs text-gray-400">Icons by Lordicon.com</p>
                    </div>
                    <a href="https://lordicon.com/" target="_blank" class="text-[#9EDDFF] hover:text-white text-sm font-bold transition">Lordicon</a>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                        <p class="text-white font-medium text-sm">Analysis Chart</p>
                        <p class="text-xs text-gray-400">Chart library by Chart.js</p>
                    </div>
                    <a href="https://www.chartjs.org/" target="_blank" class="text-[#9EDDFF] hover:text-white text-sm font-bold transition">Chart.js</a>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                        <p class="text-white font-medium text-sm">HTML and CSS Template</p>
                        <p class="text-xs text-gray-400">Template by Templatemo.com"</p>
                    </div>
                    <a href="https://templatemo.com" target="_blank" class="text-[#9EDDFF] hover:text-white text-sm font-bold transition">TemplateMo</a>
                </div>

                <div class="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                        <p class="text-white font-medium text-sm">Animated Icons</p>
                        <p class="text-xs text-gray-400">Icons by Flaticon.com</p>
                    </div>
                    <a href="https://www.flaticon.com/free-animated-icons/business-and-finance" class="text-[#9EDDFF] hover:text-white text-sm font-bold transition">Flaticon</a>
                </div>

                <a href="https://www.flaticon.com/free-animated-icons/business-and-finance"></a>

            </div>

            <div class="mt-8">
                <button onclick="closeCreditsModal()" class="w-full bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20">
                    Close
                </button>
            </div>
        </div>
    </div>
`;

const confirmModalHTML = `
    <div id="custom-confirm" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[10000]">
        <div class="glass-card bg-[#132419]/95 border border-white/20 p-8 rounded-3xl shadow-2xl w-[400px] max-w-[90vw] animate-fade-in text-center">
            <div class="mb-6">
                <img src="assets/gif/error.gif" class="w-16 h-16 mx-auto mb-4 object-contain" alt="Warning">
                <h3 class="text-xl font-bold text-white mb-2" id="confirm-title">Confirm Action</h3>
                <p class="text-gray-400 text-sm" id="confirm-message">Are you sure you want to proceed?</p>
            </div>
            <div class="flex gap-4">
                <button id="confirm-cancel" class="flex-1 px-6 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10">
                    Cancel
                </button>
                <button id="confirm-proceed" class="flex-1 px-6 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">
                    Delete
                </button>
            </div>
        </div>
    </div>
`;

// ==========================================
// 2. DOM INITIALIZATION
// ==========================================

// Dynamically inject the modals and toast container into the DOM upon initialization
document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML('beforeend', confirmModalHTML);
    document.body.insertAdjacentHTML('beforeend', creditsModalHTML);

    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
});

// ==========================================
// 3. MODAL TOGGLE FUNCTIONS
// ==========================================

function openCreditsModal() {
    document.getElementById('credits-modal').classList.remove('hidden');
}

function closeCreditsModal() {
    document.getElementById('credits-modal').classList.add('hidden');
}

// ==========================================
// 4. UI UTILITY FUNCTIONS
// ==========================================

/**
 * Displays a styled toast notification with a sliding exit animation.
 * * @param {string} message - The notification payload to display.
 * @param {string} type - The contextual type of the notification ('success', 'error', or 'info').
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Select the corresponding GIF icon based on the contextual type
    const iconHTML = type === 'success' 
        ? `<img src="assets/gif/right.gif" alt="Success" class="w-8 h-8 object-contain">` 
        : (type === 'error' 
            ? `<img src="assets/gif/error.gif" alt="Error" class="w-8 h-8 object-contain">` 
            : `<img src="assets/gif/info.gif" alt="Info" class="w-8 h-8 object-contain">`);

    toast.className = `toast-item ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${iconHTML}
        </div>
        <div class="flex-1">
            <p class="text-sm font-semibold tracking-wide">${message}</p>
        </div>
    `;

    // Allow premature dismissal via click event
    toast.onclick = () => toast.remove();

    container.appendChild(toast);

    // Automatically slide out after 4 seconds
    setTimeout(() => {

    // 1. Add a CSS class containing the slide-out effect
    toast.classList.add('toast-out-anim');

    // 2. Wait exactly 400ms (matching the 0.4s animation time in CSS) before deleting the HTML
    setTimeout(() => toast.remove(), 400);

    }, 4000);

    // If there is a sound helper, play a notification sound
    if (typeof playAppSound === 'function') {

    playAppSound(type === 'notify');

    }

}
/**
 * An asynchronous custom confirmation dialog replacing the native window.confirm() method.
 * * @param {string} message - The prompt text requesting user verification.
 * @returns {Promise<boolean>} A promise resolving to true if proceeded, or false if canceled.
 */
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm');
        const msgEl = document.getElementById('confirm-message');
        const btnCancel = document.getElementById('confirm-cancel');
        const btnProceed = document.getElementById('confirm-proceed');

        msgEl.innerText = message;
        modal.classList.remove('hidden');

        // Trigger notification sound if the utility is present
        if (typeof playAppSound === 'function') playAppSound('notify');

        const close = (result) => {
            modal.classList.add('hidden');
            
            // Cleanup event listeners to prevent memory leaks
            btnCancel.onclick = null;
            btnProceed.onclick = null;
            
            resolve(result);
        };

        btnCancel.onclick = () => close(false);
        btnProceed.onclick = () => close(true);
        
        // Dismiss the modal and resolve to false when clicking the backdrop layer
        modal.onclick = (e) => { 
            if (e.target === modal) close(false); 
        };
    });
}