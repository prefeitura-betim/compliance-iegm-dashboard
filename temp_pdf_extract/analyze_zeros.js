const XLSX = require('xlsx');
const workbook = XLSX.readFile('../data/Relatorio_Betim_Completo.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows:', data.length);

// Find examples of 0 scores
const zeros = data.filter(r => r.nota === 0);
console.log('Rows with 0 score:', zeros.length);

console.log('Sample 0-score rows:');
console.log(zeros.slice(0, 5));

// Check if any row has a different structure or extra fields
// Do we have any rows with 'peso' or 'tipo'? 
// keys are: municipio, indicador, questao, ...
console.log('Keys:', Object.keys(data[0]));
