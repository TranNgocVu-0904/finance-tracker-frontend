let pieChartInstance = null; 

// ==========================================
// 1. KHỞI TẠO APP KHI TRANG LOAD XONG
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('jwt_token');
    
    // Nếu đang đứng ở trang index (có Dashboard) thì mới gọi API lấy số liệu
    if (document.getElementById('totalIncome')) {
        fetchDashboardData(token);
        fetchTransactions(token);
        fetchUserInfo(token);

        // Khởi tạo Smart Wealth Sandbox (Bản đồ Tài chính)
        if(typeof WealthWidget !== 'undefined') {
            WealthWidget.init();
            document.getElementById('reset-test-btn').addEventListener('click', () => {
                WealthWidget.reset();
            });
        }
    }
});

// ==========================================
// 3. CÁC HÀM GỌI API DASHBOARD & THÔNG TIN
// ==========================================
async function fetchUserInfo(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            
            // Dùng innerHTML thay cho innerText
            document.getElementById('user-greeting').innerHTML = `
                <img src="assets/gif/wave.gif" alt="Wave icon" class="w-10 h-10 inline-block mr-2 pb-1 object-contain">
                Hello ${user.name}, have a nice day!
            `;
        }
    } catch (error) { console.error(error); }
}

async function fetchDashboardData(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            animateNumber('totalIncome', data.totalIncome);
            animateNumber('totalExpense', data.totalExpense);
            animateNumber('totalBalance', data.balance);

            // Thêm dòng này vào cuối hàm fetchDashboardData, đoạn hiển thị adviceEl
            const adviceEl = document.getElementById('financial-advice');
            adviceEl.setAttribute('data-default-text', adviceEl.innerText);
            adviceEl.setAttribute('data-default-class', adviceEl.className);
            if (data.totalExpense > data.totalIncome) {
                adviceEl.innerText = "Warning: You're spending more than you earn! Please review your spending categories in the chart next to this text.";
                adviceEl.className = "text-rose-400 italic font-medium"; 
            } else if (data.totalIncome === 0 && data.totalExpense === 0) {
                adviceEl.innerText = "Please add your first transaction so the system can begin analyzing it!";
                adviceEl.className = "text-gray-400 italic";
            } else {
                adviceEl.innerText = "Excellent! You're managing your finances very well. Keep maintaining this balance to contribute to your Financial Freedom Future.";
                adviceEl.className = "text-emerald-400 italic font-medium"; 
            }
        }
    } catch (error) { console.error(error); }
}

async function fetchTransactions(token) {
    const tableBody = document.getElementById('transaction-table-body');
    
    // SỬA LỖI 1: Thay thẻ <tr><td> bằng <div>
    tableBody.innerHTML = `<div class="w-full py-10 text-center text-gray-400">Đang tải giao dịch...</div>`;

    const categoryColors = {
    'Housing':          '#EFA8E4',
    'Transportation':   '#FE1C80',
    'Food and Drink':   '#FF5F01',
    'Entertainment':    '#CE0000',
    'Salary':           '#B76CFD',
    'Bonus':            '#75D5FD'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const transactions = await response.json();
            updateCategoryPieChart(transactions); 
            
            setTimeout(() => {
                tableBody.innerHTML = ''; 

                if (transactions.length === 0) {
                    // SỬA LỖI 2: Thay thẻ <tr><td> bằng <div>
                    tableBody.innerHTML = `<div class="w-full text-center py-4 text-gray-400">No transactions have been made yet.</div>`;
                    return;
                }

                transactions.forEach(t => {
                    const isIncome = t.categoryType === 'INCOME';
                    const borderColor = categoryColors[t.categoryName] || '#ffffff';

                    const row = `
                        <div onclick="goToAnalytics('${t.categoryName}')" 
                            class="group relative grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-xl bg-white/5 border transition-all duration-300 cursor-pointer overflow-hidden"
                            data-category-name="${t.categoryName}" 
                            data-category-color="${borderColor}"
                            style="color: rgba(255,255,255,0.7); font-weight: 400; border-color: rgba(255,255,255,0.05);"
                            onmouseover="this.style.color='white'; this.style.fontWeight='700'; this.style.borderColor='${borderColor}44'; this.style.boxShadow='0 4px 20px -5px ${borderColor}22'; const line = this.querySelector('.absolute'); if(line) line.style.opacity='1';"
                            onmouseout="this.style.color='rgba(255,255,255,0.5)'; this.style.fontWeight='400'; this.style.borderColor='rgba(255,255,255,0.05)'; this.style.boxShadow='none'; const line = this.querySelector('.absolute'); if(line) line.style.opacity='0';">
                            
                            <div class="absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-300" style="background-color: ${borderColor}; opacity: 0;"></div>

                            <div class="col-span-2 text-sm font-medium tracking-wide text-left">${new Date(t.transactionDate).toLocaleDateString('vi-VN')}</div>
                            
                            <div class="col-span-4 flex items-center justify-start overflow-hidden">
                                <span class="font-medium truncate pr-2 text-inherit text-left">${t.description}</span>
                            </div>
                            
                            <div class="col-span-3 flex justify-start">
                                <span class="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" 
                                    style="border: 1px solid ${borderColor}55; background: ${borderColor}11; color: ${borderColor}">
                                    ${t.categoryName}
                                </span>
                            </div>
                            
                            <div class="col-span-2 text-right font-mono font-bold text-base ${isIncome ? 'text-emerald-400' : 'text-white'} drop-shadow-md">
                                ${isIncome ? '+' : '-'}${t.amount.toLocaleString('vi-VN')} ₫
                            </div>

                            <div class="col-span-1 flex justify-end">
                                <button onclick="deleteTransaction('${t.id}'); event.stopPropagation();" 
                                        class="opacity-0 group-hover:opacity-100 p-1.5 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-all duration-200" title="Xóa giao dịch">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    `;

                    tableBody.insertAdjacentHTML('beforeend', row);
                });
            }, 300);
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error("API connection error:", error);
        
        tableBody.innerHTML = `<div class="w-full text-center py-4 text-rose-500">Unable to load the data at this time. Please try again later!</div>`;
    }
}

// ==========================================
// 4. XỬ LÝ GIAO DỊCH (THÊM / XÓA)
// ==========================================
const transForm = document.getElementById('transaction-form');
if (transForm) {
    transForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_token');
        const body = {
            amount: document.getElementById('trans-amount').value,
            description: document.getElementById('trans-desc').value,
            transactionDate: document.getElementById('trans-date').value,
            categoryId: document.getElementById('trans-category').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                playAppSound('income');
                closeModal();
                fetchDashboardData(token);
                fetchTransactions(token);
                showToast("Transaction added successfully!", "success");
            } else {
                const error = await response.json();
                showToast(error.message || "Failed to add transaction.", "error");
            }
        } catch (error) { 
            showToast("Unable to load the data at this time. Please try again later!", "error"); 
        }
    });
}

async function deleteTransaction(transactionId) {
    const confirmed = await showConfirm("Are you sure you want to delete this transaction? This action cannot be undone.");
    if (!confirmed) return;
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            fetchDashboardData(token);
            fetchTransactions(token);
            showToast("Transaction deleted successfully.", "success");
        } 
        else { 
            showToast("Failed to delete transaction.", "error");
        }
    } catch (error) { 
        console.error(error); 
        showToast("Unable to delete the data at this time. Please try again later!", "error");
    }
}

// ==========================================
// 5. MODAL & BIỂU ĐỒ PIE
// ==========================================
function openModal() {
    document.getElementById('transaction-modal').classList.remove('hidden');
    fetchCategories();
    document.getElementById('trans-date').valueAsDate = new Date();
}

function closeModal() {
    document.getElementById('transaction-modal').classList.add('hidden');
    if(document.getElementById('transaction-form')) document.getElementById('transaction-form').reset();
}

async function fetchCategories() {
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await response.json();
        const select = document.getElementById('trans-category');
        select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name} (${c.type})</option>`).join('');
    } catch (error) { console.error(error); }
}

// ==========================================
// 5. BIỂU ĐỒ PIE (BẢN TỔNG HỢP CHUẨN MÀU)
// ==========================================
function updateCategoryPieChart(transactions) {
    const canvas = document.getElementById('incomeExpenseChart');
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');
    
    const categoryData = {};
    const categoryTypes = {}; 

    transactions.forEach(t => {
        const name = t.categoryName;
        if (!categoryData[name]) {
            categoryData[name] = 0;
            categoryTypes[name] = t.categoryType;
        }
        categoryData[name] += t.amount;
    });

    let labels = Object.keys(categoryData);
    let data = Object.values(categoryData);

    if (pieChartInstance) { pieChartInstance.destroy(); }

    if (labels.length === 0) {
        labels = ['Chưa có dữ liệu'];
        data = [1];
        drawDoughnut(ctx, labels, data, ['rgba(255, 255, 255, 0.05)'], ['rgba(255, 255, 255, 0.1)'], false);
        return;
    }

    const customColors = {
        'Housing':              { bg: 'rgba(239,168,228, 0.8)',   border: '#EFA8E4' }, 
        'Transportation':       { bg: 'rgba(254, 28, 128, 0.8)',  border: '#FE1C80' }, 
        'Food and Drink':       { bg: 'rgba(255, 95, 1, 0.8)',    border: '#FF5F01' }, 
        'Entertainment':        { bg: 'rgba(206, 0, 0, 0.8)',     border: '#CE0000' }, 
        'Salary':               { bg: 'rgba(183, 108, 253, 0.8)', border: '#B76CFD' }, 
        'Bonus':                { bg: 'rgba(117, 213, 253, 0.8)', border: '#75D5FD' }
    };

    const bgColors = labels.map(label => customColors[label]?.bg || 'rgba(212, 165, 116, 0.8)');
    const borderColors = labels.map(label => customColors[label]?.border || '#d4a574');

    // Gọi hàm vẽ chung để đồng bộ logic màu sắc
    drawDoughnut(ctx, labels, data, bgColors, borderColors, true, transactions);
}

// Chỉnh tham số đầu vào để nhận thêm mảng transactions gốc
function drawDoughnut(ctx, labels, data, bgColors, borderColors, hasData, originalTransactions) {
    if (pieChartInstance) { pieChartInstance.destroy(); }

    const adviceEl = document.getElementById('financial-advice');

    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data, backgroundColor: bgColors, borderColor: borderColors,
                borderWidth: 2, hoverOffset: hasData ? 15 : 0 
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '75%',
            onHover: (event, chartElement) => {
                // 1. Reset Bảng Lịch sử (Giữ nguyên logic Bold/Mờ của bạn)
                const tableRows = document.querySelectorAll('#transaction-table-body > div');
                tableRows.forEach(row => {
                    row.style.color = 'rgba(255,255,255,0.5)';
                    row.style.fontWeight = '400';
                    row.style.opacity = '1';
                    row.style.backgroundColor = 'transparent';
                });

                // 2. Logic Hiển thị 5 Giao dịch lớn nhất
                if (chartElement.length > 0) {
                    const index = chartElement[0].index;
                    const hoveredLabel = labels[index];
                    const activeColor = borderColors[index];

                    // --- XỬ LÝ DỮ LIỆU TOP 5 ---
                    const topTransactions = originalTransactions
                        .filter(t => t.categoryName === hoveredLabel)
                        .sort((a, b) => b.amount - a.amount) // Sắp xếp giảm dần
                        .slice(0, 5); // Lấy 5 cái đầu tiên

                    // Tạo HTML để hiển thị vào ô Phân tích dòng tiền
                    let html = `<div class="animate-fade-in">
                        <h4 class="text-white font-bold mb-3 flex items-center">
                            <span class="w-3 h-3 rounded-full mr-2" style="background:${activeColor}"></span>
                            Top 5 chi tiêu: ${hoveredLabel}
                        </h4>
                        <ul class="space-y-2">`;
                    
                    topTransactions.forEach(t => {
                        html += `
                            <li class="flex justify-between text-sm border-b border-white/5 pb-1">
                                <span class="text-gray-400">${t.description}</span>
                                <span class="text-white font-mono font-bold">${t.amount.toLocaleString('vi-VN')} ₫</span>
                            </li>`;
                    });
                    
                    html += `</ul></div>`;
                    
                    adviceEl.innerHTML = html;
                    adviceEl.className = "p-2"; // Xóa class italic mặc định để dễ nhìn

                    // Highlight hàng ở bảng dưới
                    tableRows.forEach(row => {
                        if (row.getAttribute('data-category-name') === hoveredLabel) {
                            row.style.color = 'white';
                            row.style.fontWeight = '700';
                            row.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        } else {
                            row.style.opacity = '0.2';
                        }
                    });
                } else {
                    // Khi rời chuột: Hiện lại lời khuyên mặc định
                    adviceEl.innerText = adviceEl.getAttribute('data-default-text');
                    adviceEl.className = adviceEl.getAttribute('data-default-class');
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { color: '#e5e7eb', font: { family: 'Outfit', size: 11, weight: 'bold' }, usePointStyle: true, padding: 15 } },
                tooltip: { enabled: hasData }
            }
        }
    });
}
// Lắng nghe sự kiện người dùng gõ vào ô tìm kiếm hoặc chọn Category
document.getElementById('global-search')?.addEventListener('input', filterTransactionTable);
document.getElementById('category-select-filter')?.addEventListener('change', filterTransactionTable);

function filterTransactionTable() {
    const searchTerm = document.getElementById('global-search').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('category-select-filter').value;
    const rows = document.querySelectorAll('#transaction-table-body > div');

    rows.forEach(row => {
        // Lấy toàn bộ text bên trong Card này (bao gồm ngày, mô tả, danh mục, số tiền)
        const textContent = row.innerText.toLowerCase();
        const category = row.getAttribute('data-category-name') || "";

        // Kiểm tra điều kiện
        const matchesSearch = textContent.includes(searchTerm);
        const matchesCategory = categoryFilter === "" || category === categoryFilter;

        // Hiện hoặc ẩn
        if (matchesSearch && matchesCategory) {
            row.style.display = ""; 
        } else {
            row.style.display = "none"; 
        }
    });
}
// Thêm hàm này vào cuối file app.js
function goToAnalytics(categoryName) {
    window.location.href = `analytics.html?category=${encodeURIComponent(categoryName)}`;
}
// Hàm tạo hiệu ứng nhảy số từ 0 đến target
function animateNumber(elementId, targetValue, suffix = " VNĐ") {
    const el = document.getElementById(elementId);
    if (!el) return;

    let startValue = 0;
    const duration = 1000; // Chạy trong 1 giây (1000ms)
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Công thức Ease Out Expo: giúp số chạy nhanh lúc đầu và chậm dần về cuối (nhìn sẽ xịn hơn)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        const currentValue = Math.floor(easeProgress * targetValue);
        el.innerText = currentValue.toLocaleString('vi-VN') + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}