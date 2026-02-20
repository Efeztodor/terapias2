/**
 * Servidor API con PostgreSQL (compatible con Railway).
 * Usa DATABASE_URL para conectar a Postgres (Railway la inyecta al añadir el plugin Postgres).
 */
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null;

// Health check (comprueba conexión a Postgres si existe DATABASE_URL)
app.get('/api/health', async (_req, res) => {
  try {
    if (pool) {
      const client = await pool.connect();
      const result = await client.query('SELECT 1 as ok');
      client.release();
      return res.json({ status: 'ok', database: 'connected', ping: result.rows[0].ok });
    }
    res.json({ status: 'ok', database: 'not_configured' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'error', message: err.message });
  }
});

// Crear tabla site_settings si no existe (clave-valor para WhatsApp y futuras opciones)
const SETTINGS_DEFAULTS = {
  whatsapp_number: '56977929416',
  whatsapp_message: 'Hola, quiero agendar una sesión',
};

async function ensureSettingsTable() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  const { rows } = await pool.query('SELECT key, value FROM site_settings');
  const hasNumber = rows.some((r) => r.key === 'whatsapp_number');
  if (!hasNumber) {
    await pool.query(
      'INSERT INTO site_settings (key, value) VALUES ($1, $2), ($3, $4) ON CONFLICT (key) DO NOTHING',
      ['whatsapp_number', SETTINGS_DEFAULTS.whatsapp_number, 'whatsapp_message', SETTINGS_DEFAULTS.whatsapp_message]
    );
  }
}

// GET configuración para el frontend (WhatsApp flotante, etc.)
app.get('/api/settings', async (_req, res) => {
  try {
    await ensureSettingsTable();
    if (!pool) {
      return res.json({
        whatsappNumber: SETTINGS_DEFAULTS.whatsapp_number,
        whatsappMessage: SETTINGS_DEFAULTS.whatsapp_message,
      });
    }
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({
      whatsappNumber: map.whatsapp_number ?? SETTINGS_DEFAULTS.whatsapp_number,
      whatsappMessage: map.whatsapp_message ?? SETTINGS_DEFAULTS.whatsapp_message,
    });
  } catch (err) {
    res.json({
      whatsappNumber: SETTINGS_DEFAULTS.whatsapp_number,
      whatsappMessage: SETTINGS_DEFAULTS.whatsapp_message,
    });
  }
});

// PATCH actualizar configuración (WhatsApp, etc.)
app.patch('/api/settings', async (req, res) => {
  try {
    await ensureSettingsTable();
    if (!pool) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { whatsappNumber, whatsappMessage } = req.body || {};
    if (whatsappNumber != null) {
      const clean = String(whatsappNumber).replace(/\D/g, '');
      if (clean) {
        await pool.query(
          'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
          ['whatsapp_number', clean]
        );
      }
    }
    if (whatsappMessage != null && String(whatsappMessage).trim() !== '') {
      await pool.query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['whatsapp_message', String(whatsappMessage).trim()]
      );
    }
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({
      whatsappNumber: map.whatsapp_number ?? SETTINGS_DEFAULTS.whatsapp_number,
      whatsappMessage: map.whatsapp_message ?? SETTINGS_DEFAULTS.whatsapp_message,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ejemplo: listar tablas (útil para comprobar el esquema)
app.get('/api/tables', async (_req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  try {
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    res.json(result.rows.map((r) => r.table_name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sirve el frontend estático en producción (después de npm run build)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!pool) console.log('DATABASE_URL not set – API will run without database');
});
