// ============================================================================
// CONFIGURAÇÕES DE IMPORTAÇÃO DE DADOS
// ============================================================================

export interface ImportConfig {
  // Configurações gerais
  general: {
    defaultAno: number;
    defaultTribunal: string;
    defaultUF: string;
    batchSize: number;
    maxRetries: number;
    retryDelay: number;
  };

  // Configurações de filtros
  filters: {
    // Município específico para respostas detalhadas
    municipioEspecifico: string;

    // Filtros por ano
    anosPermitidos: number[];

    // Filtros por tribunal
    tribunaisPermitidos: string[];

    // Filtros por UF
    ufsPermitidas: string[];

    // Filtros por indicador
    indicadoresPermitidos: string[];
  };

  // Configurações de arquivos
  files: {
    // Estrutura de diretórios
    basePath: string;
    anoPattern: string; // {ano}
    tribunalPattern: string; // {tribunal}
    ufPattern: string; // {uf}

    // Arquivos obrigatórios
    required: {
      geral: string;
      geralMunicipio: string;
      calculo: string;
      respostas: string;
    };

    // Arquivos opcionais
    optional: {
      questionarios?: string;
      questoes?: string;
    };
  };

  // Configurações de importação por tabela
  tables: {
    tribunais: ImportTableConfig;
    municipios: ImportTableConfig;
    indicadores: ImportTableConfig;
    questionarios: ImportTableConfig;
    questoes: ImportTableConfig;
    questionarioRespostas: ImportTableConfig;
    respostas: ImportTableConfig;
    resultadosIndicadores: ImportTableConfig;
    resultadosMunicipios: ImportTableConfig;
    resultadosEstados: ImportTableConfig;
    respostasDetalhadas: ImportTableConfig;
  };
}

export interface ImportTableConfig {
  enabled: boolean;
  sourceFile: string;
  filterByMunicipio?: boolean; // Se deve filtrar apenas pelo município específico
  filterByAno?: boolean; // Se deve filtrar por ano
  filterByTribunal?: boolean; // Se deve filtrar por tribunal
  batchSize?: number; // Tamanho do lote específico para esta tabela
  transform?: (record: Record<string, unknown>) => Record<string, unknown>; // Função de transformação
  validate?: (record: Record<string, unknown>) => boolean; // Função de validação
}

// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================

export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
  general: {
    defaultAno: 2023,
    defaultTribunal: 'TCEMG',
    defaultUF: 'MG',
    batchSize: 500,
    maxRetries: 3,
    retryDelay: 1000,
  },

  filters: {
    municipioEspecifico: 'BELO HORIZONTE',
    anosPermitidos: [2022, 2023],
    tribunaisPermitidos: ['TCEMG', 'TCE'],
    ufsPermitidas: ['MG', 'BR'],
    indicadoresPermitidos: ['i-Amb', 'i-Cidade', 'i-Educ', 'i-Fiscal', 'i-GovTI', 'i-Saude', 'i-Plan'],
  },

  files: {
    basePath: 'dataset',
    anoPattern: '{ano}',
    tribunalPattern: '{tribunal}',
    ufPattern: '{uf}',

    required: {
      geral: 'geral_iegm_{ano}_{tribunal}.csv',
      geralMunicipio: 'geral_iegm_{ano}_{tribunal}_municipio.csv',
      calculo: 'calculo_iegm_{ano}_{tribunal}_completo.csv',
      respostas: 'respostas_iegm_{ano}_{tribunal}_completo_nota.csv',
    },

    optional: {
      questionarios: 'questionarios_{ano}_{tribunal}.csv',
      questoes: 'questoes_{ano}_{tribunal}.csv',
    },
  },

  tables: {
    tribunais: {
      enabled: true,
      sourceFile: 'geral',
      filterByAno: false,
      filterByTribunal: false,
    },

    municipios: {
      enabled: true,
      sourceFile: 'geralMunicipio',
      filterByAno: true,
      filterByTribunal: true,
    },

    indicadores: {
      enabled: true,
      sourceFile: 'calculo',
      filterByAno: true,
      filterByTribunal: true,
    },

    questionarios: {
      enabled: false, // Desabilitado por padrão - não temos arquivo específico
      sourceFile: 'questionarios',
      filterByAno: true,
      filterByTribunal: true,
    },

    questoes: {
      enabled: false, // Desabilitado por padrão - não temos arquivo específico
      sourceFile: 'questoes',
      filterByAno: true,
      filterByTribunal: true,
    },

    questionarioRespostas: {
      enabled: true,
      sourceFile: 'respostas',
      filterByMunicipio: true, // Apenas do município específico
      filterByAno: true,
      filterByTribunal: true,
      batchSize: 100, // Lotes menores para respostas
    },

    respostas: {
      enabled: true,
      sourceFile: 'respostas',
      filterByMunicipio: true, // Apenas do município específico
      filterByAno: true,
      filterByTribunal: true,
      batchSize: 100, // Lotes menores para respostas
    },

    resultadosIndicadores: {
      enabled: true,
      sourceFile: 'calculo',
      filterByMunicipio: true, // Apenas do município específico
      filterByAno: true,
      filterByTribunal: true,
    },

    resultadosMunicipios: {
      enabled: true,
      sourceFile: 'geralMunicipio',
      filterByAno: true,
      filterByTribunal: true,
    },

    resultadosEstados: {
      enabled: true,
      sourceFile: 'geral',
      filterByAno: true,
      filterByTribunal: true,
    },

    respostasDetalhadas: {
      enabled: true,
      sourceFile: 'respostas',
      filterByMunicipio: true, // Apenas do município específico
      filterByAno: true,
      filterByTribunal: true,
      batchSize: 50, // Lotes ainda menores para respostas detalhadas
    },
  },
};

// ============================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ============================================================================

export function getFilePath(config: ImportConfig, fileType: keyof typeof config.files.required | keyof typeof config.files.optional, ano?: number, tribunal?: string, uf?: string): string {
  const anoValue = ano || config.general.defaultAno;
  const tribunalValue = tribunal || config.general.defaultTribunal;
  const ufValue = uf || config.general.defaultUF;

  let fileName: string;

  if (fileType in config.files.required) {
    fileName = config.files.required[fileType as keyof typeof config.files.required];
  } else if (fileType in config.files.optional) {
    fileName = config.files.optional[fileType as keyof typeof config.files.optional] || '';
  } else {
    throw new Error(`Tipo de arquivo não encontrado: ${fileType}`);
  }

  // Substituir placeholders
  fileName = fileName
    .replace(/{ano}/g, anoValue.toString())
    .replace(/{tribunal}/g, tribunalValue)
    .replace(/{uf}/g, ufValue);

  // Construir caminho completo
  const anoPath = config.files.anoPattern.replace(/{ano}/g, anoValue.toString());
  const ufPath = config.files.ufPattern.replace(/{uf}/g, ufValue);

  return `${config.files.basePath}/${anoPath}/${ufPath}/${fileName}`;
}

export function shouldImportTable(config: ImportConfig, tableName: keyof typeof config.tables): boolean {
  return config.tables[tableName].enabled;
}

export function getTableConfig(config: ImportConfig, tableName: keyof typeof config.tables): ImportTableConfig {
  return config.tables[tableName];
}

export function validateConfig(config: ImportConfig): string[] {
  const errors: string[] = [];

  // Validar configurações gerais
  if (config.general.batchSize <= 0) {
    errors.push('batchSize deve ser maior que 0');
  }

  if (config.general.maxRetries < 0) {
    errors.push('maxRetries deve ser maior ou igual a 0');
  }

  // Validar filtros
  if (config.filters.anosPermitidos.length === 0) {
    errors.push('anosPermitidos não pode estar vazio');
  }

  if (config.filters.tribunaisPermitidos.length === 0) {
    errors.push('tribunaisPermitidos não pode estar vazio');
  }

  if (config.filters.ufsPermitidas.length === 0) {
    errors.push('ufsPermitidas não pode estar vazio');
  }

  if (config.filters.indicadoresPermitidos.length === 0) {
    errors.push('indicadoresPermitidos não pode estar vazio');
  }

  // Validar arquivos obrigatórios
  Object.entries(config.files.required).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Arquivo obrigatório ${key} não pode estar vazio`);
    }
  });

  return errors;
}

// ============================================================================
// CONFIGURAÇÕES ESPECÍFICAS POR AMBIENTE
// ============================================================================

export function getImportConfig(environment: 'development' | 'production' | 'test' = 'development'): ImportConfig {
  const config = { ...DEFAULT_IMPORT_CONFIG };

  switch (environment) {
    case 'development':
      // Configurações para desenvolvimento
      config.general.batchSize = 100;
      config.general.maxRetries = 2;
      break;

    case 'production':
      // Configurações para produção
      config.general.batchSize = 1000;
      config.general.maxRetries = 5;
      config.general.retryDelay = 2000;
      break;

    case 'test':
      // Configurações para testes
      config.general.batchSize = 10;
      config.general.maxRetries = 1;
      config.filters.municipioEspecifico = 'TESTE';
      break;
  }

  return config;
}
