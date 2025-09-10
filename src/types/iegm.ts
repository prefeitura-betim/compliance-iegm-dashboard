// ============================================================================
// TIPOS PRINCIPAIS
// ============================================================================

export interface Municipio {
  id: number;
  codigoIbge: string;
  nome: string;
  uf: string;
}

export interface Tribunal {
  id: number;
  codigo: string;
  nome: string;
  uf: string;
}

export interface Indicador {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  ordem: number;
}

export interface IEGMData {
  id?: number;
  tribunalId: number;
  municipioId: number;
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

export interface ComparativoEstadual {
  id?: number;
  tribunalId: number;
  uf: string;
  anoRef: number;
  percentualIamb: number | null;
  percentualIcidade: number | null;
  percentualIeduc: number | null;
  percentualIfiscal: number | null;
  percentualIgovTi: number | null;
  percentualIsaude: number | null;
  percentualIplan: number | null;
  percentualIegmEstado: number | null;
  faixaIamb: string | null;
  faixaIcidade: string | null;
  faixaIeduc: string | null;
  faixaIfiscal: string | null;
  faixaIgovTi: string | null;
  faixaIsaude: string | null;
  faixaIplan: string | null;
  faixaIegmEstado: string | null;
  quantidadeMunicipiosResponderam: number | null;
}

export interface RankingMunicipio {
  id: number;
  nome: string;
  codigoIbge: string;
  percentualIegmMunicipio: number;
  faixaIegmMunicipio: string;
  percentualIamb: number | null;
  percentualIcidade: number | null;
  percentualIeduc: number | null;
  percentualIfiscal: number | null;
  percentualIgovTi: number | null;
  percentualIsaude: number | null;
  percentualIplan: number | null;
  posicao?: number;
}

export interface RespostaDetalhada {
  tribunal: string;
  codigoIbge: string;
  municipio: string;
  indicador: string;
  questao: string;
  resposta: string;
  pontuacao: number;
  peso: number;
  nota: number;
  anoRef: number;
}

// ============================================================================
// TIPOS DE ANÁLISE
// ============================================================================

export interface AnaliseData {
  municipioId: number;
  ano: number;
  pontosFortes: PontoForte[];
  pontosMelhoria: PontoMelhoria[];
  recomendacoes: string[];
  scoreGeral: number;
  classificacao: string;
}

export interface PontoForte {
  indicador: string;
  descricao: string;
  score: number;
  impacto: 'alto' | 'medio' | 'baixo';
}

export interface PontoMelhoria {
  indicador: string;
  descricao: string;
  score: number;
  prioridade: 'alta' | 'media' | 'baixa';
  acoes: string[];
}

export interface DimensaoAnalise {
  codigo: string;
  nome: string;
  score: number;
  faixa: string;
  peso: number;
  contribuicao: number;
}

export interface ComparativoAnoAnterior {
  atual: IEGMData;
  anterior: IEGMData;
  evolucao: Record<string, {
    atual: number;
    anterior: number;
    variacao: number;
    percentualVariacao: number;
  }>;
}

// ============================================================================
// TIPOS DE FILTROS E QUERIES
// ============================================================================

export interface IEGMFilters {
  ano?: number;
  tribunal?: string;
  uf?: string;
  municipio?: string;
  indicadores?: string[];
}

export interface MunicipioQuery {
  id?: number;
  nome?: string;
  ano?: number;
  tribunal?: string;
}

export interface RankingQuery {
  ano?: number;
  tribunal?: string;
  limit?: number;
  uf?: string;
}

export interface EstatisticasQuery {
  ano?: number;
  tribunal?: string;
  uf?: string;
}

export interface RespostasQuery {
  municipioId: number;
  ano?: number;
  indicador?: string;
  resposta?: string;
}

// ============================================================================
// TIPOS DE CONFIGURAÇÃO
// ============================================================================

export interface MunicipioConfig {
  tribunal: string;
  municipio: string;
  ano: number;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: string;
  details?: any;
}

// ============================================================================
// TIPOS DE RELATÓRIO
// ============================================================================

export interface RelatorioData {
  municipio: Municipio;
  iegmData: IEGMData;
  analise: AnaliseData;
  respostasDetalhadas: RespostaDetalhada[];
  comparativoEstadual: ComparativoEstadual;
  metadata: {
    generatedAt: string;
    municipioId: number;
    ano: number;
    version: string;
  };
}

export interface RelatorioConfig {
  formato: 'pdf' | 'excel';
  incluirGraficos: boolean;
  incluirTabelas: boolean;
  incluirAnalise: boolean;
  incluirRecomendacoes: boolean;
}

// ============================================================================
// TIPOS DE ANÁLISE AVANÇADA
// ============================================================================

export interface AnaliseTendencia {
  municipioId: number;
  anos: number[];
  indicadores: Record<string, number[]>;
  evolucao: Record<string, number>;
  projecao: Record<string, number>;
}

export interface Correlacao {
  indicador1: string;
  indicador2: string;
  valor: number;
  significancia: number;
  interpretacao: string;
}

export interface Benchmarking {
  municipioId: number;
  ano: number;
  indicadores: string[];
  comparacao: {
    municipio: Record<string, number>;
    mediaEstadual: Record<string, number>;
    top10: Record<string, number>;
    diferenca: Record<string, number>;
  };
}

// ============================================================================
// TIPOS DE API
// ============================================================================

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  message?: string;
  status?: number;
  headers?: Record<string, string>;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

// ============================================================================
// TIPOS DE ESTATÍSTICAS
// ============================================================================

export interface EstatisticasGerais {
  totalMunicipios: number;
  municipiosResponderam: number;
  percentualResposta: number;
  mediaIEGMGeral: number;
  distribuicaoFaixas: FaixaDistribuicao[];
  melhorMunicipio: RankingItem;
  piorMunicipio: RankingItem;
}

export interface FaixaDistribuicao {
  faixa: string;
  quantidade: number;
  percentual: number;
  cor: string;
}

export interface RankingItem {
  posicao: number;
  municipio: string;
  score: number;
  faixa: string;
}
