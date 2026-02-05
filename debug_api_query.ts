
import Database from 'better-sqlite3';
const db = new Database('local.db');

const municipioNome = 'BETIM';
const anoRef = 2024;
const indicador = 'i-Educ';
const questaoAlvo = '%CACS FUNDEB%';

console.log('--- Verificando se existe alguém com nota > 0 ---');
const checkPoints = db.prepare(`
    SELECT count(*) as qtd, max(pontuacao) as max_pts 
    FROM respostas_detalhadas 
    WHERE questao LIKE ? 
    AND pontuacao > 0
`).get(questaoAlvo);
console.log('Alguém pontuou?', checkPoints);

console.log('--- Executando Query da API ---');

let query = `
    SELECT r.municipio, r.questao, r.pontuacao, r.resposta
    FROM respostas_detalhadas r
    WHERE upper(r.municipio) = ? AND r.ano_ref = ?
    AND r.pontuacao = 0
    AND r.resposta <> '' 
    AND EXISTS (
        SELECT 1 
        FROM respostas_detalhadas r2 
        WHERE r2.questao = r.questao 
        AND r2.ano_ref = r.ano_ref 
        AND r2.pontuacao > 0
    )
    AND r.questao LIKE ? -- Filtrando só a do CACS FUNDEB pra testar
`;

const res = db.prepare(query).all(municipioNome, anoRef, questaoAlvo);

console.log('Resultado da Query (deveria ser vazio se ninguém pontuou):');
console.log(JSON.stringify(res, null, 2));
