
import Database from 'better-sqlite3';
const db = new Database('local.db');

const term = '%condutores%infração%';
const row = db.prepare(`SELECT * FROM respostas_detalhadas WHERE questao LIKE ? AND municipio = 'BETIM' LIMIT 1`).get(term);

console.log('Result:', row);
