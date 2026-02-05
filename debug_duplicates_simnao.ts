
import Database from 'better-sqlite3';
const db = new Database('local.db');

// Encontrar perguntas Sim/Não duplicadas
const rows = db.prepare(`
    SELECT questao, count(*) as qtd 
    FROM respostas_detalhadas 
    WHERE municipio = 'BETIM' 
    AND ano_ref = 2024
    AND (resposta = 'Sim' OR resposta = 'Não')
    GROUP BY questao
    HAVING qtd > 1
    ORDER BY qtd DESC
    LIMIT 5
`).all();

console.log('Perguntas Sim/Não duplicadas:');
console.table(rows);

if (rows.length > 0) {
    const q = rows[0].questao;
    console.log(`\nDetalhes para: "${q}"`);
    const details = db.prepare(`
        SELECT id, rotulo, questao, resposta, pontuacao 
        FROM respostas_detalhadas 
        WHERE municipio = 'BETIM' AND questao = ?
    `).all(q);
    console.table(details);
}
