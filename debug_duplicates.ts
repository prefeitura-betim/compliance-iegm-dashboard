
import Database from 'better-sqlite3';
const db = new Database('local.db');

const count = db.prepare(`
    SELECT questao, count(*) as qtd 
    FROM respostas_detalhadas 
    WHERE municipio = 'BETIM' AND ano_ref = 2024
    GROUP BY questao
    HAVING qtd > 1
    ORDER BY qtd DESC
    LIMIT 10
`).all();

console.log('Perguntas com mais de 1 resposta para Betim em 2024:');
console.table(count);

if (count.length > 0) {
    const q = count[0].questao;
    console.log(`\nDetalhes da pergunta duplicada: "${q}"`);
    const details = db.prepare(`
        SELECT id, indicador, questao, resposta, pontuacao, nota, ano_ref 
        FROM respostas_detalhadas 
        WHERE municipio = 'BETIM' AND questao = ?
    `).all(q);
    console.log(details);
}
