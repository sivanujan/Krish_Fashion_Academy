const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.join(
  'C:',
  'Users',
  'Sivanujan_PC',
  '.gemini',
  'antigravity',
  'brain',
  'c29d19b3-a7f5-47c0-bfbf-8476c5c6bd0c',
  'screenshots'
);
fs.mkdirSync(outDir, { recursive: true });

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440x900
  console.log('Capturing Desktop screenshots...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await desktopContext.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for stitch animation & fonts
  await page.waitForTimeout(2500);

  // Section 3.1: Hero
  const heroEl = await page.$('section:has-text("SCARBOROUGH")');
  if (heroEl) {
    await heroEl.screenshot({ path: path.join(outDir, '3.1_hero_desktop.png') });
    console.log('Saved 3.1_hero_desktop.png');
  }

  // Section 3.2: Upcoming Master Class
  const upcomingEl = await page.$('#upcoming-class');
  if (upcomingEl) {
    await upcomingEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await upcomingEl.screenshot({ path: path.join(outDir, '3.2_upcoming_desktop.png') });
    console.log('Saved 3.2_upcoming_desktop.png');
  }

  // Section 3.3: What You'll Learn
  const learnEl = await page.$('section:has-text("From Measurement to Finished Blouse")');
  if (learnEl) {
    await learnEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await learnEl.screenshot({ path: path.join(outDir, '3.3_what_youll_learn_desktop.png') });
    console.log('Saved 3.3_what_youll_learn_desktop.png');
  }

  // Full Desktop Page
  await page.screenshot({ path: path.join(outDir, 'full_home_desktop.png'), fullPage: true });
  console.log('Saved full_home_desktop.png');

  await desktopContext.close();

  // 2. Mobile 390x844 (iPhone 12/13/14)
  console.log('Capturing Mobile screenshots...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2500);

  const mHeroEl = await mobilePage.$('section:has-text("SCARBOROUGH")');
  if (mHeroEl) {
    await mHeroEl.screenshot({ path: path.join(outDir, '3.1_hero_mobile.png') });
    console.log('Saved 3.1_hero_mobile.png');
  }

  const mUpcomingEl = await mobilePage.$('#upcoming-class');
  if (mUpcomingEl) {
    await mUpcomingEl.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(500);
    await mUpcomingEl.screenshot({ path: path.join(outDir, '3.2_upcoming_mobile.png') });
    console.log('Saved 3.2_upcoming_mobile.png');
  }

  const mLearnEl = await mobilePage.$('section:has-text("From Measurement to Finished Blouse")');
  if (mLearnEl) {
    await mLearnEl.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(800);
    await mLearnEl.screenshot({ path: path.join(outDir, '3.3_what_youll_learn_mobile.png') });
    console.log('Saved 3.3_what_youll_learn_mobile.png');
  }

  await mobilePage.screenshot({ path: path.join(outDir, 'full_home_mobile.png'), fullPage: true });
  console.log('Saved full_home_mobile.png');

  await mobileContext.close();
  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
