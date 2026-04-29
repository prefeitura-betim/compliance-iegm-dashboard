/**
 * Importa opções de múltipla escolha extraídas do PDF para o banco local (local.db).
 *
 * Uso:
 *   node scripts/importar-opcoes-db.js <caminho-do-json>
 *
 * Exemplo:
 *   node scripts/importar-opcoes-db.js scripts/opcoes-extraidas-i-GovTI.json
 *
 * O script atualiza a coluna `opcoes` na tabela `questoes` e muda o `tipo`
 * para 'multipla_escolha' em todas as questões encontradas.
 *
 * Para produção (D1 remoto), use o SQL gerado em:
 *   scripts/opcoes-update-<indicador>.sql
 * e aplique com:
 *   wrangler d1 execute compliance-iegm-dashboard --file=scripts/opcoes-update-<indicador>.sql --remote
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Uso: node scripts/importar-opcoes-db.js <caminho-do-json>');
  process.exit(1);
}

const dados = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const { indicador, questoes } = dados;

const dbPath = path.join(__dirname, '../local.db');
const db = new Database(dbPath);

let atualizadas = 0;
let naoEncontradas = [];

// Gerar SQL para D1 remoto também
const sqlLines = ['-- Atualização de opções IEGM gerada automaticamente', `-- Indicador: ${indicador}`, ''];

console.log(`\nImportando opções do indicador ${indicador}...`);

const stmtByChave = db.prepare(
  "UPDATE questoes SET opcoes = ?, tipo = 'multipla_escolha' WHERE chave_questao = ?"
);

const stmtByTexto = db.prepare(
  "UPDATE questoes SET opcoes = ?, tipo = 'multipla_escolha' WHERE LOWER(texto) LIKE LOWER(?) AND (opcoes IS NULL OR opcoes = '')"
);

const buscaChave = db.prepare("SELECT id, chave_questao FROM questoes WHERE chave_questao = ?");
const buscaTexto = db.prepare("SELECT id, texto FROM questoes WHERE LOWER(texto) LIKE LOWER(?) LIMIT 1");

for (const [chaveOuTexto, opcoes] of Object.entries(questoes)) {
  if (!opcoes || opcoes.length < 2) continue;

  const opcoesJson = JSON.stringify(opcoes);
  const escapedJson = opcoesJson.replace(/'/g, "''");

  // Tentar por chave IEGM primeiro
  if (/^M\d{2}Q/.test(chaveOuTexto)) {
    const existe = buscaChave.get(chaveOuTexto);
    if (existe) {
      stmtByChave.run(opcoesJson, chaveOuTexto);
      sqlLines.push(`UPDATE questoes SET opcoes = '${escapedJson}', tipo = 'multipla_escolha' WHERE chave_questao = '${chaveOuTexto}';`);
      atualizadas++;
    } else {
      naoEncontradas.push(chaveOuTexto);
    }
  } else {
    // Busca fuzzy por texto (primeiros 50 chars)
    const fragmento = `%${chaveOuTexto.substring(0, 50)}%`;
    const existe = buscaTexto.get(fragmento);
    if (existe) {
      stmtByTexto.run(opcoesJson, fragmento);
      sqlLines.push(`UPDATE questoes SET opcoes = '${escapedJson}', tipo = 'multipla_escolha' WHERE LOWER(texto) LIKE LOWER('${fragmento.replace(/'/g, "''")}');`);
      atualizadas++;
    } else {
      naoEncontradas.push(chaveOuTexto.substring(0, 60));
    }
  }
}

// Relatório final
const tiposResultante = db.prepare("SELECT tipo, COUNT(*) as c FROM questoes GROUP BY tipo").all();

console.log('\n─── Resultado ─────────────────────────────────────────');
console.log(`  Questões atualizadas: ${atualizadas}`);
if (naoEncontradas.length > 0) {
  console.log(`  Não encontradas no banco (${naoEncontradas.length}):`);
  naoEncontradas.forEach(k => console.log(`    - ${k}`));
}
console.log('\n  Distribuição de tipos após importação:');
tiposResultante.forEach(r => console.log(`    ${r.tipo}: ${r.c}`));

// Salvar SQL para D1 remoto
const sqlPath = path.join(__dirname, `opcoes-update-${indicador}.sql`);
fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n', 'utf8');
console.log(`\n✓ SQL para D1 remoto salvo em: ${sqlPath}`);
console.log('  Para aplicar em produção:');
console.log(`  wrangler d1 execute compliance-iegm-dashboard --file=${sqlPath} --remote`);
console.log('────────────────────────────────────────────────────────\n');
