/**
 * Tipos para respuestas de la API PostgreSQL.
 * Añade aquí los tipos de tus tablas cuando definas el esquema en Postgres.
 */

export interface HealthResponse {
  status: 'ok' | 'error';
  database?: 'connected' | 'not_configured' | 'error';
  message?: string;
  ping?: number;
}
