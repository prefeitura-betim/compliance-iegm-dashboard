import { computed } from 'vue';
import { useDatabase } from './useDatabase';
import { createIEGMServices } from '../services/iegm';
import { IEGMApiService } from '../services/iegm/iegmApiService';
import type { IEGMServices } from '../services/iegm';

export function useIEGMServices() {
  const { getDatabaseService, isMockData } = useDatabase();

  // Serviços locais (para desenvolvimento)
  const localServices = computed<IEGMServices | null>(() => {
    const dbService = getDatabaseService();
    if (!dbService) {
      return null;
    }
    return createIEGMServices(dbService);
  });

  // Serviço de API (para produção)
  const apiService = computed(() => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/';
    return new IEGMApiService(baseURL);
  });

  // Determinar qual serviço usar baseado no ambiente
  const municipioService = computed(() => {
    if (isMockData.value) {
      return localServices.value?.municipio || null;
    }
    return apiService.value;
  });

  const analiseService = computed(() => {
    if (isMockData.value) {
      return localServices.value?.analise || null;
    }
    return apiService.value;
  });

  return {
    services: localServices,
    apiService,
    municipioService,
    analiseService,
    isReady: computed(() => municipioService.value !== null),
    isApiMode: computed(() => !isMockData.value)
  };
}
