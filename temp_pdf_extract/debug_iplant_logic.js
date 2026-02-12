const fetch = require('node-fetch'); // Needs node-fetch or similar if running in node, but standard node 18+ has fetch.
// Actually, let's use the local database directly.
const Database = require('better-sqlite3');
const db = new Database('../local.db');

// 1. Fetch i-Plan answers for Betim 2024 (or default)
// We need to see the 'chave_questao' and 'rotulo' columns.
const rows = db.prepare(`
    SELECT * 
    FROM respostas_detalhadas 
    WHERE upper(municipio) = 'BETIM' 
    AND upper(indicador) = 'I-PLAN'
    AND ano_ref = 2024
`).all();

console.log(`Found ${rows.length} rows for i-Plan.`);

if (rows.length === 0) {
    console.log('No rows found. Check filters.');
    process.exit(1);
}

// 2. Load Metadata
// We can't import TS directly easily in this script without compilation, 
// so let's just read the JSON file or copy the structure if it matches score_map.json
const fs = require('fs');
// Assuming score_map.json is still there and accurate to what was put in TS
try {
    const rawMap = fs.readFileSync('score_map.json', 'utf8');
    const scoreMap = JSON.parse(rawMap);

    // 3. Check matches
    let matchCount = 0;
    let missedCount = 0;
    let potentialAttention = 0;

    rows.forEach(r => {
        const keysToTry = [r.chave_questao, r.rotulo, r.chaveQuestao, r.questao_id];
        let foundMax = undefined;
        let usedKey = '';

        for (const k of keysToTry) {
            if (k && scoreMap[k] !== undefined) {
                foundMax = scoreMap[k];
                usedKey = k;
                break;
            }
        }

        const nota = r.nota || 0;

        if (foundMax !== undefined) {
            matchCount++;
            if (nota === 0 && foundMax > 0) {
                potentialAttention++;
                console.log(`[ATTENTION] Key: ${usedKey} | Nota: ${nota} | Max: ${foundMax} | Q: ${r.questao.substring(0, 30)}...`);
            }
        } else {
            missedCount++;
            // Log unmatched items to see WHY
            if (missedCount < 5) {
                console.log(`[MISS] No metadata for keys: ${keysToTry.join(', ')} | Q: ${r.questao.substring(0, 30)}...`);
            }
        }
    });

    console.log(`\nSummary:`);
    console.log(`Total Rows: ${rows.length}`);
    console.log(`Matches in Metadata: ${matchCount}`);
    console.log(`Missed Metadata: ${missedCount}`);
    console.log(`Potential Attention Items (Nota=0, Max>0): ${potentialAttention}`);

} catch (e) {
    console.error('Error reading score map:', e);
}
