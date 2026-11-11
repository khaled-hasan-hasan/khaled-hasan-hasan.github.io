/* DOM behavior tests only. These do not measure layout or replace browser QA. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const root = path.join(__dirname, '..');

async function load(page, { mobile = false, clipboard } = {}) {
  const { Window } = await import('happy-dom');
  const window = new Window({
    url: `https://portfolio.test/${page}`,
    settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true, enableJavaScriptEvaluation: true, suppressInsecureJavaScriptEnvironmentWarning: true }
  });
  window.document.write(fs.readFileSync(path.join(root, page), 'utf8'));
  const media = { matches: mobile, handlers: [], addEventListener(type, handler) { this.handlers.push(handler); } };
  window.matchMedia = () => media;
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
  if (clipboard) Object.defineProperty(window.navigator, 'clipboard', { value: clipboard, configurable: true });
  window.eval(source);
  return { window, document: window.document, media, close: () => window.happyDOM.abort() };
}

test('all generated pages load the enhancement script without throwing', async () => {
  const pages = ['index.html','services.html','work.html','about.html','contact.html','privacy.html','404.html',
    ...fs.readdirSync(path.join(root,'case-studies')).filter(x=>x.endsWith('.html')).map(x=>'case-studies/'+x)];
  for (const page of pages) {
    const app = await load(page);
    assert.ok(app.document.querySelector('main'), page);
    assert.equal(app.document.querySelector('.menu-toggle').hidden, true, 'desktop toggle hidden');
    await app.close();
  }
});

test('mobile menu opens, closes with Escape, restores focus, and closes on a navigation link', async () => {
  const app = await load('index.html', { mobile: true });
  const { document, window } = app;
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  assert.equal(button.hidden, false);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.ok(nav.classList.contains('is-open'));
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, button);
  button.click();
  nav.querySelector('a').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(nav.classList.contains('is-open'), false);
  await app.close();
});

test('switching desktop/mobile clears stale menu state', async () => {
  const app = await load('index.html', { mobile: true });
  const button = app.document.querySelector('.menu-toggle');
  button.click();
  app.media.matches = false;
  app.media.handlers.forEach(handler => handler());
  assert.equal(button.hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  app.media.matches = true;
  app.media.handlers.forEach(handler => handler());
  assert.equal(button.hidden, false);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  await app.close();
});

test('work filters select the expected projects and announce results', async () => {
  const app = await load('work.html');
  const { document } = app;
  assert.equal(document.querySelector('.filters').hidden, false);
  for (const [filter, count] of [['sql',1], ['bi',2], ['python',2], ['all',5]]) {
    const button = document.querySelector(`[data-filter="${filter}"]`);
    button.click();
    const visible = [...document.querySelectorAll('#project-grid article')].filter(x=>!x.hidden);
    assert.equal(visible.length, count);
    if (filter !== 'all') assert.ok(visible.every(x=>x.dataset.category===filter));
    assert.equal(document.querySelector('#project-count').textContent, String(count));
    assert.equal(document.querySelectorAll('[aria-pressed="true"]').length, 1);
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    assert.match(document.querySelector('#filter-status').textContent, new RegExp(`^${count} project`));
  }
  await app.close();
});

test('email draft safely encodes the service, context, ampersands, Unicode and line breaks', async () => {
  const app = await load('contact.html');
  const { document, window } = app;
  assert.equal(document.querySelector('#email-composer').hidden, false);
  const form = document.querySelector('#inquiry-form');
  form.elements.service.value = 'Data matching & SKU reconciliation';
  form.elements.brief.value = 'Compare A&B exports. Arabic: بيانات\nQuestion: <script>alert(1)</script>';
  form.elements.timeline.value = '  January, to discuss  ';
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  const link = document.querySelector('#email-draft');
  assert.equal(link.hidden, false);
  const url = new URL(link.href);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'khaled.habdo@gmail.com');
  assert.equal(url.searchParams.get('subject'), 'Project inquiry — Data matching & SKU reconciliation');
  assert.ok(url.searchParams.get('body').includes(form.elements.brief.value));
  assert.ok(url.searchParams.get('body').includes('Target date: January, to discuss'));
  assert.equal(document.querySelectorAll('script').length, 2, 'user text never becomes a script node');
  assert.match(document.querySelector('#draft-status').textContent, /Nothing has been submitted/);
  assert.equal(document.activeElement, link);
  form.elements.brief.value += ' changed';
  form.elements.brief.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(link.hidden, true);
  assert.equal(link.hasAttribute('href'), false, 'editing invalidates a stale draft');
  assert.equal(window.localStorage.length, 0);
  assert.equal(window.sessionStorage.length, 0);
  await app.close();
});

test('invalid or whitespace-only inquiry cannot create a draft', async () => {
  const app = await load('contact.html');
  const { document, window } = app;
  const form = document.querySelector('#inquiry-form');
  form.reportValidity = () => false;
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.equal(document.querySelector('#email-draft').hidden, true);
  form.reportValidity = () => true;
  form.elements.brief.value = '                           ';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.equal(document.querySelector('#email-draft').hasAttribute('href'), false);
  assert.equal(document.activeElement, form.elements.brief);
  await app.close();
});

test('copy-email reports success only when clipboard succeeds, with an honest failure fallback', async () => {
  let copied;
  const app = await load('contact.html', { clipboard: { writeText: async (text) => { copied = text; } } });
  const button = app.document.querySelector('.copy-email');
  assert.equal(button.hidden, false);
  button.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(copied, 'khaled.habdo@gmail.com');
  assert.equal(app.document.querySelector('#copy-status').textContent, 'Email address copied.');
  await app.close();
  const failure = await load('contact.html', { clipboard: { writeText: async () => { throw new Error('Permission denied'); } } });
  failure.document.querySelector('.copy-email').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(failure.document.querySelector('#copy-status').textContent, /Copy was unavailable/);
  await failure.close();
});

test('without enhancement, project links, navigation and direct contact remain available', () => {
  const work = fs.readFileSync(path.join(root,'work.html'),'utf8');
  const contact = fs.readFileSync(path.join(root,'contact.html'),'utf8');
  assert.equal((work.match(/data-category=/g)||[]).length, 5);
  assert.match(work, /href="case-studies\/hotel-booking.html"/);
  assert.match(contact, /href="mailto:khaled.habdo@gmail.com"/);
  assert.match(contact, /id="email-composer" hidden/);
  assert.match(work, /<nav id="navigation" class="navigation"/);
  assert.ok(!/section\.style\.opacity|IntersectionObserver|fetch\(/.test(source));
});
