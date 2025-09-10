<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Respostas Detalhadas</h3>

    <div v-if="!hasData" class="text-center py-8">
      <p class="text-gray-500">Respostas detalhadas não disponíveis</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Filtros -->
      <div class="flex flex-wrap gap-4">
        <select
          v-model="filtroIndicador"
          class="text-sm border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Todos os Indicadores</option>
          <option
            v-for="indicador in indicadoresUnicos"
            :key="indicador"
            :value="indicador"
          >
            {{ indicador }}
          </option>
        </select>

        <select
          v-model="filtroResposta"
          class="text-sm border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Todas as Respostas</option>
          <option value="Adequado">Adequado</option>
          <option value="Necessita Melhoria">Necessita Melhoria</option>
        </select>
      </div>

      <!-- Estatísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-blue-600">Total de Respostas</div>
          <div class="text-2xl font-bold text-blue-900">{{ respostasFiltradas.length }}</div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-green-600">Respostas Adequadas</div>
          <div class="text-2xl font-bold text-green-900">{{ respostasAdequadas }}</div>
          <div class="text-xs text-green-600">{{ percentualAdequadas }}%</div>
        </div>

        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-red-600">Necessitam Melhoria</div>
          <div class="text-2xl font-bold text-red-900">{{ respostasMelhoria }}</div>
          <div class="text-xs text-red-600">{{ percentualMelhoria }}%</div>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-purple-600">Pontuação Média</div>
          <div class="text-2xl font-bold text-purple-900">{{ pontuacaoMedia }}</div>
          <div class="text-xs text-purple-600">de 100 pontos</div>
        </div>
      </div>

      <!-- Tabela de Respostas -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Detalhamento das Respostas</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicador
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questão
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resposta
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pontuação
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peso
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="resposta in respostasFiltradas"
                :key="`${resposta.indicador}-${resposta.questao}`"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ resposta.indicador }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate" :title="resposta.questao">
                    {{ resposta.questao }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRespostaClass(resposta.resposta)"
                  >
                    {{ resposta.resposta }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="h-2 rounded-full"
                        :class="getPontuacaoClass(resposta.pontuacao)"
                        :style="{ width: `${resposta.pontuacao}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ resposta.pontuacao }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ resposta.peso }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ resposta.nota }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Gráfico por Indicador -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Performance por Indicador</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="indicador in performanceIndicadores"
            :key="indicador.nome"
            class="bg-gray-50 p-4 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-sm font-medium text-gray-900">{{ indicador.nome }}</h5>
              <span class="text-xs text-gray-500">{{ indicador.quantidade }} respostas</span>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span>Adequado</span>
                <span class="font-medium text-green-600">{{ indicador.adequadas }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span>Melhoria</span>
                <span class="font-medium text-red-600">{{ indicador.melhoria }}</span>
              </div>
            </div>

            <div class="mt-3">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Pontuação Média</span>
                <span>{{ indicador.pontuacaoMedia }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full"
                  :class="getPontuacaoClass(indicador.pontuacaoMedia)"
                  :style="{ width: `${indicador.pontuacaoMedia}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIEGMQueries } from '@/hooks/useIEGMQueries';

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  municipioId?: number;
  ano?: number;
}

const props = withDefaults(defineProps<Props>(), {
  municipioId: 0,
  ano: 2023
});

// ============================================================================
// HOOKS
// ============================================================================

const { respostasDetalhadas } = useIEGMQueries(props.municipioId, props.ano);

// ============================================================================
// REFS
// ============================================================================

const filtroIndicador = ref('');
const filtroResposta = ref('');

// ============================================================================
// COMPUTED
// ============================================================================

const hasData = computed(() => respostasDetalhadas.data.value && respostasDetalhadas.data.value.length > 0);

const respostasFiltradas = computed(() => {
  if (!respostasDetalhadas.data.value) return [];

  let respostas = respostasDetalhadas.data.value;

  if (filtroIndicador.value) {
    respostas = respostas.filter(r => r.indicador === filtroIndicador.value);
  }

  if (filtroResposta.value) {
    respostas = respostas.filter(r => r.resposta === filtroResposta.value);
  }

  return respostas;
});

const indicadoresUnicos = computed(() => {
  if (!respostasDetalhadas.data.value) return [];
  return [...new Set(respostasDetalhadas.data.value.map(r => r.indicador))];
});

const respostasAdequadas = computed(() => {
  return respostasFiltradas.value.filter(r => r.resposta === 'Adequado').length;
});

const respostasMelhoria = computed(() => {
  return respostasFiltradas.value.filter(r => r.resposta === 'Necessita Melhoria').length;
});

const percentualAdequadas = computed(() => {
  if (respostasFiltradas.value.length === 0) return 0;
  return Math.round((respostasAdequadas.value / respostasFiltradas.value.length) * 100);
});

const percentualMelhoria = computed(() => {
  if (respostasFiltradas.value.length === 0) return 0;
  return Math.round((respostasMelhoria.value / respostasFiltradas.value.length) * 100);
});

const pontuacaoMedia = computed(() => {
  if (respostasFiltradas.value.length === 0) return 0;
  const soma = respostasFiltradas.value.reduce((sum, r) => sum + (r.pontuacao || 0), 0);
  return Math.round(soma / respostasFiltradas.value.length);
});

const performanceIndicadores = computed(() => {
  if (!respostasDetalhadas.data.value) return [];

  const indicadores = {};

  respostasDetalhadas.data.value.forEach(resposta => {
    if (!indicadores[resposta.indicador]) {
      indicadores[resposta.indicador] = {
        nome: resposta.indicador,
        quantidade: 0,
        adequadas: 0,
        melhoria: 0,
        pontuacaoTotal: 0
      };
    }

    indicadores[resposta.indicador].quantidade++;
    indicadores[resposta.indicador].pontuacaoTotal += resposta.pontuacao || 0;

    if (resposta.resposta === 'Adequado') {
      indicadores[resposta.indicador].adequadas++;
    } else {
      indicadores[resposta.indicador].melhoria++;
    }
  });

  return Object.values(indicadores).map((ind: any) => ({
    ...ind,
    pontuacaoMedia: Math.round(ind.pontuacaoTotal / ind.quantidade)
  }));
});

// ============================================================================
// MÉTODOS
// ============================================================================

const getRespostaClass = (resposta: string): string => {
  return resposta === 'Adequado'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
};

const getPontuacaoClass = (pontuacao: number): string => {
  if (pontuacao >= 80) return 'bg-green-500';
  if (pontuacao >= 60) return 'bg-blue-500';
  if (pontuacao >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
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
