
/**
 * Script para importar respostas detalhadas (Limpo via Python)
 * Arquivo: data/respostas_iegm_2024_cleaned.csv
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

console.log('🚀 Importando Respostas Detalhadas LIMPAS (Pós-Python)...');
console.log('');

try {
    const dataDir = join(process.cwd(), 'data');
    const cleanedFile = join(dataDir, 'respostas_iegm_2024_cleaned.csv');

    if (!existsSync(cleanedFile)) {
        console.error('❌ Arquivo limpo não encontrado: data/respostas_iegm_2024_cleaned.csv');
        console.error('   Execute primeiro: python3 scripts/clean_data.py');
        process.exit(1);
    }

    // Preparar banco: Limpar respostas anteriores
    console.log('🧹 Limpando dados detalhados anteriores de 2024 (TCEMG)...');
    db.prepare(`
        DELETE FROM respostas_detalhadas 
        WHERE ano_ref = 2024 AND tribunal = 'TCEMG'
    `).run();

    // Prepare Insert
    const insert = db.prepare(`
        INSERT INTO respostas_detalhadas (
            tribunal, codigo_ibge, municipio, indicador, 
            questao, resposta, pontuacao, peso, nota, ano_ref, rotulo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    console.log(`📊 Lendo arquivo: ${cleanedFile}`);

    // Ler arquivo UTF-8 padrão (o Python já cuidou do encoding)
    const buffer = readFileSync(cleanedFile, 'utf-8');

    const records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ';',
        relax_quotes: true
    });

    console.log(`   ${records.length} registros para importar.`);

    console.log(`   ${records.length} registros para importar.`);

    let totalImportado = 0;
    const CHUNK_SIZE = 20000;

    const processChunk = db.transaction((chunk) => {
        for (const row of chunk) {
            // Mapeamento simplificado pois o Python já normalizou as colunas
            const tribunal = 'TCEMG';
            const codigoIbge = row.codigo_ibge || row.codigoibge || '0';
            const municipio = row.municipio;
            const indicador = row.indicador;
            const questao = row.questao;
            const resposta = row.resposta;
            // O Python criou a coluna 'rotulo' se possível
            const rotulo = row.rotulo || '';

            // Nota já vem formatada com ponto
            const nota = parseFloat(row.nota || '0');
            const anoRef = 2024;

            insert.run(
                tribunal, codigoIbge, municipio, indicador,
                questao, resposta, nota, null, nota, anoRef, rotulo
            );
        }
    });

    // Processar em chunks
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        processChunk(chunk);
        totalImportado += chunk.length;

        // Log de progresso a cada chunk
        process.stdout.write(`\r   Progresso: ${totalImportado} / ${records.length} (${Math.round((totalImportado / records.length) * 100)}%)`);
    }

    console.log('\n\n🎉 Importação Concluída!');
    console.log(`   Total importado: ${totalImportado}`);

} catch (error) {
    console.error('\n❌ Erro fatal:', error);
}
