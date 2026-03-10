/**
 * API Local para servir dados IEGM do SQLite
 * Execute: yarn tsx scripts/api-server.ts
 */

import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

const PORT = 8787;
const DB_PATH = 'local.db';

// Verificar banco de dados
if (!existsSync(DB_PATH)) {
    console.error('❌ Banco local.db não encontrado!');
    console.log('   Execute: yarn db:migrate && yarn data:seed');
    process.exit(1);
}

const db = new Database(DB_PATH);
const app = express();

// Criar tabela de KV simulado (para rascunhos com TTL)
db.prepare(`
  CREATE TABLE IF NOT EXISTS kv_temp (
    key TEXT PRIMARY KEY,
    value TEXT,
    expires_at INTEGER
  )
`).run();

// Limpeza automática de rascunhos expirados a cada reinicialização
db.prepare('DELETE FROM kv_temp WHERE expires_at < ?').run(Math.floor(Date.now() / 1000));

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
});

/**
 * Cloudflare KV Emulation Endpoints
 */

// Salvar rascunho (PUT simulado)
app.post('/api/kv/put', (req, res) => {
    try {
        const { key, value, ttl } = req.body;
        if (!key || !value) return res.status(400).json({ error: 'Key e Value são obrigatórios' });

        const expiresAt = ttl ? Math.floor(Date.now() / 1000) + ttl : null;
        
        db.prepare('INSERT OR REPLACE INTO kv_temp (key, value, expires_at) VALUES (?, ?, ?)')
          .run(key, value, expiresAt);

        res.json({ success: true, key, expiresAt });
    } catch (error) {
        console.error('Erro em /api/kv/put:', error);
        res.status(500).json({ error: 'Erro ao salvar no KV' });
    }
});

// Recuperar rascunho (GET simulado)
app.get('/api/kv/get', (req, res) => {
    try {
        const { key } = req.query;
        if (!key) return res.status(400).json({ error: 'Key é obrigatória' });

        const now = Math.floor(Date.now() / 1000);
        const record = db.prepare('SELECT value FROM kv_temp WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)')
                        .get(key, now) as any;

        if (!record) return res.json({ value: null });
        res.json({ value: record.value });
    } catch (error) {
        console.error('Erro em /api/kv/get:', error);
        res.status(500).json({ error: 'Erro ao buscar no KV' });
    }
});

// ============================================================================
// ROTAS DA API
// ============================================================================

/**
 * GET /api/municipios
 * Lista todos os municípios com seus resultados
 */
app.get('/api/municipios', (req, res) => {
    try {
        const { ano, tribunal } = req.query;
        const anoRef = ano ? parseInt(ano as string) : 2024;

        const municipios = db.prepare(`
      SELECT 
        m.id,
        t.codigo as tribunal,
        t.id as tribunal_id,
        m.id as municipio_id,
        m.codigo_ibge as "codigoIbge",
        m.nome as municipio,
        r.ano_ref as "anoRef",
        r.percentual_iamb as "percentualIamb",
        r.percentual_icidade as "percentualIcidade",
        r.percentual_ieduc as "percentualIeduc",
        r.percentual_ifiscal as "percentualIfiscal",
        r.percentual_igov_ti as "percentualIgovTi",
        r.percentual_isaude as "percentualIsaude",
        r.percentual_iplan as "percentualIplan",
        r.percentual_iegm_municipio as "percentualIegmMunicipio",
        r.faixa_iamb as "faixaIamb",
        r.faixa_icidade as "faixaIcidade",
        r.faixa_ieduc as "faixaIeduc",
        r.faixa_ifiscal as "faixaIfiscal",
        r.faixa_igov_ti as "faixaIgovTi",
        r.faixa_isaude as "faixaIsaude",
        r.faixa_iplan as "faixaIplan",
        r.faixa_iegm_municipio as "faixaIegmMunicipio"
      FROM municipios m
      LEFT JOIN resultados_municipios r ON m.id = r.municipio_id
      LEFT JOIN tribunais t ON r.tribunal_id = t.id
      WHERE r.ano_ref = ?
      ORDER BY m.nome
    `).all(anoRef);

        res.json(municipios);
    } catch (error) {
        console.error('Erro em /api/municipios:', error);
        res.status(500).json({ error: 'Erro ao buscar municípios' });
    }
});

/**
 * GET /api/municipio/nome
 * Busca município pelo nome
 */
app.get('/api/municipio/nome', (req, res) => {
    try {
        const { nome, ano } = req.query;
        const anoRef = ano ? parseInt(ano as string) : 2024;
        const municipioNome = (nome as string || '').toUpperCase();

        const municipio = db.prepare(`
      SELECT 
        m.id,
        t.codigo as tribunal,
        t.id as tribunal_id,
        m.id as municipio_id,
        m.codigo_ibge as "codigoIbge",
        m.nome as municipio,
        r.ano_ref as "anoRef",
        r.percentual_iamb as "percentualIamb",
        r.percentual_icidade as "percentualIcidade",
        r.percentual_ieduc as "percentualIeduc",
        r.percentual_ifiscal as "percentualIfiscal",
        r.percentual_igov_ti as "percentualIgovTi",
        r.percentual_isaude as "percentualIsaude",
        r.percentual_iplan as "percentualIplan",
        r.percentual_iegm_municipio as "percentualIegmMunicipio",
        r.faixa_iamb as "faixaIamb",
        r.faixa_icidade as "faixaIcidade",
        r.faixa_ieduc as "faixaIeduc",
        r.faixa_ifiscal as "faixaIfiscal",
        r.faixa_igov_ti as "faixaIgovTi",
        r.faixa_isaude as "faixaIsaude",
        r.faixa_iplan as "faixaIplan",
        r.faixa_iegm_municipio as "faixaIegmMunicipio"
      FROM municipios m
      LEFT JOIN resultados_municipios r ON m.id = r.municipio_id
      LEFT JOIN tribunais t ON r.tribunal_id = t.id
      WHERE m.nome = ? AND r.ano_ref = ?
    `).get(municipioNome, anoRef);

        if (municipio) {
            res.json(municipio);
        } else {
            res.status(404).json({ error: 'Município não encontrado' });
        }
    } catch (error) {
        console.error('Erro em /api/municipio/nome:', error);
        res.status(500).json({ error: 'Erro ao buscar município' });
    }
});

/**
 * GET /api/ranking-municipios
 * Retorna ranking de municípios ordenado por IEGM
 */
app.get('/api/ranking-municipios', (req, res) => {
    try {
        const { ano, tribunal, limit } = req.query;
        const anoRef = ano ? parseInt(ano as string) : 2024;
        const maxLimit = limit ? parseInt(limit as string) : 100;

        const ranking = db.prepare(`
      SELECT 
        m.codigo_ibge as "codigoIbge",
        m.nome as municipio,
        r.percentual_iegm_municipio as "percentualIegmMunicipio",
        r.faixa_iegm_municipio as "faixaIegmMunicipio"
      FROM resultados_municipios r
      JOIN municipios m ON r.municipio_id = m.id
      WHERE r.ano_ref = ?
        AND r.percentual_iegm_municipio IS NOT NULL
      ORDER BY r.percentual_iegm_municipio DESC
      LIMIT ?
    `).all(anoRef, maxLimit);

        // Adicionar ranking e total
        const total = (db.prepare(`
      SELECT COUNT(*) as total 
      FROM resultados_municipios 
      WHERE ano_ref = ? AND percentual_iegm_municipio IS NOT NULL
    `).get(anoRef) as { total: number }).total;

        const rankingWithPosition = ranking.map((r: any, index: number) => ({
            ...r,
            ranking: index + 1,
            totalMunicipios: total
        }));

        res.json(rankingWithPosition);
    } catch (error) {
        console.error('Erro em /api/ranking-municipios:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});

/**
 * GET /api/comparativo-estadual
 * Retorna estatísticas estaduais
 */
app.get('/api/comparativo-estadual', (req, res) => {
    try {
        const { ano } = req.query;
        const anoRef = ano ? parseInt(ano as string) : 2024;

        const stats = db.prepare(`
      SELECT 
        COUNT(*) as "totalMunicipios",
        AVG(percentual_iegm_municipio) as "mediaIegm",
        MIN(percentual_iegm_municipio) as "minIegm",
        MAX(percentual_iegm_municipio) as "maxIegm",
        AVG(percentual_iamb) as "mediaIamb",
        AVG(percentual_icidade) as "mediaIcidade",
        AVG(percentual_ieduc) as "mediaIeduc",
        AVG(percentual_ifiscal) as "mediaIfiscal",
        AVG(percentual_igov_ti) as "mediaIgovTi",
        AVG(percentual_isaude) as "mediaIsaude",
        AVG(percentual_iplan) as "mediaIplan"
      FROM resultados_municipios
      WHERE ano_ref = ?
        AND percentual_iegm_municipio IS NOT NULL
    `).get(anoRef);

        res.json(stats);
    } catch (error) {
        console.error('Erro em /api/comparativo-estadual:', error);
        res.status(500).json({ error: 'Erro ao buscar comparativo estadual' });
    }
});

/**
 * GET /api/tribunais
 * Lista tribunais
 */
app.get('/api/tribunais', (req, res) => {
    try {
        const tribunais = db.prepare('SELECT * FROM tribunais').all();
        res.json(tribunais);
    } catch (error) {
        console.error('Erro em /api/tribunais:', error);
        res.status(500).json({ error: 'Erro ao buscar tribunais' });
    }
});

/**
 * GET /api/indicadores
 * Lista indicadores
 */
app.get('/api/indicadores', (req, res) => {
    try {
        const indicadores = db.prepare('SELECT * FROM indicadores ORDER BY ordem').all();
        res.json(indicadores);
    } catch (error) {
        console.error('Erro em /api/indicadores:', error);
        res.status(500).json({ error: 'Erro ao buscar indicadores' });
    }
});

/**
 * GET /api/anos-disponiveis
 * Lista anos com dados disponíveis
 */
app.get('/api/anos-disponiveis', (req, res) => {
    try {
        const anos = db.prepare(`
      SELECT DISTINCT ano_ref 
      FROM resultados_municipios 
      ORDER BY ano_ref DESC
    `).all().map((row: any) => row.ano_ref);

        res.json(anos);
    } catch (error) {
        console.error('Erro em /api/anos-disponiveis:', error);
        res.status(500).json({ error: 'Erro ao buscar anos disponíveis' });
    }
});

/**
 * GET /api/municipios-lista
 * Lista simples de nomes de municípios (para filtros)
 */
app.get('/api/municipios-lista', (req, res) => {
    try {
        const { ano } = req.query;
        const anoRef = ano ? parseInt(ano as string) : 2024;

        const municipios = db.prepare(`
      SELECT DISTINCT m.nome
      FROM municipios m
      JOIN resultados_municipios r ON m.id = r.municipio_id
      WHERE r.ano_ref = ?
      ORDER BY m.nome
    `).all(anoRef).map((row: any) => row.nome);

        res.json(municipios);
    } catch (error) {
        console.error('Erro em /api/municipios-lista:', error);
        res.status(500).json({ error: 'Erro ao buscar lista de municípios' });
    }
});

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// ROTAS DE RESPOSTAS DETALHADAS
// ============================================================================

/**
 * GET /api/municipio/respostas-detalhadas
 * Busca as respostas detalhadas do município para um indicador específico
 */
app.get('/api/municipio/respostas-detalhadas', (req, res) => {
    try {
        const { municipio, indicador, ano } = req.query;
        const anoRef = ano ? parseInt(ano as string) : 2024;
        const municipioNome = (municipio as string || '').toUpperCase();

        let query = `
            SELECT * 
            FROM respostas_detalhadas 
            WHERE upper(municipio) = ? AND ano_ref = ?
        `;
        const params = [municipioNome, anoRef];

        if (indicador) {
            query += ` AND upper(indicador) = upper(?)`;
            params.push(indicador as string);
        }

        // Filtro para remover excesso de dados granulares (Ações, Programas, etc.) que poluem o i-Plan
        query += ` 
            AND questao NOT IN (
                'Ações', 'Código da Ação', 'Código do Programa', 'Descrição do Programa', 
                'Valor Estimado do Indicador', 'Valor Alcançado do Indicador', 
                'Meta Física Estimada', 'Meta Física Alcançada', 'VALOR LIQUIDADO', 
                'Dotação Final', 'Descrição', 'Quantidade de Programas:',
                'Código da Atividade/Projeto/Operação Especial', 'Dotação Inicial'
            )
        `;

        query += ` ORDER BY indicador, questao`;

        const respostas = db.prepare(query).all(...params);
        res.json(respostas);
    } catch (error) {
        console.error('Erro em /api/municipio/respostas-detalhadas:', error);
        res.status(500).json({ error: 'Erro ao buscar respostas detalhadas' });
    }
});

/**
 * GET /api/analise/melhoria
 * Retorna sugestões de melhoria baseadas nas respostas negativas
 */
app.get('/api/analise/melhoria', (req, res) => {
    try {
        const { municipio, indicador, ano } = req.query;
        const anoRef = ano ? parseInt(ano as string) : 2024;
        const municipioNome = (municipio as string || '').toUpperCase();

        // Otimização de Performance:
        // ÍNDICE COMPOSTO CRIADO: (questao, ano_ref, pontuacao)
        // Isso permite que o SQLite responda ao EXISTS usando apenas o índice (Covering Index scan).
        let query = `
            SELECT r.* 
            FROM respostas_detalhadas r
            WHERE upper(r.municipio) = ? AND r.ano_ref = ?
            AND r.pontuacao = 0
            AND r.resposta <> '' 
            -- Validação via índice composto (Rápido)
            AND EXISTS (
                SELECT 1 
                FROM respostas_detalhadas r2 
                WHERE r2.questao = r.questao 
                AND r2.ano_ref = r.ano_ref 
                AND r2.pontuacao > 0
            )
        `;

        const params = [municipioNome, anoRef];

        if (indicador) {
            query += ` AND upper(r.indicador) = upper(?)`;
            params.push(indicador as string);
        }

        query += ` ORDER BY r.indicador LIMIT 100`;

        const respostasNegativas = db.prepare(query).all(...params);

        const analise = respostasNegativas.map((r: any) => ({
            indicador: r.indicador,
            questao: r.questao,
            rotulo: r.rotulo, // Novo campo para identificar duplicatas
            respostaAtual: r.resposta,
            pontuacaoAtual: 0,
            pontuacaoMaxima: 100, // Assumindo base 100 ou peso
            impacto: 10,
            recomendacao: `Rever item: ${r.questao}`
        }));

        res.json(analise);
    } catch (error) {
        console.error('Erro em /api/analise/melhoria:', error);
        res.status(500).json({ error: 'Erro ao gerar análise de melhoria' });
    }
});

/**
 * GET /api/evolucao-questoes
 * Retorna evolução histórica de perguntas para um município
 */
app.get('/api/evolucao-questoes', (req, res) => {
    try {
        const { municipio } = req.query;
        if (!municipio) {
            return res.status(400).json({ error: 'Município é obrigatório' });
        }

        const searchMunicipio = (municipio as string).toUpperCase();

        const results = db.prepare(`
            SELECT * 
            FROM respostas_detalhadas 
            WHERE upper(municipio) = ?
            ORDER BY ano_ref ASC, indicador ASC
        `).all(searchMunicipio);

        // Agrupar por questao
        const evolucao: Record<string, any> = {};

        results.forEach((row: any) => {
            const key = `${row.indicador}|${row.questao}`.trim();
            if (!evolucao[key]) {
                evolucao[key] = {
                    questao: row.questao,
                    indicador: row.indicador,
                    historico: []
                };
            }
            evolucao[key].historico.push({
                ano: row.ano_ref,
                resposta: row.resposta,
                pontuacao: row.pontuacao,
                nota: row.nota
            });
        });

        // Retornar todas as questões que têm histórico COMPLETO (2022, 2023 e 2024)
        // O frontend fará a filtragem de sucesso vs regressão
        const finalResults = Object.values(evolucao).filter((item: any) => {
            const anos = item.historico.map((h: any) => h.ano);
            return [2022, 2023, 2024].every(ano => anos.includes(ano));
        });


        res.json(finalResults);
    } catch (error) {
        console.error('Erro em /api/evolucao-questoes:', error);
        res.status(500).json({ error: 'Erro ao buscar evolução de questões' });
    }
});

// ============================================================================
// ROTAS DE SIMULADO
// ============================================================================

/**
 * GET /api/simulado/questoes
 * Retorna as questões do simulado para um indicador específico (fixo no ano 2024)
 */
app.get('/api/simulado/questoes', (req, res) => {
    try {
        const { indicador } = req.query;

        if (!indicador) {
            return res.status(400).json({ error: 'Indicador é obrigatório' });
        }

        const indicadorData = db.prepare('SELECT id FROM indicadores WHERE UPPER(codigo) = UPPER(?)').get(indicador as string) as { id: number } | undefined;

        if (!indicadorData) {
            return res.status(404).json({ error: 'Indicador não encontrado' });
        }

        const filters = [
            'Ações', 'Código da Ação', 'Código do Programa', 'Descrição do Programa', 
            'Valor Estimado do Indicador', 'Valor Alcançado do Indicador', 
            'Meta Física Estimada', 'Meta Física Alcançada', 'VALOR LIQUIDADO', 
            'Dotação Final', 'Descrição', 'Quantidade de Programas:',
            'Código da Atividade/Projeto/Operação Especial', 'Dotação Inicial'
        ];
        const placeholders = filters.map(() => '?').join(',');

        // Buscar questões e cruzar com a resposta de referência de Betim 2024
        const questoes = db.prepare(`
            SELECT 
                q.id,
                q.chave_questao as "chaveQuestao",
                q.texto,
                q.indice_questao as "indiceQuestao",
                r.resposta as "respostaRef",
                r.nota as "notaRef",
                CASE 
                    WHEN r.resposta IN ('Sim', 'Não', 'S', 'N') THEN 'boolean'
                    ELSE 'text'
                END as tipo
            FROM questoes q
            JOIN questionarios quest ON q.questionario_id = quest.id
            LEFT JOIN respostas_detalhadas r ON q.chave_questao = r.chave_questao 
                AND r.municipio = 'BETIM' 
                AND r.ano_ref = 2024
            WHERE quest.indicador_id = ? 
            AND quest.ano_ref = 2024
            AND q.texto NOT IN (${placeholders})
            ORDER BY q.id ASC
        `).all(indicadorData.id, ...filters);

        res.json(questoes);
    } catch (error) {
        console.error('Erro em /api/simulado/questoes:', error);
        res.status(500).json({ error: 'Erro ao buscar questões do simulado' });
    }
});

/**
 * POST /api/simulado/enviar
 * Salva as respostas do simulado
 */
app.post('/api/simulado/enviar', (req, res) => {
    try {
        const { nome, funcao, setor, indicadorCodigo, respostas } = req.body;

        if (!nome || !indicadorCodigo || !respostas || !Array.isArray(respostas)) {
            return res.status(400).json({ error: 'Corpo da requisição inválido' });
        }

        const criadoEm = new Date().toISOString();

        // Inserir respostas em lote usando transação
        const inTransaction = db.transaction((respostasList) => {
            const stmt = db.prepare(`
                INSERT INTO simulado_respostas 
                (nome, funcao, setor, indicador_codigo, questao_id, chave_questao, texto_questao, resposta, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const r of respostasList) {
                stmt.run(
                    nome,
                    funcao,
                    setor,
                    indicadorCodigo,
                    r.questaoId,
                    r.chaveQuestao,
                    r.textoQuestao,
                    r.resposta,
                    criadoEm
                );
            }
        });

        inTransaction(respostas);

        res.json({ success: true, count: respostas.length });
    } catch (error) {
        console.error('Erro em /api/simulado/enviar:', error);
        res.status(500).json({ error: 'Erro ao salvar respostas do simulado' });
    }
});
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 API IEGM Local rodando!');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('');
    console.log('Endpoints disponíveis:');
    console.log(`  GET /api/municipios?ano=2024&tribunal=TCEMG`);
    console.log(`  GET /api/municipio/nome?nome=BETIM&ano=2024`);
    console.log(`  GET /api/ranking-municipios?ano=2024&limit=100`);
    console.log(`  GET /api/comparativo-estadual?ano=2024`);
    console.log(`  GET /api/tribunais`);
    console.log(`  GET /api/indicadores`);
    console.log(`  GET /api/anos-disponiveis`);
    console.log(`  GET /api/health`);
    console.log('');
    console.log('Pressione Ctrl+C para parar.');
});

// Fechar banco ao sair
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
