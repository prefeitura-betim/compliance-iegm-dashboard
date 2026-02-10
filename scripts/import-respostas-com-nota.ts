
/**
 * Script para importar respostas detalhadas COMPLETAS (extraídas via Python)
 * Arquivo: data/respostas_betim_completo.csv
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

// Conectar ao banco
const dbPath = join(process.cwd(), 'local.db');
if (!existsSync(dbPath)) {
    console.error('❌ Banco local.db não encontrado!');
    process.exit(1);
}

const db = new Database(dbPath);

console.log('🚀 Importando Respostas Detalhadas COMPLETAS...');
console.log('');

try {
    const dataDir = join(process.cwd(), 'data');
    const importFile = join(dataDir, 'respostas_betim_completo.csv');

    if (!existsSync(importFile)) {
        console.error(`❌ Arquivo não encontrado: ${importFile}`);
        console.error('   Execute primeiro: python3 scripts/extrair_respostas_csv.py');
        process.exit(1);
    }

    // ========================================================================
    // 1. GARANTIR QUE COLUNAS EXISTAM (MIGRAÇÃO AUTOMÁTICA)
    // ========================================================================
    console.log('🔧 Verificando schema do banco...');

    const colunasParaAdicionar = [
        { nome: 'questao_id', tipo: 'TEXT' },
        { nome: 'indice_questao', tipo: 'TEXT' },
        { nome: 'chave_questao', tipo: 'TEXT' },
        { nome: 'nome_questionario', tipo: 'TEXT' },
        { nome: 'questionario_id', tipo: 'TEXT' },
        { nome: 'data_termino', tipo: 'TEXT' },
        { nome: 'sequencia_bloco_repeticao', tipo: 'INTEGER' },
        { nome: 'rotulo', tipo: 'TEXT' }
    ];

    // Obter colunas atuais
    const tableInfo = db.pragma('table_info(respostas_detalhadas)') as any[];
    const colunasAtuais = new Set(tableInfo.map(c => c.name));

    for (const col of colunasParaAdicionar) {
        if (!colunasAtuais.has(col.nome)) {
            console.log(`   + Adicionando coluna: ${col.nome} (${col.tipo})`);
            try {
                db.prepare(`ALTER TABLE respostas_detalhadas ADD COLUMN ${col.nome} ${col.tipo}`).run();
            } catch (e) {
                console.error(`   ⚠️ Erro ao adicionar ${col.nome}:`, e);
            }
        } else {
            // console.log(`   ✓ Coluna ${col.nome} já existe.`);
        }
    }

    // ========================================================================
    // 2. LEITURA DO ARQUIVO
    // ========================================================================

    console.log(`📊 Lendo arquivo: ${importFile}`);

    const buffer = readFileSync(importFile, 'utf-8');
    const records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ';',
        relax_quotes: true
    });

    if (records.length === 0) {
        console.error('❌ Nenhum registro encontrado no CSV.');
        process.exit(1);
    }

    // Identificar anos e municípios presentes no arquivo para limpar apenas o necessário
    // Converter ano para numero para garantir match correto no banco
    const anos = [...new Set(records.map((r: any) => parseInt(r.ano_ref)))];
    // Assumindo apenas um município por arquivo (Betim), pego o primeiro e normalizo
    const municipio = records[0].municipio;

    console.log(`\n🧹 Limpando dados anteriores de ${municipio} para os anos: ${anos.join(', ')}...`);

    const deleteStmt = db.prepare(`
        DELETE FROM respostas_detalhadas 
        WHERE municipio = ? AND ano_ref = ?
    `);

    // Usar transaction para limpeza
    const limpar = db.transaction(() => {
        for (const ano of anos) {
            deleteStmt.run(municipio, ano);
        }
    });
    limpar();


    // ========================================================================
    // 3. INSERÇÃO DOS DADOS
    // ========================================================================

    // Preparar Insert
    const insert = db.prepare(`
        INSERT INTO respostas_detalhadas (
            tribunal, codigo_ibge, municipio, indicador, 
            questao, resposta, pontuacao, peso, nota, ano_ref, 
            questao_id, indice_questao, chave_questao, nome_questionario,
            questionario_id, data_termino, sequencia_bloco_repeticao, rotulo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    console.log(`\n🚀 Importando ${records.length} registros...`);

    let totalImportado = 0;
    const CHUNK_SIZE = 5000;

    const processChunk = db.transaction((chunk) => {
        for (const row of chunk) {
            let nota = 0;
            // Tratamento robusto para nota: troca vírgula por ponto se vier como string
            if (typeof row.nota === 'string') {
                nota = parseFloat(row.nota.replace(',', '.'));
            } else {
                nota = parseFloat(row.nota);
            }
            if (isNaN(nota)) nota = 0;

            const pontuacao = nota; // Mantendo comportamento: pontuacao = nota (raw score)
            const anoRef = parseInt(row.ano_ref);

            insert.run(
                row.tribunal || 'TCEMG',
                row.codigo_ibge || '0',
                row.municipio,
                row.indicador,
                row.questao,
                row.resposta,
                pontuacao,
                null, // peso
                nota,
                anoRef,
                // Novos campos
                row.questao_id || null,
                row.indice_questao || null,
                row.chave_questao || null,
                row.nome_questionario || null,
                row.questionario_id || null,
                row.data_termino || null,
                row.sequencia_bloco_repeticao ? parseInt(row.sequencia_bloco_repeticao) : null,
                row.rotulo || ''
            );
        }
    });

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        processChunk(chunk);
        totalImportado += chunk.length;
        process.stdout.write(`\r   Progresso: ${totalImportado} / ${records.length} (${Math.round((totalImportado / records.length) * 100)}%)`);
    }

    console.log('\n\n🎉 Importação Concluída!');

    // Validar contagem
    const count = db.prepare('SELECT COUNT(*) as c FROM respostas_detalhadas WHERE municipio = ?').get(municipio) as any;
    console.log(`   Total no banco para ${municipio}: ${count.c}`);

} catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
}
