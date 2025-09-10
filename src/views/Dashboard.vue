<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Dashboard IEGM - {{ municipio?.nome || 'Carregando...' }}
            </h1>
            <p class="text-gray-600">
              Índice de Efetividade da Gestão Municipal - Análise Completa {{ ano }}
            </p>
          </div>
          <div class="flex space-x-4">
            <button
              @click="downloadReport('pdf')"
              :disabled="relatorio.isGenerating"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <span v-if="relatorio.isGenerating">
                Gerando... {{ relatorio.generationProgress }}%
              </span>
              <span v-else>📄 Relatório PDF</span>
            </button>
            <button
              @click="downloadData('csv')"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              📊 Exportar CSV
            </button>
            <button
              @click="printReport"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Carregando dados do IEGM...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800">{{ error?.message || 'Erro desconhecido' }}</p>
        <button
          @click="refetchAll"
          class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Filtros -->
        <FiltersPanel :collapsed="false" />

        <!-- Cards de Resumo -->
        <SummaryCards />

        <!-- Gráfico Radar dos Indicadores -->
        <RadarChart />

        <!-- Análise por Dimensões -->
        <DimensionAnalysis />

        <!-- Comparativo Estadual -->
        <ComparativoEstadual />

        <!-- Ranking de Municípios -->
        <RankingMunicipios />

        <!-- Análise de Tendência -->
        <TendenciaAnalysis />

        <!-- Análise de Correlações -->
        <CorrelacoesAnalysis />

        <!-- Respostas Detalhadas -->
        <RespostasDetalhadas />

        <!-- Informações sobre o IEGM -->
        <IEGMInfo />

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useIEGMQueries } from '@/hooks/useIEGMQueries';
import { useRelatorio } from '@/hooks/useRelatorio';
import { DEFAULT_MUNICIPIO_CONFIG } from '@/config/municipioConfig';
import FiltersPanel from '@/components/FiltersPanel.vue';
import SummaryCards from '@/components/SummaryCards.vue';
import DimensionAnalysis from '@/components/DimensionAnalysis.vue';
import ComparativoEstadual from '@/components/ComparativoEstadual.vue';
import RankingMunicipios from '@/components/RankingMunicipios.vue';
import TendenciaAnalysis from '@/components/TendenciaAnalysis.vue';
import CorrelacoesAnalysis from '@/components/CorrelacoesAnalysis.vue';
import RespostasDetalhadas from '@/components/RespostasDetalhadas.vue';
import IEGMInfo from '@/components/IEGMInfo.vue';
import RadarChart from '@/components/RadarChart.vue';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const route = useRoute();

// Obter parâmetros da URL ou usar configuração padrão
const municipioNome = computed(() =>
  (route.query.municipio as string) || DEFAULT_MUNICIPIO_CONFIG.municipio
);

const ano = computed(() =>
  parseInt(route.query.ano as string) || DEFAULT_MUNICIPIO_CONFIG.ano || 2023
);

const tribunal = computed(() =>
  (route.query.tribunal as string) || DEFAULT_MUNICIPIO_CONFIG.tribunal
);

// ============================================================================
// HOOKS
// ============================================================================

// Buscar município por nome primeiro
const { municipios } = useIEGMQueries(ano.value, tribunal.value);

const municipioId = computed(() => {
  const municipio = municipios.data.value?.find(m =>
    m.nome?.toUpperCase() === municipioNome.value.toUpperCase()
  );
  return municipio?.id || 0;
});

// Queries principais
const {
  municipio,
  iegmData,
  analise,
  respostasDetalhadas,
  comparativoEstadual,
  rankingMunicipios,
  tribunais,
  indicadores,
  anosDisponiveis,
  isLoading,
  hasError,
  error,
  refetchAll
} = useIEGMQueries(municipioId.value, ano.value, tribunal.value);

// Hook de relatórios
const relatorio = useRelatorio(municipioId.value, ano.value);

// ============================================================================
// MÉTODOS
// ============================================================================

const downloadReport = async (formato: 'pdf' | 'excel') => {
  try {
    await relatorio.downloadReport(formato);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    // Aqui você poderia mostrar uma notificação de erro
  }
};

const downloadData = async (formato: 'csv' | 'json') => {
  try {
    await relatorio.downloadData(formato);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    // Aqui você poderia mostrar uma notificação de erro
  }
};

const printReport = () => {
  window.print();
};

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  console.log('Dashboard: Iniciando carregamento de dados...');
  console.log('Município:', municipioNome.value);
  console.log('Ano:', ano.value);
  console.log('Tribunal:', tribunal.value);
});

onUnmounted(() => {
  // Limpar recursos do relatório
  relatorio.cleanup();
});
</script>

<style scoped>
@media print {
  header {
    display: none;
  }

  .filters-panel {
    display: none;
  }

  main {
    padding: 0;
  }

  .bg-gray-50 {
    background-color: white !important;
  }

  .shadow-sm {
    box-shadow: none !important;
  }

  .border {
    border: 1px solid #e5e7eb !important;
  }

  /* Ocultar botões de ação na impressão */
  button {
    display: none !important;
  }
}

/* Animações de carregamento */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Melhorias visuais */
.space-y-8 > * + * {
  margin-top: 2rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .flex {
    flex-direction: column;
  }

  .space-x-4 > * + * {
    margin-left: 0;
    margin-top: 0.5rem;
  }
}
</style>
