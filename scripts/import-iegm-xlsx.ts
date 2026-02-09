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

// Mapeamento de colunas para o banco
const DIMENSION_MAP: Record<string, { percentual: string, faixa: string }> = {
    'i-Amb': { percentual: 'percentual_iamb', faixa: 'faixa_iamb' },
    'i-Cidade': { percentual: 'percentual_icidade', faixa: 'faixa_icidade' },
    'i-Educ': { percentual: 'percentual_ieduc', faixa: 'faixa_ieduc' },
    'i-Fiscal': { percentual: 'percentual_ifiscal', faixa: 'faixa_ifiscal' },
    'i-GovTI': { percentual: 'percentual_igov_ti', faixa: 'faixa_igov_ti' },
    'i-Saúde': { percentual: 'percentual_isaude', faixa: 'faixa_isaude' },
    'i-Plan': { percentual: 'percentual_iplan', faixa: 'faixa_iplan' },
};

// Preparar insert para municipios
const insertMuni = db.prepare(`
    INSERT OR IGNORE INTO municipios (codigo_ibge, nome, uf) VALUES (?, ?, 'MG')
`);

// Preparar insert para resultados_indicadores
const insertIndicador = db.prepare(`
    INSERT OR REPLACE INTO resultados_indicadores (
        tribunal_id, municipio_id, indicador_id, nota_final, ano_ref
    ) VALUES (
        (SELECT id FROM tribunais WHERE codigo = 'TCEMG'),
        (SELECT id FROM municipios WHERE nome = ?),
        (SELECT id FROM indicadores WHERE codigo = ?),
        ?,
        ?
    )
`);

// Preparar insert para resultados_municipios (TODAS AS COLUNAS)
const insertMunicipioComp = db.prepare(`
    INSERT OR REPLACE INTO resultados_municipios (
        tribunal_id, municipio_id, ano_ref,
        percentual_iamb, percentual_icidade, percentual_ieduc, percentual_ifiscal,
        percentual_igov_ti, percentual_isaude, percentual_iplan, percentual_iegm_municipio,
        faixa_iamb, faixa_icidade, faixa_ieduc, faixa_ifiscal,
        faixa_igov_ti, faixa_isaude, faixa_iplan, faixa_iegm_municipio
    ) VALUES (
        (SELECT id FROM tribunais WHERE codigo = 'TCEMG'), 
        (SELECT id FROM municipios WHERE nome = ?),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
`);

/**
 * Extrai percentual e faixa de strings como "0.75A" ou "0,44 B"
 */
function parseScore(value: any): { percentual: number, faixa: string } {
    if (value === null || value === undefined || value === '') return { percentual: 0, faixa: 'C' };

    const str = String(value).trim().replace(',', '.');
    // Regex para pegar o número e a letra (e.g. 0.397C)
    const match = str.match(/^([\d.]+)\s*([A-C][+-]?)?$/i);

    if (match) {
        const percentual = parseFloat(match[1]) || 0;
        const faixa = match[2] ? match[2].toUpperCase() : calcularFaixa(percentual);
        return { percentual, faixa };
    }

    const val = parseFloat(str) || 0;
    return { percentual: val, faixa: calcularFaixa(val) };
}

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
        'i-Saúde': 'i-Saude',
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
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { range: 1 });

    console.log(`   ${data.length} municípios encontrados`);

    db.transaction(() => {
        for (const row of data) {
            const municipio = String(row['Município'] || '').toUpperCase().trim();
            if (!municipio) continue;

            const iegmRaw = row['IEGM'];
            const { percentual: iegmPerc, faixa: iegmFaixa } = parseScore(iegmRaw);

            // 1. Garantir município no banco
            const codigoIbge = `MG_${municipio.replace(/\s+/g, '_').substring(0, 20)}`;
            insertMuni.run(codigoIbge, municipio);

            // 2. Coletar dados de dimensões
            const dimScores: Record<string, { percentual: number, faixa: string }> = {};
            for (const dim of INDICADORES) {
                dimScores[dim] = parseScore(row[dim]);
            }

            // 3. Inserir resultado municipal consolidado
            try {
                insertMunicipioComp.run(
                    municipio,
                    ano,
                    dimScores['i-Amb'].percentual,
                    dimScores['i-Cidade'].percentual,
                    dimScores['i-Educ'].percentual,
                    dimScores['i-Fiscal'].percentual,
                    dimScores['i-GovTI'].percentual,
                    dimScores['i-Saúde'].percentual,
                    dimScores['i-Plan'].percentual,
                    iegmPerc,
                    dimScores['i-Amb'].faixa,
                    dimScores['i-Cidade'].faixa,
                    dimScores['i-Educ'].faixa,
                    dimScores['i-Fiscal'].faixa,
                    dimScores['i-GovTI'].faixa,
                    dimScores['i-Saúde'].faixa,
                    dimScores['i-Plan'].faixa,
                    iegmFaixa
                );
            } catch (e: any) {
                console.error(`      ❌ Erro Resultado Mun [${municipio}]:`, e.message);
            }

            // 4. Inserir resultados por indicador (tabela detalhada por indicador)
            for (const indicator of INDICADORES) {
                const { percentual } = dimScores[indicator];
                const indicatorNormalizado = normalizarIndicador(indicator);

                try {
                    insertIndicador.run(municipio, indicatorNormalizado, percentual, ano);
                    totalImportado++;
                } catch (e) {
                    // console.error(`      ❌ Erro Indicador [${municipio} - ${indicator}]:`, e.message);
                }
            }
        }
    })();

    console.log(`   ✓ Concluído\n`);
}


console.log('🎉 Importação de notas concluída!');
console.log(`   Total de registros processados: ${totalImportado}`);

db.close();
