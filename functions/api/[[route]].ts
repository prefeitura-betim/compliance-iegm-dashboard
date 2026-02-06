import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../src/db/schema';
import { eq, and, desc, asc, sql, count, avg, min, max, like } from 'drizzle-orm';
import { resultadosMunicipios, municipios as municipiosTable, indicadores, questionarios, questoes, respostas, questionarioRespostas } from '../../src/db/schema';

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

      case 'ranking':
        return await handleRanking(request, db, url);

      case 'estatisticas':
        return await handleEstatisticas(request, db, url);
      case 'stats': // alias
        return await handleEstatisticas(request, db, url);

      case 'faixas-distribuicao':
        return await handleFaixasDistribuicao(request, db, url);
      case 'faixas': // alias
        return await handleFaixasDistribuicao(request, db, url);

      case 'analise-dimensoes':
        return await handleAnaliseDimensoes(request, db, url);

      case 'respostas-detalhadas':
        return await handleRespostasDetalhadas(request, db, url);

      case 'comparativo-ano-anterior':
        return await handleComparativoAnoAnterior(request, db, url);

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
  const rankingResults = results.map((item, index) => ({
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
  let tribunal = url.searchParams.get('tribunal');
  const municipio = url.searchParams.get('municipio');
  const indicador = url.searchParams.get('indicador');

  if (!tribunal) tribunal = 'TCEMG';

  if (!ano) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: ano' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const whereConditions = [
    eq(questionarioRespostas.anoRef, parseInt(ano)),
    // eq(questionarioRespostas.tribunalId, 2) // TCEMG
  ];

  if (municipio) {
    whereConditions.push(eq(municipiosTable.nome, municipio));
  }

  if (indicador) {
    whereConditions.push(eq(indicadores.codigo, indicador));
  }

  const results = await db
    .select({
      id: respostas.id,
      tribunalId: questionarioRespostas.tribunalId,
      tribunal: sql<string>`'TCEMG'`,
      codigoIbge: municipiosTable.codigoIbge,
      municipio: municipiosTable.nome,
      indicador: indicadores.codigo,
      questao: questoes.texto,
      resposta: respostas.resposta,
      pontuacao: respostas.nota,
      peso: questoes.peso,
      nota: respostas.nota,
      anoRef: questionarioRespostas.anoRef,
    })
    .from(respostas)
    .innerJoin(questionarioRespostas, eq(respostas.questionarioRespostaId, questionarioRespostas.id))
    .innerJoin(municipiosTable, eq(questionarioRespostas.municipioId, municipiosTable.id))
    .innerJoin(questoes, eq(respostas.questaoId, questoes.id))
    .innerJoin(questionarios, eq(questoes.questionarioId, questionarios.id))
    .innerJoin(indicadores, eq(questionarios.indicadorId, indicadores.id))
    .where(and(...whereConditions))
    .orderBy(desc(respostas.nota))
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
