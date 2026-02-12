const Database = require('better-sqlite3');
const xlsx = require('xlsx');
const db = new Database('../local.db');

// 1. Get sample from DB
const dbRows = db.prepare("SELECT questao FROM respostas_detalhadas WHERE indicador = 'i-Plan' LIMIT 3").all();

// 2. Get sample from Excel
const wb = xlsx.readFile('../data/Relatorio_Betim_Completo.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const excelRows = xlsx.utils.sheet_to_json(sheet).filter(r => r['Sigla Índice'] === 'i-Plan').slice(0, 3);

console.log('--- DB SAMPLES ---');
dbRows.forEach(r => console.log(`"${r.questao}"`));

console.log('\n--- EXCEL SAMPLES ---');
excelRows.forEach(r => console.log(`"${r['Questão']}"`));

// Check length and char codes of first item if they look similar
if (dbRows.length > 0 && excelRows.length > 0) {
    const dbStr = dbRows[0].questao;
    // Find a somewhat matching excel string to compare
    const excelMatch = excelRows.find(r => r['Questão'].includes(dbStr.substring(0, 10)));

    if (excelMatch) {
        const exStr = excelMatch['Questão'];
        console.log(`\nComparing:\nDB: "${dbStr}"\nEX: "${exStr}"`);
        console.log(`DB Len: ${dbStr.length}, EX Len: ${exStr.length}`);
    }
}
