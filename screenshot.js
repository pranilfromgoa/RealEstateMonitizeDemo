import { chromium } from 'playwright'

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1400, height: 900 })

  // Login page
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'screenshot-login.png' })
  console.log('Login screenshot done')

  // Click investor card, then enter
  const investorCard = page.locator('button').filter({ hasText: 'Investor' }).first()
  await investorCard.click()
  await page.waitForTimeout(300)
  const enterBtn = page.locator('button').filter({ hasText: 'Enter as' }).first()
  await enterBtn.click()
  await page.waitForURL('**/investor/**', { timeout: 5000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'screenshot-investor-dashboard.png' })
  console.log('Investor dashboard screenshot done')

  // Navigate to admin
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(500)
  const adminCard = page.locator('button').filter({ hasText: 'Platform Admin' }).first()
  await adminCard.click()
  await page.waitForTimeout(300)
  const enterAdminBtn = page.locator('button').filter({ hasText: 'Enter as' }).first()
  await enterAdminBtn.click()
  await page.waitForURL('**/admin/**', { timeout: 5000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'screenshot-admin-dashboard.png' })
  console.log('Admin dashboard screenshot done')

  // Tokenization engine — click sidebar link from admin dashboard
  const brickMakerLink = page.locator('a[href*="tokenization"], a').filter({ hasText: 'Brick Maker' }).first()
  await brickMakerLink.click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'screenshot-tokenization.png' })
  console.log('Tokenization screenshot done')

  await browser.close()
  console.log('All screenshots done')
})().catch(err => { console.error(err); process.exit(1) })
