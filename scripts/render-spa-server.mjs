/**
 * Sirve dist/donideli/browser sin motor Angular SSR (uso de RAM muy bajo, apto plan free Render).
 * Rutas sin HTML pregenerado reciben index.csr.html para que el router hidrate en el cliente.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../dist/donideli/browser');
const port = Number(process.env.PORT) || 4000;
const host = '0.0.0.0';

if (!fs.existsSync(root)) {
  console.error(`[render-spa] No existe la carpeta de build: ${root}`);
  process.exit(1);
}

const spaShell = fs.existsSync(path.join(root, 'index.csr.html'))
  ? path.join(root, 'index.csr.html')
  : path.join(root, 'index.html');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function physicalPath(urlPath) {
  const pathname = decodeURIComponent((urlPath ?? '/').split('?')[0] || '/');
  const rel = pathname === '/' ? '' : pathname.replace(/^\/+/, '');
  const joined = path.normalize(path.join(root, rel));
  if (!joined.startsWith(root)) return null;
  return joined;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function readAndSend(res, filePath) {
  const ext = path.extname(filePath);
  const type = mime[ext] || 'application/octet-stream';
  const cache =
    ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 500, 'Error interno', { 'Content-Type': 'text/plain; charset=utf-8' });
    send(res, 200, data, { 'Content-Type': type, 'Cache-Control': cache });
  });
}

function sendCsrShell(res) {
  fs.readFile(spaShell, (err, data) => {
    if (err) return send(res, 404, 'No encontrado', { 'Content-Type': 'text/plain; charset=utf-8' });
    send(res, 200, data, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
  });
}

const server = http.createServer((req, res) => {
  const filePath = physicalPath(req.url);
  if (!filePath) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) {
      return readAndSend(res, filePath);
    }
    if (!err && st.isDirectory()) {
      const index = path.join(filePath, 'index.html');
      return fs.readFile(index, (readErr, data) => {
        if (!readErr) {
          return send(res, 200, data, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
          });
        }
        return sendCsrShell(res);
      });
    }
    return sendCsrShell(res);
  });
});

server.listen(port, host, () => {
  console.log(
    `[render-spa] Escuchando en http://${host}:${port} (PORT=${process.env.PORT ?? 'default'})`,
  );
});
