const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:5500'; // Change this to your Live Server URL

test.describe('Authentication & Security Flow', () => {
  
  test('should redirect unauthenticated user to login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    // Check if Security Guard kicks user back to login
    await expect(page).toHaveURL(/.*login.html/);
  });

  test('should login successfully with valid credentials (MOCKED)', async ({ page }) => {
    
    // Avoid the API endpoint (**/users/login)
    await page.route('**/users/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        // Return the exact "token" key that login.js is expecting
        body: JSON.stringify({ 
          token: 'fake-jwt-token-123456789',
          message: 'Login successful'
        })
      });
    });

    await page.goto(`${BASE_URL}/login.html`);
    
    // Fill in the input fields
    await page.fill('#email', 'test@vgu.edu.vn'); 
    await page.fill('#password', 'password123');

    // Click the login button
    await page.click('#login-btn');

    // Wait explicitly for the mock API to finish its job
    const responsePromise = page.waitForResponse('**/users/login');
    await page.click('#login-btn');
    await responsePromise; // Wait until the fake response is received

    // erify that the fake token was successfully saved into localStorage
    const token = await page.evaluate(() => localStorage.getItem('jwt_token'));
    expect(token).toEqual('fake-jwt-token-123456789');

    // Since JS code has an 800ms setTimeout, we use waitForURL to wait until the browser actually navigates to the new page
    await page.waitForURL(/.*index.html/);
  });
});