
import Database from 'better-sqlite3';
const db = new Database('local.db');

console.log('Criando índices de performance...');
db.exec('CREATE INDEX IF NOT EXISTS idx_respostas_questao ON respostas_detalhadas(questao);');
db.exec('CREATE INDEX IF NOT EXISTS idx_respostas_municipio ON respostas_detalhadas(municipio);');
db.exec('CREATE INDEX IF NOT EXISTS idx_respostas_ano ON respostas_detalhadas(ano_ref);');
db.exec('CREATE INDEX IF NOT EXISTS idx_respostas_pontuacao ON respostas_detalhadas(pontuacao);');
console.log('Índices criados!');
