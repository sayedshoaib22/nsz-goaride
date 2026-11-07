'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const skip = new Set(['yandex_51fd73c55b9266b3.html', 'naver43756a38e66ca409b20ced3963689004.html']);

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function prefixFor(filePath) {
  const rel = path.relative(rootDir, path.dirname(filePath));
  if (!rel || rel === '.') return '';
  return rel.split(path.sep).map(() => '..').join('/') + '/';
}

function inject(html, prefix) {
  const cssTag = `<link rel="stylesheet" href="${prefix}css/festival-themes.css">`;
  const jsTag = `<script src="${prefix}js/festival-theme.js" defer></script>`;
  let next = html;
  if (!/festival-themes\.css/.test(next)) {
    if (/<\/head>/i.test(next)) next = next.replace(/<\/head>/i, `    ${cssTag}\n</head>`);
    else next = `${cssTag}\n${next}`;
  }
  if (!/festival-theme\.js/.test(next)) {
    if (/<\/body>/i.test(next)) next = next.replace(/<\/body>/i, `    ${jsTag}\n</body>`);
    else next = `${next}\n${jsTag}\n`;
  }
  return next;
}

const files = walk(rootDir, []).filter((file) => !skip.has(path.basename(file)));
let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = inject(original, prefixFor(file));
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed += 1;
  }
}
console.log(`Injected festival assets into ${changed} HTML files.`);
