// ============================================================================
// TIPOS DE FILTROS E CONFIGURAÇÕES
// ============================================================================

export interface IEGMFilters {
  ano?: number;
  tribunal?: string;
  municipio?: string;
  indicador?: string;
  faixa?: string;
}

export interface MunicipioConfig {
  ano: number;
  tribunal: string;
  municipio: string;
}

// ============================================================================
// TIPOS DE DADOS PRINCIPAIS
// ============================================================================

export interface Municipio {
  id: number;
  tribunalId: number;
  tribunal: string;
  municipioId: number;
  codigoIbge: string;
  municipio: string;
  anoRef: number;

  // Percentuais dos indicadores (novos nomes)
  percentualIamb: number | null;
  percentualIcidade: number | null;
  percentualIeduc: number | null;
  percentualIfiscal: number | null;
  percentualIgovTi: number | null;
  percentualIsaude: number | null;
  percentualIplan: number | null;
  percentualIegmMunicipio: number | null;

  // Faixas dos indicadores (novos nomes)
  faixaIamb: string | null;
  faixaIcidade: string | null;
  faixaIeduc: string | null;
  faixaIfiscal: string | null;
  faixaIgovTi: string | null;
  faixaIsaude: string | null;
  faixaIplan: string | null;
  faixaIegmMunicipio: string | null;
}

export interface EstatisticasGerais {
  totalMunicipios: number;
  mediaIegm: number;
  minIegm: number;
  maxIegm: number;
  mediaIamb: number;
  mediaIcidade: number;
  mediaIeduc: number;
  mediaIfiscal: number;
  mediaIgovTi: number;
  mediaIsaude: number;
  mediaIplan: number;
}

export interface RankingItem {
  codigoIbge: string;
  municipio: string;
  percentualIegmMunicipio: number | null;
  faixaIegmMunicipio: string | null;
  ranking: number;
  totalMunicipios: number;
}

export interface FaixaDistribuicao {
  faixa: string | null;
  quantidade: number;
  percentual: number;
}

// ============================================================================
// TIPOS DE ANÁLISE E RESPOSTAS
// ============================================================================

export interface RespostaDetalhada {
  id: number;
  tribunalId: number;
  tribunal: string;
  codigoIbge: string;
  municipio: string;
  indicador: string;
  questao: string;
  resposta: string | null;
  pontuacao: number | null;
  peso: number | null;
  nota: number | null;
  anoRef: number;
}

export interface AnaliseMelhoria {
  indicador: string;
  questao: string;
  respostaAtual: string;
  pontuacaoAtual: number;
  pontuacaoMaxima: number;
  impacto: number;
  recomendacao: string;
}

export interface PontoForte {
  nome: string;
  score: number;
  diferenca: number;
}

export interface PontoMelhoria {
  nome: string;
  score: number;
  diferenca: number;
  motivo: string;
}

// ============================================================================
// TIPOS DE COMPARAÇÃO E ANÁLISE
// ============================================================================

export interface ComparativoAnoAnterior {
  variacao: number;
  anoAnterior: number;
  anoAtual: number;
}

export interface ComparativoEstadual {
  mediaEstadual: number;
  posicaoRanking: number;
  totalMunicipios: number;
}

export interface DimensaoAnalise {
  nome: string;
  score: number;
  grade: string;
  ranking: number;
  diferencial: number;
  mediaEstadual: number;
}

export interface TopMunicipio {
  municipio: string;
  pctIegmMunicipio: number;
  ranking: number;
  diferencial: number;
}

// ============================================================================
// TIPOS DE RESULTADOS E CÁLCULOS
// ============================================================================

export interface ResultadoIndicador {
  indicador: string;
  score: number;
  questoes: number;
  respondidas: number;
  taxa: number;
  status: string;
}

export interface QuestaoCritica {
  indicador: string;
  nome: string;
  score: number;
  description: string;
}

export interface Recomendacao {
  indicador: string;
  recomendacao: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

// ============================================================================
// TIPOS DE ESTADO E LOADING
// ============================================================================

export interface LoadingState {
  municipios: boolean;
  estatisticas: boolean;
  ranking: boolean;
  respostas: boolean;
  analise: boolean;
}

export interface ErrorState {
  municipios: string | null;
  estatisticas: string | null;
  ranking: string | null;
  respostas: string | null;
  analise: string | null;
}

// ============================================================================
// TIPOS DE CONSULTAS E QUERIES
// ============================================================================

export interface MunicipioQuery {
  ano?: number;
  tribunal?: string;
  municipio?: string;
  limit?: number;
  offset?: number;
}

export interface RankingQuery {
  ano: number;
  tribunal: string;
  limit?: number;
  offset?: number;
}

export interface EstatisticasQuery {
  ano: number;
  tribunal: string;
}

export interface RespostasQuery {
  ano: number;
  tribunal: string;
  municipio?: string;
  indicador?: string;
}
export interface RankingMunicipio {
  codigoIbge: string;
  municipio: string;
  percentualIegmMunicipio: number | null;
  faixaIegmMunicipio: string | null;
  ranking?: number;
}

export interface Tribunal {
  id: number;
  nome: string;
  uf: string;
}

export interface Indicador {
  id: number;
  codigo: string;
  nome: string;
  cor?: string;
}

export interface AnaliseData {
  municipio: string;
  ano: number;
  dimensoes: DimensaoAnalise[];
  melhorias: AnaliseMelhoria[];
  pontosFortes: PontoForte[];
  pontosMelhoria: PontoMelhoria[];
}

export interface IEGMData {
  id?: number;
  municipioId?: number;
  municipio?: string;
  anoRef: number;
  percentualIamb: number | null;
  percentualIcidade: number | null;
  percentualIeduc: number | null;
  percentualIfiscal: number | null;
  percentualIgovTi: number | null;
  percentualIsaude: number | null;
  percentualIplan: number | null;
  percentualIegmMunicipio: number | null;
  faixaIamb: string | null;
  faixaIcidade: string | null;
  faixaIeduc: string | null;
  faixaIfiscal: string | null;
  faixaIgovTi: string | null;
  faixaIsaude: string | null;
  faixaIplan: string | null;
  faixaIegmMunicipio: string | null;
}
