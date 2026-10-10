// Run `node render-seo.cjs` after changing listings in data.js.
// Keeps crawler-visible HTML aligned with the interactive listing cards.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = __dirname;
const context = { location: { search: '' }, URLSearchParams, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\nthis.listings = STAYS;', context);
const source = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
vm.runInContext(source.replace("  document.addEventListener('DOMContentLoaded'", "  globalThis.renderCard = stayCard;\n  document.addEventListener('DOMContentLoaded'"), context);
for (const [file, id, listings] of [
  ['index.html', 'featuredGrid', context.listings.filter(s => s.featured).slice(0, 6)],
  ['properties.html', 'stayGrid', [...context.listings].sort((a, b) => a.price - b.price)]
]) {
  const target = path.join(root, file);
  let html = fs.readFileSync(target, 'utf8');
  const marker = `<div class="stay-grid" id="${id}">`;
  const start = html.indexOf(marker) + marker.length;
  const after = file === 'index.html' ? '\n      </div>\n    </section>' : '\n\n        <div id="moreWrap"';
  const boundary = html.indexOf(after, start);
  const close = html.lastIndexOf('</div>', boundary);
  if (start < marker.length || boundary < 0 || close < start) throw new Error('Listing grid not found in ' + file);
  html = html.slice(0, start) + listings.map(context.renderCard).join('') + html.slice(close);
  fs.writeFileSync(target, html.replace(/[ \t]+$/gm, ''));
}
