const XLSX = require('xlsx');
const workbook = XLSX.readFile('../data/iegm_minas_2024.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Sheet Name:', sheetName);
console.log('First 5 rows:', data.slice(0, 5));
