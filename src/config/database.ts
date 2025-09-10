// ============================================================================
// CONFIGURAÇÕES DO BANCO DE DADOS
// ============================================================================

export const DATABASE_CONFIG = {
  // Configurações de cache
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
    LONG_TTL: 30 * 60 * 1000,   // 30 minutos
    SHORT_TTL: 1 * 60 * 1000,   // 1 minuto
  },

  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 1000,
    MIN_PAGE_SIZE: 10,
  },

  // Configurações de consulta
  QUERY: {
    DEFAULT_LIMIT: 1000,
    MAX_LIMIT: 5000,
    BATCH_SIZE: 100,
  },

  // Configurações de performance
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_LIMIT: 100,
    QUERY_TIMEOUT: 30000,
  },

  // Configurações de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DOS TRIBUNAIS
// ============================================================================

export const TRIBUNAL_CONFIG = {
  TCEMG: {
    id: 1,
    codigo: 'TCEMG',
    nome: 'Tribunal de Contas do Estado de Minas Gerais',
    uf: 'MG',
  },
  TCE: {
    id: 2,
    codigo: 'TCE',
    nome: 'Tribunal de Contas Estadual',
    uf: 'BR',
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DOS INDICADORES
// ============================================================================

export const INDICADOR_CONFIG = {
  'i-Educ': {
    codigo: 'i-Educ',
    nome: 'Educação',
    descricao: 'Indicador de Educação',
    ordem: 1,
  },
  'i-Saude': {
    codigo: 'i-Saude',
    nome: 'Saúde',
    descricao: 'Indicador de Saúde',
    ordem: 2,
  },
  'i-Fiscal': {
    codigo: 'i-Fiscal',
    nome: 'Gestão Fiscal',
    descricao: 'Indicador de Gestão Fiscal',
    ordem: 3,
  },
  'i-Amb': {
    codigo: 'i-Amb',
    nome: 'Meio Ambiente',
    descricao: 'Indicador de Meio Ambiente',
    ordem: 4,
  },
  'i-Cidade': {
    codigo: 'i-Cidade',
    nome: 'Cidades',
    descricao: 'Indicador de Cidades',
    ordem: 5,
  },
  'i-Plan': {
    codigo: 'i-Plan',
    nome: 'Planejamento',
    descricao: 'Indicador de Planejamento',
    ordem: 6,
  },
  'i-GovTI': {
    codigo: 'i-GovTI',
    nome: 'Governança de TI',
    descricao: 'Indicador de Governança de TI',
    ordem: 7,
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DE CLASSIFICAÇÃO
// ============================================================================

export const CLASSIFICACAO_CONFIG = {
  A: {
    nome: 'Excelente',
    range: [0.8, 1.0],
    cor: '#10b981',
    descricao: 'Gestão de excelência com práticas exemplares',
  },
  'B+': {
    nome: 'Muito Boa',
    range: [0.6, 0.8],
    cor: '#3b82f6',
    descricao: 'Gestão muito boa com poucos pontos de melhoria',
  },
  B: {
    nome: 'Boa',
    range: [0.4, 0.6],
    cor: '#6366f1',
    descricao: 'Gestão boa com oportunidades de melhoria',
  },
  'C+': {
    nome: 'Regular',
    range: [0.2, 0.4],
    cor: '#f59e0b',
    descricao: 'Gestão regular que precisa de melhorias',
  },
  C: {
    nome: 'Precisa Melhorar',
    range: [0.0, 0.2],
    cor: '#ef4444',
    descricao: 'Gestão que precisa de melhorias significativas',
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DE ANOS
// ============================================================================

export const ANO_CONFIG = {
  MIN: 2020,
  MAX: 2030,
  DEFAULT: 2023,
  DISPONIVEIS: [2022, 2023],
} as const;

// ============================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ============================================================================

export function getTribunalId(codigo: string): number {
  const tribunal = Object.values(TRIBUNAL_CONFIG).find(t => t.codigo === codigo);
  return tribunal?.id || 1; // Default para TCEMG
}

export function getIndicadorOrdem(codigo: string): number {
  const indicador = Object.values(INDICADOR_CONFIG).find(i => i.codigo === codigo);
  return indicador?.ordem || 999;
}

export function getClassificacao(score: number): keyof typeof CLASSIFICACAO_CONFIG {
  for (const [grade, config] of Object.entries(CLASSIFICACAO_CONFIG)) {
    const [min, max] = config.range;
    if (score >= min && score <= max) {
      return grade as keyof typeof CLASSIFICACAO_CONFIG;
    }
  }
  return 'C';
}

export function isValidAno(ano: number): boolean {
  return ano >= ANO_CONFIG.MIN && ano <= ANO_CONFIG.MAX;
}

export function getAnosDisponiveis(): readonly number[] {
  return ANO_CONFIG.DISPONIVEIS;
}
