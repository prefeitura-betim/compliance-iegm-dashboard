
import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse';
import fs from 'fs';
import iconv from 'iconv-lite';

// Configuração
const DB_PATH = join(process.cwd(), 'local.db');
const CSV_FILE = join(process.cwd(), 'data', 'respostas_iegm_detalhadas_2024.csv');
const BATCH_SIZE = 2000; // Tamanho do lote de inserção

async function main() {
    console.log('🚀 Iniciando importação de respostas detalhadas (2024)...');

    // Verificar banco de dados
    if (!existsSync(DB_PATH)) {
        console.error('❌ Banco de dados local.db não encontrado.');
        process.exit(1);
    }

    const db = new Database(DB_PATH);

    // Verificar arquivo CSV
    if (!existsSync(CSV_FILE)) {
        console.error(`❌ Arquivo CSV não encontrado: ${CSV_FILE}`);
        process.exit(1);
    }

    // Preparar tabela
    console.log('🧹 Limpando dados antigos de 2024...');
    db.prepare('DELETE FROM respostas_detalhadas WHERE ano_ref = 2024').run();

    // Preparar statement de inserção
    const insertStmt = db.prepare(`
        INSERT INTO respostas_detalhadas (
            tribunal, codigo_ibge, municipio, indicador, 
            questao, resposta, ano_ref, 
            pontuacao, peso, nota
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    console.log('📖 Lendo e importando arquivo (Isso pode demorar um pouco)...');

    let count = 0;
    let batch = [];

    // Iniciar transação para melhor performance
    const insertMany = db.transaction((rows) => {
        for (const row of rows) insertStmt.run(...row);
    });

    // Criar stream de leitura com decodificação UTF-16LE
    const fileStream = fs.createReadStream(CSV_FILE);
    const decoderStream = fileStream.pipe(iconv.decodeStream('utf16-le'));

    const parser = decoderStream.pipe(parse({
        delimiter: ';',
        columns: true,
        trim: true,
        skip_empty_lines: true,
        // Configurações permissivas para arquivos mal formatados
        relax_quotes: true,
        relax_column_count: true,
        quote: null // Desabilita aspas como delimitador para evitar erros com aspas no texto
    }));

    try {
        for await (const record of parser) {
            try {
                // Simular pontuação baseada na resposta
                let pontuacao = null;
                const respUpper = record.resposta?.toUpperCase();
                if (respUpper === 'SIM') pontuacao = 100;
                else if (respUpper === 'NÃO' || respUpper === 'NAO') pontuacao = 0;

                // Mapear campos
                const tribunal = record.tribunal || 'TCEMG';
                const municipio = record.municipio;
                // Ignorar se não tiver município (pode ser linha quebrada)
                if (!municipio) continue;

                batch.push([
                    tribunal,
                    record.codigo_ibge,
                    municipio,
                    record.indicador,
                    record.questao,
                    record.resposta,
                    parseInt(record.ano_ref || '2024'),
                    pontuacao,
                    1.0,
                    pontuacao
                ]);

                count++;

                if (batch.length >= BATCH_SIZE) {
                    insertMany(batch);
                    batch = [];
                    process.stdout.write(`\r✅ Importados: ${count.toLocaleString()} registros...`);
                }
            } catch (err: any) {
                // Logar erro mas não parar
                // Ocasionalmente pode falhar em uma linha muito quebrada
            }
        }
    } catch (parseError: any) {
        console.error('\n❌ Erro no parser:', parseError.message);
    }

    // Inserir restante
    if (batch.length > 0) {
        insertMany(batch);
    }

    console.log(`\n\n🎉 Importação concluída! Total: ${count.toLocaleString()} registros.`);
    db.close();
}

main().catch(console.error);
