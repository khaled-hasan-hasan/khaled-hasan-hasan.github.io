/** Real Chromium QA and Lighthouse against a loopback-only static server. No deployment. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputIndex = process.argv.indexOf('--output');
const output = path.resolve(outputIndex < 0 ? path.join(root, 'review-artifacts/browser-qa') : process.argv[outputIndex + 1]);
await fs.mkdir(path.join(output, 'screenshots'), { recursive: true });
await fs.mkdir(path.join(output, 'lighthouse'), { recursive: true });
const origin = 'http://127.0.0.1:4173';
const server = spawn('python3', ['-m', 'http.server', '4173', '--bind', '127.0.0.1', '--directory', path.join(root, 'dist')], { stdio: 'ignore' });
const report = { checkedAt: new Date().toISOString(), origin, scope: 'Local static preview on isolated CI runner; no deployment', node: process.version, pages: [], screenshots: [], interactions: [], lighthouse: {}, errors: [], limitations: ['Python static server does not apply Cloudflare _headers; deployed CSP/HTTPS/caching remain unverified.', 'No email client was launched and no email was sent.', 'Automated browser checks do not replace a screen-reader or human visual review.'] };
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i += 1) {
    if (server.exitCode !== null) throw new Error('Preview server exited before it was ready.');
    try { const response = await fetch(origin); if (response.ok) { ready = true; break; } } catch { /* wait for server */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'loopback server must become ready');
  browser = await chromium.launch({ headless: true });
  report.chromium = browser.version();
  const cases = (await fs.readdir(path.join(root, 'dist/case-studies'))).filter(x => x.endsWith('.html')).map(x => `case-studies/${x}`);
  const pages = ['index.html', 'services.html', 'work.html', 'about.html', 'contact.html', 'privacy.html', '404.html', ...cases];
  for (const width of [320, 390, 768, 1024, 1440]) {
    const mobile = width <= 390;
    const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(`${width}: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(`${width}: console: ${message.text()}`); });
    page.on('requestfailed', request => report.errors.push(`${width}: request: ${request.url()} ${request.failure()?.errorText}`));
    for (const file of pages) {
      const response = await page.goto(`${origin}/${file}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, `${file} returns 200`);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth, html: document.documentElement.scrollWidth, images: [...document.images].filter(image => image.loading !== 'lazy' && (!image.complete || image.naturalWidth === 0)).map(image => image.src) }));
      assert.ok(Math.max(layout.body, layout.html) <= layout.viewport + 1, `${width}px ${file}: horizontal overflow ${JSON.stringify(layout)}`);
      assert.deepEqual(layout.images, [], `${file}: eager images load`);
      assert.equal(await page.locator('h1').count(), 1);
      report.pages.push({ file, width, status: response.status(), horizontalOverflow: false });
      if ([390, 1440].includes(width) && ['index.html', 'services.html', 'work.html', 'contact.html', 'case-studies/hotel-booking.html'].includes(file)) {
        // Eager-load below-fold images before a genuine full-page capture.
        await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
        await page.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
        const filename = `${file.replaceAll('/', '-').replace('.html', '')}-${mobile ? 'mobile' : 'desktop'}.png`;
        await page.screenshot({ path: path.join(output, 'screenshots', filename), fullPage: true, animations: 'disabled' });
        report.screenshots.push({ file: `screenshots/${filename}`, page: file, width, fullPage: true });
      }
    }
    if ([390, 1440].includes(width)) {
      await page.goto(origin, { waitUntil: 'networkidle' });
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
      if (mobile) {
        const menu = page.locator('.menu-toggle');
        await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape'); assert.equal(await menu.getAttribute('aria-expanded'), 'false');
        assert.equal(await page.evaluate(() => document.activeElement.className), 'menu-toggle');
      }
      await page.goto(`${origin}/work.html`, { waitUntil: 'networkidle' });
      for (const [filter, expected] of [['sql', 1], ['bi', 2], ['python', 2], ['all', 5]]) {
        await page.locator(`[data-filter="${filter}"]`).click();
        assert.equal(await page.locator('#project-grid article:visible').count(), expected);
        assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
      }
      await page.goto(`${origin}/contact.html`, { waitUntil: 'networkidle' });
      await page.locator('#service').selectOption({ label: 'Data matching & SKU reconciliation' });
      await page.locator('#brief').fill('Compare A&B exports and validate SKU matches. بيانات\nExpected result: a clear exception report.');
      await page.locator('#timeline').fill('To be discussed');
      await page.getByRole('button', { name: 'Prepare email draft' }).click();
      const draft = new URL(await page.locator('#email-draft').getAttribute('href'));
      assert.equal(draft.protocol, 'mailto:');
      assert.equal(draft.pathname, 'khaled.habdo@gmail.com');
      assert.ok(draft.searchParams.get('body').includes('A&B'));
      assert.ok(draft.searchParams.get('body').includes('بيانات'));
      await page.locator('#brief').fill('Updated project context, so the previous draft must be invalidated.');
      assert.equal(await page.locator('#email-draft').isVisible(), false);
      assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
      report.interactions.push({ width, passed: ['skip link and focus', 'reduced motion', ...(mobile ? ['menu opens, Escape closes and restores focus'] : []), 'all project filter counts and selected state', 'email draft encoding', 'draft invalidation after edits', 'no storage writes'] });
    }
    await context.close();
  }
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJSPage = await noJS.newPage();
  await noJSPage.goto(`${origin}/work.html`);
  assert.equal(await noJSPage.locator('#project-grid article:visible').count(), 5);
  assert.equal(await noJSPage.locator('#navigation a:visible').count(), 4);
  await noJSPage.goto(`${origin}/contact.html`);
  assert.equal(await noJSPage.locator('a[href="mailto:khaled.habdo@gmail.com"]').count(), 1);
  assert.equal(await noJSPage.locator('#email-composer').isVisible(), false);
  await noJS.close();
  report.interactions.push({ mode: 'JavaScript disabled', passed: ['five projects visible', 'mobile navigation visible', 'direct email link present', 'optional composer hidden'] });
  assert.deepEqual(report.errors, [], 'no console/page/request errors during Chromium checks');
  await browser.close(); browser = undefined;
  for (const mode of ['mobile', 'desktop']) {
    const outputPath = path.join(output, 'lighthouse', mode);
    const args = [path.join(root, 'node_modules/lighthouse/cli/index.js'), origin, '--output=html', '--output=json', `--output-path=${outputPath}`, '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage', '--quiet'];
    if (mode === 'desktop') args.push('--preset=desktop');
    await exec(process.execPath, args, { cwd: root, env: { ...process.env, CHROME_PATH: chromium.executablePath() }, timeout: 180000, maxBuffer: 10 * 1024 * 1024 });
    const lighthouse = JSON.parse(await fs.readFile(`${outputPath}.report.json`, 'utf8'));
    report.lighthouse[mode] = { lighthouseVersion: lighthouse.lighthouseVersion, fetchTime: lighthouse.fetchTime, finalUrl: lighthouse.finalDisplayedUrl || lighthouse.finalUrl, scores: Object.fromEntries(Object.entries(lighthouse.categories).map(([name, category]) => [name, Math.round(category.score * 100)])), metrics: Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index'].map(id => [id, { value: lighthouse.audits[id].numericValue, display: lighthouse.audits[id].displayValue }])), configSettings: lighthouse.configSettings, warnings: lighthouse.runWarnings, runtimeError: lighthouse.runtimeError || null };
    assert.ok(!lighthouse.runtimeError, `${mode}: Lighthouse completed`);
  }
  report.result = 'passed';
} catch (error) {
  report.result = 'failed'; report.failure = error.stack || error.message;
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
  const lines = ['# Actual Chromium and Lighthouse review', '', `Result: ${report.result}`, `Date: ${report.checkedAt}`, `Chrome: ${report.chromium || 'not launched'}`, `Page/viewport combinations checked: ${report.pages.length}`, `Real screenshots: ${report.screenshots.length}`, '', 'This ran against a loopback-only static server. It did not publish or deploy the site.', '', ...Object.entries(report.lighthouse).map(([mode,data]) => `${mode}: ${JSON.stringify(data.scores)}`), '', ...report.limitations.map(item=>'- '+item), ...(report.failure ? ['', 'Failure:', '```', report.failure, '```'] : [])];
  await fs.writeFile(path.join(output, 'README.md'), lines.join('\n') + '\n');
  console.log(JSON.stringify(report, null, 2));
}
