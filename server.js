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

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (reqPath === '/') reqPath = '/index.html';
  const fullPath = path.join(rootDir, reqPath.replace(/^\/+/, ''));
  let safePath = path.normalize(fullPath);

  if (!safePath.startsWith(rootDir)) {
    sendJson(res, 403, { ok: false, error: 'Forbidden' });
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      safePath = path.join(safePath, 'index.html');
      stats = { isFile: () => true };
    }
    if (err || !stats.isFile()) {
      if (reqPath === '/api/leads') return;
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
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
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain; charset=utf-8'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(safePath).pipe(res);
  });
}

function handleLead(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 32 * 1024) req.destroy();
  });
  req.on('end', () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const requiredFields = ['name', 'phone', 'email', 'vehicle', 'pickup', 'dropoff', 'location'];
      const missingField = requiredFields.find(field => typeof payload[field] !== 'string' || !payload[field].trim());
      const phone = typeof payload.phone === 'string' ? payload.phone.replace(/[\s-]/g, '') : '';
      const pickup = new Date(`${payload.pickup}T00:00:00`);
      const dropoff = new Date(`${payload.dropoff}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (missingField) return sendJson(res, 400, { ok: false, error: `Missing field: ${missingField}` });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return sendJson(res, 400, { ok: false, error: 'Invalid email.' });
      if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) return sendJson(res, 400, { ok: false, error: 'Invalid phone number.' });
      if (Number.isNaN(pickup.getTime()) || pickup < today) return sendJson(res, 400, { ok: false, error: 'Invalid pickup date.' });
      if (Number.isNaN(dropoff.getTime()) || dropoff <= pickup) return sendJson(res, 400, { ok: false, error: 'Invalid drop-off date.' });

      const lead = {
        id: `LEAD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        name: payload.name.trim().slice(0, 100),
        phone: payload.phone.trim().slice(0, 30),
        email: payload.email.trim().slice(0, 160),
        vehicle: payload.vehicle.trim().slice(0, 160),
        pickup: payload.pickup,
        dropoff: payload.dropoff,
        location: payload.location.trim().slice(0, 160),
        requests: typeof payload.requests === 'string' ? payload.requests.trim().slice(0, 1000) : '',
        source: typeof payload.source === 'string' ? payload.source.slice(0, 50) : 'website',
        bookingReference: typeof payload.bookingReference === 'string' ? payload.bookingReference.slice(0, 40) : ''
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
  serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`NSZ Goa Ride server running at http://localhost:${PORT}`);
});
