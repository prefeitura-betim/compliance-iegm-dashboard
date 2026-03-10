import Database from 'better-sqlite3';
import XLSX from 'xlsx';

console.log("🚀 Lendo arquivo Excel de Betim...");
const wb = XLSX.readFile('data/Relatorio_Betim_Completo.xlsx');
const sheet = wb.Sheets['Dados Completos'];
const data = XLSX.utils.sheet_to_json(sheet) as any[];

const db = new Database('./local.db');

// Limpar dados anteriores (apenas se quisermos garantir, mas aqui vamos usar INSERT IGNORE)
// db.prepare("DELETE FROM questoes").run();
// db.prepare("DELETE FROM questionarios").run();

const insertQuestionario = db.prepare(`
  INSERT OR REPLACE INTO questionarios (id, tribunal_id, indicador_id, ano_ref, nome, codigo)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertQuestao = db.prepare(`
  INSERT OR REPLACE INTO questoes (id, questionario_id, questao_id, sequencia_bloco_repeticao, indice_questao, chave_questao, texto, peso, resposta_ref, nota_ref, tipo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let questionariosInseridos = 0;
let questoesInseridas = 0;

const processar = db.transaction(() => {
  // 1. Procurar ID do tribunal
  const tribunal = db.prepare("SELECT id FROM tribunais WHERE codigo = 'TCEMG'").get() as any;
  if (!tribunal) throw new Error("Tribunal TCEMG não encontrado.");

  // 2. Extrair dados únicos (Questionários de 2024)
  const questionariosUnicos = new Map();
  const questoesUnicas = new Map();

  for (const row of data) {
    if (row.ano_ref === 2024) {
      // Indicador (Normalizar i-Gov TI para i-GovTI)
      const indicadorCodigo = row.indicador === 'i-Gov TI' ? 'i-GovTI' : row.indicador;
      const indicadorRow = db.prepare("SELECT id FROM indicadores WHERE codigo = ?").get(indicadorCodigo) as any;
      if (!indicadorRow) continue; 
      
      const qCode = row.questionario_id;
      if (!questionariosUnicos.has(qCode)) {
        insertQuestionario.run(
          qCode,
          tribunal.id,
          indicadorRow.id,
          2024,
          row.nome_questionario || row.indicador,
          row.nome_questionario || row.indicador
        );
        questionariosUnicos.set(qCode, true);
        questionariosInseridos++;
      }

      const questaoIdInterno = row.questao_id || row.chave_questao;
      if (!questoesUnicas.has(questaoIdInterno)) {
        // Detectar tipo: se o texto contém padrões de Sim/Não
        const textoQuestao = row.questao || '';
        const tipo = (textoQuestao.includes('Sim ou não') || textoQuestao.includes('(S ou N)')) ? 'boolean' : 'text';
        
        insertQuestao.run(
          row.questao_id && typeof row.questao_id === 'number' ? row.questao_id : null, 
          qCode,
          row.questao_id ? String(row.questao_id) : row.chave_questao,
          row.sequencia_bloco_repeticao || 0,
          row.indice_questao || null,
          row.chave_questao || '',
          textoQuestao,
          1.0,
          row.resposta || null, // resposta_ref
          row.nota || 0,        // nota_ref
          tipo
        );
        questoesUnicas.set(questaoIdInterno, true);
        questoesInseridas++;
      }
    }
  }
});

try {
  processar();
  console.log(`✅ Sucesso! Inseridos: ${questionariosInseridos} questionários e ${questoesInseridas} questões de 2024.`);
} catch (e) {
  console.error("❌ Falha:", e);
} finally {
  db.close();
}
