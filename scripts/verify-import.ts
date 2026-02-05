
import Database from 'better-sqlite3';
const db = new Database('local.db');

console.log('--- Verificando Duplicatas Pós-Importação ---');

// Verificar total de linhas
const count = db.prepare('SELECT count(*) as total FROM respostas_detalhadas WHERE ano_ref = 2024').get();
console.log(`Total de registros no banco: ${count.total}`);

// Verificar se ainda existem duplicatas (mesmo município, indicador, questão, ano)
const dups = db.prepare(`
    SELECT municipio, indicador, questao, count(*) as qtd 
    FROM respostas_detalhadas 
    WHERE ano_ref = 2024
    GROUP BY municipio, indicador, questao
    HAVING qtd > 1
    ORDER BY qtd DESC
    LIMIT 5
`).all();

if (dups.length === 0) {
    console.log('✅ SUCESSO! Nenhuma duplicata encontrada (mesmo Municipio + Questão).');
} else {
    console.log('❌ ALERTA: Ainda existem duplicatas!');
    console.table(dups);
}

// Verificar integridade das questões com Rotulo
const rotulos = db.prepare(`
    SELECT count(*) as qtd_com_rotulo FROM respostas_detalhadas 
    WHERE rotulo IS NOT NULL AND rotulo <> '' AND ano_ref = 2024
`).get();

console.log(`Registros com Rótulo preenchido: ${rotulos.qtd_com_rotulo}`);
