const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/home/juankio/ui-snapshot-nav-icon.png' });
  await browser.close();
})();
