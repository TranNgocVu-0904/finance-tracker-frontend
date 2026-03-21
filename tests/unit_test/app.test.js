const { calculateCategoryTotals, getFinancialAdvice } = require('../../scripts/app.js');

describe('Main Dashboard Logic', () => {

    describe('calculateCategoryTotals', () => {
        test('should correctly aggregate amounts by category name', () => {
            const mockTransactions = [
                { amount: 100, categoryName: 'Food', categoryType: 'EXPENSE' },
                { amount: 200, categoryName: 'Food', categoryType: 'EXPENSE' },
                { amount: 500, categoryName: 'Salary', categoryType: 'INCOME' }
            ];

            const result = calculateCategoryTotals(mockTransactions);

            expect(result.categoryData['Food']).toBe(300);
            expect(result.categoryData['Salary']).toBe(500);
        });

        test('should return empty objects for zero transactions', () => {
            const result = calculateCategoryTotals([]);
            expect(result.categoryData).toEqual({});
        });
    });

    describe('getFinancialAdvice', () => {
        test('should return warning when expenses exceed income', () => {
            const advice = getFinancialAdvice(1000, 2000);
            expect(advice.text).toContain('Warning');
            expect(advice.className).toContain('text-rose-400');
        });

        test('should return encouraging message when income is healthy', () => {
            const advice = getFinancialAdvice(5000, 2000);
            expect(advice.text).toContain('Excellent');
            expect(advice.className).toContain('text-emerald-400');
        });

        test('should return empty state message when no data exists', () => {
            const advice = getFinancialAdvice(0, 0);
            expect(advice.text).toContain('Please add your first transaction');
            expect(advice.className).toContain('text-gray-400');
        });
    });

});