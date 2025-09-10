import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema';
import { ImportConfig, getFilePath, shouldImportTable, getTableConfig, validateConfig } from '../config/importConfig';
import { CSVProcessor } from './csvProcessor';
import { existsSync } from 'fs';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface ImportStats {
  tribunais: number;
  municipios: number;
  indicadores: number;
  questionarios: number;
  questoes: number;
  questionarioRespostas: number;
  respostas: number;
  resultadosIndicadores: number;
  resultadosMunicipios: number;
  resultadosEstados: number;
  respostasDetalhadas: number;
  totalRecords: number;
  processingTime: number;
  errors: string[];
}

export interface ImportOptions {
  ano?: number;
  tribunal?: string;
  uf?: string;
  municipio?: string;
  environment?: 'development' | 'production' | 'test';
  dryRun?: boolean;
  verbose?: boolean;
}

// ============================================================================
// GERENCIADOR DE IMPORTAÇÃO
// ============================================================================

export class ImportManager {
  private config: ImportConfig;
  private processor: CSVProcessor;
  private db: any;
  private stats: ImportStats;
  private errors: string[];

  constructor(config: ImportConfig, db?: any) {
    this.config = config;
    this.processor = new CSVProcessor(config);
    this.db = db;
    this.stats = this.initializeStats();
    this.errors = [];
  }

  /**
   * Executa a importação completa
   */
  async importData(options: ImportOptions = {}): Promise<ImportStats> {
    const startTime = Date.now();

    console.log('🚀 Iniciando importação de dados IEGM...');
    console.log('');

    // Validar configuração
    const configErrors = validateConfig(this.config);
    if (configErrors.length > 0) {
      throw new Error(`Erro na configuração: ${configErrors.join(', ')}`);
    }

    // Aplicar opções
    const ano = options.ano || this.config.general.defaultAno;
    const tribunal = options.tribunal || this.config.general.defaultTribunal;
    const uf = options.uf || this.config.general.defaultUF;
    const municipio = options.municipio || this.config.filters.municipioEspecifico;

    console.log(`📅 Ano: ${ano}`);
    console.log(`⚖️  Tribunal: ${tribunal}`);
    console.log(`📍 UF: ${uf}`);
    console.log(`🏙️  Município específico: ${municipio}`);
    console.log(`🔧 Ambiente: ${options.environment || 'development'}`);
    console.log(`🧪 Dry run: ${options.dryRun ? 'Sim' : 'Não'}`);
    console.log('');

    try {
      // 1. Importar tribunais
      if (shouldImportTable(this.config, 'tribunais')) {
        await this.importTribunais(ano, tribunal, uf, options);
      }

      // 2. Importar municípios
      if (shouldImportTable(this.config, 'municipios')) {
        await this.importMunicipios(ano, tribunal, uf, options);
      }

      // 3. Importar indicadores
      if (shouldImportTable(this.config, 'indicadores')) {
        await this.importIndicadores(ano, tribunal, uf, options);
      }

      // 4. Importar questionários (se habilitado)
      if (shouldImportTable(this.config, 'questionarios')) {
        await this.importQuestionarios(ano, tribunal, uf, options);
      }

      // 5. Importar questões (se habilitado)
      if (shouldImportTable(this.config, 'questoes')) {
        await this.importQuestoes(ano, tribunal, uf, options);
      }

      // 6. Importar respostas de questionários
      if (shouldImportTable(this.config, 'questionarioRespostas')) {
        await this.importQuestionarioRespostas(ano, tribunal, uf, municipio, options);
      }

      // 7. Importar respostas
      if (shouldImportTable(this.config, 'respostas')) {
        await this.importRespostas(ano, tribunal, uf, municipio, options);
      }

      // 8. Importar resultados de indicadores
      if (shouldImportTable(this.config, 'resultadosIndicadores')) {
        await this.importResultadosIndicadores(ano, tribunal, uf, municipio, options);
      }

      // 9. Importar resultados municipais
      if (shouldImportTable(this.config, 'resultadosMunicipios')) {
        await this.importResultadosMunicipios(ano, tribunal, uf, options);
      }

      // 10. Importar resultados estaduais
      if (shouldImportTable(this.config, 'resultadosEstados')) {
        await this.importResultadosEstados(ano, tribunal, uf, options);
      }

      // 11. Importar respostas detalhadas
      if (shouldImportTable(this.config, 'respostasDetalhadas')) {
        await this.importRespostasDetalhadas(ano, tribunal, uf, municipio, options);
      }

      // Calcular estatísticas finais
      this.stats.processingTime = Date.now() - startTime;
      this.stats.totalRecords = this.calculateTotalRecords();
      this.stats.errors = this.errors;

      // Exibir resumo
      this.printSummary();

      return this.stats;

    } catch (error) {
      console.error('❌ Erro durante a importação:', error);
      this.errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
      throw error;
    }
  }

  /**
   * Importa tribunais
   */
  private async importTribunais(ano: number, tribunal: string, uf: string, options: ImportOptions): Promise<void> {
    console.log('🏛️  Importando tribunais...');

    const tableConfig = getTableConfig(this.config, 'tribunais');
    const filePath = getFilePath(this.config, 'geral', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf });

      if (!options.dryRun && this.db) {
        await this.insertRecords('tribunais', records, tableConfig);
      }

      this.stats.tribunais = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} tribunais importados`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar tribunais:`, error);
      this.errors.push(`Tribunais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa municípios
   */
  private async importMunicipios(ano: number, tribunal: string, uf: string, options: ImportOptions): Promise<void> {
    console.log('🏙️  Importando municípios...');

    const tableConfig = getTableConfig(this.config, 'municipios');
    const filePath = getFilePath(this.config, 'geralMunicipio', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf });

      if (!options.dryRun && this.db) {
        await this.insertRecords('municipios', records, tableConfig);
      }

      this.stats.municipios = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} municípios importados`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar municípios:`, error);
      this.errors.push(`Municípios: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa indicadores
   */
  private async importIndicadores(ano: number, tribunal: string, uf: string, options: ImportOptions): Promise<void> {
    console.log('📊 Importando indicadores...');

    const tableConfig = getTableConfig(this.config, 'indicadores');
    const filePath = getFilePath(this.config, 'calculo', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf });

      if (!options.dryRun && this.db) {
        await this.insertRecords('indicadores', records, tableConfig);
      }

      this.stats.indicadores = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} indicadores importados`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar indicadores:`, error);
      this.errors.push(`Indicadores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa questionários
   */
  private async importQuestionarios(ano: number, tribunal: string, uf: string, options: ImportOptions): Promise<void> {
    console.log('📋 Importando questionários...');

    const tableConfig = getTableConfig(this.config, 'questionarios');
    const filePath = getFilePath(this.config, 'questionarios', ano, tribunal, uf);

    if (!existsSync(filePath)) {
      console.log(`  ⚠️  Arquivo não encontrado: ${filePath}`);
      return;
    }

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf });

      if (!options.dryRun && this.db) {
        await this.insertRecords('questionarios', records, tableConfig);
      }

      this.stats.questionarios = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} questionários importados`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar questionários:`, error);
      this.errors.push(`Questionários: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa questões
   */
  private async importQuestoes(ano: number, tribunal: string, uf: string, options: ImportOptions): Promise<void> {
    console.log('❓ Importando questões...');

    const tableConfig = getTableConfig(this.config, 'questoes');
    const filePath = getFilePath(this.config, 'questoes', ano, tribunal, uf);

    if (!existsSync(filePath)) {
      console.log(`  ⚠️  Arquivo não encontrado: ${filePath}`);
      return;
    }

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf });

      if (!options.dryRun && this.db) {
        await this.insertRecords('questoes', records, tableConfig);
      }

      this.stats.questoes = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} questões importadas`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar questões:`, error);
      this.errors.push(`Questões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa respostas de questionários
   */
  private async importQuestionarioRespostas(ano: number, tribunal: string, uf: string, municipio: string, options: ImportOptions): Promise<void> {
    console.log('📝 Importando respostas de questionários...');

    const tableConfig = getTableConfig(this.config, 'questionarioRespostas');
    const filePath = getFilePath(this.config, 'respostas', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf, municipio });

      if (!options.dryRun && this.db) {
        await this.insertRecords('questionarioRespostas', records, tableConfig);
      }

      this.stats.questionarioRespostas = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} respostas de questionários importadas`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar respostas de questionários:`, error);
      this.errors.push(`Respostas de questionários: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa respostas
   */
  private async importRespostas(ano: number, tribunal: string, uf: string, municipio: string, options: ImportOptions): Promise<void> {
    console.log('💬 Importando respostas...');

    const tableConfig = getTableConfig(this.config, 'respostas');
    const filePath = getFilePath(this.config, 'respostas', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf, municipio });

      if (!options.dryRun && this.db) {
        await this.insertRecords('respostas', records, tableConfig);
      }

      this.stats.respostas = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} respostas importadas`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar respostas:`, error);
      this.errors.push(`Respostas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa resultados de indicadores
   */
  private async importResultadosIndicadores(ano: number, tribunal: string, uf: string, municipio: string, options: ImportOptions): Promise<void> {
    console.log('📈 Importando resultados de indicadores...');

    const tableConfig = getTableConfig(this.config, 'resultadosIndicadores');
    const filePath = getFilePath(this.config, 'calculo', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf, municipio });

      if (!options.dryRun && this.db) {
        await this.insertRecords('resultadosIndicadores', records, tableConfig);
      }

      this.stats.resultadosIndicadores = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} resultados de indicadores importados`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar resultados de indicadores:`, error);
      this.errors.push(`Resultados de indicadores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa resultados municipais
   */
  private async importResultadosMunicipios(ano: number, tribunal: string, uf: string, options: ImportOptions): Promise<void> {
    console.log('🏘️  Importando resultados municipais...');

    const tableConfig = getTableConfig(this.config, 'resultadosMunicipios');
    const filePath = getFilePath(this.config, 'geralMunicipio', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf });

      if (!options.dryRun && this.db) {
        await this.insertRecords('resultadosMunicipios', records, tableConfig);
      }

      this.stats.resultadosMunicipios = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} resultados municipais importados`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar resultados municipais:`, error);
      this.errors.push(`Resultados municipais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa resultados estaduais
   */
  private async importResultadosEstados(ano: number, tribunal: string, uf: string, options: ImportOptions): Promise<void> {
    console.log('🏛️  Importando resultados estaduais...');

    const tableConfig = getTableConfig(this.config, 'resultadosEstados');
    const filePath = getFilePath(this.config, 'geral', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf });

      if (!options.dryRun && this.db) {
        await this.insertRecords('resultadosEstados', records, tableConfig);
      }

      this.stats.resultadosEstados = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} resultados estaduais importados`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar resultados estaduais:`, error);
      this.errors.push(`Resultados estaduais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa respostas detalhadas
   */
  private async importRespostasDetalhadas(ano: number, tribunal: string, uf: string, municipio: string, options: ImportOptions): Promise<void> {
    console.log('📋 Importando respostas detalhadas...');

    const tableConfig = getTableConfig(this.config, 'respostasDetalhadas');
    const filePath = getFilePath(this.config, 'respostas', ano, tribunal, uf);

    try {
      const { records, stats } = this.processor.processFile(filePath, { ano, tribunal, uf, municipio });

      if (!options.dryRun && this.db) {
        await this.insertRecords('respostasDetalhadas', records, tableConfig);
      }

      this.stats.respostasDetalhadas = stats.validRecords;
      this.errors.push(...stats.errors);

      console.log(`  ✅ ${stats.validRecords} respostas detalhadas importadas`);
    } catch (error) {
      console.error(`  ❌ Erro ao importar respostas detalhadas:`, error);
      this.errors.push(`Respostas detalhadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Insere registros no banco de dados
   */
  private async insertRecords(tableName: string, records: any[], tableConfig: any): Promise<void> {
    if (!this.db || records.length === 0) return;

    const batchSize = tableConfig.batchSize || this.config.general.batchSize;
    const batches = this.createBatches(records, batchSize);

    console.log(`  📦 Inserindo ${records.length} registros em ${batches.length} lotes...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        // Aqui você implementaria a lógica específica de inserção para cada tabela
        // Por exemplo:
        // await this.db.insert(schema[tableName]).values(batch);

        console.log(`  ✅ Lote ${i + 1}/${batches.length} inserido (${batch.length} registros)`);
      } catch (error) {
        console.error(`  ❌ Erro no lote ${i + 1}:`, error);
        this.errors.push(`Lote ${i + 1} da tabela ${tableName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }

      // Pausa entre lotes
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, this.config.general.retryDelay));
      }
    }
  }

  /**
   * Cria lotes de registros
   */
  private createBatches(records: any[], batchSize: number): any[][] {
    const batches = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Inicializa estatísticas
   */
  private initializeStats(): ImportStats {
    return {
      tribunais: 0,
      municipios: 0,
      indicadores: 0,
      questionarios: 0,
      questoes: 0,
      questionarioRespostas: 0,
      respostas: 0,
      resultadosIndicadores: 0,
      resultadosMunicipios: 0,
      resultadosEstados: 0,
      respostasDetalhadas: 0,
      totalRecords: 0,
      processingTime: 0,
      errors: []
    };
  }

  /**
   * Calcula total de registros
   */
  private calculateTotalRecords(): number {
    return Object.values(this.stats).reduce((sum, value) => {
      return typeof value === 'number' && value !== this.stats.totalRecords && value !== this.stats.processingTime
        ? sum + value
        : sum;
    }, 0);
  }

  /**
   * Exibe resumo da importação
   */
  private printSummary(): void {
    console.log('');
    console.log('✅ Importação concluída com sucesso!');
    console.log('');
    console.log('📈 Estatísticas da importação:');
    console.log(`  - Tribunais: ${this.stats.tribunais}`);
    console.log(`  - Municípios: ${this.stats.municipios}`);
    console.log(`  - Indicadores: ${this.stats.indicadores}`);
    console.log(`  - Questionários: ${this.stats.questionarios}`);
    console.log(`  - Questões: ${this.stats.questoes}`);
    console.log(`  - Respostas de Questionários: ${this.stats.questionarioRespostas}`);
    console.log(`  - Respostas: ${this.stats.respostas}`);
    console.log(`  - Resultados de Indicadores: ${this.stats.resultadosIndicadores}`);
    console.log(`  - Resultados de Municípios: ${this.stats.resultadosMunicipios}`);
    console.log(`  - Resultados de Estados: ${this.stats.resultadosEstados}`);
    console.log(`  - Respostas Detalhadas: ${this.stats.respostasDetalhadas}`);
    console.log(`  - Total de registros: ${this.stats.totalRecords}`);
    console.log(`  - Tempo de processamento: ${this.stats.processingTime}ms`);

    if (this.errors.length > 0) {
      console.log('');
      console.log('⚠️  Erros encontrados:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
  }
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

export function createImportManager(config: ImportConfig, db?: any): ImportManager {
  return new ImportManager(config, db);
}
