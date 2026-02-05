/**
 * Script para verificar estrutura dos arquivos XLSX
 */

import XLSX from 'xlsx';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');

// Ler arquivo de notas
console.log('📊 Verificando estrutura: iegm_minas_2024.xlsx');
const notasWb = XLSX.readFile(join(dataDir, 'iegm_minas_2024.xlsx'));
const notasSheet = notasWb.Sheets[notasWb.SheetNames[0]];
const notasData = XLSX.utils.sheet_to_json(notasSheet, { header: 1 });
console.log('Colunas:', notasData[0]);
console.log('Primeira linha de dados:', notasData[1]);
console.log('Total de linhas:', notasData.length);
console.log('');

// Ler arquivo de respostas
console.log('📊 Verificando estrutura: respostas_iegm_i-Educ_2024.xlsx');
const respWb = XLSX.readFile(join(dataDir, 'respostas_iegm_i-Educ_2024.xlsx'));
const respSheet = respWb.Sheets[respWb.SheetNames[0]];
const respData = XLSX.utils.sheet_to_json(respSheet, { header: 1 });
console.log('Colunas:', respData[0]);
console.log('Primeira linha de dados:', respData[1]);
console.log('Total de linhas:', respData.length);
