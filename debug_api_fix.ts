
import Database from 'better-sqlite3';
const db = new Database('local.db');

const municipioNome = 'BETIM';
const anoRef = 2024;
const indicador = 'i-Educ'; // Testando com i-Educ onde sabemos que há dados

console.log('--- Testando Query Otimizada da API (Geral) ---');

// A mesma query que coloquei no api-server.ts
let query = `
    SELECT DISTINCT r.id, r.questao, r.pontuacao
    FROM respostas_detalhadas r
    INNER JOIN (
        SELECT DISTINCT questao, ano_ref 
        FROM respostas_detalhadas 
        WHERE pontuacao > 0 AND ano_ref = ?
    ) validas ON r.questao = validas.questao AND r.ano_ref = validas.ano_ref
    WHERE upper(r.municipio) = ? AND r.ano_ref = ?
    AND r.pontuacao = 0
    AND r.resposta <> ''
    AND upper(r.indicador) = upper(?)
    ORDER BY r.indicador 
    LIMIT 5
`;

try {
    const res = db.prepare(query).all(anoRef, municipioNome, anoRef, indicador);
    console.log(`Encontrados: ${res.length} registros`);
    if (res.length > 0) {
        console.log('Exemplo:', res[0]);
    } else {
        console.log('Nenhum registro encontrado. Algo está muito restritivo.');

        // Debug: Checar se o JOIN está matando tudo
        const countAll = db.prepare("SELECT count(*) as c FROM respostas_detalhadas WHERE upper(municipio) = ? AND indicador = 'i-Educ' AND pontuacao = 0").get(municipioNome);
        console.log('Total de zeros (sem whitelist):', countAll);

        const countValid = db.prepare("SELECT count(DISTINCT questao) as c FROM respostas_detalhadas WHERE indicador = 'i-Educ' AND pontuacao > 0").get();
        console.log('Total de questões na whitelist (pontuacao > 0):', countValid);
    }
} catch (e) {
    console.error('Erro na query:', e);
}
