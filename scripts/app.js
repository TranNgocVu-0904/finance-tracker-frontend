/**
 * ==========================================
 * MAIN DASHBOARD CONTROLLER
 * Orchestrates data fetching, state management, and Chart.js rendering.
 * ==========================================
 */

let pieChartInstance = null; 

// ==========================================
// PART 1: LOGIC (Unit Test)
// ==========================================

/**
 * Aggregates transaction amounts by category for the Pie Chart.
 * @param {Array} transactions - Raw transaction data.
 * @returns {Object} { categoryData, categoryTypes }
 */
function calculateCategoryTotals(transactions) {
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
    return { categoryData, categoryTypes };
}

/**
 * Determines financial advice metadata based on income and expense levels.
 */
function getFinancialAdvice(totalIncome, totalExpense) {
    if (totalExpense > totalIncome) {
        return {
            text: "Warning: You're spending more than you earn! Please review your spending categories in the chart next to this text.",
            className: "text-rose-400 italic font-medium"
        };
    } else if (totalIncome === 0 && totalExpense === 0) {
        return {
            text: "Please add your first transaction so the system can begin analyzing it!",
            className: "text-gray-400 italic"
        };
    } else {
        return {
            text: "Excellent! You're managing your finances very well. Keep maintaining this balance to contribute to your Financial Freedom Future.",
            className: "text-emerald-400 italic font-medium"
        };
    }
}

// ==========================================
// PART 2: UI & API HANDLERS
// ==========================================

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

            const adviceEl = document.getElementById('financial-advice');
            if (adviceEl) {
                const advice = getFinancialAdvice(data.totalIncome, data.totalExpense);
                adviceEl.innerText = advice.text;
                adviceEl.className = advice.className;
                adviceEl.setAttribute('data-default-text', advice.text);
                adviceEl.setAttribute('data-default-class', advice.className);
            }
        }
    } catch (error) { console.error("Dashboard error:", error); }
}

function updateCategoryPieChart(transactions) {
    const canvas = document.getElementById('incomeExpenseChart');
    if (!canvas) return; 
    
    const { categoryData } = calculateCategoryTotals(transactions);
    let labels = Object.keys(categoryData);
    let data = Object.values(categoryData);

    const ctx = canvas.getContext('2d');
    if (pieChartInstance) pieChartInstance.destroy();

    if (labels.length === 0) {
        drawDoughnut(ctx, ['No Data'], [1], ['rgba(255,255,255,0.05)'], ['#ffffff11'], false);
        return;
    }

    const customColors = {
        'Housing': { bg: 'rgba(239, 168, 228, 0.8)', border: '#EFA8E4' }, 
        'Transportation': { bg: 'rgba(254, 28, 128, 0.8)', border: '#FE1C80' }, 
        'Food and Drink': { bg: 'rgba(255, 95, 1, 0.8)', border: '#FF5F01' }, 
        'Entertainment': { bg: 'rgba(206, 0, 0, 0.8)', border: '#CE0000' }, 
        'Salary': { bg: 'rgba(183, 108, 253, 0.8)', border: '#B76CFD' }, 
        'Bonus': { bg: 'rgba(117, 213, 253, 0.8)', border: '#75D5FD' }
    };

    const bgColors = labels.map(l => customColors[l]?.bg || 'rgba(212, 165, 116, 0.8)');
    const borderColors = labels.map(l => customColors[l]?.border || '#d4a574');

    drawDoughnut(ctx, labels, data, bgColors, borderColors, true, transactions);
}

function drawDoughnut(ctx, labels, data, bgColors, borderColors, hasData, originalTransactions) {
    if (pieChartInstance) { pieChartInstance.destroy(); }

    const adviceEl = document.getElementById('financial-advice');

    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data, 
                backgroundColor: bgColors, 
                borderColor: borderColors,
                borderWidth: 2, 
                hoverOffset: hasData ? 15 : 0 
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '75%',
            onHover: (event, chartElement) => {
                
                // 1. Reset the transaction ledger styling (restore baseline opacity)
                const tableRows = document.querySelectorAll('#transaction-table-body > div');
                tableRows.forEach(row => {
                    row.style.color = 'rgba(255,255,255,0.5)';
                    row.style.fontWeight = '400';
                    row.style.opacity = '1';
                    row.style.backgroundColor = 'transparent';
                });

                // 2. Dynamic Top 5 transactions injection logic
                if (chartElement.length > 0) {
                    const index = chartElement[0].index;
                    const hoveredLabel = labels[index];
                    const activeColor = borderColors[index];

                    // --- EXTRACT TOP 5 TRANSACTIONS FOR THE HOVERED CATEGORY ---
                    const topTransactions = originalTransactions
                        .filter(t => t.categoryName === hoveredLabel)
                        .sort((a, b) => b.amount - a.amount) // Sort in descending order
                        .slice(0, 5); // Isolate the top 5 records

                    // Construct the HTML payload to inject into the financial advice container
                    let html = `<div class="animate-fade-in">
                        <h4 class="text-white font-bold mb-3 flex items-center">
                            <span class="w-3 h-3 rounded-full mr-2" style="background:${activeColor}"></span>
                            Top 5 Expenses: ${hoveredLabel}
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
                    adviceEl.className = "p-2"; // Remove default italics for improved list legibility

                    // Apply visual highlighting to the corresponding rows in the data table
                    tableRows.forEach(row => {
                        if (row.getAttribute('data-category-name') === hoveredLabel) {
                            row.style.color = 'white';
                            row.style.fontWeight = '700';
                            row.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        } else {
                            // Dim non-matching rows
                            row.style.opacity = '0.2';
                        }
                    });
                } else {
                    // On mouseout: Restore the default financial advice state
                    adviceEl.innerText = adviceEl.getAttribute('data-default-text');
                    adviceEl.className = adviceEl.getAttribute('data-default-class');
                }
            },
            plugins: {
                legend: { 
                    position: 'bottom', 
                    labels: { color: '#e5e7eb', font: { family: 'Outfit', size: 11, weight: 'bold' }, usePointStyle: true, padding: 15 } 
                },
                tooltip: { enabled: hasData }
            }
        }
    });
}

// ==========================================
// 5. UI/UX INTERACTION CONTROLLERS
// ==========================================

// Modal toggles
function openModal() {
    document.getElementById('transaction-modal').classList.remove('hidden');
    fetchCategories();
    document.getElementById('trans-date').valueAsDate = new Date();
}

function closeModal() {
    document.getElementById('transaction-modal').classList.add('hidden');
    if (document.getElementById('transaction-form')) {
        document.getElementById('transaction-form').reset();
    }
}

// Bind event listeners for global search and categorical filtering
document.getElementById('global-search')?.addEventListener('input', filterTransactionTable);
document.getElementById('category-select-filter')?.addEventListener('change', filterTransactionTable);

/**
 * Filters the transaction table in real-time based on the search query and selected category.
 */
function filterTransactionTable() {
    const searchTerm = document.getElementById('global-search').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('category-select-filter').value;
    const rows = document.querySelectorAll('#transaction-table-body > div');

    rows.forEach(row => {
        // Evaluate the entire text payload of the card entity
        const textContent = row.innerText.toLowerCase();
        const category = row.getAttribute('data-category-name') || "";

        // Determine logical matches
        const matchesSearch = textContent.includes(searchTerm);
        const matchesCategory = categoryFilter === "" || category === categoryFilter;

        // Toggle element visibility
        row.style.display = (matchesSearch && matchesCategory) ? "" : "none";
    });
}

function goToAnalytics(categoryName) {
    window.location.href = `analytics.html?category=${encodeURIComponent(categoryName)}`;
}

// ==========================================
// 6. ANIMATION UTILITIES
// ==========================================
/**
 * Smoothly interpolates an integer value from zero to a target limit over a specified duration.
 * Utilizes requestAnimationFrame for high-performance rendering.
 */
function animateNumber(elementId, targetValue, suffix = " VNĐ") {
    const el = document.getElementById(elementId);
    if (!el) return;

    let startValue = 0;
    const duration = 1000; // Define execution timeframe (1000ms)
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply an Ease-Out Exponential formula for smooth hardware-accelerated deceleration
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        const currentValue = Math.floor(easeProgress * targetValue);
        el.innerText = currentValue.toLocaleString('vi-VN') + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}
// ==========================================
// PART 3: EXPORT FOR JEST
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateCategoryTotals, getFinancialAdvice };
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    document.addEventListener("DOMContentLoaded", function() {
        const token = localStorage.getItem('jwt_token');
        if (document.getElementById('totalIncome')) {
            fetchDashboardData(token);
        }
    });
}