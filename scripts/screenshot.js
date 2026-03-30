const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function takeScreenshots() {
  const outDir = path.resolve(__dirname, '..', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('Opening home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, 'home.png'), fullPage: true });
    console.log('Saved screenshots/home.png');

    console.log('Opening kronik list page...');
    await page.goto('http://localhost:5173/article/kronik', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, 'kronik.png'), fullPage: true });
    console.log('Saved screenshots/kronik.png');
  } catch (err) {
    console.error('Screenshot error:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
}

takeScreenshots();
