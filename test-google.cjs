const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Intercept the API call to log it
  await page.route('**/api/auth/google', async route => {
    const request = route.request();
    console.log('API call payload:', request.postData());
    route.continue();
  });

  await page.goto('http://localhost:3000/login');
  
  await page.waitForTimeout(2000);
  
  console.log('Clicking Google button...');
  
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('text="Ingresar con Google"')
  ]);
  
  await popup.waitForLoadState();
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
