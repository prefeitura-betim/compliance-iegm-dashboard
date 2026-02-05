
import Database from 'better-sqlite3';
const db = new Database('local.db');

const questao = "A Prefeitura Municipal disponibilizou, em sítio na internet, informações atualizadas sobre a composição e o funcionamento do CACS FUNDEB?";

const stats = db.prepare(`
    SELECT resposta, count(*) as qtd, avg(nota) as media_nota, max(nota) as max_nota 
    FROM respostas_detalhadas 
    WHERE questao = ?
    GROUP BY resposta
`).all(questao);

const maxPossible = db.prepare(`SELECT max(nota) as val FROM respostas_detalhadas WHERE questao = ?`).get(questao);

console.log('Distribuição de Notas para a questão:', questao);
console.table(stats);
console.log('Nota Máxima Possível identificada:', maxPossible);
