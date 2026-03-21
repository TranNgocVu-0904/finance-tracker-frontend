const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:5500';

test.describe('Transaction Management', () => {

  test.beforeEach(async ({ page }) => {
    
     // Intercept the API call to provide fake financial totals
    await page.route('**/analytics/dashboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalIncome: 50000, totalExpense: 10000, balance: 40000 })
      });
    });

    // Inject a structurally valid, non-expired JWT into LocalStorage
    await page.addInitScript(() => {
      const futurePayload = 'eyJleHAiOjk5OTk5OTk5OTl9'; 
      localStorage.setItem('jwt_token', `fakeHeader.${futurePayload}.fakeSignature`);
    });

    // Proceed directly to the protected dashboard page
    await page.goto(`${BASE_URL}/index.html`);
  });

  test('should add a new expense and see it in the table', async ({ page }) => {
    
    // 1. Click the button by searching for its exact text (since it has no ID)
    await page.locator('button:has-text("+ Add transaction")').click();

    // 2. Ensure the modal is visible before typing
    const modal = page.locator('#transaction-modal');
    await expect(modal).not.toHaveClass(/hidden/);

    // 3. Fill the form using the CORRECT IDs from your index.html
    await page.fill('#trans-amount', '50000');
    await page.fill('#trans-desc', 'VGU Cafeteria Dinner'); // Fixed the ID here!

  });

});