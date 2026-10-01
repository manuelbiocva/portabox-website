/* Validate vercel.json against Vercel's published schema before pushing.
   An invalid key fails the deploy rather than the build, so it is only
   visible in the dashboard — worth catching locally. */
const fs = require('fs');
const https = require('https');

const SCHEMA = 'https://openapi.vercel.sh/vercel.json';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return resolve(get(r.headers.location));
      }
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function resolveRef(schema, node) {
  if (node && node.$ref) {
    const key = node.$ref.split('/').pop();
    return (schema.definitions || schema.$defs || {})[key] || {};
  }
  return node || {};
}

(async () => {
  const cfg = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const schema = JSON.parse(await get(SCHEMA));
  const props = schema.properties || {};
  const problems = [];

  for (const key of Object.keys(cfg)) {
    if (key === '$schema') continue;
    if (!props[key]) problems.push(`unknown top-level key: "${key}"`);
  }

  // header rules reject unknown keys, which is how a "comment" broke a deploy
  const hItem = resolveRef(schema, (props.headers || {}).items);
  const allowed = Object.keys(hItem.properties || {});
  (cfg.headers || []).forEach((rule, i) => {
    for (const k of Object.keys(rule)) {
      if (allowed.length && !allowed.includes(k)) {
        problems.push(`headers[${i}]: unknown key "${k}" (allowed: ${allowed.join(', ')})`);
      }
    }
    if (!rule.source) problems.push(`headers[${i}]: missing "source"`);
  });

  if (problems.length) {
    problems.forEach((p) => console.log('  ' + p));
    console.log(`vercel.json: ${problems.length} problem(s) — the deploy would fail`);
    process.exitCode = 1;
  } else {
    console.log(`vercel.json: valid (${Object.keys(cfg).length - 1} settings, ${(cfg.headers || []).length} header rules)`);
  }
})();
