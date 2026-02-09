/**
 * Script para importar respostas detalhadas dos arquivos XLSX
 * Inclui todas as notas: negativas (< 0), neutras (= 0) e positivas (> 0)
 */

import XLSX from 'xlsx';
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync } from 'fs';

const dbPath = join(process.cwd(), 'local.db');
const dataDir = join(process.cwd(), 'data');

if (!existsSync(dbPath)) {
    console.error('❌ Banco local.db não encontrado!');
    process.exit(1);
}

const db = new Database(dbPath);

// Mapeamento de arquivos para indicadores
const FILES = [
    { filePattern: 'respostas_iegm_i-Amb_{ano}.xlsx', indicador: 'i-Amb' },
    { filePattern: 'respostas_iegm_i-Cidade_{ano}.xlsx', indicador: 'i-Cidade' },
    { filePattern: 'respostas_iegm_i-Educ_{ano}.xlsx', indicador: 'i-Educ' },
    { filePattern: 'respostas_iegm_i-Fiscal_{ano}.xlsx', indicador: 'i-Fiscal' },
    { filePattern: 'respostas_iegm_i-GovTi_{ano}.xlsx', indicador: 'i-GovTI' },
    { filePattern: 'respostas_iegm_i-Plan_{ano}.xlsx', indicador: 'i-Plan' },
    { filePattern: 'respostas_iegm_i-Saude_{ano}.xlsx', indicador: 'i-Saude' },
];

console.log('🚀 Importando Respostas Detalhadas de arquivos XLSX...\n');

// Preparar insert
const insert = db.prepare(`
    INSERT INTO respostas_detalhadas (
        tribunal, codigo_ibge, municipio, indicador, 
        questao, resposta, pontuacao, peso, nota, ano_ref
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let totalImportado = 0;
let negativas = 0;
let neutras = 0;
let positivas = 0;

const ANOS = [2022, 2023, 2024];

for (const ano of ANOS) {
    const yearDir = join(dataDir, `respostas_iegm_${ano}`);
    if (!existsSync(yearDir)) {
        console.log(`⚠️  Diretório não encontrado: ${yearDir}`);
        continue;
    }

    // Verificar quantos registros existem antes de deletar
    const countResult = db.prepare(`SELECT COUNT(*) as count FROM respostas_detalhadas WHERE ano_ref = ? AND tribunal = 'TCEMG'`).get(ano) as { count: number };
    console.log(`\n📅 Processando ano ${ano}`);
    console.log(`   Registros existentes: ${countResult.count}`);

    if (countResult.count > 0) {
        console.log('🧹 Limpando dados anteriores em lotes...');
        // Deletar em lotes menores para não travar
        let deleted = 0;
        while (deleted < countResult.count) {
            const result = db.prepare(`DELETE FROM respostas_detalhadas WHERE id IN (SELECT id FROM respostas_detalhadas WHERE ano_ref = ? AND tribunal = 'TCEMG' LIMIT 10000)`).run(ano);
            deleted += result.changes;
            process.stdout.write(`\r   Deletados: ${deleted} / ${countResult.count}`);
            if (result.changes === 0) break;
        }
        console.log('\n   ✓ Limpeza concluída');
    } else {
        console.log('   Nenhum dado anterior para limpar.');
    }

    for (const { filePattern, indicador } of FILES) {
        // Ajustar nome do arquivo para o ano correto
        const file = filePattern.replace('{ano}', ano.toString());
        const filePath = join(yearDir, file);

        if (!existsSync(filePath)) {
            console.log(`⚠️  Arquivo não encontrado: ${file}`);
            continue;
        }

        console.log(`📊 Processando: ${file} (${indicador})`);

        const wb = XLSX.readFile(filePath);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        console.log(`   ${data.length} registros encontrados`);

        const processFile = db.transaction(() => {
            for (const row of data) {
                const municipio = String(row['municipio'] || '').toUpperCase().trim();
                const questao = String(row['questao'] || '').trim();
                const resposta = String(row['resposta'] || '').trim();
                const nota = parseFloat(row['nota']) || 0;
                // Forçar o ano correto, ignorando o da planilha se estiver errado ou faltante
                const anoRef = ano;

                if (!municipio || !questao) continue;

                // Contagem por tipo
                if (nota < 0) negativas++;
                else if (nota === 0) neutras++;
                else positivas++;

                try {
                    insert.run(
                        'TCEMG',     // tribunal
                        '0',        // codigo_ibge (não temos)
                        municipio,
                        indicador,
                        questao,
                        resposta,
                        nota,       // pontuacao
                        null,       // peso
                        nota,       // nota
                        anoRef
                    );
                    totalImportado++;
                } catch (e) {
                    // Ignorar erros de duplicatas
                }
            }
        });

        processFile();
        console.log(`   ✓ Concluído`);
    }
}

console.log('🎉 Importação de respostas concluída!');
console.log('');
console.log('📈 Estatísticas:');
console.log(`   Total importado: ${totalImportado}`);
console.log(`   Notas negativas (< 0): ${negativas}`);
console.log(`   Notas neutras (= 0): ${neutras}`);
console.log(`   Notas positivas (> 0): ${positivas}`);

db.close();
