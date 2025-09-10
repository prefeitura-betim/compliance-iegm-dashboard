import { createDB } from '../../db';

export interface DatabaseConfig {
  useMockData: boolean;
  apiBaseUrl: string;
  useDirectD1: boolean;
}

export class DatabaseService {
  private db: ReturnType<typeof createDB> | null = null;
  private config: DatabaseConfig;

  constructor(d1Database?: D1Database, config?: Partial<DatabaseConfig>) {
    // Detectar se estamos no browser
    const isBrowser = typeof window !== 'undefined';

    // Detectar se estamos em produção (Cloudflare Pages)
    const isProduction = typeof globalThis !== 'undefined' &&
                        'location' in globalThis &&
                        (globalThis.location.hostname.includes('pages.dev') ||
                         globalThis.location.hostname.includes('cloudflare.com'));

    const defaultConfig: DatabaseConfig = {
      useMockData: false,
      apiBaseUrl: isProduction
        ? `${globalThis.location.origin}/api` // Usar API do Cloudflare Pages em produção
        : '/api', // Usar API local em desenvolvimento
      useDirectD1: false
    };

    this.config = { ...defaultConfig, ...config };

    try {
      // Em browser, sempre usar API (não pode acessar D1Database diretamente)
      if (isBrowser) {
        this.db = null;
        console.log('Browser environment detected, using API endpoints');
        this.config.useDirectD1 = false;
        this.config.useMockData = false;
      } else {
        // Em Cloudflare Pages Functions, tentar usar D1Database
        if (d1Database) {
          this.db = createDB(d1Database);
          if (this.db) {
            console.log('D1Database connected successfully with Drizzle');
            this.config.useDirectD1 = true;
            this.config.useMockData = false;
          } else {
            console.warn('D1Database not available, using API endpoints');
            this.config.useDirectD1 = false;
            this.config.useMockData = false;
          }
        } else {
          console.log('No D1Database provided, using API endpoints');
          this.config.useDirectD1 = false;
          this.config.useMockData = false;
        }
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      this.config.useDirectD1 = false;
      this.config.useMockData = false;
    }
  }

  getDb() {
    return this.db;
  }

  isMockData() {
    return this.config.useMockData;
  }

  isDirectD1() {
    return this.config.useDirectD1;
  }

  getApiBaseUrl() {
    return this.config.apiBaseUrl;
  }

  getConfig() {
    return this.config;
  }
}

export const createDatabaseService = (d1Database?: D1Database, config?: Partial<DatabaseConfig>) => {
  return new DatabaseService(d1Database, config);
};
