/**
 * Importa questões extraídas pelo Gemini (formato rico com opcoes[]{id, texto})
 * para o banco local.db e gera SQL para D1 remoto.
 *
 * Uso:
 *   node scripts/importar-opcoes-gemini.js <arquivo.json>
 *
 * Exemplo:
 *   node scripts/importar-opcoes-gemini.js scripts/i-Amb.json
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Uso: node scripts/importar-opcoes-gemini.js <arquivo.json>');
  process.exit(1);
}

const dados = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const questoes = Object.values(dados.questoes || dados);
const indicadorNome = dados.indicador || path.basename(jsonPath, '.json');

const dbPath = path.join(__dirname, '../local.db');
const db = new Database(dbPath);

const stmtUpdate = db.prepare(
  "UPDATE questoes SET tipo = ?, opcoes = ? WHERE chave_questao = ?"
);
const stmtCheck = db.prepare(
  "SELECT id, chave_questao, tipo FROM questoes WHERE chave_questao = ?"
);

const sqlLines = [
  `-- Atualização de tipos e opções gerada por importar-opcoes-gemini.js`,
  `-- Fonte: ${jsonPath}`,
  `-- Indicador: ${indicadorNome}`,
  '',
];

let atualizadas = 0, semCodigoNoJson = 0, naoNoBanco = 0;
const naoEncontradas = [];

for (const q of questoes) {
  const codigoQuestao = q.codigo_questao;
  if (!codigoQuestao) { semCodigoNoJson++; continue; }

  const existe = stmtCheck.get(codigoQuestao);
  if (!existe) { naoNoBanco++; naoEncontradas.push(codigoQuestao); continue; }

  const optsRaw = q.opcoes || [];
  // Normalizar: guardar objetos {texto, valor} preservando o valor_referencia
  const optsNormalizadas = optsRaw
    .map(o => typeof o === 'string'
      ? { texto: o, valor: null }
      : { texto: o.texto ?? '', valor: o.valor ?? o.valor_referencia ?? null }
    )
    .filter(o => o.texto);

  const textos = optsNormalizadas.map(o => o.texto);

  let tipo, opcoesJson;

  if (textos.length === 0) {
    tipo = 'text';
    opcoesJson = null;
  } else {
    const isSimNao = textos.every(t =>
      ['Sim', 'Não', 'Nao', 'sim', 'não', 'nao'].includes(t.trim())
    );
    if (isSimNao) {
      tipo = 'boolean';
      opcoesJson = null;
    } else {
      tipo = 'multipla_escolha';
      // Guardar objeto completo para poder exibir o valor de referência na UI
      opcoesJson = JSON.stringify(optsNormalizadas);
    }
  }

  stmtUpdate.run(tipo, opcoesJson, codigoQuestao);
  atualizadas++;

  const escaped = opcoesJson ? opcoesJson.replace(/'/g, "''") : 'NULL';
  const opcoesClause = opcoesJson ? `'${escaped}'` : 'NULL';
  sqlLines.push(
    `UPDATE questoes SET tipo = '${tipo}', opcoes = ${opcoesClause} WHERE chave_questao = '${codigoQuestao}';`
  );
}

// Resultado final
const tiposResultante = db.prepare(
  "SELECT tipo, COUNT(*) as c FROM questoes GROUP BY tipo ORDER BY c DESC"
).all();

const indicadorCodigo = indicadorNome.match(/i-[A-Za-z]+/)?.[0] || indicadorNome;
const sqlPath = path.join(__dirname, `opcoes-update-${indicadorCodigo}.sql`);
fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n', 'utf8');

console.log('\n─── Resultado ─────────────────────────────────────────');
console.log(`  Fonte: ${indicadorNome}`);
console.log(`  Questões no JSON: ${questoes.length}`);
console.log(`  Atualizadas no banco: ${atualizadas}`);
if (semCodigoNoJson > 0) console.log(`  Sem codigo_questao no JSON: ${semCodigoNoJson}`);
if (naoNoBanco > 0) {
  console.log(`  Não encontradas no banco (${naoNoBanco}): ${naoEncontradas.slice(0, 5).join(', ')}${naoNoBanco > 5 ? '...' : ''}`);
}
console.log('\n  Tipos em questoes (banco completo):');
tiposResultante.forEach(r => console.log(`    ${(r.tipo || 'null').padEnd(18)} ${r.c}`));
console.log(`\n✓ SQL para D1 remoto: ${sqlPath}`);
console.log('  Para aplicar em produção:');
console.log(`  wrangler d1 execute compliance-iegm-dashboard --file=${sqlPath} --remote`);
console.log('────────────────────────────────────────────────────────\n');
