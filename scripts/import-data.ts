import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../src/db/schema';
import { getImportConfig } from '../src/config/importConfig';
import { createImportManager } from '../src/utils/importManager';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';

// ============================================================================
// CONFIGURAÇÃO E INICIALIZAÇÃO
// ============================================================================

// Conectar ao banco local SQLite
const sqlite = new Database('local.db');
const localDB = drizzle(sqlite, { schema });

// Obter configuração de importação
const config = getImportConfig('development');

// Criar gerenciador de importação
const importManager = createImportManager(config, localDB);

// ============================================================================
// FUNÇÃO PRINCIPAL - SISTEMA MELHORADO
// ============================================================================

async function main() {
  console.log('🚀 Iniciando importação de dados IEGM para SQLite local...');
  console.log('');

  // Verificar se o banco local existe
  if (!existsSync('local.db')) {
    console.error('❌ Banco local.db não encontrado! Execute primeiro: yarn db:migrate');
    process.exit(1);
  }

  try {
    // Usar o sistema de importação melhorado
    const stats = await importManager.importData({
      ano: 2023,
      tribunal: 'TCEMG',
      uf: 'MG',
      municipio: 'BETIM', // Usar BETIM como município padrão
      environment: 'development',
      dryRun: false,
      verbose: true
    });

    console.log('');
    console.log('✅ Importação concluída com sucesso!');
    console.log('');
    console.log('📈 Estatísticas da importação:');
    console.log(`  - Tribunais: ${stats.tribunais}`);
    console.log(`  - Municípios: ${stats.municipios}`);
    console.log(`  - Indicadores: ${stats.indicadores}`);
    console.log(`  - Questionários: ${stats.questionarios}`);
    console.log(`  - Questões: ${stats.questoes}`);
    console.log(`  - Respostas de Questionários: ${stats.questionarioRespostas}`);
    console.log(`  - Respostas: ${stats.respostas}`);
    console.log(`  - Resultados de Indicadores: ${stats.resultadosIndicadores}`);
    console.log(`  - Resultados de Municípios: ${stats.resultadosMunicipios}`);
    console.log(`  - Resultados de Estados: ${stats.resultadosEstados}`);
    console.log(`  - Respostas Detalhadas: ${stats.respostasDetalhadas}`);
    console.log(`  - Total de registros: ${stats.totalRecords}`);
    console.log(`  - Tempo de processamento: ${stats.processingTime}ms`);

    if (stats.errors.length > 0) {
      console.log('');
      console.log('⚠️  Erros encontrados:');
      stats.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    console.log('');
    console.log('📋 Próximos passos:');
    console.log('  1. Verificar dados: yarn db:studio');
    console.log('  2. Migrar para D1 local: yarn migrate:local');
    console.log('  3. Testar localmente: yarn dev:d1');

  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    process.exit(1);
  } finally {
    // Fechar conexão com SQLite
    sqlite.close();
  }
}

// ============================================================================
// EXECUÇÃO
// ============================================================================

main();
