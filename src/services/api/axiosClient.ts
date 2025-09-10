import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from './httpClient';

// ============================================================================
// CONFIGURAÇÕES DO AXIOS
// ============================================================================

export interface AxiosApiRequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
}

export interface AxiosApiResponse<T = any> extends ApiResponse<T> {
  status: number;
  headers: Record<string, string>;
}

// ============================================================================
// CLIENTE AXIOS
// ============================================================================

export class AxiosClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
          dataLength: Array.isArray(response.data) ? response.data.length : 'Not array',
          dataType: typeof response.data,
        });

        return {
          ...response,
          data: {
            data: response.data,
            success: true,
            status: response.status,
            headers: response.headers,
          },
        };
      },
      async (error) => {
        console.error('❌ Response Error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });

        // Retry logic
        const config = error.config as AxiosApiRequestConfig;
        const retryCount = config.retry || 0;
        const maxRetries = 3;

        if (retryCount < maxRetries && this.shouldRetry(error)) {
          config.retry = retryCount + 1;
          const delay = config.retryDelay || 1000 * Math.pow(2, retryCount);

          console.log(`🔄 Retrying request (${retryCount + 1}/${maxRetries}) in ${delay}ms`);

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.instance(config);
        }

        const errorResponse: AxiosApiResponse = {
          data: null,
          success: false,
          error: this.getErrorMessage(error),
          status: error.response?.status || 0,
          headers: error.response?.headers || {},
        };

        return Promise.reject(errorResponse);
      }
    );
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600) ||
      error.code === 'ECONNABORTED'
    );
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.message) {
      return error.message;
    }

    return 'Erro desconhecido na requisição';
  }

  // ============================================================================
  // MÉTODOS HTTP
  // ============================================================================

  async get<T>(endpoint: string, config?: AxiosApiRequestConfig): Promise<AxiosApiResponse<T>> {
    try {
      const response = await this.instance.get<T>(endpoint, config);
      return response.data as AxiosApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosApiRequestConfig): Promise<AxiosApiResponse<T>> {
    try {
      const response = await this.instance.post<T>(endpoint, data, config);
      return response.data as AxiosApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosApiRequestConfig): Promise<AxiosApiResponse<T>> {
    try {
      const response = await this.instance.put<T>(endpoint, data, config);
      return response.data as AxiosApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(endpoint: string, config?: AxiosApiRequestConfig): Promise<AxiosApiResponse<T>> {
    try {
      const response = await this.instance.delete<T>(endpoint, config);
      return response.data as AxiosApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  async patch<T>(endpoint: string, data?: any, config?: AxiosApiRequestConfig): Promise<AxiosApiResponse<T>> {
    try {
      const response = await this.instance.patch<T>(endpoint, data, config);
      return response.data as AxiosApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  setAuthToken(token: string): void {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.instance.defaults.headers.common['Authorization'];
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
    this.instance.defaults.baseURL = url;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  // ============================================================================
  // MÉTODOS ESPECÍFICOS PARA IEGM
  // ============================================================================

  async getMunicipios(ano?: number, tribunal?: string): Promise<AxiosApiResponse> {
    const params: Record<string, any> = {};
    if (ano) params.ano = ano;
    if (tribunal) params.tribunal = tribunal;

    return this.get('/api/municipios', { params });
  }

  async getMunicipio(id: number, ano?: number): Promise<AxiosApiResponse> {
    const params: Record<string, any> = { id };
    if (ano) params.ano = ano;

    return this.get('/api/municipio', { params });
  }

  async getIEGMData(municipioId: number, ano?: number): Promise<AxiosApiResponse> {
    const params: Record<string, any> = { municipioId };
    if (ano) params.ano = ano;

    return this.get('/api/iegm-data', { params });
  }

  async getAnalise(municipioId: number, ano?: number): Promise<AxiosApiResponse> {
    const params: Record<string, any> = { municipioId };
    if (ano) params.ano = ano;

    return this.get('/api/analise', { params });
  }

  async getRespostasDetalhadas(municipioId: number, ano?: number): Promise<AxiosApiResponse> {
    const params: Record<string, any> = { municipioId };
    if (ano) params.ano = ano;

    return this.get('/api/respostas-detalhadas', { params });
  }

  async getComparativoEstadual(ano?: number, tribunal?: string): Promise<AxiosApiResponse> {
    const params: Record<string, any> = {};
    if (ano) params.ano = ano;
    if (tribunal) params.tribunal = tribunal;

    return this.get('/api/comparativo-estadual', { params });
  }

  async getRankingMunicipios(ano?: number, tribunal?: string, limit?: number): Promise<AxiosApiResponse> {
    const params: Record<string, any> = {};
    if (ano) params.ano = ano;
    if (tribunal) params.tribunal = tribunal;
    if (limit) params.limit = limit;

    return this.get('/api/ranking-municipios', { params });
  }

  async getTribunais(): Promise<AxiosApiResponse> {
    return this.get('/api/tribunais');
  }

  async getIndicadores(): Promise<AxiosApiResponse> {
    return this.get('/api/indicadores');
  }

  async getAnosDisponiveis(): Promise<AxiosApiResponse> {
    return this.get('/api/anos-disponiveis');
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const createAxiosClient = (baseURL: string): AxiosClient => {
  return new AxiosClient(baseURL);
};

// ============================================================================
// INSTÂNCIA PADRÃO
// ============================================================================

export const defaultAxiosClient = createAxiosClient('/');
