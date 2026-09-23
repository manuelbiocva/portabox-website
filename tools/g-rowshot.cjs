const { chromium } = require('playwright');
const path = require('path'); const { pathToFileURL } = require('url');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(path.resolve('site/index.html')).href);
  await p.addStyleTag({content:'.g-rise{opacity:1!important;transform:none!important}'});
  const idx = p.locator('.g-index').first();
  await idx.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  await p.locator('.g-row').nth(1).hover(); await p.waitForTimeout(800);
  await idx.screenshot({ path: 'tools/shot-rows.png' });
  await b.close();
})();
