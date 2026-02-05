
import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'local.db');
const db = new Database(DB_PATH);

console.log('--- Checking for BETIM ---');
const countBetim = db.prepare("SELECT count(*) as count FROM respostas_detalhadas WHERE upper(municipio) = 'BETIM'").get();
console.log('Total rows for BETIM:', countBetim);

console.log('--- Sample rows for BETIM ---');
const sample = db.prepare("SELECT * FROM respostas_detalhadas WHERE upper(municipio) = 'BETIM' LIMIT 5").all();
console.log(sample);

console.log('--- List of distinct municipalities (top 10) ---');
const cities = db.prepare("SELECT distinct municipio FROM respostas_detalhadas LIMIT 10").all();
console.log(cities);
