const fs = require('fs');
const XLSX = require('xlsx');

// 1. Read Excel Data
const workbook = XLSX.readFile('../data/Relatorio_Betim_Completo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(sheet);
// Create a map of Questao Chave/Rotulo -> Data
const excelMap = {};
excelData.forEach(row => {
    // We can use 'rotulo' (e.g. '001.') or 'indice_questao' 
    // The manual uses '1.0', Excel uses '001.'. We need a fuzzy match or normalization.
    // Let's print some examples to see the correlation
    if (row.indicador === 'i-Educ') { // Limit to one indicator first
        excelMap[row.rotulo] = row;
    }
});

console.log('Excel Rotulo Examples:', Object.keys(excelMap).slice(0, 10));

// 2. Read Extracted Text
const text = fs.readFileSync('manual_iegm_extracted_final.txt', 'utf8');
const manualMappings = [];
const lines = text.split('\n');
const questRegex = /^(\d+(\.\d+)+)\s+(.+)/;
const pmaxRegex = /Pontuação máxima.*=\s*(\d+)/i;

let currentQ = null;
lines.forEach((line, idx) => {
    const qMatch = line.match(questRegex);
    if (qMatch) {
        currentQ = { id: qMatch[1], text: qMatch[3].trim(), idx };
    }
    const pMatch = line.match(pmaxRegex);
    if (pMatch && currentQ && (idx - currentQ.idx) < 20) {
        manualMappings.push({
            manualVal: currentQ.id,
            pmax: parseInt(pMatch[1]),
            text: currentQ.text
        });
        currentQ = null;
    }
});

console.log('Manual ID Examples:', manualMappings.map(m => m.manualVal).slice(0, 5));

// 3. Try Auto-Match
// Manual: 1.0 -> Excel: 001. ?
// Manual: 1.1 -> Excel: 001.001. ?
// This mapping looks disjointed. We might need to rely on TEXT Matching.
