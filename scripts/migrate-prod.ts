import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { DEFAULT_MUNICIPIO_CONFIG } from '../src/config/municipioConfig';

// Mapeamento de colunas CSV para colunas do schema D1
const columnMappings: Record<string, Record<string, string>> = {
  tribunais: {
    id: 'id',
    codigo: 'codigo',
    nome: 'nome',
    uf: 'uf'
  },
  municipios: {
    id: 'id',
    codigoIbge: 'codigo_ibge',
    nome: 'nome',
    uf: 'uf'
  },
  indicadores: {
    id: 'id',
    codigo: 'codigo',
    nome: 'nome',
    descricao: 'descricao',
    ordem: 'ordem'
  },
  questionarios: {
    id: 'id',
    tribunalId: 'tribunal_id',
    indicadorId: 'indicador_id',
    anoRef: 'ano_ref',
    nome: 'nome',
    codigo: 'codigo'
  },
  questoes: {
    id: 'id',
    questionarioId: 'questionario_id',
    questaoId: 'questao_id',
    sequenciaBlocoRepeticao: 'sequencia_bloco_repeticao',
    indiceQuestao: 'indice_questao',
    chaveQuestao: 'chave_questao',
    texto: 'texto',
    peso: 'peso',
    respostaRef: 'resposta_ref',
    notaRef: 'nota_ref',
    tipo: 'tipo'
  },
  questionario_respostas: {
    id: 'id',
    tribunalId: 'tribunal_id',
    municipioId: 'municipio_id',
    questionarioId: 'questionario_id',
    questionarioRespostaId: 'questionario_resposta_id',
    dataTermino: 'data_termino',
    anoRef: 'ano_ref'
  },
  respostas: {
    id: 'id',
    questionarioRespostaId: 'questionario_resposta_id',
    questaoId: 'questao_id',
    chaveResposta: 'chave_resposta',
    resposta: 'resposta',
    nota: 'nota'
  },
  resultados_indicadores: {
    id: 'id',
    tribunalId: 'tribunal_id',
    municipioId: 'municipio_id',
    indicadorId: 'indicador_id',
    anoRef: 'ano_ref',
    quantidadeRespostas: 'quantidade_respostas',
    quantidadeRespostasPontuadas: 'quantidade_respostas_pontuadas',
    notaFinal: 'nota_final',
    notaAjustadaDentroFaixa: 'nota_ajustada_dentro_faixa',
    percentualIndice: 'percentual_indice',
    faixa: 'faixa',
    rebaixamentos: 'rebaixamentos',
    percentualIndiceAposRebaixamento: 'percentual_indice_apos_rebaixamento',
    faixaAposRebaixamento: 'faixa_apos_rebaixamento'
  },
  resultados_municipios: {
    id: 'id',
    tribunalId: 'tribunal_id',
    municipioId: 'municipio_id',
    anoRef: 'ano_ref',
    percentualIamb: 'percentual_iamb',
    percentualIcidade: 'percentual_icidade',
    percentualIeduc: 'percentual_ieduc',
    percentualIfiscal: 'percentual_ifiscal',
    percentualIgovTi: 'percentual_igov_ti',
    percentualIsaude: 'percentual_isaude',
    percentualIplan: 'percentual_iplan',
    percentualIegmMunicipio: 'percentual_iegm_municipio',
    faixaIamb: 'faixa_iamb',
    faixaIcidade: 'faixa_icidade',
    faixaIeduc: 'faixa_ieduc',
    faixaIfiscal: 'faixa_ifiscal',
    faixaIgovTi: 'faixa_igov_ti',
    faixaIsaude: 'faixa_isaude',
    faixaIplan: 'faixa_iplan',
    faixaIegmMunicipio: 'faixa_iegm_municipio'
  },
  resultados_estados: {
    id: 'id',
    tribunalId: 'tribunal_id',
    uf: 'uf',
    anoRef: 'ano_ref',
    percentualIamb: 'percentual_iamb',
    percentualIcidade: 'percentual_icidade',
    percentualIeduc: 'percentual_ieduc',
    percentualIfiscal: 'percentual_ifiscal',
    percentualIgovTi: 'percentual_igov_ti',
    percentualIsaude: 'percentual_isaude',
    percentualIplan: 'percentual_iplan',
    percentualIegmEstado: 'percentual_iegm_estado',
    faixaIamb: 'faixa_iamb',
    faixaIcidade: 'faixa_icidade',
    faixaIeduc: 'faixa_ieduc',
    faixaIfiscal: 'faixa_ifiscal',
    faixaIgovTi: 'faixa_igov_ti',
    faixaIsaude: 'faixa_isaude',
    faixaIplan: 'faixa_iplan',
    faixaIegmEstado: 'faixa_iegm_estado',
    quantidadeMunicipiosResponderam: 'quantidade_municipios_responderam'
  },
  respostas_detalhadas: {
    id: 'id',
    tribunal: 'tribunal',
    codigoIbge: 'codigo_ibge',
    municipio: 'municipio',
    indicador: 'indicador',
    questao: 'questao',
    resposta: 'resposta',
    pontuacao: 'pontuacao',
    peso: 'peso',
    nota: 'nota',
    anoRef: 'ano_ref',
    chaveQuestao: 'chave_questao',
    rotulo: 'rotulo',
    questaoId: 'questao_id',
    indiceQuestao: 'indice_questao',
    nomeQuestionario: 'nome_questionario',
    questionarioId: 'questionario_id',
    dataTermino: 'data_termino',
    sequenciaBlocoRepeticao: 'sequencia_bloco_repeticao'
  }
};

// Conectar ao banco local SQLite
const sqlite = new Database('local.db');
const localDB = drizzle(sqlite, { schema });

async function createTables() {
  console.log('🏗️  Criando tabelas no Cloudflare D1...');

  try {
    const command = 'npx wrangler d1 execute DB -y --file=scripts/create-d1-tables.sql --local=false --remote';
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    return false;
  }
}

async function clearD1Tables(): Promise<void> {
  console.log('🧹 Limpando tabelas existentes no D1...');

  const tables = [
    'respostas_detalhadas',
    'resultados_estados',
    'resultados_municipios',
    'resultados_indicadores',
    'respostas',
    'questionario_respostas',
    'questoes',
    'questionarios',
    'indicadores',
    'municipios',
    'tribunais',
    'simulado_respostas'
  ];

  const clearStatements = tables.map(table => `DELETE FROM ${table};`);
  const sqlContent = clearStatements.join('\n');
  const sqlFilename = 'temp_clear_tables.sql';
  writeFileSync(sqlFilename, sqlContent, 'utf8');

  try {
    const command = `npx wrangler d1 execute DB -y --file=${sqlFilename} --local=false --remote`;
    execSync(command, { stdio: 'inherit' });
    console.log('  ✓ Tabelas limpas com sucesso');
  } catch (error) {
    console.error('  ⚠️  Erro ao limpar tabelas (pode ser normal se estiverem vazias):', error);
  } finally {
    unlinkSync(sqlFilename);
  }
}

interface MigrationStats {
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
}

async function exportTableToCSV(tableName: string, query: any): Promise<string> {
  try {
    console.log(`Exportando ${tableName}...`);

    const data = await query;
    console.log(`  - ${data.length} registros encontrados`);

    if (data.length === 0) {
      console.log(`  - Nenhum dado para exportar`);
      return '';
    }

    // Criar CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const filename = `temp_${tableName}.csv`;
    writeFileSync(filename, csvContent, 'utf8');

    console.log(`  ✓ ${data.length} registros exportados para ${filename}`);
    return filename;
  } catch (error) {
    console.error(`  ✗ Erro ao exportar ${tableName}:`, error);
    return '';
  }
}

async function importCSVToD1(filename: string, tableName: string): Promise<number> {
  try {
    console.log(`Importando ${filename} para D1...`);

    // Ler o arquivo CSV usando parser robusto
    const csvContent = readFileSync(filename, 'utf8');
    const records = parse(csvContent, {
      columns: true, // Usar primeira linha como headers
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true, // Ser mais tolerante com aspas malformadas
      relax_column_count: true, // Ser mais tolerante com número de colunas
      quote: '"',
      escape: '"'
    });

    if (records.length === 0) {
      console.log(`  ⚠️  Nenhum dado para importar em ${tableName}`);
      unlinkSync(filename);
      return 0;
    }

    // Obter mapeamento de colunas para esta tabela
    const columnMapping = columnMappings[tableName] || {};

    // Mapear headers do CSV para colunas do schema D1
    const csvHeaders = Object.keys(records[0] as object);
    const d1Headers = csvHeaders.map(header => columnMapping[header] || header);

    // Criar INSERT statements
    const insertStatements = records.map((record: any) => {
      const values = csvHeaders.map(header => {
        const value = record[header];

        // CORREÇÃO: Permitir string vazia para coluna 'resposta' (NOT NULL)
        if (header === 'resposta' && value === '') {
          return "''";
        }

        // Se o valor está vazio ou é 'null', usar NULL
        if (value === null || value === undefined || value === '' || value === 'null' || value === 'NULL') {
          return 'NULL';
        }
        // Se é um número, não usar aspas
        if (!isNaN(Number(value)) && value !== '') {
          return value;
        }
        // Para strings, escapar aspas, remover quebras de linha, caracteres de controle, aspas no início/fim e tabs
        return `'${String(value)
          .replace(/'/g, "''")
          .replace(/\r?\n/g, ' ')
          .replace(/[\u0000-\u001F\u007F]/g, ' ')
          .replace(/^'+|'+$/g, '')
          .replace(/\t/g, ' ')
          }'`;
      });

      return `INSERT INTO ${tableName} (${d1Headers.join(', ')}) VALUES (${values.join(', ')});`;
    });

    // Dividir em lotes de 500 INSERTs para evitar bug do D1
    const batchSize = 500;
    const batches = [];
    for (let i = 0; i < insertStatements.length; i += batchSize) {
      batches.push(insertStatements.slice(i, i + batchSize));
    }

    console.log(`  📦 Dividindo ${insertStatements.length} registros em ${batches.length} lotes de ${batchSize}`);

    let totalImported = 0;

    // Executar cada lote separadamente
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const sqlContent = `PRAGMA foreign_keys = OFF;\n` + batch.join('\n') + `\nPRAGMA foreign_keys = ON;`;
      const sqlFilename = `temp_import_${tableName}_batch_${batchIndex + 1}.sql`;
      writeFileSync(sqlFilename, sqlContent, 'utf8');

      try {
        console.log(`  🔄 Executando lote ${batchIndex + 1}/${batches.length} (${batch.length} registros)...`);

        // Usar wrangler para executar o arquivo SQL
        const command = `npx wrangler d1 execute DB -y --file=${sqlFilename} --local=false --remote`;
        execSync(command, { stdio: 'inherit' });

        totalImported += batch.length;
        console.log(`  ✅ Lote ${batchIndex + 1} executado com sucesso`);

      } catch (error: any) {
        console.error(`  ❌ Erro no lote ${batchIndex + 1}:`, error.message);
        if (error.stdout) console.log('STDOUT:', error.stdout.toString());
        if (error.stderr) console.log('STDERR:', error.stderr.toString());
        // Continuar com o próximo lote mesmo se este falhar
      } finally {
        // Limpar arquivo temporário do lote
        unlinkSync(sqlFilename);
      }

      // Pequena pausa entre lotes para dar tempo ao D1 processar
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Limpar arquivo CSV original
    unlinkSync(filename);

    console.log(`  ✓ ${totalImported} registros importados para ${tableName} (de ${records.length} total)`);
    return totalImported;
  } catch (error) {
    console.error(`  ✗ Erro ao importar ${filename}:`, error);
    return 0;
  }
}

async function migrateTable(tableName: string, query: any): Promise<number> {
  const filename = await exportTableToCSV(tableName, query);
  if (!filename) return 0;

  return await importCSVToD1(filename, tableName);
}

async function migrateTribunais(): Promise<number> {
  return migrateTable(
    'tribunais',
    localDB.select().from(schema.tribunais)
  );
}

async function migrateMunicipios(): Promise<number> {
  // Migrar todos os municípios - sistema precisa de todos para comparativos
  return migrateTable(
    'municipios',
    localDB.select().from(schema.municipios)
  );
}

async function migrateIndicadores(): Promise<number> {
  return migrateTable(
    'indicadores',
    localDB.select().from(schema.indicadores)
  );
}

async function migrateQuestionarios(): Promise<number> {
  return migrateTable(
    'questionarios',
    localDB.select().from(schema.questionarios)
  );
}

async function migrateQuestoes(): Promise<number> {
  return migrateTable(
    'questoes',
    localDB.select().from(schema.questoes)
  );
}

async function migrateQuestionarioRespostas(): Promise<number> {
  // Migrar todas as respostas de questionários - sistema precisa de todos para comparativos
  return migrateTable(
    'questionario_respostas',
    localDB.select().from(schema.questionarioRespostas)
  );
}

async function migrateRespostas(): Promise<number> {
  // Migrar todas as respostas - sistema precisa de todos para comparativos
  return migrateTable(
    'respostas',
    localDB.select().from(schema.respostas)
  );
}

async function migrateResultadosIndicadores(): Promise<number> {
  // Migrar todos os resultados de indicadores - sistema precisa de todos para comparativos
  return migrateTable(
    'resultados_indicadores',
    localDB.select().from(schema.resultadosIndicadores)
  );
}

async function migrateResultadosMunicipios(): Promise<number> {
  // Migrar todos os resultados municipais - sistema precisa de todos para comparativos
  return migrateTable(
    'resultados_municipios',
    localDB.select().from(schema.resultadosMunicipios)
  );
}

async function migrateResultadosEstados(): Promise<number> {
  return migrateTable(
    'resultados_estados',
    localDB.select().from(schema.resultadosEstados)
  );
}

async function migrateRespostasDetalhadas(): Promise<number> {
  console.log('Migrando respostas detalhadas (Dados REAIS)...');

  // Migrar dados reais da tabela respostas_detalhadas
  return migrateTable(
    'respostas_detalhadas',
    localDB.select().from(schema.respostasDetalhadas)
  );
}

// Remove helper function as it is no longer used
// function generateQuestion... (need to handle this in a separate edit or just leave it unused)




async function main() {
  console.log('🚀 Iniciando migração para Cloudflare D1...');
  const databaseId = '5803f64b-c4f9-434d-b279-abb8d8f57e5f';
  console.log(`📊 Database ID: ${databaseId}`);
  console.log(`📍 Município configurado: ${DEFAULT_MUNICIPIO_CONFIG.municipio} (apenas para respostas detalhadas)`);
  console.log(`📅 Ano de referência: ${DEFAULT_MUNICIPIO_CONFIG.ano}`);
  console.log(`⚖️  Tribunal: ${DEFAULT_MUNICIPIO_CONFIG.tribunal}`);
  console.log('📊 Migrando dados de todos os municípios para comparativos...');
  console.log('');

  // Verificar se o arquivo SQL existe
  if (!existsSync('scripts/create-d1-tables.sql')) {
    console.error('❌ Arquivo scripts/create-d1-tables.sql não encontrado!');
    process.exit(1);
  }

  // Verificar se o banco local existe
  if (!existsSync('local.db')) {
    console.error('❌ Banco local.db não encontrado! Execute primeiro: yarn data:migrate');
    process.exit(1);
  }

  const stats: MigrationStats = {
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
    respostasDetalhadas: 0
  };

  try {
    // 1. Criar tabelas
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('❌ Falha ao criar tabelas. Abortando migração.');
      process.exit(1);
    }

    console.log('');

    // 2. Limpar tabelas existentes no D1
    await clearD1Tables();

    // 3. Migrar tabelas de referência
    stats.tribunais = await migrateTribunais();
    stats.municipios = await migrateMunicipios();
    stats.indicadores = await migrateIndicadores();

    // 4. Migrar tabelas de questionários
    stats.questionarios = await migrateQuestionarios();
    stats.questoes = await migrateQuestoes();

    // 5. Migrar tabelas de respostas (filtradas por município)
    stats.questionarioRespostas = await migrateQuestionarioRespostas();
    stats.respostas = await migrateRespostas();

    // 6. Migrar tabelas de resultados (filtradas por município)
    stats.resultadosIndicadores = await migrateResultadosIndicadores();
    stats.resultadosMunicipios = await migrateResultadosMunicipios();
    stats.resultadosEstados = await migrateResultadosEstados();

    // 7. Migrar respostas detalhadas (filtradas por município)
    stats.respostasDetalhadas = await migrateRespostasDetalhadas();

    console.log('');
    console.log('✅ Migração concluída com sucesso!');
    console.log('');
    console.log('📈 Estatísticas da migração:');
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

    const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`  - Total de registros migrados: ${totalRecords}`);

    console.log('');
    console.log('📋 Próximos passos:');
    console.log('  1. Verificar dados: yarn cf:db:studio');
    console.log('  2. Fazer deploy: yarn cf:deploy');
    console.log('  3. Testar API: curl https://seu-worker.workers.dev/api/municipios');
    console.log('');
    console.log('💡 Para desenvolvimento local, use: yarn migrate:local');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    // Fechar conexão com SQLite
    sqlite.close();
  }
}

// Verificar se o script está sendo executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as migrateToD1 };
