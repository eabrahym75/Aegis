const fs = require('fs')
const { chromium } = require('playwright')
const { AxeBuilder } = require('@axe-core/playwright')

;(async () => {
  const outPath = './axe-report.json'
  const target = process.env.AEGIS_URL || 'http://localhost:3000/aegis'
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const page = await browser.newPage()
  try {
    console.log('Navigating to', target)
    await page.goto(target, { waitUntil: 'networkidle' })
    console.log('Running Axe checks...')
    const results = await new AxeBuilder({ page }).analyze()
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
    console.log('Axe report written to', outPath)
  } catch (err) {
    console.error('Error during Axe run:', err.message || err)
    process.exitCode = 2
  } finally {
    await browser.close()
  }
})()
