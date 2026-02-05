
import Database from 'better-sqlite3';
const db = new Database('local.db');
try {
    const row = db.prepare('SELECT count(*) as total FROM respostas_detalhadas WHERE ano_ref = 2024').get() as { total: number };
    console.log(`Total records: ${row.total}`);
} catch (e) {
    console.error(e);
}
