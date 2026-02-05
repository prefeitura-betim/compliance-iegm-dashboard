
import fs from 'fs';
import iconv from 'iconv-lite';

const FILE_PATH = 'data/respostas_iegm_detalhadas_2024.csv';

// Ler os primeiros 1000 bytes
const buffer = Buffer.alloc(1000);
const fd = fs.openSync(FILE_PATH, 'r');
fs.readSync(fd, buffer, 0, 1000, 0);
fs.closeSync(fd);

// Tentar decodificar como utf16-le
// Remove BOM se existir
const decoded = iconv.decode(buffer, 'utf16-le');

console.log('--- Decoded Preview (utf16-le) ---');
console.log(decoded.split('\n').slice(0, 5).join('\n'));
