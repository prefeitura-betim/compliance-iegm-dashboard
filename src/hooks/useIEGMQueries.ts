import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useIEGMServices } from './useIEGMServices';
import type { Municipio, IEGMData, AnaliseData, RespostaDetalhada } from '@/types/iegm';

// ============================================================================
// QUERIES PRINCIPAIS
// ============================================================================

export function useMunicipiosQuery(ano?: number, tribunal?: string) {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['municipios', ano, tribunal],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getMunicipios(ano, tribunal);
    },
    enabled: computed(() => isReady.value && !!municipioService.value),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useMunicipioQuery(municipioId: number, ano?: number) {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['municipio', municipioId, ano],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getMunicipio(municipioId, ano);
    },
    enabled: computed(() => isReady.value && !!municipioService.value && !!municipioId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useIEGMDataQuery(municipioId: number, ano?: number) {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['iegm-data', municipioId, ano],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getIEGMData(municipioId, ano);
    },
    enabled: computed(() => isReady.value && !!municipioService.value && !!municipioId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAnaliseQuery(municipioId: number, ano?: number) {
  const { analiseService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['analise', municipioId, ano],
    queryFn: async () => {
      if (!analiseService.value) throw new Error('Serviço não disponível');
      return await analiseService.value.getAnalise(municipioId, ano);
    },
    enabled: computed(() => isReady.value && !!analiseService.value && !!municipioId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useRespostasDetalhadasQuery(municipioId: number, ano?: number) {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['respostas-detalhadas', municipioId, ano],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getRespostasDetalhadas(municipioId, ano);
    },
    enabled: computed(() => isReady.value && !!municipioService.value && !!municipioId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// QUERIES DE COMPARAÇÃO
// ============================================================================

export function useComparativoEstadualQuery(ano?: number, tribunal?: string) {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['comparativo-estadual', ano, tribunal],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getComparativoEstadual(ano, tribunal);
    },
    enabled: computed(() => isReady.value && !!municipioService.value),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

export function useRankingMunicipiosQuery(ano?: number, tribunal?: string, limit?: number) {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['ranking-municipios', ano, tribunal, limit],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getRankingMunicipios(ano, tribunal, limit);
    },
    enabled: computed(() => isReady.value && !!municipioService.value),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ============================================================================
// QUERIES DE METADADOS
// ============================================================================

export function useTribunaisQuery() {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['tribunais'],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getTribunais();
    },
    enabled: computed(() => isReady.value && !!municipioService.value),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  });
}

export function useIndicadoresQuery() {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['indicadores'],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getIndicadores();
    },
    enabled: computed(() => isReady.value && !!municipioService.value),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useAnosDisponiveisQuery() {
  const { municipioService, isReady } = useIEGMServices();

  return useQuery({
    queryKey: ['anos-disponiveis'],
    queryFn: async () => {
      if (!municipioService.value) throw new Error('Serviço não disponível');
      return await municipioService.value.getAnosDisponiveis();
    },
    enabled: computed(() => isReady.value && !!municipioService.value),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useRefreshDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Simular refresh - na prática, poderia invalidar cache ou fazer nova requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas ao IEGM
      queryClient.invalidateQueries({ queryKey: ['municipios'] });
      queryClient.invalidateQueries({ queryKey: ['iegm-data'] });
      queryClient.invalidateQueries({ queryKey: ['analise'] });
      queryClient.invalidateQueries({ queryKey: ['respostas-detalhadas'] });
    },
  });
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

export function useIEGMQueries(municipioId?: number, ano?: number, tribunal?: string) {
  const municipios = useMunicipiosQuery(ano, tribunal);
  const municipio = useMunicipioQuery(municipioId || 0, ano);
  const iegmData = useIEGMDataQuery(municipioId || 0, ano);
  const analise = useAnaliseQuery(municipioId || 0, ano);
  const respostasDetalhadas = useRespostasDetalhadasQuery(municipioId || 0, ano);
  const comparativoEstadual = useComparativoEstadualQuery(ano, tribunal);
  const rankingMunicipios = useRankingMunicipiosQuery(ano, tribunal, 10);
  const tribunais = useTribunaisQuery();
  const indicadores = useIndicadoresQuery();
  const anosDisponiveis = useAnosDisponiveisQuery();
  const refreshData = useRefreshDataMutation();

  const isLoading = computed(() =>
    municipios.isLoading.value ||
    municipio.isLoading.value ||
    iegmData.isLoading.value ||
    analise.isLoading.value ||
    respostasDetalhadas.isLoading.value ||
    comparativoEstadual.isLoading.value ||
    rankingMunicipios.isLoading.value ||
    tribunais.isLoading.value ||
    indicadores.isLoading.value ||
    anosDisponiveis.isLoading.value
  );

  const hasError = computed(() =>
    municipios.isError.value ||
    municipio.isError.value ||
    iegmData.isError.value ||
    analise.isError.value ||
    respostasDetalhadas.isError.value ||
    comparativoEstadual.isError.value ||
    rankingMunicipios.isError.value ||
    tribunais.isError.value ||
    indicadores.isError.value ||
    anosDisponiveis.isError.value
  );

  const error = computed(() =>
    municipios.error.value ||
    municipio.error.value ||
    iegmData.error.value ||
    analise.error.value ||
    respostasDetalhadas.error.value ||
    comparativoEstadual.error.value ||
    rankingMunicipios.error.value ||
    tribunais.error.value ||
    indicadores.error.value ||
    anosDisponiveis.error.value
  );

  return {
    // Queries
    municipios,
    municipio,
    iegmData,
    analise,
    respostasDetalhadas,
    comparativoEstadual,
    rankingMunicipios,
    tribunais,
    indicadores,
    anosDisponiveis,

    // Mutations
    refreshData,

    // Estados
    isLoading,
    hasError,
    error,

    // Utilitários
    refetchAll: async () => {
      await Promise.all([
        municipios.refetch(),
        municipio.refetch(),
        iegmData.refetch(),
        analise.refetch(),
        respostasDetalhadas.refetch(),
        comparativoEstadual.refetch(),
        rankingMunicipios.refetch(),
        tribunais.refetch(),
        indicadores.refetch(),
        anosDisponiveis.refetch(),
      ]);
    }
  };
}
