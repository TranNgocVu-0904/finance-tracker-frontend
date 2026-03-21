/**
 * ==========================================
 * ANALYTICS DASHBOARD CONTROLLER
 * Handles data aggregation, state management, and Chart.js rendering.
 * ==========================================
 */

let barChartInstance = null;
let allTransactions = [];
let currentCategory = "";
let currentDays = 30;

const categoryColors = {
    'Housing':          { bg: 'rgba(239, 168, 228, 0.8)', border: '#EFA8E4' }, 
    'Transportation':   { bg: 'rgba(254, 28, 128, 0.8)',  border: '#FE1C80' }, 
    'Food and Drink':   { bg: 'rgba(255, 95, 1, 0.8)',    border: '#FF5F01' }, 
    'Entertainment':    { bg: 'rgba(206, 0, 0, 0.8)',     border: '#CE0000' }, 
    'Salary':           { bg: 'rgba(183, 108, 253, 0.8)', border: '#B76CFD' }, 
    'Bonus':            { bg: 'rgba(117, 213, 253, 0.8)', border: '#75D5FD' }
};

// ==========================================
// PART 1: LOGIC (Unit Test)
// ==========================================

/**
 * Aggregates transaction amounts into a chronological data matrix.
 * @returns {Object} { labels, dataMap }
 */
function aggregateChartData(transactions, daysAmount) {
    const today = new Date();
    const labels = [];
    const dataMap = {};

    for (let i = daysAmount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('vi-VN');
        labels.push(dateStr);
        dataMap[dateStr] = {
            'Housing': 0, 'Transportation': 0, 'Food and Drink': 0, 
            'Entertainment': 0, 'Salary': 0, 'Bonus': 0
        };
    }

    transactions.forEach(t => {
        const tDate = new Date(t.transactionDate).toLocaleDateString('vi-VN');
        if (dataMap[tDate] !== undefined && dataMap[tDate][t.categoryName] !== undefined) {
            dataMap[tDate][t.categoryName] += t.amount;
        }
    });
    return { labels, dataMap };
}

/**
 * Calculates summary metrics based on date range and category filters.
 */
function calculateStats(transactions, daysAmount, category) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); 
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - daysAmount + 1);
    cutoffDate.setHours(0, 0, 0, 0);

    let totalAmount = 0;
    let txCount = 0;
    let maxAmount = 0;

    transactions.forEach(t => {
        const tDate = new Date(t.transactionDate);
        if (tDate >= cutoffDate && tDate <= today && t.categoryType !== 'INCOME') {
            if (category === 'Overview' || t.categoryName === category) {
                totalAmount += t.amount;
                txCount++;
                if (t.amount > maxAmount) maxAmount = t.amount;
            }
        }
    });

    return {
        total: Math.floor(totalAmount / 1000),
        daily: Math.floor((totalAmount / daysAmount) / 1000),
        max: Math.floor(maxAmount / 1000),
        count: txCount
    };
}

// ==========================================
// PART 2: UI & CHART RENDERERS
// ==========================================

async function fetchAllTransactions(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) allTransactions = await response.json();
    } catch (error) { console.error("Data retrieval error:", error); }
}

function updateBarChart(daysAmount) {

    const { labels, dataMap } = aggregateChartData(allTransactions, daysAmount);
    updateStatsCards(daysAmount);

    let datasets = [];
    const isStacked = currentCategory === 'Overview';

    if (isStacked) {
        Object.keys(categoryColors).forEach(cat => {
            const catData = labels.map(label => dataMap[label][cat]);
            if (catData.some(val => val > 0)) {
                datasets.push({
                    label: cat, data: catData,
                    backgroundColor: categoryColors[cat].bg,
                    borderColor: categoryColors[cat].border,
                    borderWidth: 1, borderRadius: 4
                });
            }
        });
    } else {
        const catColor = categoryColors[currentCategory] || { bg: 'rgba(52, 211, 153, 0.8)', border: '#34d399' };
        datasets.push({
            label: currentCategory,
            data: labels.map(label => dataMap[label][currentCategory] || 0),
            backgroundColor: catColor.bg, borderColor: catColor.border,
            borderWidth: 1, borderRadius: 4
        });
    }

    const canvas = document.getElementById('categoryBarChart');

    if (!canvas) return; // Preventing from for testing environments without DOM
    
    const ctx = canvas.getContext('2d');

    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: { responsive: true, scales: { x: { stacked: isStacked }, y: { stacked: isStacked } } }
    });
}

function updateStatsCards(daysAmount) {
    const stats = calculateStats(allTransactions, daysAmount, currentCategory);
    animateValue('stat-total', 0, stats.total, 1000);
    animateValue('stat-daily', 0, stats.daily, 1000);
    animateValue('stat-max', 0, stats.max, 1000);
    animateValue('stat-count', 0, stats.count, 1000);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    obj.innerText = end.toLocaleString('vi-VN'); // Simplified for headless logic
}

function setActiveBtn(clickedBtn, days) {
    document.querySelectorAll('.card-actions .card-btn').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    currentDays = days; 
    updateBarChart(days); 
}

// ==========================================
// PART 3: EXPORT FOR JEST
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { aggregateChartData, calculateStats };
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    document.addEventListener("DOMContentLoaded", async function() {
        const token = localStorage.getItem('jwt_token');
        if (!token) { window.location.href = 'login.html'; return; }

        const urlParams = new URLSearchParams(window.location.search);
        currentCategory = urlParams.get('category') || 'Overview';
        document.getElementById('analytics-title').innerText = `Category analysis: ${currentCategory}`;
        
        const categorySelect = document.getElementById('analytics-category');
        if (categorySelect) {
            categorySelect.value = currentCategory;
            categorySelect.addEventListener('change', (e) => {
                currentCategory = e.target.value;
                document.getElementById('analytics-title').innerText = `Category analysis: ${currentCategory}`;
                updateBarChart(currentDays);
            });
        }
        await fetchAllTransactions(token);
        updateBarChart(currentDays);
    });
}