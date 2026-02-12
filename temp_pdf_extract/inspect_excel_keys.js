const xlsx = require('xlsx');

const wb = xlsx.readFile('../data/Relatorio_Betim_Completo.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

if (data.length > 0) {
    console.log('Keys in first row:', Object.keys(data[0]));
    console.log('First row sample:', data[0]);
} else {
    console.log('Sheet is empty or failed to parse.');
}
