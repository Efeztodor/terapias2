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
