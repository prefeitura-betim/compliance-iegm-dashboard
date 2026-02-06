import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Para produção no Cloudflare Workers
export function createD1DB(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Factory para criar o banco baseado no ambiente
export function createDB(d1Database?: D1Database) {
  // Detectar se estamos em um ambiente que suporta D1Database
  const isD1Environment = typeof globalThis !== 'undefined' &&
    ('D1Database' in globalThis ||
      'D1Database' in globalThis.constructor ||
      typeof d1Database !== 'undefined');

  // Se temos D1Database disponível ou estamos em ambiente Cloudflare
  if (isD1Environment && d1Database) {
    return createD1DB(d1Database);
  }

  if (typeof globalThis !== 'undefined' &&
    'location' in globalThis &&
    globalThis.location.hostname.includes('pages.dev')) {
    return null;
  }

  // Em desenvolvimento local ou browser, retornar null para usar API
  // Em desenvolvimento local ou browser, retornar null para usar API
  return null;
}

// Tipos exportados
export type DB = ReturnType<typeof createD1DB> | null;
export { schema };
