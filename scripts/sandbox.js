/**
 * ==========================================
 * SMART FINANCE PREDICTION SANDBOX
 * A financial modeling engine that computes compound interest projections adjusted for inflation.
 * ==========================================
 */

let projectionChartInstance = null;

// ==========================================
// PART 1: LOGIC (Unit Test)
// ==========================================

/**
 * Computes the wealth projection using the Real Interest Rate formula.
 * Adjusts nominal rates by the inflation rate to determine actual purchasing power.
 * Isolated as a pure function to enable headless unit testing.
 * @param {number} capital - Initial Principal (Millions)
 * @param {number} savings - Monthly Contribution (Millions)
 * @param {number} bankRate - Savings Account APR (%)
 * @param {number} investRate - Investment/Side Job APR (%)
 * @param {number} years - Simulation Horizon (Years)
 * @param {number} inflation - Estimated Annual Inflation Rate (%)
 * @returns {Object} An object containing labels, bankNetWorth, and investNetWorth arrays.
 */
function calculateCompoundInterest(capital, savings, bankRate, investRate, years, inflation) {
    const labels = [];
    const bankNetWorth = [];
    const investNetWorth = [];

    let currentBank = capital;
    let currentInvest = capital;
    
    // Real Rate = (Nominal Rate - Inflation Rate) / 12 months
    const rBank = ((bankRate - inflation) / 100) / 12; 
    const rInvest = ((investRate - inflation) / 100) / 12;

    for (let y = 0; y <= years; y++) {
        labels.push(y === 0 ? 'Present' : 'Year ' + y);
        
        if (y === 0) {
            bankNetWorth.push(currentBank);
            investNetWorth.push(currentInvest);
            continue;
        }

        // Compound monthly savings and interest over 12 iterations per year
        for (let m = 1; m <= 12; m++) {
            currentBank = (currentBank + savings) * (1 + rBank);
            currentInvest = (currentInvest + savings) * (1 + rInvest);
        }

        bankNetWorth.push(Math.round(currentBank));
        investNetWorth.push(Math.round(currentInvest));
    }

    return { labels, bankNetWorth, investNetWorth };
}

// ==========================================
// PART 2: UI CONTROLLER
// ==========================================

const WealthWidget = {
    // Initial state parameters for financial simulation
    state: {
        capital: 50,      
        savings: 5,      
        bankRate: 5.5,   
        investRate: 12.0,
        years: 10,       
        inflation: 4.0   
    },

    colors: {
        'sandbox-capital':      '#F5AFAF',
        'sandbox-savings':      '#EB4C4C',
        'sandbox-bank-rate':    '#6367FF',
        'sandbox-invest-rate':  '#647FBC',
        'sandbox-years':        '#9F8383',
        'sandbox-inflation':    '#FFAA80'
    },

    init: function() {
        const sliders = [
            'sandbox-capital', 'sandbox-savings', 'sandbox-bank-rate', 
            'sandbox-invest-rate', 'sandbox-years', 'sandbox-inflation'
        ];

        sliders.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', this.handleSliderChange.bind(this));
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
        
        this.updateChart();
    },

    updateUI: function(id, value) {
        const displayEl = document.getElementById(id + "-val");
        if (displayEl) {
            let displayStr = value;
            if (id === 'sandbox-capital') displayStr = `${value} Million`;
            else if (id === 'sandbox-savings') displayStr = `+${value} Mil / Month`;
            else if (id === 'sandbox-years') displayStr = `${value} Years`;
            else displayStr = `${value}% / Year`;

            displayEl.innerText = displayStr;
            displayEl.style.color = this.colors[id]; 
        }
        
        const sliderEl = document.getElementById(id);
        if (sliderEl) this.updateSliderBackground(sliderEl);
    },

    handleSliderChange: function(event) {
        const el = event.target;
        const id = el.id;
        const value = parseFloat(el.value);
        
        this.updateSliderBackground(el);
        this.updateUI(id, value);

        const map = {
            'sandbox-capital': 'capital', 'sandbox-savings': 'savings',
            'sandbox-bank-rate': 'bankRate', 'sandbox-invest-rate': 'investRate', 
            'sandbox-years': 'years', 'sandbox-inflation': 'inflation'
        };
        
        this.state[map[id]] = value;
        this.updateChart();
    },

    updateSliderBackground: function(el) {
        const min = el.min || 0;
        const max = el.max || 100;
        const val = el.value;
        const percentage = (val - min) / (max - min) * 100;
        const color = this.colors[el.id];
        el.style.background = `linear-gradient(to right, ${color} ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;
    },

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

    calculateProjection: function() {
        // Delegates the calculation
        return calculateCompoundInterest(
            this.state.capital,
            this.state.savings,
            this.state.bankRate,
            this.state.investRate,
            this.state.years,
            this.state.inflation
        );
    },

    updateChart: function() {
        const canvas = document.getElementById('projectionChart');
        if (!canvas) return; // Preventing from for testing environments without DOM
        
        const ctx = canvas.getContext('2d');
        const data = this.calculateProjection();

        if (projectionChartInstance) {
            projectionChartInstance.data.labels = data.labels;
            projectionChartInstance.data.datasets[0].data = data.investNetWorth;
            projectionChartInstance.data.datasets[1].data = data.bankNetWorth;
            projectionChartInstance.update(); 
            return; 
        }

        projectionChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    { label: 'Business & Side Jobs', data: data.investNetWorth, borderColor: '#E9FF97', backgroundColor: 'rgba(233, 255, 151, 0.2)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 3 },
                    { label: 'Standard Bank Savings', data: data.bankNetWorth, borderColor: '#9EDDFF', backgroundColor: 'rgba(158, 221, 255, 0.2)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 3 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};

// ==========================================
// PART 3: EXPORT FOR JEST
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateCompoundInterest, WealthWidget };
}