const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1300);

  // bad postcode
  await p.fill('.tool-card-form input','12');
  await p.click('.tool-card-form .btn-trace'); await p.waitForTimeout(400);
  console.log('error path :', (await p.textContent('.tool-card .quote-out')||'').trim().slice(0,60));

  // good postcode
  await p.fill('.tool-card-form input','3121');
  await p.click('.tool-card-form .btn-trace'); await p.waitForTimeout(300);
  const busy = await p.getAttribute('.tool-card-form .bt-label','data-title');
  await p.waitForTimeout(700);
  const done = await p.$eval('.tool-card-form .btn-trace', e=>e.className);
  const title = await p.getAttribute('.tool-card-form .bt-label','data-title');
  console.log('busy label :', busy);
  console.log('after done :', title, '| class:', done);
  console.log('result     :', (await p.textContent('.tool-card .quote-out')||'').trim().slice(0,70));
  // structure intact?
  const parts = await p.$eval('.tool-card-form .btn-trace', e=>({
    edge:!!e.querySelector('.bt-edge'), size:!!e.querySelector('.bt-size'),
    sr:!!e.querySelector('.sr-only'), label:!!e.querySelector('.bt-label')}));
  console.log('structure  :', JSON.stringify(parts));
  console.log('js errors  :', errs.length?errs.join(';'):'none');
  await b.close();
})();
