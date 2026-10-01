/* Postcode box -> Instant Quote page -> full quote form. */
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:8899/';

(async () => {
  const b = await chromium.launch();
  const errs = [];

  // 1. a small postcode box hands over to the quote page
  const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(B + 'storage-services.html', { waitUntil: 'networkidle' });
  await p.locator('.quote-form input').first().fill('3121');
  await p.locator('.quote-form button[type=submit]').first().click();
  await p.waitForLoadState('networkidle');
  console.log('redirected to :', p.url().split('/site/')[1]);

  const pre = await p.evaluate(() => ({
    from: document.getElementById('q-from').value,
    hint: (document.querySelector('[data-depot-for="q-from"]') || {}).textContent,
    atForm: Math.round(document.getElementById('quote-form').getBoundingClientRect().top),
  }));
  console.log('prefilled     :', JSON.stringify(pre));

  // 2. the form's own fields
  const shape = await p.evaluate(() => ({
    radioGroups: [...new Set([...document.querySelectorAll('.g-qform input[type=radio]')].map(r => r.name))],
    selects: [...document.querySelectorAll('.g-qform select')].map(s => s.id + '(' + (s.options.length - 1) + ')'),
    inputs: [...document.querySelectorAll('.g-qform input:not([type=radio])')].map(i => i.id),
    required: document.querySelectorAll('.g-qform [required]').length,
  }));
  console.log('form shape    :', JSON.stringify(shape));

  // 3. empty submit -> validation, radios flagged on their wrapper
  await p.evaluate(() => document.getElementById('q-from').value = '');
  await p.locator('.g-qform button[type=submit]').click();
  await p.waitForTimeout(300);
  const bad = await p.evaluate(() => ({
    msg: document.querySelector('.g-qform .g-cform-msg').textContent.trim().slice(0, 48),
    flaggedRadioGroups: document.querySelectorAll('.g-qform .g-radios[aria-invalid="true"]').length,
    flaggedFields: document.querySelectorAll('.g-qform input[aria-invalid="true"], .g-qform select[aria-invalid="true"]').length,
  }));
  console.log('empty submit  :', JSON.stringify(bad));

  // 4. mismatched confirm email is caught
  await p.click('label[for="q-help-2"]'); await p.click('label[for="q-where-1"]');
  await p.selectOption('#q-space', 'large'); await p.selectOption('#q-term', { index: 2 });
  await p.fill('#q-from', '3121'); await p.fill('#q-to', '3000');
  await p.fill('#q-email', 'sam@example.com'); await p.fill('#q-email2', 'sam@exampel.com');
  await p.fill('#q-phone', '0400111222');
  await p.locator('.g-qform button[type=submit]').click();
  await p.waitForTimeout(250);
  console.log('email mismatch:', await p.evaluate(() => ({
    caught: document.getElementById('q-email2').getAttribute('aria-invalid') === 'true',
    msg: document.querySelector('.g-qform .g-cform-msg').textContent.trim().slice(0, 40),
  })));

  // 5. matching -> accepted, and the depot hint is live
  await p.fill('#q-email2', 'sam@example.com');
  await p.locator('.g-qform button[type=submit]').click();
  await p.waitForTimeout(250);
  console.log('valid submit  :', await p.evaluate(() => ({
    msg: document.querySelector('.g-qform .g-cform-msg').textContent.trim().slice(0, 46),
    stillFlagged: document.querySelectorAll('.g-qform [aria-invalid="true"]').length,
    fromHint: document.querySelector('[data-depot-for="q-from"]').textContent,
    toHint: document.querySelector('[data-depot-for="q-to"]').textContent,
  })));

  // 6. footer
  console.log('footer        :', await p.evaluate(() => {
    const rows = [...document.querySelectorAll('.g-foot-contact li')].map(li => Math.round(li.getBoundingClientRect().top));
    return {
      gapPx: rows.length > 1 ? rows[1] - rows[0] : null,
      social: [...document.querySelectorAll('.g-foot-social a')].map(a => a.getAttribute('aria-label')),
      icons: document.querySelectorAll('.g-foot-social svg').length,
    };
  }));
  console.log('page errors   :', errs.length ? errs : 'none');
  await b.close();
})();
