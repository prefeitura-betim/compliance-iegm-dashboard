/**
 * Script para importar notas IEGM dos arquivos XLSX
 * Arquivos: iegm_minas_2022.xlsx, iegm_minas_2023.xlsx, iegm_minas_2024.xlsx
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

// Indicadores mapeados
const INDICADORES = ['i-Amb', 'i-Cidade', 'i-Educ', 'i-Fiscal', 'i-GovTI', 'i-Saúde', 'i-Plan'];

// Arquivos e anos
const FILES = [
    { file: 'iegm_minas_2022.xlsx', ano: 2022 },
    { file: 'iegm_minas_2023.xlsx', ano: 2023 },
    { file: 'iegm_minas_2024.xlsx', ano: 2024 },
];

console.log('🚀 Importando Notas IEGM de arquivos XLSX...\n');

// Preparar insert para resultados_indicadores
const insertIndicador = db.prepare(`
    INSERT OR REPLACE INTO resultados_indicadores (
        tribunal_id, municipio_id, indicador_id, nota, ano_ref
    ) VALUES (
        (SELECT id FROM tribunais WHERE sigla = 'TCEMG'),
        (SELECT id FROM municipios WHERE nome = ?),
        (SELECT id FROM indicadores WHERE codigo = ?),
        ?,
        ?
    )
`);

// Preparar insert para resultados_municipios
const insertMunicipio = db.prepare(`
    INSERT OR REPLACE INTO resultados_municipios (
        tribunal_id, municipio_id, nota_iegm, faixa, ano_ref
    ) VALUES (
        (SELECT id FROM tribunais WHERE sigla = 'TCEMG'),
        (SELECT id FROM municipios WHERE nome = ?),
        ?,
        ?,
        ?
    )
`);

// Função para determinar a faixa
function calcularFaixa(nota: number): string {
    if (nota >= 0.9) return 'A+';
    if (nota >= 0.75) return 'A';
    if (nota >= 0.6) return 'B+';
    if (nota >= 0.5) return 'B';
    if (nota >= 0.25) return 'C+';
    return 'C';
}

// Normalizar nome do indicador para match no banco
function normalizarIndicador(col: string): string {
    const map: Record<string, string> = {
        'i-Amb': 'i-Amb',
        'i-Cidade': 'i-Cidade',
        'i-Educ': 'i-Educ',
        'i-Fiscal': 'i-Fiscal',
        'i-GovTI': 'i-GovTI',
        'i-Saúde': 'i-Saude', // Normaliza acentuação
        'i-Plan': 'i-Plan',
    };
    return map[col] || col;
}

let totalImportado = 0;

for (const { file, ano } of FILES) {
    const filePath = join(dataDir, file);

    if (!existsSync(filePath)) {
        console.log(`⚠️  Arquivo não encontrado: ${file}`);
        continue;
    }

    console.log(`📊 Processando: ${file}`);

    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { range: 1 }); // Skip first row (title)

    console.log(`   ${data.length} municípios encontrados`);

    const processYear = db.transaction(() => {
        for (const row of data) {
            const municipio = String(row['Município'] || '').toUpperCase().trim();
            const iegm = parseFloat(row['IEGM']) || 0;

            if (!municipio) continue;

            // Inserir nota IEGM geral
            try {
                insertMunicipio.run(municipio, iegm, calcularFaixa(iegm), ano);
            } catch (e) {
                // Município pode não existir
            }

            // Inserir notas por indicador
            for (const indicador of INDICADORES) {
                const nota = parseFloat(row[indicador]) || 0;
                const indicadorNormalizado = normalizarIndicador(indicador);

                try {
                    insertIndicador.run(municipio, indicadorNormalizado, nota, ano);
                    totalImportado++;
                } catch (e) {
                    // Indicador/município pode não existir
                }
            }
        }
    });

    processYear();
    console.log(`   ✓ Concluído\n`);
}

console.log('🎉 Importação de notas concluída!');
console.log(`   Total de registros processados: ${totalImportado}`);

db.close();
