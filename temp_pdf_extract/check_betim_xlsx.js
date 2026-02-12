const XLSX = require('xlsx');
const workbook = XLSX.readFile('../data/Relatorio_Betim_Completo.xlsx');
console.log('Sheet Names:', workbook.SheetNames);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log('First 5 rows of first sheet:', data.slice(0, 5));
