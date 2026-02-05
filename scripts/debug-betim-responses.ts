
import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'local.db');
const db = new Database(DB_PATH);

console.log('--- Resposta Types for BETIM ---');
const responses = db.prepare(`
    SELECT resposta, count(*) as qtd 
    FROM respostas_detalhadas 
    WHERE upper(municipio) = 'BETIM' 
    GROUP BY resposta 
    ORDER BY qtd DESC 
    LIMIT 20
`).all();
console.log(responses);

console.log('--- Sample Negative Responses for BETIM ---');
const negative = db.prepare(`
    SELECT * 
    FROM respostas_detalhadas 
    WHERE upper(municipio) = 'BETIM' 
    AND (upper(resposta) LIKE 'NÃO%' OR upper(resposta) = 'NAO' OR upper(resposta) LIKE 'NAO%')
    LIMIT 5
`).all();
console.log(negative);
