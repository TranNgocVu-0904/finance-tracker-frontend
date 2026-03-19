let barChartInstance = null;
let allTransactions = [];
let currentCategory = "";
let currentDays = 30; // Mặc định xem 30 ngày

// BẢNG MÀU ĐỒNG BỘ 100% VỚI PIE CHART Ở DASHBOARD
const categoryColors = {
    'Housing':          { bg: 'rgba(239,168,228, 0.8)',   border: '#EFA8E4' }, 
    'Transportation':   { bg: 'rgba(254, 28, 128, 0.8)',  border: '#FE1C80' }, 
    'Food and Drink':   { bg: 'rgba(255, 95, 1, 0.8)',    border: '#FF5F01' }, 
    'Entertainment':    { bg: 'rgba(206, 0, 0, 0.8)',     border: '#CE0000' }, 
    'Salary':           { bg: 'rgba(183, 108, 253, 0.8)', border: '#B76CFD' }, 
    'Bonus':            { bg: 'rgba(117, 213, 253, 0.8)', border: '#75D5FD' }
};

document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category') || 'Overview';
    
    document.getElementById('analytics-title').innerText = `Category analysis: ${currentCategory}`;
    const categorySelect = document.getElementById('analytics-category');
    
    if(categorySelect) {
        const optionExists = Array.from(categorySelect.options).some(opt => opt.value === currentCategory);
        if(!optionExists && currentCategory !== 'Overview') {
            categorySelect.add(new Option(currentCategory, currentCategory));
        }
        categorySelect.value = currentCategory;
        
        categorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            document.getElementById('analytics-title').innerText = `Category analysis: ${currentCategory}`;
            updateBarChart(currentDays);
            
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('category', currentCategory);
            window.history.pushState({}, '', newUrl);
        });
    }

    await fetchAllTransactions(token);
    updateBarChart(currentDays);

    document.getElementById('btn-7d').addEventListener('click', (e) => setActiveBtn(e.target, 7));
    document.getElementById('btn-30d').addEventListener('click', (e) => setActiveBtn(e.target, 30));
    document.getElementById('btn-90d').addEventListener('click', (e) => setActiveBtn(e.target, 90));
});

async function fetchAllTransactions(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            allTransactions = await response.json();
        }
    } catch (error) { console.error("Data retrieval error:", error); }
}

function setActiveBtn(clickedBtn, days) {
    document.querySelectorAll('.card-actions .card-btn').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    currentDays = days; 
    updateBarChart(days); 
}

function updateBarChart(daysAmount) {
    const today = new Date();
    const labels = [];
    const dataMap = {}; // Lưu trữ tổng tiền của từng danh mục cho mỗi ngày

    updateStatsCards(daysAmount);

    // 1. Khởi tạo các mốc thời gian và cấu trúc dữ liệu trống
    for (let i = daysAmount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('vi-VN');
        
        labels.push(dateStr);
        dataMap[dateStr] = {
            'Housing': 0, 'Transportation': 0, 'Food and Drink': 0, 'Entertainment': 0, 'Salary': 0, 'Bonus': 0
        };
    }

    // 2. Quét qua dữ liệu và cộng dồn tiền vào đúng ngày, đúng danh mục
    allTransactions.forEach(t => {
        const tDate = new Date(t.transactionDate).toLocaleDateString('vi-VN');
        if (dataMap[tDate] !== undefined && dataMap[tDate][t.categoryName] !== undefined) {
            dataMap[tDate][t.categoryName] += t.amount;
        }
    });

    let datasets = [];
    const isStacked = currentCategory === 'Overview';

    // 3. Chuẩn bị dữ liệu cho Chart.js
    if (isStacked) {
        // NẾU LÀ TỔNG QUAN: Tạo 6 datasets xếp chồng lên nhau
        Object.keys(categoryColors).forEach(cat => {
            const catData = labels.map(label => dataMap[label][cat]);
            
            // Chỉ hiển thị các danh mục có phát sinh giao dịch để chú thích (legend) đỡ rối
            if (catData.some(val => val > 0)) {
                datasets.push({
                    label: cat,
                    data: catData,
                    backgroundColor: categoryColors[cat].bg,
                    borderColor: categoryColors[cat].border,
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.6
                });
            }
        });
    } else {
        // NẾU LÀ DANH MỤC CỤ THỂ: Tạo 1 dataset với màu tương ứng
        // Lấy màu riêng của danh mục, nếu không có thì dùng màu Xanh ngọc mặc định
        const catColor = categoryColors[currentCategory] || { bg: 'rgba(52, 211, 153, 0.8)', border: '#34d399' };
        const catData = labels.map(label => dataMap[label][currentCategory] || 0);

        datasets.push({
            label: currentCategory,
            data: catData,
            backgroundColor: catColor.bg,
            borderColor: catColor.border,
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6
        });
    }

    // 4. Vẽ biểu đồ
    const ctx = document.getElementById('categoryBarChart').getContext('2d');
    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500, easing: 'easeOutQuart' },
            plugins: {
                // Hiển thị chú thích màu (Legend) nếu là biểu đồ xếp chồng
                legend: { 
                    display: isStacked,
                    position: 'bottom',
                    labels: { color: '#e5e7eb', font: { family: 'Outfit', size: 12 }, usePointStyle: true, padding: 20 }
                },
                // Hover vào biểu đồ xếp chồng sẽ hiện tổng quát các danh mục của ngày đó
                tooltip: { 
                    mode: isStacked ? 'index' : 'nearest',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#e5e7eb',
                    bodyColor: '#e5e7eb',
                    padding: 12,
                    callbacks: { 
                        label: function(context) { 
                            return ` ${context.dataset.label}: ${context.parsed.y.toLocaleString('vi-VN')} ₫`; 
                        } 
                    } 
                }
            },
            scales: {
                x: { 
                    stacked: isStacked, // Bật chế độ xếp chồng trục X
                    grid: { display: false }, 
                    ticks: { color: '#9ca3af', font: { family: 'Space Mono' } } 
                },
                y: {
                    stacked: isStacked, // Bật chế độ xếp chồng trục Y
                    grid: { color: 'rgba(255, 255, 255, 0.05)', borderDash: [5, 5] },
                    ticks: { 
                        color: '#9ca3af', font: { family: 'Space Mono' },
                        callback: function(value) {
                            if(value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                            if(value >= 1000) return (value / 1000).toFixed(0) + 'K';
                            return value;
                        }
                    }
                }
            },
            interaction: { mode: isStacked ? 'index' : 'nearest', axis: 'x', intersect: false }
        }
    });
}
function updateStatsCards(daysAmount) {
    const today = new Date();
    // Đưa thời gian về đầu ngày để so sánh chuẩn xác
    today.setHours(23, 59, 59, 999); 
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - daysAmount + 1);
    cutoffDate.setHours(0, 0, 0, 0);

    let totalAmount = 0;
    let txCount = 0;
    let maxAmount = 0;

    // Lọc dữ liệu: Nằm trong khoảng thời gian, không phải Thu Nhập, và đúng Danh Mục
    allTransactions.forEach(t => {
        const tDate = new Date(t.transactionDate);
        if (tDate >= cutoffDate && tDate <= today && t.categoryType !== 'INCOME') {
            
            // Nếu là Tổng quan thì tính hết, nếu không thì phải khớp danh mục
            if (currentCategory === 'Overview' || t.categoryName === currentCategory) {
                totalAmount += t.amount;
                txCount++;
                if (t.amount > maxAmount) {
                    maxAmount = t.amount;
                }
            }
        }
    });

    // 1. Tính toán giá trị hiển thị (Chia cho 1000 để bỏ 3 số 0)
    const displayTotal = Math.floor(totalAmount / 1000);
    const displayDaily = Math.floor((totalAmount / daysAmount) / 1000);
    const displayMax = Math.floor(maxAmount / 1000);

    // 2. Chạy hiệu ứng với tốc độ 800ms (0.8 giây)
    animateValue('stat-total', 0, displayTotal, 1000);
    animateValue('stat-daily', 0, displayDaily, 1000);
    animateValue('stat-max', 0, displayMax, 1000);

    // Riêng số lần giao dịch thì giữ nguyên không chia 1000
    animateValue('stat-count', 0, txCount, 1000);
}
// Hàm tạo hiệu ứng nhảy số siêu mượt
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Hiệu ứng Ease-Out: Khởi đầu nhanh, càng về cuối càng chậm dần cho đẹp
        const easeOut = 1 - Math.pow(1 - progress, 4); 
        const currentVal = Math.floor(start + (end - start) * easeOut);
        
        // Cập nhật số lên màn hình kèm định dạng vi-VN
        obj.innerText = currentVal.toLocaleString('vi-VN');
        
        // Nếu chưa chạy xong thời gian thì tiếp tục gọi lại
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Đảm bảo kết thúc bằng chính xác con số cuối cùng
            obj.innerText = end.toLocaleString('vi-VN'); 
        }
    };
    window.requestAnimationFrame(step);
}