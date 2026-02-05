
import Database from 'better-sqlite3';
const db = new Database('local.db');

console.log('Criando índice composto de alta performance...');
// Índice cobrindo as colunas usadas na subquery EXISTS e filtros principais
db.exec('CREATE INDEX IF NOT EXISTS idx_cover_perf ON respostas_detalhadas(questao, ano_ref, pontuacao);');
console.log('Índice criado!');
