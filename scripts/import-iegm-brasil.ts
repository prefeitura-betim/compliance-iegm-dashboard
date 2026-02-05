/**
 * Script para importar dados IEGM de múltiplos arquivos CSV (Minas Gerais)
 * Lê: IEGM_Minas_2022.csv, IEGM_Minas_2023.csv, IEGM_Minas_2024.csv
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

// Conectar ao banco
const dbPath = join(process.cwd(), 'local.db');
if (!existsSync(dbPath)) {
    console.error('❌ Banco local.db não encontrado! Execute: yarn db:migrate && yarn data:seed');
    process.exit(1);
}

const db = new Database(dbPath);

/**
 * Parse do valor IEGM no formato "0.08C" ou "0,44 B"
 */
function parseIegmValue(value: string | null | undefined): { percentual: number | null, faixa: string | null } {
    if (!value || value === '' || value === 'null' || value === 'NA' || value === '-') {
        return { percentual: null, faixa: null };
    }

    const cleaned = value.toString().trim();
    // Formato: "0.44B" ou "0,44 B" ou "0.5435C+"
    const match = cleaned.match(/^([\d.,]+)\s*([ABC][+\-]?)?\s*$/i);

    if (match) {
        const numStr = match[1].replace(',', '.');
        const faixa = match[2] ? match[2].toUpperCase() : null;
        const num = parseFloat(numStr);

        if (!isNaN(num)) {
            return { percentual: num, faixa };
        }
    }

    return { percentual: null, faixa: null };
}

/**
 * Normalizar nome do município (maiúsculo, sem espaços extras)
 */
function normalizarNome(nome: string): string {
    return nome.toString().trim().toUpperCase().replace(/\s+/g, ' ');
}

console.log('🚀 Importando dados IEGM de Minas Gerais...');
console.log('');

try {
    // Buscar todos os arquivos CSV na pasta data/
    const dataDir = join(process.cwd(), 'data');
    const arquivosCSV = readdirSync(dataDir)
        .filter(f => f.startsWith('IEGM_Minas_') && f.endsWith('.csv'))
        .sort();

    if (arquivosCSV.length === 0) {
        console.error('❌ Nenhum arquivo IEGM_Minas_*.csv encontrado na pasta data/');
        process.exit(1);
    }

    console.log(`📁 Arquivos encontrados: ${arquivosCSV.join(', ')}`);
    console.log('');

    // Buscar ID do tribunal TCEMG
    let tribunal = db.prepare('SELECT id FROM tribunais WHERE codigo = ?').get('TCEMG') as { id: number } | undefined;

    if (!tribunal) {
        // Criar tribunal se não existir
        db.prepare(`INSERT INTO tribunais (codigo, nome, uf) VALUES (?, ?, ?)`).run(
            'TCEMG', 'Tribunal de Contas do Estado de Minas Gerais', 'MG'
        );
        tribunal = db.prepare('SELECT id FROM tribunais WHERE codigo = ?').get('TCEMG') as { id: number };
        console.log('🏛️  Tribunal TCEMG criado');
    }

    console.log(`🏛️  Tribunal ID: ${tribunal.id}`);

    // LIMPAR DADOS ANTIGOS para evitar duplicatas
    console.log('🧹 Limpando dados antigos...');
    db.prepare('DELETE FROM resultados_municipios WHERE tribunal_id = ?').run(tribunal.id);
    console.log('');

    // Preparar statements
    const insertMunicipio = db.prepare(`
        INSERT OR IGNORE INTO municipios (codigo_ibge, nome, uf) VALUES (?, ?, ?)
    `);

    const getMunicipio = db.prepare(`
        SELECT id FROM municipios WHERE nome = ?
    `);

    const insertResultado = db.prepare(`
        INSERT INTO resultados_municipios (
            tribunal_id, municipio_id, ano_ref,
            percentual_iamb, percentual_icidade, percentual_ieduc, percentual_ifiscal,
            percentual_igov_ti, percentual_isaude, percentual_iplan, percentual_iegm_municipio,
            faixa_iamb, faixa_icidade, faixa_ieduc, faixa_ifiscal,
            faixa_igov_ti, faixa_isaude, faixa_iplan, faixa_iegm_municipio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let totalResultados = 0;
    const municipiosSet = new Set<string>();

    // Processar cada arquivo CSV
    for (const arquivo of arquivosCSV) {
        const csvPath = join(dataDir, arquivo);
        console.log(`📊 Processando: ${arquivo}`);

        const csvContent = readFileSync(csvPath, 'utf8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true,
            bom: true,
        });

        console.log(`   ${records.length} registros encontrados`);

        // Extrair ano do nome do arquivo (IEGM_Minas_2024.csv -> 2024)
        const anoMatch = arquivo.match(/(\\d{4})\\.csv$/);
        const anoDoArquivo = anoMatch ? parseInt(anoMatch[1]) : null;

        const importarArquivo = db.transaction(() => {
            for (const record of records) {
                // Detectar nome do campo de município (pode variar)
                const municipioNome = normalizarNome(
                    record['Município'] || record['Municipio'] || record['municipio'] || ''
                );

                // Usar ano do arquivo ou do registro
                const anoRef = anoDoArquivo || parseInt(record['Exercício'] || record['Exercicio'] || record['Ano'] || '2024');

                if (!municipioNome) continue;

                // Inserir município se não existir
                const codigoIbge = `MG_${municipioNome.substring(0, 30).replace(/\\s+/g, '_')}`;
                insertMunicipio.run(codigoIbge, municipioNome, 'MG');
                municipiosSet.add(municipioNome);

                // Buscar ID do município
                const municipio = getMunicipio.get(municipioNome) as { id: number } | undefined;
                if (!municipio) continue;

                // Parsear valores (tentar ambos formatos de nome de coluna)
                const iAmb = parseIegmValue(record['i-Amb'] || record['I-AMB'] || record['i_amb']);
                const iCidade = parseIegmValue(record['i-Cidade'] || record['I-CIDADE'] || record['i_cidade']);
                const iEduc = parseIegmValue(record['i-Educ'] || record['I-EDUC'] || record['i_educ']);
                const iFiscal = parseIegmValue(record['i-Fiscal'] || record['I-FISCAL'] || record['i_fiscal']);
                const iGovTI = parseIegmValue(record['i-GovTI'] || record['I-GOVTI'] || record['i_govti'] || record['i-GovTi']);
                const iSaude = parseIegmValue(record['i-Saúde'] || record['i-Saude'] || record['I-SAUDE'] || record['i_saude']);
                const iPlan = parseIegmValue(record['i-Plan'] || record['I-PLAN'] || record['i_plan']);
                const iegm = parseIegmValue(record['IEGM'] || record['iegm']);

                // Inserir resultado
                insertResultado.run(
                    tribunal.id, municipio.id, anoRef,
                    iAmb.percentual, iCidade.percentual, iEduc.percentual, iFiscal.percentual,
                    iGovTI.percentual, iSaude.percentual, iPlan.percentual, iegm.percentual,
                    iAmb.faixa, iCidade.faixa, iEduc.faixa, iFiscal.faixa,
                    iGovTI.faixa, iSaude.faixa, iPlan.faixa, iegm.faixa
                );
                totalResultados++;
            }
        });

        importarArquivo();
        console.log(`   ✅ ${arquivo} importado`);
    }

    console.log('');
    console.log('✅ Importação concluída!');
    console.log('');
    console.log('📈 Estatísticas:');
    console.log(`   - Municípios únicos: ${municipiosSet.size}`);
    console.log(`   - Total de resultados: ${totalResultados}`);

    // Verificar anos disponíveis
    const anos = db.prepare(`
        SELECT DISTINCT ano_ref FROM resultados_municipios ORDER BY ano_ref DESC
    `).all() as Array<{ ano_ref: number }>;
    console.log(`   - Anos disponíveis: ${anos.map(a => a.ano_ref).join(', ')}`);

    // Verificar BETIM
    const betim = db.prepare(`
        SELECT m.nome, r.ano_ref, r.percentual_iegm_municipio, r.faixa_iegm_municipio
        FROM resultados_municipios r
        JOIN municipios m ON r.municipio_id = m.id
        WHERE m.nome = 'BETIM'
        ORDER BY r.ano_ref DESC
    `).all() as Array<{ nome: string, ano_ref: number, percentual_iegm_municipio: number, faixa_iegm_municipio: string }>;

    if (betim.length > 0) {
        console.log('');
        console.log('🏙️  Dados de BETIM:');
        betim.forEach(b => {
            const pct = b.percentual_iegm_municipio ? (b.percentual_iegm_municipio * 100).toFixed(1) : 'N/A';
            console.log(`   - ${b.ano_ref}: ${pct}% (Faixa ${b.faixa_iegm_municipio || 'N/D'})`);
        });
    }

    // Verificar possíveis duplicatas
    const duplicatas = db.prepare(`
        SELECT municipio_id, ano_ref, COUNT(*) as cnt
        FROM resultados_municipios
        GROUP BY municipio_id, ano_ref
        HAVING cnt > 1
    `).all() as Array<{ municipio_id: number, ano_ref: number, cnt: number }>;

    if (duplicatas.length > 0) {
        console.log('');
        console.log('⚠️  ATENÇÃO: Foram encontradas duplicatas!');
        duplicatas.forEach(d => {
            console.log(`   - Município ID ${d.municipio_id}, Ano ${d.ano_ref}: ${d.cnt} registros`);
        });
    } else {
        console.log('');
        console.log('✅ Nenhuma duplicata encontrada.');
    }

    console.log('');
    console.log('🎉 Pronto! Reinicie a API para ver os novos dados.');

} catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
} finally {
    db.close();
}
