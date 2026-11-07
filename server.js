const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const leadsFile = path.join(dataDir, 'leads.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, '[]', 'utf8');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function festivalAssetPrefix(reqPath) {
  const clean = reqPath.replace(/\/index\.html$/i, '/');
  const depth = clean.split('/').filter(Boolean).length;
  if (depth === 0) return '';
  return '../'.repeat(depth);
}

function injectFestivalAssets(html, reqPath) {
  if (!html || /festival-theme\.js/.test(html)) return html;
  const prefix = festivalAssetPrefix(reqPath);
  const cssTag = `<link rel="stylesheet" href="${prefix}css/festival-themes.css">`;
  const jsTag = `<script src="${prefix}js/festival-theme.js" defer></script>`;
  let next = html;
  if (!/festival-themes\.css/.test(next) && /<\/head>/i.test(next)) {
    next = next.replace(/<\/head>/i, `    ${cssTag}\n</head>`);
  }
  if (/<\/body>/i.test(next)) {
    next = next.replace(/<\/body>/i, `    ${jsTag}\n</body>`);
  }
  return next;
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const routeAliases = {
    '/cars': '/cars/index.html',
    '/car-rental-goa': '/cars/index.html',
    '/bikes': '/bikes/index.html',
    '/bike-rental-goa': '/bikes/index.html',
    '/scooty-rental-goa': '/bikes/index.html',
    '/contact': '/contact/index.html',
    '/gallery': '/gallery/index.html',
    '/self-drive-car-goa': '/self-drive-car-rental-goa/index.html',
    '/self-drive-cars-goa': '/self-drive-car-rental-goa/index.html',
    '/self-drive-car-rental-goa': '/self-drive-car-rental-goa/index.html',
    '/best-self-drive-cars-goa': '/best-self-drive-cars-goa/index.html',
    '/goa-airport-taxi': '/goa-airport-taxi/index.html',
    '/goa-airport-car-rental': '/goa-airport-car-rental/index.html',
    '/mopa-airport-car-rental': '/mopa-airport-car-rental/index.html',
    '/dabolim-airport-car-rental': '/dabolim-airport-car-rental/index.html',
    '/north-goa-car-rental': '/north-goa-car-rental/index.html',
    '/south-goa-car-rental': '/south-goa-car-rental/index.html',
    '/automatic-car-rental-goa': '/automatic-car-rental-goa/index.html',
    '/cheap-car-rental-goa': '/cheap-car-rental-goa/index.html',
    '/luxury-car-rental-goa': '/luxury-car-rental-goa/index.html',
    '/7-seater-car-rental-goa': '/7-seater-car-rental-goa/index.html',
    '/calangute-car-rental': '/calangute-car-rental/index.html',
    '/baga-car-rental': '/baga-car-rental/index.html',
    '/candolim-car-rental': '/candolim-car-rental/index.html',
    '/panjim-car-rental': '/panjim-car-rental/index.html',
    '/madgaon-car-rental': '/madgaon-car-rental/index.html',
    '/palolem-car-rental': '/palolem-car-rental/index.html'
  };
  reqPath = routeAliases[reqPath] || reqPath;
  if (reqPath === '/') reqPath = '/index.html';

  const relativePath = reqPath.replace(/^\/+/, '');
  const fullPath = path.join(rootDir, relativePath);
  let safePath = path.normalize(fullPath);

  if (!safePath.startsWith(rootDir)) {
    sendJson(res, 403, { ok: false, error: 'Forbidden' });
    return;
  }

  if (!path.extname(safePath) && fs.existsSync(safePath + '.html')) {
    safePath = safePath + '.html';
  }

  fs.stat(safePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      safePath = path.join(safePath, 'index.html');
      stats = { isFile: () => true };
    }
    if (err || !stats.isFile()) {
      if (reqPath === '/api/leads') return;
      const notFoundPage = path.join(rootDir, '404.html');
      fs.readFile(notFoundPage, 'utf8', (readErr, pageContent) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(pageContent);
      });
      return;
    }
    const ext = path.extname(safePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.xml': 'application/xml; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8'
    };
    if (ext === '.html') {
      fs.readFile(safePath, 'utf8', (readErr, html) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Unable to read page');
          return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] });
        res.end(injectFestivalAssets(html, reqPath));
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(safePath).pipe(res);
  });
}

function handleLead(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const lead = {
        id: `LEAD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...payload
      };
      const rows = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
      rows.push(lead);
      fs.writeFileSync(leadsFile, JSON.stringify(rows, null, 2), 'utf8');
      sendJson(res, 200, { ok: true, leadId: lead.id, message: 'Lead captured successfully.' });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: 'Unable to save lead.' });
    }
  });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && reqUrl.pathname === '/api/leads') {
    handleLead(req, res);
    return;
  }
  if (req.method === 'GET' && reqUrl.pathname === '/api/festivals') {
    const calendarFile = path.join(dataDir, 'festivals.json');
    fs.readFile(calendarFile, 'utf8', (err, content) => {
      if (err) {
        sendJson(res, 500, { ok: false, error: 'Festival calendar unavailable.' });
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(content);
    });
    return;
  }
  serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`NSZ Goa Ride server running at http://localhost:${PORT}`);
});
