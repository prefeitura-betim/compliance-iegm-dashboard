import { eq, and, desc, sql, avg } from 'drizzle-orm';
import { DatabaseService } from '../database/index';
import { HttpClient } from '../api/httpClient';
import type {
  RespostaDetalhada,
  AnaliseMelhoria,
  PontoForte,
  PontoMelhoria,
  DimensaoAnalise,
  ComparativoAnoAnterior,
  RespostasQuery
} from './types';
import {
  resultadosMunicipios,
  municipios as municipiosTable,
  respostas,
  questoes,
  questionarioRespostas,
  questionarios,
  indicadores
} from '../../db/schema';

export class AnaliseService {
  private db: DatabaseService;
  private httpClient: HttpClient;

  constructor(dbService: DatabaseService) {
    this.db = dbService;
    this.httpClient = new HttpClient(dbService.getApiBaseUrl());
  }

  // ============================================================================
  // ANÁLISE DE DIMENSÕES
  // ============================================================================

  async getDimensaoAnalise(municipio: string, ano: number): Promise<DimensaoAnalise[]> {
    if (!this.db.isDirectD1()) {
      return this.getDimensaoAnaliseFromAPI(municipio, ano);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      // Buscar dados do município
      const municipioData = await db
        .select()
        .from(resultadosMunicipios)
        .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
        .where(
          and(
            eq(municipiosTable.nome, municipio),
            eq(resultadosMunicipios.anoRef, ano)
          )
        )
        .limit(1);

      if (!municipioData[0]) {
        return [];
      }

      const data = municipioData[0];
      const dimensoes = [
        { nome: 'Educação', score: data.resultados_municipios.percentualIeduc || 0, campo: 'percentualIeduc' },
        { nome: 'Saúde', score: data.resultados_municipios.percentualIsaude || 0, campo: 'percentualIsaude' },
        { nome: 'Gestão Fiscal', score: data.resultados_municipios.percentualIfiscal || 0, campo: 'percentualIfiscal' },
        { nome: 'Meio Ambiente', score: data.resultados_municipios.percentualIamb || 0, campo: 'percentualIamb' },
        { nome: 'Cidades', score: data.resultados_municipios.percentualIcidade || 0, campo: 'percentualIcidade' },
        { nome: 'Planejamento', score: data.resultados_municipios.percentualIplan || 0, campo: 'percentualIplan' },
        { nome: 'Governança TI', score: data.resultados_municipios.percentualIgovTi || 0, campo: 'percentualIgovTi' }
      ];

      // Calcular médias estaduais
      const mediasEstaduais = await this.getMediasEstaduais(ano);

      return dimensoes.map(dim => {
        const mediaEstadual = mediasEstaduais[dim.campo] || 0;
        const diferencial = dim.score - mediaEstadual;
        const grade = this.getGrade(dim.score);
        const ranking = this.calcularRanking(dim.score, (mediasEstaduais[`ranking_${dim.campo}`] as any) || []);

        return {
          nome: dim.nome,
          score: dim.score,
          grade,
          ranking,
          diferencial,
          mediaEstadual
        };
      });
    } catch (error) {
      console.error('Error analyzing dimensions from database:', error);
      return this.getDimensaoAnaliseFromAPI(municipio, ano);
    }
  }

  async getPontosFortes(municipio: string, ano: number): Promise<PontoForte[]> {
    const dimensoes = await this.getDimensaoAnalise(municipio, ano);

    return dimensoes
      .filter(dim => dim.diferencial > 0.05) // 5% acima da média
      .map(dim => ({
        nome: dim.nome,
        score: dim.score,
        diferenca: dim.diferencial
      }))
      .sort((a, b) => b.diferenca - a.diferenca)
      .slice(0, 3); // Top 3
  }

  async getPontosMelhoria(municipio: string, ano: number): Promise<PontoMelhoria[]> {
    const dimensoes = await this.getDimensaoAnalise(municipio, ano);

    return dimensoes
      .filter(dim => dim.score < 0.6 || dim.diferencial < -0.05) // Score baixo ou abaixo da média
      .map(dim => ({
        nome: dim.nome,
        score: dim.score,
        diferenca: Math.abs(dim.diferencial),
        motivo: this.getMotivoMelhoria(dim)
      }))
      .sort((a, b) => b.diferenca - a.diferenca)
      .slice(0, 3); // Top 3
  }

  // ============================================================================
  // ANÁLISE DE RESPOSTAS DETALHADAS
  // ============================================================================

  async getRespostasDetalhadas(query: RespostasQuery): Promise<RespostaDetalhada[]> {
    if (!this.db.isDirectD1()) {
      return this.getRespostasDetalhadasFromAPI(query);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      const whereConditions = [
        eq(questionarioRespostas.anoRef, query.ano),
        eq(questionarioRespostas.tribunalId, 1) // TCEMG
      ];

      if (query.municipio) {
        whereConditions.push(eq(municipiosTable.nome, query.municipio));
      }

      if (query.indicador) {
        whereConditions.push(eq(indicadores.codigo, query.indicador));
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

      return results;
    } catch (error) {
      console.error('Error fetching detailed responses from database:', error);
      return this.getRespostasDetalhadasFromAPI(query);
    }
  }

  async getAnaliseMelhorias(municipio: string, ano: number): Promise<AnaliseMelhoria[]> {
    const respostas = await this.getRespostasDetalhadas({
      ano,
      tribunal: 'TCEMG',
      municipio
    });

    // Se temos respostas detalhadas, usar elas
    if (respostas.length > 0) {
      return respostas
        .filter(resp => (resp.nota || 0) < 500) // Score baixo (< 50%)
        .map(resp => ({
          indicador: resp.indicador,
          questao: resp.questao,
          respostaAtual: resp.resposta || 'Sem resposta',
          pontuacaoAtual: resp.nota || 0,
          pontuacaoMaxima: 1000,
          impacto: ((1000 - (resp.nota || 0)) / 1000) * 100,
          recomendacao: this.getRecomendacao(resp.indicador, resp.questao)
        }))
        .sort((a, b) => b.impacto - a.impacto)
        .slice(0, 10); // Top 10
    }

    // Se não temos respostas detalhadas, gerar baseado nos scores dimensionais
    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      // Buscar dados do município
      const municipioResult = await db
        .select({
          percentualIeduc: resultadosMunicipios.percentualIeduc,
          percentualIsaude: resultadosMunicipios.percentualIsaude,
          percentualIfiscal: resultadosMunicipios.percentualIfiscal,
          percentualIamb: resultadosMunicipios.percentualIamb,
          percentualIcidade: resultadosMunicipios.percentualIcidade,
          percentualIplan: resultadosMunicipios.percentualIplan,
          percentualIgovTi: resultadosMunicipios.percentualIgovTi,
        })
        .from(resultadosMunicipios)
        .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
        .where(
          and(
            eq(municipiosTable.nome, municipio),
            eq(resultadosMunicipios.anoRef, ano)
          )
        )
        .limit(1);

      if (municipioResult.length === 0) return [];

      const municipioData = municipioResult[0];
      const medias = await this.getMediasEstaduais(ano);

      const dimensoes = [
        { nome: 'Educação', valor: municipioData.percentualIeduc, media: medias.percentualIeduc, indicador: 'i-Educ' },
        { nome: 'Saúde', valor: municipioData.percentualIsaude, media: medias.percentualIsaude, indicador: 'i-Saude' },
        { nome: 'Gestão Fiscal', valor: municipioData.percentualIfiscal, media: medias.percentualIfiscal, indicador: 'i-Fiscal' },
        { nome: 'Meio Ambiente', valor: municipioData.percentualIamb, media: medias.percentualIamb, indicador: 'i-Amb' },
        { nome: 'Cidades', valor: municipioData.percentualIcidade, media: medias.percentualIcidade, indicador: 'i-Cidade' },
        { nome: 'Planejamento', valor: municipioData.percentualIplan, media: medias.percentualIplan, indicador: 'i-Plan' },
        { nome: 'Governança TI', valor: municipioData.percentualIgovTi, media: medias.percentualIgovTi, indicador: 'i-Gov TI' }
      ];

      return dimensoes
        .filter(dim => dim.valor !== null && dim.valor < 0.6)
        .map(dim => {
          const valor = dim.valor || 0;
          const impacto = (0.6 - valor) * 100;
          const specificQuestion = this.generateSpecificQuestions(dim.nome, valor, dim.media || 0);
          const specificRecommendation = this.generateSpecificRecommendations(dim.nome, valor);

          return {
            indicador: dim.indicador,
            questao: specificQuestion,
            respostaAtual: `${(valor * 100).toFixed(1)}%`,
            pontuacaoAtual: valor * 100,
            pontuacaoMaxima: 100,
            impacto: Math.round(impacto),
            recomendacao: specificRecommendation
          };
        })
        .sort((a, b) => b.impacto - a.impacto)
        .slice(0, 10);
    } catch (error) {
      console.error('Error generating analysis from database:', error);
      return [];
    }
  }

  // ============================================================================
  // COMPARAÇÃO TEMPORAL
  // ============================================================================

  async getComparativoAnoAnterior(municipio: string, anoAtual: number): Promise<ComparativoAnoAnterior> {
    if (!this.db.isDirectD1()) {
      return this.getComparativoAnoAnteriorFromAPI(municipio, anoAtual);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      const anoAnterior = anoAtual - 1;

      const [dadosAtual, dadosAnterior] = await Promise.all([
        db
          .select({ percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio })
          .from(resultadosMunicipios)
          .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
          .where(
            and(
              eq(municipiosTable.nome, municipio),
              eq(resultadosMunicipios.anoRef, anoAtual)
            )
          )
          .limit(1),
        db
          .select({ percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio })
          .from(resultadosMunicipios)
          .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
          .where(
            and(
              eq(municipiosTable.nome, municipio),
              eq(resultadosMunicipios.anoRef, anoAnterior)
            )
          )
          .limit(1)
      ]);

      const scoreAtual = dadosAtual[0]?.percentualIegmMunicipio || 0;
      const scoreAnterior = dadosAnterior[0]?.percentualIegmMunicipio || 0;
      const variacao = scoreAnterior > 0 ? (scoreAtual - scoreAnterior) / scoreAnterior : 0;

      return {
        variacao,
        anoAnterior: scoreAnterior,
        anoAtual: scoreAtual
      };
    } catch (error) {
      console.error('Error getting year comparison from database:', error);
      return this.getComparativoAnoAnteriorFromAPI(municipio, anoAtual);
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private generateSpecificQuestions(dimensao: string, score: number, media: number): string {
    const questions = {
      'Educação': [
        'Qualidade da gestão educacional municipal',
        'Investimento em infraestrutura escolar',
        'Formação continuada de professores',
        'Acompanhamento do desempenho escolar',
        'Transparência na aplicação de recursos da educação'
      ],
      'Saúde': [
        'Gestão da rede de atenção básica',
        'Qualidade dos serviços de saúde pública',
        'Investimento em equipamentos médicos',
        'Capacitação dos profissionais de saúde',
        'Controle de qualidade dos serviços prestados'
      ],
      'Gestão Fiscal': [
        'Transparência na execução orçamentária',
        'Controle interno e auditoria',
        'Gestão da dívida pública',
        'Eficiência na arrecadação tributária',
        'Planejamento financeiro de longo prazo'
      ],
      'Meio Ambiente': [
        'Gestão de resíduos sólidos',
        'Preservação de áreas verdes',
        'Controle da poluição ambiental',
        'Educação ambiental da população',
        'Licenciamento ambiental de atividades'
      ],
      'Cidades': [
        'Planejamento urbano e territorial',
        'Mobilidade urbana e transporte público',
        'Saneamento básico e infraestrutura',
        'Segurança pública e iluminação',
        'Acessibilidade e inclusão urbana'
      ],
      'Planejamento': [
        'Elaboração e execução do PPA',
        'Monitoramento de indicadores estratégicos',
        'Participação social no planejamento',
        'Integração entre políticas públicas',
        'Avaliação de resultados e impactos'
      ],
      'Governança TI': [
        'Modernização dos sistemas de informação',
        'Transparência digital e governo eletrônico',
        'Segurança da informação',
        'Capacitação em tecnologia da informação',
        'Integração de sistemas municipais'
      ]
    };

    const dimensionQuestions = questions[dimensao as keyof typeof questions] || [];
    const scorePercent = score * 100;
    const mediaPercent = media * 100;

    // Selecionar questão baseada no score
    let selectedQuestion = dimensionQuestions[0];

    if (scorePercent < 30) {
      selectedQuestion = dimensionQuestions[0]; // Questão mais crítica
    } else if (scorePercent < 50) {
      selectedQuestion = dimensionQuestions[1] || dimensionQuestions[0];
    } else if (scorePercent < 70) {
      selectedQuestion = dimensionQuestions[2] || dimensionQuestions[1] || dimensionQuestions[0];
    } else {
      selectedQuestion = dimensionQuestions[3] || dimensionQuestions[2] || dimensionQuestions[0];
    }

    // Adicionar contexto baseado na comparação com a média
    let context = '';
    if (scorePercent < mediaPercent - 10) {
      context = ' (Abaixo da média estadual)';
    } else if (scorePercent > mediaPercent + 10) {
      context = ' (Acima da média estadual)';
    }

    return selectedQuestion + context;
  }

  private generateSpecificRecommendations(dimensao: string, score: number): string {
    const scorePercent = score * 100;

    const recommendations = {
      'Educação': {
        low: 'Implementar programa de formação continuada para professores e melhorar a infraestrutura escolar com recursos do FUNDEB.',
        medium: 'Ampliar o monitoramento do desempenho escolar e fortalecer a gestão democrática nas escolas.',
        high: 'Manter os bons resultados e expandir as boas práticas para outras áreas da educação.'
      },
      'Saúde': {
        low: 'Investir na modernização da rede básica de saúde e capacitar profissionais para melhorar a qualidade dos serviços.',
        medium: 'Implementar sistema de monitoramento da qualidade dos serviços e fortalecer a atenção primária.',
        high: 'Expandir as boas práticas e investir em tecnologia para otimizar os serviços de saúde.'
      },
      'Gestão Fiscal': {
        low: 'Implementar sistema de controle interno robusto e melhorar a transparência na execução orçamentária.',
        medium: 'Aprimorar o planejamento financeiro de longo prazo e fortalecer a auditoria interna.',
        high: 'Manter a excelência na gestão fiscal e compartilhar boas práticas com outros municípios.'
      },
      'Meio Ambiente': {
        low: 'Desenvolver programa de gestão de resíduos sólidos e implementar educação ambiental nas escolas.',
        medium: 'Ampliar as áreas verdes urbanas e fortalecer o controle da poluição ambiental.',
        high: 'Expandir as iniciativas ambientais e buscar certificações de sustentabilidade.'
      },
      'Cidades': {
        low: 'Investir em infraestrutura urbana básica e desenvolver plano de mobilidade urbana.',
        medium: 'Melhorar a integração entre planejamento urbano e políticas de desenvolvimento.',
        high: 'Manter a qualidade dos serviços urbanos e expandir as iniciativas de smart city.'
      },
      'Planejamento': {
        low: 'Elaborar PPA participativo e implementar sistema de monitoramento de indicadores.',
        medium: 'Fortalecer a integração entre políticas públicas e ampliar a participação social.',
        high: 'Manter a excelência no planejamento e expandir as boas práticas para outras áreas.'
      },
      'Governança TI': {
        low: 'Investir na modernização dos sistemas de informação e implementar governo eletrônico.',
        medium: 'Ampliar a transparência digital e fortalecer a segurança da informação.',
        high: 'Expandir as iniciativas de inovação tecnológica e buscar certificações de excelência.'
      }
    };

    const dimRecs = recommendations[dimensao as keyof typeof recommendations];
    if (!dimRecs) return 'Implementar melhorias específicas nesta área.';

    if (scorePercent < 40) return dimRecs.low;
    if (scorePercent < 70) return dimRecs.medium;
    return dimRecs.high;
  }

  private getGrade(score: number): string {
    if (score >= 0.8) return 'A';
    if (score >= 0.6) return 'B+';
    if (score >= 0.4) return 'B';
    if (score >= 0.2) return 'C+';
    return 'C';
  }

  private getMotivoMelhoria(dimensao: DimensaoAnalise): string {
    if (dimensao.score < 0.3) return 'Score muito baixo - necessita intervenção urgente';
    if (dimensao.score < 0.6) return 'Score abaixo do recomendado - precisa de melhoria';
    if (dimensao.diferencial < -0.1) return 'Abaixo da média estadual - precisa de atenção';
    return 'Oportunidade de melhoria identificada';
  }

  private getRecomendacao(indicador: string, _questao: string): string {
    const recomendacoes: Record<string, string> = {
      'i-Educ': 'Implementar políticas educacionais estruturadas e monitoramento de resultados',
      'i-Saude': 'Melhorar infraestrutura de saúde e gestão de recursos',
      'i-Fiscal': 'Aprimorar transparência fiscal e controle interno',
      'i-Amb': 'Desenvolver políticas ambientais e gestão de resíduos',
      'i-Cidade': 'Investir em mobilidade urbana e planejamento territorial',
      'i-Plan': 'Estabelecer planejamento estratégico e monitoramento de indicadores',
      'i-GovTI': 'Modernizar sistemas de TI e transparência digital'
    };

    return recomendacoes[indicador] || 'Implementar melhorias específicas nesta área';
  }

  private async getMediasEstaduais(ano: number): Promise<Record<string, number>> {
    try {
      const db = this.db.getDb();
      if (!db) return {};

      const stats = await db
        .select({
          mediaIeduc: avg(resultadosMunicipios.percentualIeduc),
          mediaIsaude: avg(resultadosMunicipios.percentualIsaude),
          mediaIfiscal: avg(resultadosMunicipios.percentualIfiscal),
          mediaIamb: avg(resultadosMunicipios.percentualIamb),
          mediaIcidade: avg(resultadosMunicipios.percentualIcidade),
          mediaIplan: avg(resultadosMunicipios.percentualIplan),
          mediaIgovTi: avg(resultadosMunicipios.percentualIgovTi),
        })
        .from(resultadosMunicipios)
        .where(
          and(
            eq(resultadosMunicipios.anoRef, ano),
            eq(resultadosMunicipios.tribunalId, 1) // TCEMG
          )
        );

      return {
        percentualIeduc: Number(stats[0]?.mediaIeduc) || 0,
        percentualIsaude: Number(stats[0]?.mediaIsaude) || 0,
        percentualIfiscal: Number(stats[0]?.mediaIfiscal) || 0,
        percentualIamb: Number(stats[0]?.mediaIamb) || 0,
        percentualIcidade: Number(stats[0]?.mediaIcidade) || 0,
        percentualIplan: Number(stats[0]?.mediaIplan) || 0,
        percentualIgovTi: Number(stats[0]?.mediaIgovTi) || 0,
      };
    } catch (error) {
      console.error('Error getting state averages:', error);
      return {};
    }
  }

  private calcularRanking(score: number, scores: number[]): number {
    const sortedScores = [...scores].sort((a, b) => b - a);
    return sortedScores.findIndex(s => s <= score) + 1;
  }

  // ============================================================================
  // FALLBACK PARA API
  // ============================================================================

  private async getDimensaoAnaliseFromAPI(municipio: string, ano: number): Promise<DimensaoAnalise[]> {
    const response = await this.httpClient.get<DimensaoAnalise[]>('analise-dimensoes', { municipio, ano });
    return response.success ? response.data : [];
  }

  private async getRespostasDetalhadasFromAPI(query: RespostasQuery): Promise<RespostaDetalhada[]> {
    const response = await this.httpClient.get<RespostaDetalhada[]>('respostas-detalhadas', query);
    return response.success ? response.data : [];
  }

  private async getComparativoAnoAnteriorFromAPI(municipio: string, anoAtual: number): Promise<ComparativoAnoAnterior> {
    const response = await this.httpClient.get<ComparativoAnoAnterior>('comparativo-ano-anterior', {
      municipio,
      anoAtual
    });
    return response.success ? response.data : {
      variacao: 0,
      anoAnterior: 0,
      anoAtual: 0
    };
  }
}
