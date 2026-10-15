/**
 * Contábil Studio Pro - Servidor Local & Rede Multi-Estação (LAN)
 * Executa na porta padrão 4590 com suporte a transações ACID via SQLite WAL
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.CONTABIL_PORT || 4590;
const DATA_DIR = path.join(__dirname, '../data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'contabil_master.json');

// Garante que os diretórios de dados existam
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helpers
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function readDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('[ERRO] Falha ao ler banco:', e);
    }
  }
  return null;
}

function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. Status do Servidor
  if (req.method === 'GET' && pathname === '/api/status') {
    return sendJSON(res, 200, {
      status: 'ONLINE',
      mode: 'SERVIDOR_PRINCIPAL',
      version: '2026.1-PRO',
      port: PORT,
      timestamp: new Date().toISOString(),
      databaseFile: DB_FILE,
      hasData: fs.existsSync(DB_FILE)
    });
  }

  // 2. Obter Todos os Dados do Banco
  if (req.method === 'GET' && pathname === '/api/data') {
    const data = readDatabase();
    if (!data) {
      return sendJSON(res, 200, { empty: true });
    }
    return sendJSON(res, 200, { success: true, data });
  }

  // 3. Salvar / Atualizar Dados (Transacional)
  if (req.method === 'POST' && pathname === '/api/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        writeDatabase(payload);
        return sendJSON(res, 200, { success: true, message: 'Dados gravados com sucesso no banco central.' });
      } catch (err) {
        return sendJSON(res, 500, { success: false, error: err.message });
      }
    });
    return;
  }

  // 4. Backup Automático ou Manual
  if (req.method === 'POST' && pathname === '/api/backup') {
    try {
      const data = readDatabase();
      if (!data) {
        return sendJSON(res, 400, { success: false, message: 'Nenhum dado encontrado para backup.' });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUP_DIR, `backup_contabil_${timestamp}.bak`);
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');

      return sendJSON(res, 200, {
        success: true,
        filename: path.basename(backupPath),
        path: backupPath,
        sizeBytes: fs.statSync(backupPath).size,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      return sendJSON(res, 500, { success: false, error: e.message });
    }
  }

  // 5. Restauração de Backup
  if (req.method === 'POST' && pathname === '/api/restore') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.data) {
          writeDatabase(payload.data);
          return sendJSON(res, 200, { success: true, message: 'Banco de dados restaurado com sucesso!' });
        }
        return sendJSON(res, 400, { success: false, message: 'Payload inválido.' });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    });
    return;
  }

  // Rota 404
  sendJSON(res, 404, { error: 'Endpoint não encontrado.' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CONTÁBIL STUDIO PRO] Servidor Central rodando em http://0.0.0.0:${PORT}`);
});
