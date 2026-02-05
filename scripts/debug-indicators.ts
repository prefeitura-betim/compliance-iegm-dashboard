
import Database from 'better-sqlite3';
const db = new Database('local.db');

const counts = db.prepare(`
    SELECT indicador, COUNT(*) as total 
    FROM respostas_detalhadas 
    WHERE ano_ref = 2024 
    GROUP BY indicador
    ORDER BY indicador
`).all();

console.table(counts);
