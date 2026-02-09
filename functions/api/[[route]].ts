/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../src/db/schema';
import { eq, and, desc, asc, sql, count, avg, min, max, like } from 'drizzle-orm';
import { resultadosMunicipios, municipios as municipiosTable, indicadores, questionarios, questoes, respostas, questionarioRespostas, tribunais, respostasDetalhadas } from '../../src/db/schema';

// Interface para o ambiente Cloudflare Pages
interface Env {
  DB: D1Database;
}

// Função para criar conexão D1 com Drizzle
function createD1Connection(d1: D1Database) {
  return drizzle(d1, { schema });
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function onRequestOptions(context: any) {
  return new Response(null, { headers: corsHeaders });
}

// Main handler
export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar conexão D1
    const db = createD1Connection(env.DB);

    // Rotas da API
    switch (path) {
      case 'municipios':
        return await handleMunicipios(request, db, url);

      case 'municipio':
        return await handleMunicipio(request, db, url);

      case 'municipio/nome':
        return await handleMunicipioByNome(request, db, url);

      case 'municipios-lista':
        return await handleMunicipiosLista(request, db, url);

      case 'ranking':
      case 'ranking-municipios':
        return await handleRanking(request, db, url);

      case 'estatisticas':
      case 'stats':
      case 'comparativo-estadual':
        return await handleEstatisticas(request, db, url);

      case 'faixas-distribuicao':
      case 'faixas':
        return await handleFaixasDistribuicao(request, db, url);

      case 'analise':
      case 'analise-dimensoes':
        return await handleAnaliseDimensoes(request, db, url);

      case 'respostas-detalhadas':
      case 'municipio/respostas-detalhadas':
        return await handleRespostasDetalhadas(request, db, url);

      case 'comparativo-ano-anterior':
        return await handleComparativoAnoAnterior(request, db, url);

      case 'evolucao-questoes':
        return await handleEvolucaoQuestoes(request, db, url);

      case 'iegm-data':
        return await handleIEGMData(request, db, url);

      case 'tribunais':
        return await handleTribunais(request, db, url);

      case 'indicadores':
        return await handleIndicadores(request, db, url);

      case 'anos-disponiveis':
        return await handleAnosDisponiveis(request, db, url);

      default:
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handlers para cada endpoint
async function handleMunicipios(request: Request, db: any, url: URL) {
  const ano = url.searchParams.get('ano');
  let tribunal = url.searchParams.get('tribunal');
  const municipio = url.searchParams.get('municipio');
  const limit = parseInt(url.searchParams.get('limit') || '1000');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // Se tribunal não for informado, usar TCEMG
  if (!tribunal) tribunal = 'TCEMG';

  if (!ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const whereConditions = [
    eq(resultadosMunicipios.anoRef, parseInt(ano)),
    // eq(resultadosMunicipios.tribunalId, 2) // TCEMG
  ];

  if (municipio) {
    whereConditions.push(like(municipiosTable.nome, `%${municipio}%`));
  }

  const results = await db
    .select({
      id: resultadosMunicipios.id,
      tribunalId: resultadosMunicipios.tribunalId,
      tribunal: sql<string>`'TCEMG'`,
      municipioId: resultadosMunicipios.municipioId,
      codigoIbge: municipiosTable.codigoIbge,
      municipio: municipiosTable.nome,
      anoRef: resultadosMunicipios.anoRef,
      percentualIamb: resultadosMunicipios.percentualIamb,
      percentualIcidade: resultadosMunicipios.percentualIcidade,
      percentualIeduc: resultadosMunicipios.percentualIeduc,
      percentualIfiscal: resultadosMunicipios.percentualIfiscal,
      percentualIgovTi: resultadosMunicipios.percentualIgovTi,
      percentualIsaude: resultadosMunicipios.percentualIsaude,
      percentualIplan: resultadosMunicipios.percentualIplan,
      percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
      faixaIamb: resultadosMunicipios.faixaIamb,
      faixaIcidade: resultadosMunicipios.faixaIcidade,
      faixaIeduc: resultadosMunicipios.faixaIeduc,
      faixaIfiscal: resultadosMunicipios.faixaIfiscal,
      faixaIgovTi: resultadosMunicipios.faixaIgovTi,
      faixaIsaude: resultadosMunicipios.faixaIsaude,
      faixaIplan: resultadosMunicipios.faixaIplan,
      faixaIegmMunicipio: resultadosMunicipios.faixaIegmMunicipio,
    })
    .from(resultadosMunicipios)
    .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
    .where(and(...whereConditions))
    .orderBy(desc(resultadosMunicipios.percentualIegmMunicipio))
    .limit(limit)
    .offset(offset);

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRanking(request: Request, db: any, url: URL) {
  const ano = url.searchParams.get('ano');
  let tribunal = url.searchParams.get('tribunal');
  const limit = parseInt(url.searchParams.get('limit') || '1000');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  if (!tribunal) tribunal = 'TCEMG';

  if (!ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results = await db
    .select({
      codigoIbge: municipiosTable.codigoIbge,
      municipio: municipiosTable.nome,
      percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
      faixaIegmMunicipio: resultadosMunicipios.faixaIegmMunicipio,
    })
    .from(resultadosMunicipios)
    .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
    .where(
      and(
        eq(resultadosMunicipios.anoRef, parseInt(ano)),
        // eq(resultadosMunicipios.tribunalId, 2) // TCEMG
      )
    )
    .orderBy(desc(resultadosMunicipios.percentualIegmMunicipio))
    .limit(limit)
    .offset(offset);

  // Calcular ranking
  const rankingResults = results.map((item: any, index: number) => ({
    ...item,
    ranking: index + 1 + offset,
    totalMunicipios: results.length
  }));

  return new Response(JSON.stringify(rankingResults), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleEstatisticas(request: Request, db: any, url: URL) {
  const ano = url.searchParams.get('ano');
  let tribunal = url.searchParams.get('tribunal');
  if (!tribunal) tribunal = 'TCEMG';

  if (!ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const stats = await db
    .select({
      totalMunicipios: count(),
      mediaIegm: avg(resultadosMunicipios.percentualIegmMunicipio),
      minIegm: min(resultadosMunicipios.percentualIegmMunicipio),
      maxIegm: max(resultadosMunicipios.percentualIegmMunicipio),
      mediaIamb: avg(resultadosMunicipios.percentualIamb),
      mediaIcidade: avg(resultadosMunicipios.percentualIcidade),
      mediaIeduc: avg(resultadosMunicipios.percentualIeduc),
      mediaIfiscal: avg(resultadosMunicipios.percentualIfiscal),
      mediaIgovTi: avg(resultadosMunicipios.percentualIgovTi),
      mediaIsaude: avg(resultadosMunicipios.percentualIsaude),
      mediaIplan: avg(resultadosMunicipios.percentualIplan),
    })
    .from(resultadosMunicipios)
    .where(
      and(
        eq(resultadosMunicipios.anoRef, parseInt(ano)),
        // eq(resultadosMunicipios.tribunalId, 2) // TCEMG
      )
    );

  return new Response(JSON.stringify(stats[0]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleFaixasDistribuicao(request: Request, db: any, url: URL) {
  const ano = url.searchParams.get('ano');

  if (!ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const faixas = await db
    .select({
      faixa: resultadosMunicipios.faixaIegmMunicipio,
      quantidade: count(),
    })
    .from(resultadosMunicipios)
    .where(
      and(
        eq(resultadosMunicipios.anoRef, parseInt(ano)),
        // eq(resultadosMunicipios.tribunalId, 2) // TCEMG
      )
    )
    .groupBy(resultadosMunicipios.faixaIegmMunicipio)
    .orderBy(asc(resultadosMunicipios.faixaIegmMunicipio));

  return new Response(JSON.stringify(faixas), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAnaliseDimensoes(request: Request, db: any, url: URL) {
  const municipio = url.searchParams.get('municipio');
  const ano = url.searchParams.get('ano');

  if (!municipio || !ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameters: municipio, ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Buscar dados do município
  const municipioData = await db
    .select()
    .from(resultadosMunicipios)
    .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
    .where(
      and(
        eq(municipiosTable.nome, municipio),
        eq(resultadosMunicipios.anoRef, parseInt(ano))
      )
    )
    .limit(1);

  if (!municipioData[0]) {
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const data = municipioData[0];
  const dimensoes = [
    { nome: 'Educação', score: data.resultados_municipios.percentualIeduc || 0 },
    { nome: 'Saúde', score: data.resultados_municipios.percentualIsaude || 0 },
    { nome: 'Gestão Fiscal', score: data.resultados_municipios.percentualIfiscal || 0 },
    { nome: 'Meio Ambiente', score: data.resultados_municipios.percentualIamb || 0 },
    { nome: 'Cidades', score: data.resultados_municipios.percentualIcidade || 0 },
    { nome: 'Planejamento', score: data.resultados_municipios.percentualIplan || 0 },
    { nome: 'Governança TI', score: data.resultados_municipios.percentualIgovTi || 0 }
  ];

  return new Response(JSON.stringify(dimensoes), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRespostasDetalhadas(request: Request, db: any, url: URL) {
  const ano = url.searchParams.get('ano');
  const municipio = url.searchParams.get('municipio');
  const indicador = url.searchParams.get('indicador');

  if (!ano || !municipio) {
    return new Response(JSON.stringify({ error: 'Missing required parameters: ano, municipio' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Normalizar município para busca (remover espaços e transformar em maiúsculas)
  const searchMunicipio = municipio.trim().toUpperCase();

  const whereConditions = [
    eq(respostasDetalhadas.anoRef, parseInt(ano)),
    sql`UPPER(${respostasDetalhadas.municipio}) LIKE ${`%${searchMunicipio}%`}`
  ];

  if (indicador) {
    // Normalizar indicador (ex: i-Educ ou EDUC)
    const cleanIndicador = indicador.trim().replace(/^i-/, '').replace(/^i/, '').toUpperCase();
    whereConditions.push(sql`UPPER(${respostasDetalhadas.indicador}) LIKE ${`%${cleanIndicador}%`}`);
  }

  const results = await db
    .select()
    .from(respostasDetalhadas)
    .where(and(...whereConditions))
    .orderBy(desc(respostasDetalhadas.nota))
    .limit(1000);

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleComparativoAnoAnterior(request: Request, db: any, url: URL) {
  const municipio = url.searchParams.get('municipio');
  const anoAtual = url.searchParams.get('anoAtual');

  if (!municipio || !anoAtual) {
    return new Response(JSON.stringify({ error: 'Missing required parameters: municipio, anoAtual' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const anoAnterior = parseInt(anoAtual) - 1;

  // Buscar dados do ano atual
  const dadosAtual = await db
    .select({
      percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
    })
    .from(resultadosMunicipios)
    .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
    .where(
      and(
        eq(municipiosTable.nome, municipio),
        eq(resultadosMunicipios.anoRef, parseInt(anoAtual))
      )
    )
    .limit(1);

  // Buscar dados do ano anterior
  const dadosAnterior = await db
    .select({
      percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
    })
    .from(resultadosMunicipios)
    .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
    .where(
      and(
        eq(municipiosTable.nome, municipio),
        eq(resultadosMunicipios.anoRef, anoAnterior)
      )
    )
    .limit(1);

  const comparativo = {
    anoAtual: parseInt(anoAtual),
    anoAnterior,
    scoreAtual: dadosAtual[0]?.percentualIegmMunicipio || 0,
    scoreAnterior: dadosAnterior[0]?.percentualIegmMunicipio || 0,
    variacao: (dadosAtual[0]?.percentualIegmMunicipio || 0) - (dadosAnterior[0]?.percentualIegmMunicipio || 0),
    evolucao: dadosAtual[0]?.percentualIegmMunicipio > dadosAnterior[0]?.percentualIegmMunicipio ? 'melhorou' : 'piorou'
  };

  return new Response(JSON.stringify(comparativo), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
async function handleMunicipio(request: Request, db: any, url: URL) {
  const id = url.searchParams.get('id');
  const ano = url.searchParams.get('ano');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results = await db
    .select()
    .from(municipiosTable)
    .where(eq(municipiosTable.id, parseInt(id)));

  return new Response(JSON.stringify(results[0] || null), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleIEGMData(request: Request, db: any, url: URL) {
  const municipioId = url.searchParams.get('municipioId');
  const ano = url.searchParams.get('ano');

  if (!municipioId || !ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameters: municipioId, ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results = await db
    .select()
    .from(resultadosMunicipios)
    .where(
      and(
        eq(resultadosMunicipios.municipioId, parseInt(municipioId)),
        eq(resultadosMunicipios.anoRef, parseInt(ano))
      )
    );

  return new Response(JSON.stringify(results[0] || null), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleTribunais(request: Request, db: any, url: URL) {
  const results = await db.select().from(tribunais);
  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleIndicadores(request: Request, db: any, url: URL) {
  const results = await db.select().from(indicadores);
  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAnosDisponiveis(request: Request, db: any, url: URL) {
  const results = await db
    .select({ ano: resultadosMunicipios.anoRef })
    .from(resultadosMunicipios)
    .groupBy(resultadosMunicipios.anoRef);

  const anos = results.map((r: any) => r.ano);

  return new Response(JSON.stringify(anos), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleMunicipioByNome(request: Request, db: any, url: URL) {
  const nome = url.searchParams.get('nome');
  const ano = url.searchParams.get('ano');

  if (!nome || !ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameters: nome, ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results = await db
    .select({
      municipio: municipiosTable.nome,
      anoRef: resultadosMunicipios.anoRef,
      percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
      faixaIegmMunicipio: resultadosMunicipios.faixaIegmMunicipio,
      percentualIamb: resultadosMunicipios.percentualIamb,
      percentualIcidade: resultadosMunicipios.percentualIcidade,
      percentualIeduc: resultadosMunicipios.percentualIeduc,
      percentualIfiscal: resultadosMunicipios.percentualIfiscal,
      percentualIgovTi: resultadosMunicipios.percentualIgovTi,
      percentualIsaude: resultadosMunicipios.percentualIsaude,
      percentualIplan: resultadosMunicipios.percentualIplan,
    })
    .from(resultadosMunicipios)
    .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
    .where(
      and(
        eq(municipiosTable.nome, nome.toUpperCase()),
        eq(resultadosMunicipios.anoRef, parseInt(ano))
      )
    )
    .limit(1);

  return new Response(JSON.stringify(results[0] || null), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleMunicipiosLista(request: Request, db: any, url: URL) {
  const ano = url.searchParams.get('ano');

  if (!ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results = await db
    .select({ nome: municipiosTable.nome })
    .from(resultadosMunicipios)
    .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
    .where(eq(resultadosMunicipios.anoRef, parseInt(ano)))
    .groupBy(municipiosTable.nome);

  const nomes = results.map((r: any) => r.nome);

  return new Response(JSON.stringify(nomes), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleEvolucaoQuestoes(request: Request, db: any, url: URL) {
  const municipio = url.searchParams.get('municipio');

  if (!municipio) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: municipio' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Normalizar município para busca
  const searchMunicipio = municipio.trim().toUpperCase();

  // Buscar todas as respostas para este município em qualquer ano
  const results = await db
    .select()
    .from(respostasDetalhadas)
    .where(sql`UPPER(${respostasDetalhadas.municipio}) LIKE ${`%${searchMunicipio}%`}`)
    .orderBy(asc(respostasDetalhadas.anoRef), asc(respostasDetalhadas.indicador));

  // Agrupar por texto da questão para facilitar o consumo no frontend
  const evolucao: Record<string, {
    questao: string;
    indicador: string;
    historico: Array<{
      ano: number;
      resposta: string;
      pontuacao: number;
      nota: number;
    }>;
  }> = {};

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
      ano: row.anoRef,
      resposta: row.resposta,
      pontuacao: row.pontuacao,
      nota: row.nota
    });
  });

  // Converter para array e filtrar apenas as que começaram negativas (pontuacao = 0) em 2022
  const finalResults = Object.values(evolucao).filter(item => {
    const start2022 = item.historico.find(h => h.ano === 2022);
    // Só incluir se tiver dado em 2022 E a pontuação for 0
    return start2022 && start2022.pontuacao === 0;
  });

  return new Response(JSON.stringify(finalResults), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
