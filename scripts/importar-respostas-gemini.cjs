/**
 * Importa respostas reais de Betim para o campo resposta_ref no banco.
 * Cruza o arquivo de questões (i-Amb.json) com o de respostas (respostas-i-Amb.JSON).
 *
 * Uso:
 *   node scripts/importar-respostas-gemini.cjs <questoes.json> <respostas.json>
 *
 * Exemplo:
 *   node scripts/importar-respostas-gemini.cjs scripts/i-Amb.json scripts/respostas-i-Amb.JSON
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const [questoesPath, respostasPath] = process.argv.slice(2);
if (!questoesPath || !respostasPath) {
  console.error('Uso: node scripts/importar-respostas-gemini.cjs <questoes.json> <respostas.json>');
  process.exit(1);
}

const dadosQuestoes = JSON.parse(fs.readFileSync(questoesPath, 'utf8'));
const dadosRespostas = JSON.parse(fs.readFileSync(respostasPath, 'utf8'));

const questoes = Object.values(dadosQuestoes.questoes || dadosQuestoes);
const respostas = dadosRespostas.respostas || dadosRespostas;
const submissao = dadosRespostas.submissao || {};

const indicador = submissao.indicador || dadosQuestoes.indicador || path.basename(questoesPath, '.json');
const ano = submissao.data_termino?.substring(0, 4) || '2025';

// Mapear numero → codigo_questao
const numeroPorCodigo = {};
for (const q of questoes) {
  if (q.numero && q.codigo_questao) {
    numeroPorCodigo[q.numero] = q.codigo_questao;
  }
}

// Mapear numero → resposta (normalizada)
const respostasPorNumero = {};
for (const r of respostas) {
  if (!r.numero) continue;
  let val = r.resposta;
  if (Array.isArray(val)) {
    val = JSON.stringify(val);
  } else if (typeof val === 'number') {
    val = String(val);
  }
  respostasPorNumero[r.numero] = val ?? '';
}

const db = new Database(path.join(__dirname, '../local.db'));
const stmtUpdate = db.prepare("UPDATE questoes SET resposta_ref = ? WHERE chave_questao = ?");
const stmtCheck = db.prepare("SELECT id FROM questoes WHERE chave_questao = ?");

const sqlLines = [
  `-- Respostas de referência Betim ${ano} — ${indicador}`,
  `-- Gerado por importar-respostas-gemini.cjs`,
  '',
];

let atualizadas = 0, semCodigo = 0, naoNoBanco = 0;

for (const [numero, codigoQuestao] of Object.entries(numeroPorCodigo)) {
  const resposta = respostasPorNumero[numero];
  if (resposta === undefined || resposta === '') continue;

  if (!stmtCheck.get(codigoQuestao)) { naoNoBanco++; continue; }

  stmtUpdate.run(resposta, codigoQuestao);
  atualizadas++;

  const escaped = resposta.replace(/'/g, "''");
  sqlLines.push(`UPDATE questoes SET resposta_ref = '${escaped}' WHERE chave_questao = '${codigoQuestao}';`);
}

semCodigo = respostas.filter(r => r.numero && !numeroPorCodigo[r.numero]).length;

// Salvar SQL para D1 remoto
const indicadorSlug = indicador.match(/i-[A-Za-z]+/)?.[0] || indicador.replace(/\s+/g, '-');
const sqlPath = path.join(__dirname, `respostas-update-${indicadorSlug}-${ano}.sql`);
fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n', 'utf8');

console.log('\n─── Resultado ─────────────────────────────────────────');
console.log(`  Município: ${submissao.municipio_nome || 'Betim'}`);
console.log(`  Indicador: ${indicador}`);
console.log(`  Ano:       ${ano}`);
console.log(`  Respostas no JSON:          ${respostas.length}`);
console.log(`  resposta_ref atualizadas:   ${atualizadas}`);
if (semCodigo > 0)  console.log(`  Sem código no mapa:         ${semCodigo}`);
if (naoNoBanco > 0) console.log(`  Código não encontrado no BD: ${naoNoBanco}`);
console.log(`\n✓ SQL para D1 remoto: ${sqlPath}`);
console.log(`  wrangler d1 execute compliance-iegm-dashboard --file=${sqlPath} --remote`);
console.log('────────────────────────────────────────────────────────\n');
