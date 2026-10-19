const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootDirectory = path.resolve(__dirname, '..');
const context = {
  console,
  URL,
  window: { location: { pathname: '/' } },
  document: {
    title: '',
    addEventListener(eventName, callback) {
      if (eventName === 'DOMContentLoaded') this.renderSeoPage = callback;
    },
    createElement() {
      return {
        setAttribute() {},
        remove() {}
      };
    },
    getElementById(id) {
      return id === 'seo-page-root' ? this.seoPageRoot : null;
    },
    head: {
      appendChild() {},
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      }
    },
    seoPageRoot: {
      dataset: {},
      addEventListener() {},
      innerHTML: ''
    }
  }
};

vm.createContext(context);
for (const sourcePath of ['js/seo-pages.js', 'js/seo-renderer.js']) {
  const source = fs.readFileSync(path.join(rootDirectory, sourcePath), 'utf8');
  vm.runInContext(source, context, { filename: sourcePath });
}

const renderSeoPage = context.document.renderSeoPage;
if (typeof renderSeoPage !== 'function') {
  throw new Error('The SEO renderer did not register its page-render callback.');
}

let updatedPages = 0;
for (const route of Object.keys(context.window.seoPages)) {
  if (route === '/') continue;

  const relativeRoute = route.replace(/^\/+|\/+$/g, '');
  const pagePath = path.join(rootDirectory, relativeRoute, 'index.html');
  if (!fs.existsSync(pagePath)) {
    throw new Error(`No HTML page exists for SEO route ${route}.`);
  }

  context.window.location.pathname = `/${relativeRoute}/`;
  context.document.seoPageRoot.innerHTML = '';
  context.document.seoPageRoot.dataset = {};
  renderSeoPage();

  const markup = context.document.seoPageRoot.innerHTML
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
  if (!markup || !/<h1\b/i.test(markup)) {
    throw new Error(`The renderer produced no page heading for ${route}.`);
  }

  const html = fs.readFileSync(pagePath, 'utf8');
  const renderedBlock = `<!-- SEO_STATIC_START -->\n${markup}\n<!-- SEO_STATIC_END -->`;
  let updatedHtml;

  if (html.includes('<!-- SEO_STATIC_START -->')) {
    updatedHtml = html.replace(/<!-- SEO_STATIC_START -->[\s\S]*?<!-- SEO_STATIC_END -->/, renderedBlock);
  } else {
    const emptyRoot = /<div id="seo-page-root">\s*<\/div>/;
    if (!emptyRoot.test(html)) continue;
    updatedHtml = html.replace(emptyRoot, `<div id="seo-page-root">\n${renderedBlock}\n</div>`);
  }

  if (updatedHtml !== html) {
    fs.writeFileSync(pagePath, updatedHtml, 'utf8');
    updatedPages++;
  }
}

console.log(`Updated ${updatedPages} client-rendered SEO pages; custom HTML pages and the homepage were excluded.`);
