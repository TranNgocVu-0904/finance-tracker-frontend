const { aggregateChartData, calculateStats } = require('../../scripts/analytics.js');

describe('Analytics Dashboard Logic', () => {
    
    const mockTransactions = [
        { amount: 1000000, categoryName: 'Housing', categoryType: 'EXPENSE', transactionDate: new Date().toISOString() },
        { amount: 500000, categoryName: 'Food and Drink', categoryType: 'EXPENSE', transactionDate: new Date().toISOString() },
        { amount: 5000000, categoryName: 'Salary', categoryType: 'INCOME', transactionDate: new Date().toISOString() }
    ];

    test('aggregateChartData should create correct number of daily labels', () => {
        const days = 7;
        const result = aggregateChartData(mockTransactions, days);
        expect(result.labels.length).toBe(days);
    });

    test('aggregateChartData should correctly sum amounts by category', () => {
        const result = aggregateChartData(mockTransactions, 30);
        const todayStr = new Date().toLocaleDateString('vi-VN');
        
        // Check if Housing sum is correct for today
        expect(result.dataMap[todayStr]['Housing']).toBe(1000000);
        expect(result.dataMap[todayStr]['Food and Drink']).toBe(500000);
    });

    test('calculateStats should exclude INCOME from total expenses', () => {
        const stats = calculateStats(mockTransactions, 30, 'Overview');
        
        // Total should be (1,000,000 + 500,000) / 1000 = 1500. Salary (5M) is ignored.
        expect(stats.total).toBe(1500);
        expect(stats.count).toBe(2);
    });

    test('calculateStats should filter correctly by specific category', () => {
        const stats = calculateStats(mockTransactions, 30, 'Housing');
        expect(stats.total).toBe(1000); // Only Housing
        expect(stats.count).toBe(1);
    });
});