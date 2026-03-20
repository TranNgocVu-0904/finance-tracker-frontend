/**
 * ==========================================
 * SMART WEALTH SANDBOX (WEALTHWIDGET)
 * A financial modeling engine that computes compound interest 
 * projections adjusted for inflation.
 * ==========================================
 */

let projectionChartInstance = null;

const WealthWidget = {
    // Initial state parameters for financial simulation
    state: {
        capital: 50,      // Initial Principal (Millions)
        savings: 5,      // Monthly Contribution (Millions)
        bankRate: 5.5,   // Savings Account APR (%)
        investRate: 12.0,// Investment/Side Job APR (%)
        years: 10,       // Simulation Horizon (Years)
        inflation: 4.0   // Estimated Annual Inflation Rate (%)
    },

    // UI Color mapping for slider themes and data visualization
    colors: {
        'sandbox-capital':      '#F5AFAF',
        'sandbox-savings':      '#EB4C4C',
        'sandbox-bank-rate':    '#6367FF',
        'sandbox-invest-rate':  '#647FBC',
        'sandbox-years':        '#9F8383',
        'sandbox-inflation':    '#FFAA80'
    },

    /**
     * Initializes the widget by binding event listeners to the range inputs
     * and performing the first render of the UI and Chart.
     */
    init: function() {
        const sliders = [
            'sandbox-capital', 'sandbox-savings', 'sandbox-bank-rate', 
            'sandbox-invest-rate', 'sandbox-years', 'sandbox-inflation'
        ];

        sliders.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Bind input events to the state handler
                el.addEventListener('input', this.handleSliderChange.bind(this));
                
                // Map DOM IDs to internal state keys for the initial UI sync
                const stateMap = { 
                    'sandbox-capital': 'capital', 
                    'sandbox-savings': 'savings', 
                    'sandbox-bank-rate': 'bankRate', 
                    'sandbox-invest-rate': 'investRate', 
                    'sandbox-years': 'years', 
                    'sandbox-inflation': 'inflation' 
                };
                this.updateUI(id, this.state[stateMap[id]]);
            }
        });
        
        // Initial chart render
        this.updateChart();
    },

    /**
     * Updates the text labels and visual styles of the slider components.
     * @param {string} id - The ID of the targeted slider.
     * @param {number} value - The numerical value to display.
     */
    updateUI: function(id, value) {
        const displayEl = document.getElementById(id + "-val");
        if (displayEl) {
            let displayStr = value;
            
            // Format labels based on the specific metric type
            if (id === 'sandbox-capital') displayStr = `${value} Million`;
            else if (id === 'sandbox-savings') displayStr = `+${value} Mil / Month`;
            else if (id === 'sandbox-years') displayStr = `${value} Years`;
            else displayStr = `${value}% / Year`;

            displayEl.innerText = displayStr;
            displayEl.style.color = this.colors[id]; // Apply contextual branding
        }
        
        // Synchronize the slider's track background color
        const sliderEl = document.getElementById(id);
        if (sliderEl) this.updateSliderBackground(sliderEl);
    },

    /**
     * Handles input events from range sliders, updates internal state, 
     * and triggers re-calculations.
     */
    handleSliderChange: function(event) {
        const el = event.target;
        const id = el.id;
        const value = parseFloat(el.value);
        
        // Immediate UI feedback for track background
        this.updateSliderBackground(el);
        this.updateUI(id, value);

        // Internal state synchronization
        const map = {
            'sandbox-capital': 'capital', 
            'sandbox-savings': 'savings',
            'sandbox-bank-rate': 'bankRate', 
            'sandbox-invest-rate': 'investRate', 
            'sandbox-years': 'years', 
            'sandbox-inflation': 'inflation'
        };
        
        this.state[map[id]] = value;
        
        // Refresh the projection chart with new parameters
        this.updateChart();
    },

    /**
     * Calculates the fill percentage of a slider to render a custom linear gradient background.
     * @param {HTMLElement} el - The range input element.
     */
    updateSliderBackground: function(el) {
        const min = el.min || 0;
        const max = el.max || 100;
        const val = el.value;
        const percentage = (val - min) / (max - min) * 100;
        const color = this.colors[el.id];

        // Render a fill effect from left to right using the assigned theme color
        el.style.background = `linear-gradient(to right, ${color} ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;
    },

    /**
     * Resets the financial sandbox to default parameters.
     */
    reset: function() {
        const defaults = { 
            capital: 50, savings: 5, bankRate: 5.5, 
            investRate: 12.0, years: 10, inflation: 4.0 
        };

        Object.keys(defaults).forEach(key => {
            const sliderId = `sandbox-${key.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}`;
            const el = document.getElementById(sliderId);
            if (el) el.value = defaults[key];
            this.updateUI(sliderId, defaults[key]);
        });

        this.state = { ...defaults };
        this.updateChart();
    },

    /**
     * Computes the wealth projection using the Real Interest Rate formula.
     * Adjusts nominal rates by the inflation rate to determine actual purchasing power.
     * @returns {Object} Labels and datasets for Chart.js.
     */
    calculateProjection: function() {
        const labels = [];
        const bankNetWorth = [];
        const investNetWorth = [];

        let currentBank = this.state.capital;
        let currentInvest = this.state.capital;
        const monthlySave = this.state.savings; 
        
        // FORMULA: Real Rate = (Nominal Rate - Inflation Rate) / 12 months
        const rBank = ((this.state.bankRate - this.state.inflation) / 100) / 12; 
        const rInvest = ((this.state.investRate - this.state.inflation) / 100) / 12;

        for (let y = 0; y <= this.state.years; y++) {
            labels.push(y === 0 ? 'Present' : 'Year ' + y);
            
            if (y === 0) {
                bankNetWorth.push(currentBank);
                investNetWorth.push(currentInvest);
                continue;
            }

            // Compound monthly savings and interest over 12 iterations per year
            for (let m = 1; m <= 12; m++) {
                currentBank = (currentBank + monthlySave) * (1 + rBank);
                currentInvest = (currentInvest + monthlySave) * (1 + rInvest);
            }

            bankNetWorth.push(Math.round(currentBank));
            investNetWorth.push(Math.round(currentInvest));
        }

        return { labels, bankNetWorth, investNetWorth };
    },

    /**
     * Renders or updates the Chart.js line graph with the latest projection data.
     */
    updateChart: function() {
        const ctx = document.getElementById('projectionChart').getContext('2d');
        const data = this.calculateProjection();

        // Update the existing chart instance if it exists to preserve animations
        if (projectionChartInstance) {
            projectionChartInstance.data.labels = data.labels;
            projectionChartInstance.data.datasets[0].data = data.investNetWorth;
            projectionChartInstance.data.datasets[1].data = data.bankNetWorth;
            projectionChartInstance.update(); 
            return; 
        }

        // Initialize the Chart.js instance for the first time
        projectionChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Business & Side Ventures',
                        data: data.investNetWorth,
                        borderColor: '#E9FF97', 
                        backgroundColor: 'rgba(233, 255, 151, 0.2)', 
                        borderWidth: 3, 
                        fill: true, 
                        tension: 0.4, 
                        pointRadius: 3
                    },
                    {
                        label: 'Standard Bank Savings',
                        data: data.bankNetWorth,
                        borderColor: '#9EDDFF', 
                        backgroundColor: 'rgba(158, 221, 255, 0.2)', 
                        borderWidth: 3, 
                        fill: true, 
                        tension: 0.4, 
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        labels: { color: '#e5e7eb', font: { family: 'Outfit' } } 
                    }
                },
                scales: {
                    x: { ticks: { color: '#9ca3af' } },
                    y: { 
                        ticks: { 
                            color: '#9ca3af', 
                            callback: v => v.toLocaleString() + ' Mil' 
                        } 
                    }
                }
            }
        });
    }
};