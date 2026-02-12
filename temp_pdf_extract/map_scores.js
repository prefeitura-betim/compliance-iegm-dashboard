const fs = require('fs');
const XLSX = require('xlsx');

// 1. Read Excel Data for ALL questions
const workbook = XLSX.readFile('../data/Relatorio_Betim_Completo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(sheet);

console.log(`Loaded ${excelData.length} rows from Excel.`);

// Normalize function for text matching
function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]/g, '') // remove all non-alphanumeric
        .substring(0, 50); // compare first 50 chars? or full?
}

// 2. Read Manual Text
const text = fs.readFileSync('manual_iegm_extracted_final.txt', 'utf8');
const lines = text.split('\n');

const manualItems = [];
const questRegex = /^(\d+(\.\d+)+)\s+(.+)/;
const pmaxRegex = /Pontuação máxima.*=\s*(\d+)/i;

let currentQ = null;
lines.forEach((line, idx) => {
    const qMatch = line.match(questRegex);
    if (qMatch) {
        currentQ = {
            id: qMatch[1],
            text: qMatch[3].trim(),
            norm: normalize(qMatch[3]),
            idx
        };
    }
    const pMatch = line.match(pmaxRegex);
    if (pMatch && currentQ && (idx - currentQ.idx) < 30) {
        manualItems.push({
            ...currentQ,
            pmax: parseInt(pMatch[1]),
        });
        currentQ = null;
    }
});

console.log(`Found ${manualItems.length} manual scoring items.`);

// 3. Match
let matched = 0;
const finalMap = {}; // llave_questao -> pmax

// Use a Set to avoid duplicates
const processedKeys = new Set();

excelData.forEach(row => {
    if (processedKeys.has(row.chave_questao)) return;

    const rowNorm = normalize(row.questao);

    // Find matching manual item
    const match = manualItems.find(m => {
        // Simple inclusion check or exact match of normalized string
        return rowNorm.includes(m.norm) || m.norm.includes(rowNorm);
    });

    if (match) {
        finalMap[row.chave_questao] = match.pmax;
        matched++;
        processedKeys.add(row.chave_questao);
    }
});

console.log(`Matched ${matched} questions to scores.`);
fs.writeFileSync('score_map.json', JSON.stringify(finalMap, null, 2));
