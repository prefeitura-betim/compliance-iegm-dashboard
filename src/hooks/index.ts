// ============================================================================
// EXPORTAÇÕES DOS HOOKS
// ============================================================================

export { useDatabase } from './useDatabase';
export { useIEGMServices } from './useIEGMServices';
export { useMunicipios } from './useMunicipios';
export { useAnalise } from './useAnalise';

// ============================================================================
// EXPORTAÇÕES DOS HOOKS DE QUERY
// ============================================================================

export {
  useIEGMQueries,
  useMunicipiosQuery,
  useMunicipioQuery,
  useIEGMDataQuery,
  useAnaliseQuery,
  useRespostasDetalhadasQuery,
  useComparativoEstadualQuery,
  useRankingMunicipiosQuery,
  useTribunaisQuery,
  useIndicadoresQuery,
  useAnosDisponiveisQuery,
  useRefreshDataMutation
} from './useIEGMQueries';

// ============================================================================
// EXPORTAÇÕES DOS HOOKS DE RELATÓRIO
// ============================================================================

export { useRelatorio } from './useRelatorio';

// ============================================================================
// EXPORTAÇÕES DOS TIPOS DOS HOOKS
// ============================================================================

export type { DatabaseService } from '../services/database';
export type { IEGMServices } from '../services/iegm';
