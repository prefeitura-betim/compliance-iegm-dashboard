const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('../local.db');

// Load metadata map
let scoreMap = {};
try {
    const rawMap = fs.readFileSync('score_map.json', 'utf8');
    scoreMap = JSON.parse(rawMap);
} catch (e) {
    console.error("Could not load score_map.json");
    process.exit(1);
}

const indicators = ['i-Educ', 'i-Saude', 'i-Fiscal', 'i-Amb', 'i-Cidade', 'i-Plan', 'i-Gov TI'];

console.log("--- INDICATOR DATA HEALTH CHECK ---");
console.log(String("INDICATOR").padEnd(10) + " | " + String("ROWS").padEnd(6) + " | " + String("MATCHED").padEnd(8) + " | " + String("ATTENTION (S=0, M>0)").padEnd(22));
console.log("-".repeat(60));

indicators.forEach(ind => {
    const rows = db.prepare(`SELECT * FROM respostas_detalhadas WHERE indicador = ? AND ano_ref = 2024`).all(ind);

    let matched = 0;
    let attention = 0;

    rows.forEach(r => {
        // Try all keys
        const k = r.chave_questao || r.rotulo || r.questao_id;
        const maxScore = scoreMap[k];

        if (maxScore !== undefined) {
            matched++;
            if ((r.nota || 0) === 0 && maxScore > 0) {
                attention++;
            }
        }
    });

    console.log(
        String(ind).padEnd(10) + " | " +
        String(rows.length).padEnd(6) + " | " +
        String(matched).padEnd(8) + " | " +
        String(attention).padEnd(22)
    );
});
