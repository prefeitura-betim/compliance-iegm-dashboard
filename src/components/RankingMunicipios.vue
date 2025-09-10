<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Ranking de Municípios</h3>
      <div class="flex items-center space-x-2">
        <select
          v-model="limit"
          class="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="10">Top 10</option>
          <option value="20">Top 20</option>
          <option value="50">Top 50</option>
        </select>
      </div>
    </div>

    <div v-if="!hasData" class="text-center py-8">
      <p class="text-gray-500">Dados do ranking não disponíveis</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Tabela de Ranking -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Município
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IEGM Geral
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Faixa
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Melhor Indicador
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pior Indicador
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(municipio, index) in rankingData"
              :key="municipio.id"
              :class="getRowClass(municipio)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
                    :class="getPositionClass(index + 1)"
                  >
                    {{ index + 1 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ municipio.nome }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ municipio.codigoIbge }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold" :class="getScoreColor(municipio.percentualIegmMunicipio)">
                  {{ formatPercentual(municipio.percentualIegmMunicipio) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getFaixaClass(municipio.faixaIegmMunicipio)"
                >
                  {{ municipio.faixaIegmMunicipio }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getMelhorIndicador(municipio) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getPiorIndicador(municipio) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Gráfico de Distribuição -->
      <div class="mt-6">
        <h4 class="text-md font-medium text-gray-900 mb-4">Distribuição por Faixa</h4>
        <div class="grid grid-cols-5 gap-4">
          <div
            v-for="faixa in distribuicaoFaixas"
            :key="faixa.nome"
            class="text-center p-3 rounded-lg"
            :class="faixa.bgClass"
          >
            <div class="text-2xl font-bold" :class="faixa.textClass">
              {{ faixa.quantidade }}
            </div>
            <div class="text-sm" :class="faixa.textClass">
              {{ faixa.nome }}
            </div>
            <div class="text-xs opacity-75" :class="faixa.textClass">
              {{ faixa.percentual }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useIEGMQueries } from '@/hooks/useIEGMQueries';

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  municipioId?: number;
  ano?: number;
  tribunal?: string;
}

const props = withDefaults(defineProps<Props>(), {
  municipioId: 0,
  ano: 2023,
  tribunal: 'TCEMG'
});

// ============================================================================
// HOOKS
// ============================================================================

const { rankingMunicipios } = useIEGMQueries(props.municipioId, props.ano);

// ============================================================================
// REFS
// ============================================================================

const limit = ref(10);

// ============================================================================
// COMPUTED
// ============================================================================

const hasData = computed(() => rankingMunicipios.data.value && rankingMunicipios.data.value.length > 0);

const rankingData = computed(() => {
  if (!hasData.value) return [];
  return rankingMunicipios.data.value?.slice(0, limit.value) || [];
});

const distribuicaoFaixas = computed(() => {
  if (!rankingMunicipios.data.value) return [];

  const total = rankingMunicipios.data.value.length;
  const faixas = {
    'A': 0,
    'B+': 0,
    'B': 0,
    'C+': 0,
    'C': 0
  };

  rankingMunicipios.data.value.forEach((municipio: any) => {
    const faixa = municipio.faixaIegmMunicipio;
    if (faixa in faixas) {
      faixas[faixa as keyof typeof faixas]++;
    }
  });

  return [
    {
      nome: 'A',
      quantidade: faixas['A'],
      percentual: total > 0 ? Math.round((faixas['A'] / total) * 100) : 0,
      bgClass: 'bg-green-100',
      textClass: 'text-green-800'
    },
    {
      nome: 'B+',
      quantidade: faixas['B+'],
      percentual: total > 0 ? Math.round((faixas['B+'] / total) * 100) : 0,
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800'
    },
    {
      nome: 'B',
      quantidade: faixas['B'],
      percentual: total > 0 ? Math.round((faixas['B'] / total) * 100) : 0,
      bgClass: 'bg-indigo-100',
      textClass: 'text-indigo-800'
    },
    {
      nome: 'C+',
      quantidade: faixas['C+'],
      percentual: total > 0 ? Math.round((faixas['C+'] / total) * 100) : 0,
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800'
    },
    {
      nome: 'C',
      quantidade: faixas['C'],
      percentual: total > 0 ? Math.round((faixas['C'] / total) * 100) : 0,
      bgClass: 'bg-red-100',
      textClass: 'text-red-800'
    }
  ];
});

// ============================================================================
// MÉTODOS
// ============================================================================

const formatPercentual = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-blue-600';
  if (score >= 0.4) return 'text-yellow-600';
  if (score >= 0.2) return 'text-orange-600';
  return 'text-red-600';
};

const getFaixaClass = (faixa: string): string => {
  switch (faixa) {
    case 'A': return 'bg-green-100 text-green-800';
    case 'B+': return 'bg-blue-100 text-blue-800';
    case 'B': return 'bg-indigo-100 text-indigo-800';
    case 'C+': return 'bg-yellow-100 text-yellow-800';
    case 'C': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPositionClass = (position: number): string => {
  if (position === 1) return 'bg-yellow-100 text-yellow-800';
  if (position === 2) return 'bg-gray-100 text-gray-800';
  if (position === 3) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-600';
};

const getRowClass = (municipio: any): string => {
  if (municipio.id === props.municipioId) {
    return 'bg-blue-50 border-l-4 border-blue-400';
  }
  return '';
};

const getMelhorIndicador = (municipio: any): string => {
  const indicadores = [
    { nome: 'I-Amb', valor: municipio.percentualIamb },
    { nome: 'I-Cidade', valor: municipio.percentualIcidade },
    { nome: 'I-Educ', valor: municipio.percentualIeduc },
    { nome: 'I-Fiscal', valor: municipio.percentualIfiscal },
    { nome: 'I-GovTI', valor: municipio.percentualIgovTi },
    { nome: 'I-Saude', valor: municipio.percentualIsaude },
    { nome: 'I-Plan', valor: municipio.percentualIplan }
  ];

  const melhor = indicadores.reduce((prev, current) =>
    (current.valor || 0) > (prev.valor || 0) ? current : prev
  );

  return `${melhor.nome} (${formatPercentual(melhor.valor || 0)})`;
};

const getPiorIndicador = (municipio: any): string => {
  const indicadores = [
    { nome: 'I-Amb', valor: municipio.percentualIamb },
    { nome: 'I-Cidade', valor: municipio.percentualIcidade },
    { nome: 'I-Educ', valor: municipio.percentualIeduc },
    { nome: 'I-Fiscal', valor: municipio.percentualIfiscal },
    { nome: 'I-GovTI', valor: municipio.percentualIgovTi },
    { nome: 'I-Saude', valor: municipio.percentualIsaude },
    { nome: 'I-Plan', valor: municipio.percentualIplan }
  ];

  const pior = indicadores.reduce((prev, current) =>
    (current.valor || 0) < (prev.valor || 0) ? current : prev
  );

  return `${pior.nome} (${formatPercentual(pior.valor || 0)})`;
};
</script>

<style scoped>
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f9fafb;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
