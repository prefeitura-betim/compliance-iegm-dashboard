import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './src/db/schema';

const sqlite = new Database('local.db');
const db = drizzle(sqlite, { schema });

async function test() {
    try {
        console.log('Querying questionarios...');
        const q1 = await db.select().from(schema.questionarios).limit(1);
        console.log('Result:', q1.length);

        console.log('Querying questoes...');
        const q2 = await db.select().from(schema.questoes).limit(1);
        console.log('Result:', q2.length);

        console.log('Querying respostas_detalhadas...');
        const q3 = await db.select().from(schema.respostasDetalhadas).limit(1);
        console.log('Result:', q3.length);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        sqlite.close();
    }
}

test();
