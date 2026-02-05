import { eq, and, desc, asc, like, inArray } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

// ============================================================================
// CACHE DE CONSULTAS
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryCache = new QueryCache();

// ============================================================================
// UTILITÁRIOS DE CONSULTA
// ============================================================================

export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

export function withCache<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = queryCache.get<T>(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  return queryFn().then(result => {
    queryCache.set(cacheKey, result, ttl);
    return result;
  });
}

// ============================================================================
// BUILDER DE CONSULTAS
// ============================================================================

export class QueryBuilder {
  private conditions: SQL[] = [];
  private orderByClause?: SQL;
  private limitClause?: number;
  private offsetClause?: number;

  where(condition: SQL): this {
    this.conditions.push(condition);
    return this;
  }

  whereEq(column: any, value: any): this {
    if (value !== undefined && value !== null) {
      this.conditions.push(eq(column, value));
    }
    return this;
  }

  whereLike(column: any, value: string): this {
    if (value) {
      this.conditions.push(like(column, `%${value}%`));
    }
    return this;
  }

  whereIn(column: any, values: any[]): this {
    if (values && values.length > 0) {
      this.conditions.push(inArray(column, values));
    }
    return this;
  }

  orderBy(column: any, direction: 'asc' | 'desc' = 'desc'): this {
    this.orderByClause = direction === 'desc' ? desc(column) : asc(column);
    return this;
  }

  limit(value: number): this {
    this.limitClause = value;
    return this;
  }

  offset(value: number): this {
    this.offsetClause = value;
    return this;
  }

  build(): {
    where?: SQL;
    orderBy?: SQL;
    limit?: number;
    offset?: number;
  } {
    return {
      where: this.conditions.length > 0 ? and(...this.conditions) : undefined,
      orderBy: this.orderByClause,
      limit: this.limitClause,
      offset: this.offsetClause
    };
  }
}

// ============================================================================
// UTILITÁRIOS DE PAGINAÇÃO
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function calculatePagination(page: number, pageSize: number, total: number) {
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    total,
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// ============================================================================
// UTILITÁRIOS DE PERFORMANCE
// ============================================================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================================================

export function isValidYear(year: any): year is number {
  return typeof year === 'number' && year >= 2020 && year <= 2030;
}

export function isValidMunicipio(municipio: any): municipio is string {
  return typeof municipio === 'string' && municipio.trim().length > 0;
}

export function isValidTribunal(tribunal: any): tribunal is string {
  return typeof tribunal === 'string' && ['TCEMG', 'TCE'].includes(tribunal);
}

// ============================================================================
// UTILITÁRIOS DE TRANSFORMAÇÃO
// ============================================================================

export function normalizeMunicipioName(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

export function normalizeIndicatorCode(code: string): string {
  return code
    .replace(/\s+/g, '') // Remove espaços
    .toUpperCase()
    .trim();
}

// ============================================================================
// UTILITÁRIOS DE LOGGING
// ============================================================================

export function logQuery(operation: string, params: any, duration: number) {
  console.log(`[DB Query] ${operation}`, {
    params,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  });
}

export function logError(operation: string, error: any) {
  console.error(`[DB Error] ${operation}`, {
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString()
  });
}

// ============================================================================
// WRAPPER DE PERFORMANCE
// ============================================================================

export async function withPerformanceLogging<T>(
  operation: string,
  queryFn: () => Promise<T>,
  params?: any
): Promise<T> {
  const start = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    logQuery(operation, params, duration);
    return result;
  } catch (error) {
    // const duration = performance.now() - start;
    logError(operation, error);
    throw error;
  }
}
