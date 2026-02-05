
import Database from 'better-sqlite3';
const db = new Database('local.db');

const term = '%CACS FUNDEB%';
const rows = db.prepare(`
    SELECT id, questao, resposta, pontuacao, nota, ano_ref 
    FROM respostas_detalhadas 
    WHERE questao LIKE ? AND municipio = 'BETIM'
`).all(term);

console.log(JSON.stringify(rows, null, 2));
