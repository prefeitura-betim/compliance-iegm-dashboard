const Database = require('better-sqlite3');
const xlsx = require('xlsx');
const db = new Database('../local.db');

// 1. Alter Table to add missing columns
const columnsToAdd = [
    { name: 'chave_questao', type: 'TEXT' },
    { name: 'rotulo', type: 'TEXT' },
    { name: 'questao_id', type: 'TEXT' },
    { name: 'indice_questao', type: 'TEXT' }
];

const existingCols = db.prepare("PRAGMA table_info('respostas_detalhadas')").all().map(c => c.name);

console.log('Adding missing columns...');
db.transaction(() => {
    columnsToAdd.forEach(col => {
        if (!existingCols.includes(col.name)) {
            try {
                db.prepare(`ALTER TABLE respostas_detalhadas ADD COLUMN ${col.name} ${col.type}`).run();
                console.log(`Added column: ${col.name}`);
            } catch (e) {
                console.error(`Error adding ${col.name}:`, e.message);
            }
        } else {
            console.log(`Column ${col.name} already exists.`);
        }
    });
})();

// 2. Load Excel Data to Map Keys
console.log('Loading Excel data...');
// Adjusted path based on `find` result: ../data/Relatorio_Betim_Completo.xlsx relative to temp_pdf_extract
const wb = xlsx.readFile('../data/Relatorio_Betim_Completo.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

console.log(`Loaded ${data.length} rows from Excel.`);

// 3. Update Rows in Database
console.log('Updating database rows matched by question text...');
const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ')
        .trim();
};

let updatedCount = 0;
let notFoundCount = 0;

db.transaction(() => {
    // Pre-calculate normalized map from DB to avoid N*M complexity if possible, 
    // BUT since we are iterating Excel and updating DB, we need to match DB rows.
    // Efficient approach: 
    // 1. Fetch all DB rows for the indicator with their IDs and normalized text.
    // 2. Iterate Excel, find match in in-memory DB map, Get DB ID.
    // 3. Update by DB ID.

    // Let's refactor the whole loop to be efficient.

    // Group Excel data by indicator to minimize DB fetches
    const excelByIndicador = {};
    data.forEach(row => {
        const ind = row['indicador'];
        if (!excelByIndicador[ind]) excelByIndicador[ind] = [];
        excelByIndicador[ind].push(row);
    });

    const indicators = Object.keys(excelByIndicador);

    indicators.forEach(ind => {
        // Fetch all DB questions for this indicator
        const dbQuestions = db.prepare(`SELECT id, questao FROM respostas_detalhadas WHERE indicador = ?`).all(ind);

        // Create map: NormalizedText -> DB_ID
        const dbMap = {};
        dbQuestions.forEach(q => {
            dbMap[normalize(q.questao)] = q.id;
        });

        const stmt = db.prepare(`UPDATE respostas_detalhadas SET chave_questao = ?, rotulo = ?, questao_id = ?, indice_questao = ? WHERE id = ?`);

        excelByIndicador[ind].forEach(row => {
            const qText = normalize(row['questao']);
            const dbId = dbMap[qText];

            if (dbId) {
                stmt.run(row['chave_questao'], row['rotulo'], row['questao_id'], row['indice_questao'], dbId);
                updatedCount++;
            } else {
                notFoundCount++;
                // console.log(`Miss for indicator ${ind}: ${qText.substring(0,30)}...`);
            }
        });
        console.log(`Processed ${ind}.`);
    });

    // Remove old loop
    return;
    /* 
    data.forEach((row, i) => { ... old loop ... }); 
    */
})();

console.log(`\nMigration Complete.`);
console.log(`Updated Rows: ${updatedCount}`);
console.log(`Rows in Excel not matched in DB (by exact text): ${notFoundCount}`);
