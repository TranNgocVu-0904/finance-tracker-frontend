let projectionChartInstance = null;

const WealthWidget = {
    // 1. Thêm inflation vào state mặc định
    state: {
        capital: 50, savings: 5, bankRate: 5.5, investRate: 12.0, years: 10, inflation: 4.0
    },

    // 2. Thêm màu cho thanh trượt lạm phát (Màu cam đào cảnh báo)
    colors: {
        'sandbox-capital':      '#F5AFAF',
        'sandbox-savings':      '#EB4C4C',
        'sandbox-bank-rate':    '#6367FF',
        'sandbox-invest-rate':  '#647FBC',
        'sandbox-years':        '#9F8383',
        'sandbox-inflation':    '#FFAA80'
    },
    // Hàm dùng chung để cập nhật giao diện (Số + Màu)
    updateUI: function(id, value) {
        const displayEl = document.getElementById(id + "-val");
        if (displayEl) {
            let displayStr = value;
            if (id === 'sandbox-capital') displayStr = `${value} Millon`;
            else if (id === 'sandbox-savings') displayStr = `+${value} Mil / Month`;
            else if (id === 'sandbox-years') displayStr = `${value} Năm`;
            else displayStr = `${value}% / Year`;

            displayEl.innerText = displayStr;
            displayEl.style.color = this.colors[id]; // Áp dụng màu ở đây
        }
        
        // Cập nhật màu thanh trượt (nếu bạn dùng logic lấp đầy màu)
        const sliderEl = document.getElementById(id);
        if (sliderEl) this.updateSliderBackground(sliderEl);
    },

    init: function() {
        // 3. Thêm ID mới vào mảng
        const sliders = ['sandbox-capital', 'sandbox-savings', 'sandbox-bank-rate', 'sandbox-invest-rate', 'sandbox-years', 'sandbox-inflation'];
        sliders.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', this.handleSliderChange.bind(this));
                const stateMap = { 'sandbox-capital': 'capital', 'sandbox-savings': 'savings', 'sandbox-bank-rate': 'bankRate', 'sandbox-invest-rate': 'investRate', 'sandbox-years': 'years', 'sandbox-inflation': 'inflation' };
                this.updateUI(id, this.state[stateMap[id]]);
            }
        });
        this.updateChart();
    },

    // 3. Xử lý thanh trượt (Đã thêm lệnh cập nhật background)
    handleSliderChange: function(event) {
        const el = event.target;
        const id = el.id;
        const value = parseFloat(el.value);
        const displayEl = document.getElementById(id + "-val"); 
        
        // Cập nhật màu nền lấp đầy cho thanh trượt
        this.updateSliderBackground(el);

        if (displayEl) {
            let displayStr = value;
            if (id === 'sandbox-capital') displayStr = `${value} Millon`;
            else if (id === 'sandbox-savings') displayStr = `+${value} Mil / Month`;
            else if (id === 'sandbox-years') displayStr = `${value} Year`;
            else displayStr = `${value}% / Năm`;

            displayEl.innerText = displayStr;
            displayEl.style.color = this.colors[id];
        }

        const map = {
            'sandbox-capital': 'capital', 'sandbox-savings': 'savings',
            'sandbox-bank-rate': 'bankRate', 'sandbox-invest-rate': 'investRate', 'sandbox-years': 'years', 'sandbox-inflation': 'inflation'
        };
        this.state[map[id]] = value;
        this.updateChart();
    },
  

    // HÀM MỚI: Tính toán tỉ lệ % và vẽ Linear Gradient
    updateSliderBackground: function(el) {
        const min = el.min || 0;
        const max = el.max || 100;
        const val = el.value;
        const percentage = (val - min) / (max - min) * 100;
        const color = this.colors[el.id];

        // Tạo hiệu ứng lấp đầy từ trái sang phải
        el.style.background = `linear-gradient(to right, ${color} ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;
    },

    // 4. Reset
    reset: function() {
        document.getElementById('sandbox-capital').value = 50;
        document.getElementById('sandbox-capital-val').innerText = '50 Triệu';
        
        document.getElementById('sandbox-savings').value = 5;
        document.getElementById('sandbox-savings-val').innerText = '+5 Tr/Tháng';
        
        document.getElementById('sandbox-bank-rate').value = 5.5;
        document.getElementById('sandbox-bank-rate-val').innerText = '5.5% / Năm';
        
        document.getElementById('sandbox-invest-rate').value = 12.0;
        document.getElementById('sandbox-invest-rate-val').innerText = '12.0% / Năm';
        
        document.getElementById('sandbox-years').value = 10;
        document.getElementById('sandbox-years-val').innerText = '10 Năm';

        document.getElementById('sandbox-inflation').value = 4.0;
        document.getElementById('sandbox-inflation-val').innerText = '4.0% / Năm';

        // Gọi updateUI để số quay về màu chuẩn
        this.updateUI('sandbox-capital', 50);
        this.updateUI('sandbox-savings', 5);
        this.updateUI('sandbox-bank-rate', 5.5);
        this.updateUI('sandbox-invest-rate', 12.0);
        this.updateUI('sandbox-years', 10);
        this.updateUI('sandbox-inflation', 4.0);

        this.state = { capital: 50, savings: 5, bankRate: 5.5, investRate: 12.0, years: 10, inflation: 4.0 };
        this.updateChart();
    },

    // 5. Tính toán Lãi kép
    calculateProjection: function() {
        const labels = [];
        const bankNetWorth = [];
        const investNetWorth = [];

        let currentBank = this.state.capital;
        let currentInvest = this.state.capital;
        
        const monthlySave = this.state.savings; 
        
        // 5. CÔNG THỨC MỚI: Trừ đi lạm phát để ra Lãi suất thực (Real Rate)
        const rBank = ((this.state.bankRate - this.state.inflation) / 100) / 12; 
        const rInvest = ((this.state.investRate - this.state.inflation) / 100) / 12;

        for (let y = 0; y <= this.state.years; y++) {
            labels.push(y === 0 ? 'Now' : 'Year ' + y);
            
            if (y === 0) {
                bankNetWorth.push(currentBank);
                investNetWorth.push(currentInvest);
                continue;
            }

            for (let m = 1; m <= 12; m++) {
                currentBank = (currentBank + monthlySave) * (1 + rBank);
                currentInvest = (currentInvest + monthlySave) * (1 + rInvest);
            }

            bankNetWorth.push(Math.round(currentBank));
            investNetWorth.push(Math.round(currentInvest));
        }

        return { labels, bankNetWorth, investNetWorth };
    },

    // ==========================================
    // 6. DRAW CHART: Vẽ biểu đồ ra màn hình (Mượt mà như code gốc)
    // ==========================================
    updateChart: function() {
        const ctx = document.getElementById('projectionChart').getContext('2d');
        const data = this.calculateProjection();

        if (projectionChartInstance) {
            projectionChartInstance.data.labels = data.labels;
            projectionChartInstance.data.datasets[0].data = data.investNetWorth;
            projectionChartInstance.data.datasets[1].data = data.bankNetWorth;
            projectionChartInstance.update(); 
            return; 
        }

        // Khởi tạo Chart lần đầu (Màu sắc giữ nguyên như yêu cầu của Vũ)
        projectionChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Business and side jobs',
                        data: data.investNetWorth,
                        borderColor: '#E9FF97', backgroundColor: 'rgba(233, 255, 151, 0.2)', 
                        borderWidth: 3, fill: true, tension: 0.4, pointRadius: 3
                    },
                    {
                        label: 'Deposit money into a bank account',
                        data: data.bankNetWorth,
                        borderColor: '#9EDDFF', backgroundColor: 'rgba(158, 221, 255, 0.2)', 
                        borderWidth: 3, fill: true, tension: 0.4, pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#e5e7eb', font: { family: 'Outfit' } } }
                },
                scales: {
                    x: { ticks: { color: '#9ca3af' } },
                    y: { ticks: { color: '#9ca3af', callback: v => v.toLocaleString() + ' Tr' } }
                }
            }
        });
    }
};