
import Database from 'better-sqlite3';
const db = new Database('local.db');

const questao = "A Prefeitura municipal oferece Creche?";

const stats = db.prepare(`
    SELECT resposta, count(*) as qtd, avg(nota) as media_nota, max(nota) as max_nota 
    FROM respostas_detalhadas 
    WHERE questao = ?
    GROUP BY resposta
`).all(questao);

console.log('Distribuição de Notas para: ', questao);
console.table(stats);

const maxPts = db.prepare(`
    SELECT municipio, nota, resposta 
    FROM respostas_detalhadas 
    WHERE questao = ? AND pontuacao > 0 
    LIMIT 5
`).all(questao);
console.log('Quem pontuou?', maxPts);
