const fs = require("fs");
const Database = require("better-sqlite3");
const db = new Database("local.db");

const mapping = {
  "M02Q07220": " (Atenção Básica - Consultas)",
  "M02Q09720": " (Exames Laboratoriais)",
  "M02Q10906": " (Atenção Especializada - Consultas)",
  "M02Q09884": " (Atenção Especializada - Exames)"
};

let sqlLines = [
  "-- Atualização de textos para remover ambiguidades no i-Saude",
  ""
];

let mods = 0;
for (const [cod, suffix] of Object.entries(mapping)) {
    const row = db.prepare("SELECT texto FROM questoes WHERE chave_questao = ?").get(cod);
    if (row && !row.texto.endsWith(suffix)) {
        const newText = row.texto.trim() + suffix;
        const escaped = newText.replace(/'/g, "''");
        sqlLines.push(`UPDATE questoes SET texto = '${escaped}' WHERE chave_questao = '${cod}';`);
        
        try {
            db.prepare(`UPDATE questoes SET texto = ? WHERE chave_questao = ?`).run(newText, cod);
            mods++;
        } catch (err) {
            console.log(`DB locked or err on ${cod}:`, err.message);
        }
    }
}

console.log(`Updated ${mods} textos in local DB.`);
fs.writeFileSync("src/db/migrations/0013_isaude_disambiguation.sql", sqlLines.join("\n") + "\n", "utf8");
