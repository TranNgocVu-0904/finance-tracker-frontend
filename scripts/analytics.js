/**
 * ==========================================
 * ANALYTICS DASHBOARD CONTROLLER
 * Handles data aggregation, state management, and Chart.js rendering.
 * ==========================================
 */

// Global State Variables
let barChartInstance = null;
let allTransactions = [];
let currentCategory = "";
let currentDays = 30; // Default lookback period

// Consistent color palette synchronized with the primary dashboard's pie chart
const categoryColors = {
    'Housing':          { bg: 'rgba(239, 168, 228, 0.8)', border: '#EFA8E4' }, 
    'Transportation':   { bg: 'rgba(254, 28, 128, 0.8)',  border: '#FE1C80' }, 
    'Food and Drink':   { bg: 'rgba(255, 95, 1, 0.8)',    border: '#FF5F01' }, 
    'Entertainment':    { bg: 'rgba(206, 0, 0, 0.8)',     border: '#CE0000' }, 
    'Salary':           { bg: 'rgba(183, 108, 253, 0.8)', border: '#B76CFD' }, 
    'Bonus':            { bg: 'rgba(117, 213, 253, 0.8)', border: '#75D5FD' }
};

// ==========================================
// 1. INITIALIZATION & EVENT BINDING
// ==========================================
document.addEventListener("DOMContentLoaded", async function() {
    // Session validation
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Parse URL parameters for direct category navigation
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category') || 'Overview';
    
    // Initialize UI elements based on the selected category
    document.getElementById('analytics-title').innerText = `Category analysis: ${currentCategory}`;
    const categorySelect = document.getElementById('analytics-category');
    
    if (categorySelect) {
        // Ensure the current category exists as an option in the dropdown
        const optionExists = Array.from(categorySelect.options).some(opt => opt.value === currentCategory);
        if (!optionExists && currentCategory !== 'Overview') {
            categorySelect.add(new Option(currentCategory, currentCategory));
        }
        categorySelect.value = currentCategory;
        
        // Bind change event to update the chart and URL state dynamically
        categorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            document.getElementById('analytics-title').innerText = `Category analysis: ${currentCategory}`;
            updateBarChart(currentDays);
            
            // Push the new state to the browser history for shareable URLs
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('category', currentCategory);
            window.history.pushState({}, '', newUrl);
        });
    }

    // Fetch master dataset and render initial views
    await fetchAllTransactions(token);
    updateBarChart(currentDays);

    // Bind time-range toggle buttons
    document.getElementById('btn-7d').addEventListener('click', (e) => setActiveBtn(e.target, 7));
    document.getElementById('btn-30d').addEventListener('click', (e) => setActiveBtn(e.target, 30));
    document.getElementById('btn-90d').addEventListener('click', (e) => setActiveBtn(e.target, 90));
});

// ==========================================
// 2. DATA ACQUISITION
// ==========================================
async function fetchAllTransactions(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            allTransactions = await response.json();
        }
    } catch (error) { 
        console.error("Data retrieval error:", error); 
    }
}

// ==========================================
// 3. STATE UPDATERS
// ==========================================
function setActiveBtn(clickedBtn, days) {
    // Manage active visual state for time-range buttons
    document.querySelectorAll('.card-actions .card-btn').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    
    // Update global state and re-render visualizations
    currentDays = days; 
    updateBarChart(days); 
}

// ==========================================
// 4. CHART RENDERING & AGGREGATION
// ==========================================
function updateBarChart(daysAmount) {
    const today = new Date();
    const labels = [];
    const dataMap = {}; // Matrix mapping dates to category totals

    // Trigger updates for the summary metric cards
    updateStatsCards(daysAmount);

    // Step 1: Initialize chronological structure and empty data matrix
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

    // Step 2: Aggregate transaction amounts into the matrix based on date and category
    allTransactions.forEach(t => {
        const tDate = new Date(t.transactionDate).toLocaleDateString('vi-VN');
        if (dataMap[tDate] !== undefined && dataMap[tDate][t.categoryName] !== undefined) {
            dataMap[tDate][t.categoryName] += t.amount;
        }
    });

    let datasets = [];
    const isStacked = currentCategory === 'Overview';

    // Step 3: Format the aggregated data into Chart.js dataset configurations
    if (isStacked) {
        // Overview Mode: Generate layered datasets for stacked rendering
        Object.keys(categoryColors).forEach(cat => {
            const catData = labels.map(label => dataMap[label][cat]);
            
            // Exclude empty categories to optimize legend visibility
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
        // Specific Category Mode: Generate a single dataset with its designated color
        // Fallback to default Emerald if the category is not predefined in the palette
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

    // Step 4: Canvas initialization and Chart.js instantiation
    const ctx = document.getElementById('categoryBarChart').getContext('2d');
    
    // Destroy previous instance to prevent memory leaks and rendering overlaps
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
                // Configure legend visibility based on charting mode
                legend: { 
                    display: isStacked,
                    position: 'bottom',
                    labels: { color: '#e5e7eb', font: { family: 'Outfit', size: 12 }, usePointStyle: true, padding: 20 }
                },
                // Customize tooltip behavior for stacked vs individual views
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
                    stacked: isStacked, // Enable x-axis stacking for Overview mode
                    grid: { display: false }, 
                    ticks: { color: '#9ca3af', font: { family: 'Space Mono' } } 
                },
                y: {
                    stacked: isStacked, // Enable y-axis stacking for Overview mode
                    grid: { color: 'rgba(255, 255, 255, 0.05)', borderDash: [5, 5] },
                    ticks: { 
                        color: '#9ca3af', 
                        font: { family: 'Space Mono' },
                        // Format large currency values for UI brevity (e.g., 1.5M, 500K)
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

// ==========================================
// 5. SUMMARY METRICS CALCULATION
// ==========================================
function updateStatsCards(daysAmount) {
    const today = new Date();
    // Normalize "today" to the very end of the day to capture all recent transactions
    today.setHours(23, 59, 59, 999); 
    
    // Calculate the cutoff date based on the selected lookback period
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - daysAmount + 1);
    cutoffDate.setHours(0, 0, 0, 0);

    let totalAmount = 0;
    let txCount = 0;
    let maxAmount = 0;

    // Filter dataset: within date range, exclude income, match category criteria
    allTransactions.forEach(t => {
        const tDate = new Date(t.transactionDate);
        if (tDate >= cutoffDate && tDate <= today && t.categoryType !== 'INCOME') {
            
            // Bypass category check if in Overview mode
            if (currentCategory === 'Overview' || t.categoryName === currentCategory) {
                totalAmount += t.amount;
                txCount++;
                if (t.amount > maxAmount) {
                    maxAmount = t.amount;
                }
            }
        }
    });

    // Step 1: Normalize monetary values (divide by 1000) for UI presentation
    const displayTotal = Math.floor(totalAmount / 1000);
    const displayDaily = Math.floor((totalAmount / daysAmount) / 1000);
    const displayMax = Math.floor(maxAmount / 1000);

    // Step 2: Trigger hardware-accelerated number rolling animations (1-second duration)
    animateValue('stat-total', 0, displayTotal, 1000);
    animateValue('stat-daily', 0, displayDaily, 1000);
    animateValue('stat-max', 0, displayMax, 1000);

    // The transaction count remains absolute (no division)
    animateValue('stat-count', 0, txCount, 1000);
}

// ==========================================
// 6. UI ANIMATION UTILITIES
// ==========================================
/**
 * Smoothly interpolates an integer value from start to end over a specified duration.
 * Utilizes requestAnimationFrame for high-performance, layout-friendly rendering.
 * * @param {string} id - The DOM element ID to update.
 * @param {number} start - The initial value.
 * @param {number} end - The target final value.
 * @param {number} duration - The animation timeframe in milliseconds.
 */
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        
        // Calculate normalized progression (0.0 to 1.0)
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Apply an Ease-Out Quartic function for a polished deceleration effect
        const easeOut = 1 - Math.pow(1 - progress, 4); 
        const currentVal = Math.floor(start + (end - start) * easeOut);
        
        // Inject localized formatting directly into the DOM
        obj.innerText = currentVal.toLocaleString('vi-VN');
        
        // Continue loop if animation is not complete
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Guarantee precision by explicitly setting the final value upon completion
            obj.innerText = end.toLocaleString('vi-VN'); 
        }
    };
    
    window.requestAnimationFrame(step);
}