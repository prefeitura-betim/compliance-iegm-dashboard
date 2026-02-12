const Database = require('better-sqlite3');
const db = new Database('../local.db');

const rows = db.prepare(`
    SELECT id, indicador, questao, chave_questao, rotulo, questao_id, indice_questao 
    FROM respostas_detalhadas 
    WHERE indicador = 'i-Plan' 
    LIMIT 5
`).all();

console.log(JSON.stringify(rows, null, 2));
