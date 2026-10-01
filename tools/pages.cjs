/* The site moved to the URL structure in the scope of work: pages live at
   nested paths (storage/self-storage/index.html served as /storage/self-storage/)
   rather than flat .html files. Tools enumerate through here so they do not
   each need their own walk. */
const fs = require('fs');
const path = require('path');

const ROOT = 'site';

/** Every generated page as a served URL path, e.g. "/", "/storage/self-storage/". */
function pageUrls(opts) {
  opts = opts || {};
  const skip = new Set(opts.skip || ['/palette.html']);
  const out = [];

  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'assets') continue;
        walk(full);
      } else if (entry.name.endsWith('.html')) {
        const rel = path.relative(ROOT, full).split(path.sep).join('/');
        out.push('/' + rel.replace(/index\.html$/, ''));
      }
    }
  })(ROOT);

  return out.filter((u) => !skip.has(u)).sort();
}

/** Local server origin the tools run against; site/ is the web root. */
const BASE = 'http://127.0.0.1:8899';

/** A served URL path -> the file on disk that backs it. */
function fileFor(url) {
  return path.join(ROOT, url === '/' ? 'index.html' : url.replace(/^\//, '') + (url.endsWith('/') ? 'index.html' : ''));
}

module.exports = { pageUrls, fileFor, BASE, ROOT };
