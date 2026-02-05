
import Database from 'better-sqlite3';
const db = new Database('local.db');

const columns = db.prepare(`PRAGMA table_info(respostas_detalhadas)`).all();
console.table(columns);
