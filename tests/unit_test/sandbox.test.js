const { calculateCompoundInterest } = require('../../scripts/sandbox.js'); // Ensure the path matches your structure

describe('Smart Wealth Sandbox - Compound Interest Engine', () => {

    test('should return the initial capital at Year 0 (Present)', () => {
        const capital = 50;
        const result = calculateCompoundInterest(capital, 5, 5.5, 12.0, 10, 4.0);
        
        // At index 0, the net worth should be exactly the initial capital
        expect(result.labels[0]).toBe('Present');
        expect(result.bankNetWorth[0]).toBe(capital);
        expect(result.investNetWorth[0]).toBe(capital);
    });

    test('should generate correct timeline length based on specified years', () => {
        const years = 10;
        const result = calculateCompoundInterest(50, 5, 5.5, 12.0, years, 4.0);
        
        // If we simulate 10 years, the array should have 11 elements (Year 0 to Year 10)
        expect(result.labels.length).toBe(years + 1);
        expect(result.bankNetWorth.length).toBe(years + 1);
        expect(result.investNetWorth.length).toBe(years + 1);
    });

    test('should accurately calculate 1-year compound interest with no monthly savings and zero inflation', () => {
        // Scenario: 100 Mil, 0 Monthly savings, 12% APR, 1 Year, 0% Inflation
        // Formula: 100 * (1 + (0.12/12))^12 = 112.68
        const result = calculateCompoundInterest(100, 0, 12.0, 12.0, 1, 0);
        
        // Verify Year 1 data (index 1)
        expect(result.labels[1]).toBe('Year 1');
        
        // Using toBeCloseTo or checking the exact rounded value (113 Mil)
        expect(result.bankNetWorth[1]).toBe(113); 
        expect(result.investNetWorth[1]).toBe(113);
    });

    test('investing should yield higher returns than bank savings over time', () => {
        // Scenario: Bank APR is lower than Invest APR
        const result = calculateCompoundInterest(50, 5, 5.0, 15.0, 5, 3.0);
        
        const finalYearBank = result.bankNetWorth[5];
        const finalYearInvest = result.investNetWorth[5];
        
        expect(finalYearInvest).toBeGreaterThan(finalYearBank);
    });

});