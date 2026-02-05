import { AxiosClient } from '../api/axiosClient';
import type {
  Municipio,
  IEGMData,
  AnaliseData,
  RespostaDetalhada,
  ComparativoEstadual,
  RankingMunicipio,
  Tribunal,
  Indicador
} from './types';

// ============================================================================
// SERVIÇO DE API IEGM
// ============================================================================

export class IEGMApiService {
  private client: AxiosClient;

  constructor(baseURL: string = '/') {
    this.client = new AxiosClient(baseURL);
  }

  // ============================================================================
  // MÉTODOS DE MUNICÍPIOS
  // ============================================================================

  async getMunicipios(ano?: number, tribunal?: string): Promise<Municipio[]> {
    try {
      const response = await this.client.getMunicipios(ano, tribunal);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      throw new Error('Falha ao carregar dados dos municípios');
    }
  }

  async getMunicipio(id: number, ano?: number): Promise<Municipio | null> {
    try {
      const response = await this.client.getMunicipio(id, ano);
      return response.data || null;
    } catch (error) {
      console.error('Erro ao buscar município:', error);
      throw new Error('Falha ao carregar dados do município');
    }
  }

  async getMunicipioByNome(nome: string, ano?: number): Promise<Municipio | null> {
    try {
      const response = await this.client.get('/api/municipio/nome', {
        params: { nome, ano }
      });
      return (response.data as Municipio) || null;
    } catch (error) {
      console.error('Erro ao buscar município por nome:', error);
      throw new Error('Falha ao carregar dados do município');
    }
  }

  // ============================================================================
  // MÉTODOS DE DADOS IEGM
  // ============================================================================

  async getIEGMData(municipioId: number, ano?: number): Promise<IEGMData | null> {
    try {
      const response = await this.client.getIEGMData(municipioId, ano);
      return response.data || null;
    } catch (error) {
      console.error('Erro ao buscar dados IEGM:', error);
      throw new Error('Falha ao carregar dados IEGM');
    }
  }

  async getAnalise(municipioId: number, ano?: number): Promise<AnaliseData | null> {
    try {
      const response = await this.client.getAnalise(municipioId, ano);
      return response.data || null;
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      throw new Error('Falha ao carregar análise');
    }
  }

  async getRespostasDetalhadas(municipioId: number, ano?: number): Promise<RespostaDetalhada[]> {
    try {
      const response = await this.client.getRespostasDetalhadas(municipioId, ano);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar respostas detalhadas:', error);
      throw new Error('Falha ao carregar respostas detalhadas');
    }
  }

  // ============================================================================
  // MÉTODOS DE COMPARAÇÃO
  // ============================================================================

  async getComparativoEstadual(ano?: number, tribunal?: string): Promise<ComparativoEstadual | null> {
    try {
      const response = await this.client.getComparativoEstadual(ano, tribunal);
      return response.data || null;
    } catch (error) {
      console.error('Erro ao buscar comparativo estadual:', error);
      throw new Error('Falha ao carregar comparativo estadual');
    }
  }

  async getRankingMunicipios(ano?: number, tribunal?: string, limit?: number): Promise<RankingMunicipio[]> {
    try {
      const response = await this.client.getRankingMunicipios(ano, tribunal, limit);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar ranking de municípios:', error);
      throw new Error('Falha ao carregar ranking de municípios');
    }
  }

  async getComparativoAnoAnterior(municipioId: number, anoAtual: number): Promise<any> {
    try {
      const anoAnterior = anoAtual - 1;
      const [dadosAtual, dadosAnterior] = await Promise.all([
        this.getIEGMData(municipioId, anoAtual),
        this.getIEGMData(municipioId, anoAnterior)
      ]);

      return {
        atual: dadosAtual,
        anterior: dadosAnterior,
        evolucao: this.calcularEvolucao(dadosAtual, dadosAnterior)
      };
    } catch (error) {
      console.error('Erro ao buscar comparativo ano anterior:', error);
      throw new Error('Falha ao carregar comparativo entre anos');
    }
  }

  // ============================================================================
  // MÉTODOS DE METADADOS
  // ============================================================================

  async getTribunais(): Promise<Tribunal[]> {
    try {
      const response = await this.client.getTribunais();
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar tribunais:', error);
      throw new Error('Falha ao carregar tribunais');
    }
  }

  async getIndicadores(): Promise<Indicador[]> {
    try {
      const response = await this.client.getIndicadores();
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error);
      throw new Error('Falha ao carregar indicadores');
    }
  }

  async getAnosDisponiveis(): Promise<number[]> {
    try {
      const response = await this.client.getAnosDisponiveis();
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar anos disponíveis:', error);
      throw new Error('Falha ao carregar anos disponíveis');
    }
  }

  // ============================================================================
  // MÉTODOS DE RELATÓRIOS
  // ============================================================================

  async gerarRelatorio(municipioId: number, ano: number, formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    try {
      const response = await this.client.post('/api/relatorio', {
        municipioId,
        ano,
        formato
      });

      // Converter resposta para Blob
      const blob = new Blob([response.data as any], {
        type: formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      return blob;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error('Falha ao gerar relatório');
    }
  }

  async exportarDados(municipioId: number, ano: number, formato: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const response = await this.client.get('/api/exportar', {
        params: { municipioId, ano, formato }
      });

      return response.data as string;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw new Error('Falha ao exportar dados');
    }
  }

  // ============================================================================
  // MÉTODOS DE ANÁLISE AVANÇADA
  // ============================================================================

  async getAnaliseTendencia(municipioId: number, anos: number[]): Promise<any> {
    try {
      const response = await this.client.post('/api/analise-tendencia', {
        municipioId,
        anos
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise de tendência:', error);
      throw new Error('Falha ao carregar análise de tendência');
    }
  }

  async getCorrelacoes(municipioId: number, ano: number): Promise<any> {
    try {
      const response = await this.client.get('/api/correlacoes', {
        params: { municipioId, ano }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar correlações:', error);
      throw new Error('Falha ao carregar correlações');
    }
  }

  async getBenchmarking(municipioId: number, ano: number, indicadores: string[]): Promise<any> {
    try {
      const response = await this.client.post('/api/benchmarking', {
        municipioId,
        ano,
        indicadores
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar benchmarking:', error);
      throw new Error('Falha ao carregar benchmarking');
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private calcularEvolucao(atual: IEGMData | null, anterior: IEGMData | null): any {
    if (!atual || !anterior) {
      return null;
    }

    const evolucao: any = {};

    // Calcular evolução dos percentuais
    const atualVal = atual.percentualIegmMunicipio || 0;
    const anteriorVal = anterior.percentualIegmMunicipio || 0;

    evolucao.iegmGeral = {
      atual: atualVal,
      anterior: anteriorVal,
      variacao: atualVal - anteriorVal,
      percentualVariacao: anteriorVal !== 0 ? ((atualVal - anteriorVal) / anteriorVal) * 100 : 0
    };

    // Calcular evolução por indicador
    const indicadores = ['iamb', 'icidade', 'ieduc', 'ifiscal', 'igovTi', 'isaude', 'iplan'];

    indicadores.forEach(ind => {
      const atualVal = (atual[`percentual${ind.charAt(0).toUpperCase() + ind.slice(1)}` as keyof IEGMData] as number) || 0;
      const anteriorVal = (anterior[`percentual${ind.charAt(0).toUpperCase() + ind.slice(1)}` as keyof IEGMData] as number) || 0;

      evolucao[ind] = {
        atual: atualVal,
        anterior: anteriorVal,
        variacao: atualVal - anteriorVal,
        percentualVariacao: anteriorVal !== 0 ? ((atualVal - anteriorVal) / anteriorVal) * 100 : 0
      };
    });

    return evolucao;
  }

  // ============================================================================
  // CONFIGURAÇÕES
  // ============================================================================

  setBaseURL(url: string): void {
    this.client.setBaseURL(url);
  }

  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  removeAuthToken(): void {
    this.client.removeAuthToken();
  }
}

// ============================================================================
// INSTÂNCIA PADRÃO
// ============================================================================

export const defaultIEGMApiService = new IEGMApiService();
