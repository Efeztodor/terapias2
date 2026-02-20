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

// Crear tabla site_settings si no existe (clave-valor para WhatsApp, redes sociales, etc.)
const SETTINGS_DEFAULTS = {
  whatsapp_number: '56977929416',
  whatsapp_message: 'Hola, quiero agendar una sesión',
  whatsapp_tooltip: '💬 ¡Hablemos, con gusto te oriento!',
  social_instagram_url: 'https://instagram.com/paola.cyc',
  social_instagram_label: 'Instagram',
  social_facebook_url: 'https://www.facebook.com/share/18M4oaggvG/?mibextid=wwXIfr',
  social_facebook_label: 'Facebook',
  social_youtube_url: 'https://youtube.com/@pao.terapeuta',
  social_youtube_label: 'YouTube',
  social_tiktok_url: 'https://www.tiktok.com/@paola.terapeuta.cyc',
  social_tiktok_label: 'TikTok',
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
      `INSERT INTO site_settings (key, value) VALUES
       ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10), ($11, $12), ($13, $14), ($15, $16), ($17, $18), ($19, $20), ($21, $22)
       ON CONFLICT (key) DO NOTHING`,
      [
        'whatsapp_number', SETTINGS_DEFAULTS.whatsapp_number,
        'whatsapp_message', SETTINGS_DEFAULTS.whatsapp_message,
        'whatsapp_tooltip', SETTINGS_DEFAULTS.whatsapp_tooltip,
        'social_instagram_url', SETTINGS_DEFAULTS.social_instagram_url,
        'social_instagram_label', SETTINGS_DEFAULTS.social_instagram_label,
        'social_facebook_url', SETTINGS_DEFAULTS.social_facebook_url,
        'social_facebook_label', SETTINGS_DEFAULTS.social_facebook_label,
        'social_youtube_url', SETTINGS_DEFAULTS.social_youtube_url,
        'social_youtube_label', SETTINGS_DEFAULTS.social_youtube_label,
        'social_tiktok_url', SETTINGS_DEFAULTS.social_tiktok_url,
        'social_tiktok_label', SETTINGS_DEFAULTS.social_tiktok_label,
      ]
    );
  }
}

function mapToSocial(map) {
  return {
    instagram: { url: map.social_instagram_url ?? SETTINGS_DEFAULTS.social_instagram_url, label: map.social_instagram_label ?? SETTINGS_DEFAULTS.social_instagram_label },
    facebook: { url: map.social_facebook_url ?? SETTINGS_DEFAULTS.social_facebook_url, label: map.social_facebook_label ?? SETTINGS_DEFAULTS.social_facebook_label },
    youtube: { url: map.social_youtube_url ?? SETTINGS_DEFAULTS.social_youtube_url, label: map.social_youtube_label ?? SETTINGS_DEFAULTS.social_youtube_label },
    tiktok: { url: map.social_tiktok_url ?? SETTINGS_DEFAULTS.social_tiktok_url, label: map.social_tiktok_label ?? SETTINGS_DEFAULTS.social_tiktok_label },
  };
}

// GET configuración para el frontend (WhatsApp flotante, etc.)
app.get('/api/settings', async (_req, res) => {
  try {
    await ensureSettingsTable();
    if (!pool) {
      return res.json({
        whatsappNumber: SETTINGS_DEFAULTS.whatsapp_number,
        whatsappMessage: SETTINGS_DEFAULTS.whatsapp_message,
        whatsappTooltip: SETTINGS_DEFAULTS.whatsapp_tooltip,
        social: mapToSocial(SETTINGS_DEFAULTS),
      });
    }
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({
      whatsappNumber: map.whatsapp_number ?? SETTINGS_DEFAULTS.whatsapp_number,
      whatsappMessage: map.whatsapp_message ?? SETTINGS_DEFAULTS.whatsapp_message,
      whatsappTooltip: map.whatsapp_tooltip ?? SETTINGS_DEFAULTS.whatsapp_tooltip,
      social: mapToSocial(map),
    });
  } catch (err) {
    res.json({
      whatsappNumber: SETTINGS_DEFAULTS.whatsapp_number,
      whatsappMessage: SETTINGS_DEFAULTS.whatsapp_message,
      whatsappTooltip: SETTINGS_DEFAULTS.whatsapp_tooltip,
      social: mapToSocial(SETTINGS_DEFAULTS),
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
    const body = req.body || {};
    const { whatsappNumber, whatsappMessage } = body;
    const socialBody = {
      socialInstagramUrl: body.socialInstagramUrl,
      socialInstagramLabel: body.socialInstagramLabel,
      socialFacebookUrl: body.socialFacebookUrl,
      socialFacebookLabel: body.socialFacebookLabel,
      socialYoutubeUrl: body.socialYoutubeUrl,
      socialYoutubeLabel: body.socialYoutubeLabel,
      socialTiktokUrl: body.socialTiktokUrl,
      socialTiktokLabel: body.socialTiktokLabel,
    };
    const keyMap = {
      socialInstagramUrl: 'social_instagram_url',
      socialInstagramLabel: 'social_instagram_label',
      socialFacebookUrl: 'social_facebook_url',
      socialFacebookLabel: 'social_facebook_label',
      socialYoutubeUrl: 'social_youtube_url',
      socialYoutubeLabel: 'social_youtube_label',
      socialTiktokUrl: 'social_tiktok_url',
      socialTiktokLabel: 'social_tiktok_label',
    };
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
    if (body.whatsappTooltip != null) {
      await pool.query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['whatsapp_tooltip', String(body.whatsappTooltip).trim() || SETTINGS_DEFAULTS.whatsapp_tooltip]
      );
    }
    for (const [apiKey, dbKey] of Object.entries(keyMap)) {
      const val = socialBody[apiKey];
      if (val != null && String(val).trim() !== '') {
        await pool.query(
          'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
          [dbKey, String(val).trim()]
        );
      }
    }
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({
      whatsappNumber: map.whatsapp_number ?? SETTINGS_DEFAULTS.whatsapp_number,
      whatsappMessage: map.whatsapp_message ?? SETTINGS_DEFAULTS.whatsapp_message,
      whatsappTooltip: map.whatsapp_tooltip ?? SETTINGS_DEFAULTS.whatsapp_tooltip,
      social: mapToSocial(map),
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
