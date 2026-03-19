// 1. Chứa toàn bộ giao diện của Modal vào một biến
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

document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML('beforeend', confirmModalHTML);
});

// 2. Tự động "bơm" cái Modal này vào cuối thẻ <body>
document.addEventListener("DOMContentLoaded", function() {
    document.body.insertAdjacentHTML('beforeend', creditsModalHTML);
});

// 3. Các hàm đóng/mở
function openCreditsModal() {
    document.getElementById('credits-modal').classList.remove('hidden');
}

function closeCreditsModal() {
    document.getElementById('credits-modal').classList.add('hidden');
}
// Tự động tạo container chứa toast khi trang load
document.addEventListener("DOMContentLoaded", function() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
});

/**
 * Hiển thị thông báo đẹp mắt
 * @param {string} message - Nội dung thông báo
 * @param {string} type - 'success', 'error', hoặc 'info'
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Logic chọn icon GIF của bạn (đã dọn dẹp lại cho đồng bộ dấu nháy)
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

    // Click để đóng nhanh
    toast.onclick = () => toast.remove();

    container.appendChild(toast);

    // Tự động xóa sau 4 giây
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    // Nếu có sound-helper, phát âm thanh báo hiệu luôn
    if (typeof playAppSound === 'function') {
        playAppSound(type === 'error' ? 'delete' : 'notify');
    }
}
/**
 * Thay thế confirm() mặc định
 * @param {string} message - Câu hỏi cần xác nhận
 */
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm');
        const msgEl = document.getElementById('confirm-message');
        const btnCancel = document.getElementById('confirm-cancel');
        const btnProceed = document.getElementById('confirm-proceed');

        msgEl.innerText = message;
        modal.classList.remove('hidden');

        // Phát âm thanh cảnh báo nếu có
        if (typeof playAppSound === 'function') playAppSound('notify');

        const close = (result) => {
            modal.classList.add('hidden');
            btnCancel.onclick = null;
            btnProceed.onclick = null;
            resolve(result);
        };

        btnCancel.onclick = () => close(false);
        btnProceed.onclick = () => close(true);
        
        // Bấm ra ngoài cũng là Cancel
        modal.onclick = (e) => { if(e.target === modal) close(false); };
    });
}