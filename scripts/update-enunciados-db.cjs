const fs = require("fs");
const Database = require("better-sqlite3");
const db = new Database("local.db");

const json = JSON.parse(fs.readFileSync("scripts/i-Educ.JSON", "utf8"));
const questoes = Object.values(json.questoes || json);

let sqlLines = [
  "-- Atualização de enunciados para remover ambiguidades/repetições",
  "-- Fonte: scripts/i-Educ.JSON",
  ""
];

let mods = 0;
questoes.forEach(q => {
  if (q.enunciado.includes("(Creche)") || q.enunciado.includes("(Pré-escola)") || q.enunciado.includes("(Anos Iniciais)") || q.enunciado.includes("(Anos Finais)")) {
    const escaped = q.enunciado.replace(/'/g, "''");
    sqlLines.push(`UPDATE questoes SET enunciado = '${escaped}' WHERE chave_questao = '${q.codigo_questao}';`);
    
    try {
      db.prepare(`UPDATE questoes SET enunciado = ? WHERE chave_questao = ?`).run(q.enunciado, q.codigo_questao);
      mods++;
    } catch (err) {
      console.log(`DB locked or err on ${q.codigo_questao}:`, err.message);
    }
  }
});

console.log(`Updated ${mods} enunciados in local DB.`);

fs.writeFileSync("scripts/enunciados-update-i-Educ.sql", sqlLines.join("\n") + "\n", "utf8");

// Combine into 0008 migration
const mig0008 = fs.readFileSync("src/db/migrations/0008_ieduc_tipos_opcoes_respostas.sql", "utf8");
fs.writeFileSync("src/db/migrations/0008_ieduc_tipos_opcoes_respostas.sql", mig0008 + "\n" + sqlLines.join("\n") + "\n", "utf8");
