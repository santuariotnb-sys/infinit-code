#!/usr/bin/env node
// ============================================================
//  Infinit Code — File Server API
//  HTTP server leve para operações de arquivo no container
//  Porta 9090 — roda em background ao lado do ttyd
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9090;
const WORKSPACE = '/root/workspace';
const SECRET = process.env.IDE_JWT_SECRET;

// ── Auth ────────────────────────────────────────────────────
function authenticate(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  return token === SECRET;
}

// ── Helpers ─────────────────────────────────────────────────
function safePath(p) {
  const resolved = path.resolve(WORKSPACE, p);
  if (!resolved.startsWith(WORKSPACE)) return null;
  return resolved;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(data));
}

// ── File tree (recursivo) ───────────────────────────────────
const IGNORE = new Set(['node_modules', '.git', '.next', 'dist', '.cache', '__pycache__']);

function buildTree(dirPath, relativeTo) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    if (IGNORE.has(entry.name) || entry.name.startsWith('.DS_Store')) continue;

    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(relativeTo, fullPath);

    if (entry.isDirectory()) {
      result.push({
        name: entry.name,
        type: 'folder',
        path: relPath,
        children: buildTree(fullPath, relativeTo),
      });
    } else {
      const stat = fs.statSync(fullPath);
      // Ignora arquivos > 1MB (binários provavelmente)
      if (stat.size > 1_000_000) continue;
      result.push({
        name: entry.name,
        type: 'file',
        path: relPath,
        size: stat.size,
      });
    }
  }

  return result.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ── Request handler ─────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    json(res, 204, null);
    return;
  }

  // Auth
  if (!authenticate(req)) {
    json(res, 401, { error: 'Unauthorized' });
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const action = url.pathname;

  try {
    // GET /tree — árvore de diretórios
    if (req.method === 'GET' && action === '/tree') {
      const dirPath = url.searchParams.get('path') || WORKSPACE;
      const safe = safePath(path.relative(WORKSPACE, dirPath) || '.');
      if (!safe) { json(res, 400, { error: 'Path outside workspace' }); return; }
      const tree = buildTree(safe, WORKSPACE);
      json(res, 200, { tree });
      return;
    }

    // GET /read — conteúdo de um arquivo
    if (req.method === 'GET' && action === '/read') {
      const filePath = url.searchParams.get('path');
      if (!filePath) { json(res, 400, { error: 'path required' }); return; }
      const safe = safePath(filePath);
      if (!safe) { json(res, 400, { error: 'Path outside workspace' }); return; }
      if (!fs.existsSync(safe)) { json(res, 404, { error: 'File not found' }); return; }
      const content = fs.readFileSync(safe, 'utf-8');
      json(res, 200, { path: filePath, content });
      return;
    }

    // POST /write — escrever arquivo
    if (req.method === 'POST' && action === '/write') {
      const body = await readBody(req);
      if (!body.path || body.content === undefined) { json(res, 400, { error: 'path and content required' }); return; }
      const safe = safePath(body.path);
      if (!safe) { json(res, 400, { error: 'Path outside workspace' }); return; }
      fs.mkdirSync(path.dirname(safe), { recursive: true });
      fs.writeFileSync(safe, body.content, 'utf-8');
      json(res, 200, { ok: true, path: body.path });
      return;
    }

    // POST /mkdir — criar diretório
    if (req.method === 'POST' && action === '/mkdir') {
      const body = await readBody(req);
      if (!body.path) { json(res, 400, { error: 'path required' }); return; }
      const safe = safePath(body.path);
      if (!safe) { json(res, 400, { error: 'Path outside workspace' }); return; }
      fs.mkdirSync(safe, { recursive: true });
      json(res, 200, { ok: true, path: body.path });
      return;
    }

    // DELETE /delete — deletar arquivo ou pasta
    if (req.method === 'DELETE' && action === '/delete') {
      const filePath = url.searchParams.get('path');
      if (!filePath) { json(res, 400, { error: 'path required' }); return; }
      const safe = safePath(filePath);
      if (!safe) { json(res, 400, { error: 'Path outside workspace' }); return; }
      if (!fs.existsSync(safe)) { json(res, 404, { error: 'Not found' }); return; }
      fs.rmSync(safe, { recursive: true, force: true });
      json(res, 200, { ok: true });
      return;
    }

    // POST /rename — renomear arquivo ou pasta
    if (req.method === 'POST' && action === '/rename') {
      const body = await readBody(req);
      if (!body.oldPath || !body.newPath) { json(res, 400, { error: 'oldPath and newPath required' }); return; }
      const safeOld = safePath(body.oldPath);
      const safeNew = safePath(body.newPath);
      if (!safeOld || !safeNew) { json(res, 400, { error: 'Path outside workspace' }); return; }
      if (!fs.existsSync(safeOld)) { json(res, 404, { error: 'Not found' }); return; }
      fs.mkdirSync(path.dirname(safeNew), { recursive: true });
      fs.renameSync(safeOld, safeNew);
      json(res, 200, { ok: true });
      return;
    }

    // GET /health
    if (req.method === 'GET' && action === '/health') {
      json(res, 200, { ok: true, workspace: WORKSPACE });
      return;
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('File server error:', err.message);
    json(res, 500, { error: err.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`∞ File server listening on port ${PORT}`);
});
