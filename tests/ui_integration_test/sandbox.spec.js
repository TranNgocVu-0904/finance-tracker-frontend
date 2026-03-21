const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:5500';

test.describe('Smart Finance Sandbox Widget', () => {

  test.beforeEach(async ({ page }) => {
    
    // Intercept the API call to provide fake financial totals
    await page.route('**/analytics/dashboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          totalIncome: 50000, 
          totalExpense: 10000, 
          balance: 40000 
        })
      });
    });

    // Inject a structurally valid, non-expired JWT into LocalStorage
    await page.addInitScript(() => {
      // Base64 for {"exp": 9999999999} - expires in the year 2286
      const futurePayload = 'eyJleHAiOjk5OTk5OTk5OTl9'; 
      localStorage.setItem('jwt_token', `fakeHeader.${futurePayload}.fakeSignature`);
    });
    
    // Proceed directly to the protected dashboard page
    await page.goto(`${BASE_URL}/index.html`);
  });

  test('should update projected values when capital slider is moved', async ({ page }) => {
    // 1. Locate the range slider and its corresponding label
    const capitalSlider = page.locator('#sandbox-capital');
    const displayValue = page.locator('#sandbox-capital-val');

    // 2. Ensure the element is scrolled into the viewport
    await capitalSlider.scrollIntoViewIfNeeded();

    // 3. Programmatically move the slider to '50'
    // Dispatch the 'input' event to trigger the logic inside sandbox.js
    await capitalSlider.evaluate((node) => {
      node.value = 50;
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // 4. ASSERTIONS: Verify the UI reflects the change and the chart is rendered
    await expect(displayValue).toHaveText('50 Million');
    await expect(page.locator('#projectionChart')).toBeVisible();
  });
});