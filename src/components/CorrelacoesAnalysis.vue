<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Análise de Correlações</h3>

    <div v-if="!hasData" class="text-center py-8">
      <p class="text-gray-500">Dados de correlações não disponíveis</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Resumo das Correlações -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-blue-600">Correlação Mais Forte</div>
          <div class="text-lg font-bold text-blue-900">{{ correlacaoMaisForte.indicadores }}</div>
          <div class="text-xs text-blue-600">{{ formatCorrelacao(correlacaoMaisForte.valor) }}</div>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-green-600">Correlações Positivas</div>
          <div class="text-2xl font-bold text-green-900">{{ correlacoesPositivas }}</div>
          <div class="text-xs text-green-600">de {{ totalCorrelacoes }} pares</div>
        </div>
        
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-red-600">Correlações Negativas</div>
          <div class="text-2xl font-bold text-red-900">{{ correlacoesNegativas }}</div>
          <div class="text-xs text-red-600">de {{ totalCorrelacoes }} pares</div>
        </div>
      </div>

      <!-- Matriz de Correlação -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Matriz de Correlação</h4>
        <div class="overflow-x-auto">
          <div class="inline-block min-w-full align-middle">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicador
                  </th>
                  <th 
                    v-for="indicador in indicadores" 
                    :key="indicador.codigo"
                    class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ indicador.codigo }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="indicador1 in indicadores" :key="indicador1.codigo">
                  <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ indicador1.codigo }}
                  </td>
                  <td 
                    v-for="indicador2 in indicadores" 
                    :key="indicador2.codigo"
                    class="px-3 py-2 whitespace-nowrap text-center"
                  >
                    <div 
                      v-if="indicador1.codigo === indicador2.codigo"
                      class="w-8 h-8 mx-auto bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-500"
                    >
                      1.0
                    </div>
                    <div 
                      v-else
                      class="w-8 h-8 mx-auto rounded flex items-center justify-center text-xs font-medium"
                      :class="getCorrelacaoClass(getCorrelacao(indicador1.codigo, indicador2.codigo))"
                    >
                      {{ formatCorrelacaoShort(getCorrelacao(indicador1.codigo, indicador2.codigo)) }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Top Correlações -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Principais Correlações</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Correlações Positivas</h5>
            <div class="space-y-2">
              <div 
                v-for="correlacao in topCorrelacoesPositivas" 
                :key="correlacao.id"
                class="flex items-center justify-between p-2 bg-green-50 rounded"
              >
                <span class="text-sm text-green-800">{{ correlacao.indicadores }}</span>
                <span class="text-sm font-medium text-green-900">{{ formatCorrelacao(correlacao.valor) }}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Correlações Negativas</h5>
            <div class="space-y-2">
              <div 
                v-for="correlacao in topCorrelacoesNegativas" 
                :key="correlacao.id"
                class="flex items-center justify-between p-2 bg-red-50 rounded"
              >
                <span class="text-sm text-red-800">{{ correlacao.indicadores }}</span>
                <span class="text-sm font-medium text-red-900">{{ formatCorrelacao(correlacao.valor) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interpretação -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-medium text-gray-900 mb-2">Interpretação das Correlações</h4>
        <div class="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Correlação Positiva:</strong> Quando um indicador melhora, o outro tende a melhorar também.
          </p>
          <p>
            <strong>Correlação Negativa:</strong> Quando um indicador melhora, o outro tende a piorar.
          </p>
          <p>
            <strong>Correlação Fraca:</strong> Pouca relação entre os indicadores.
          </p>
          <p class="text-xs text-gray-500 mt-3">
            * Valores próximos de 1.0 indicam correlação forte positiva, próximos de -1.0 indicam correlação forte negativa.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const { iegmData } = useIEGMQueries(props.municipioId, props.ano);

// ============================================================================
// COMPUTED
// ============================================================================

const hasData = computed(() => iegmData.data.value);

const indicadores = computed(() => [
  { codigo: 'I-Amb', nome: 'Meio Ambiente' },
  { codigo: 'I-Cidade', nome: 'Cidades' },
  { codigo: 'I-Educ', nome: 'Educação' },
  { codigo: 'I-Fiscal', nome: 'Gestão Fiscal' },
  { codigo: 'I-GovTI', nome: 'Governança TI' },
  { codigo: 'I-Saude', nome: 'Saúde' },
  { codigo: 'I-Plan', nome: 'Planejamento' }
]);

// Dados simulados de correlação - em produção viriam da API
const correlacoes = computed(() => {
  if (!iegmData.data.value) return [];

  // Simular correlações baseadas nos dados reais
  const data = iegmData.data.value;
  const valores = [
    data.percentualIamb || 0,
    data.percentualIcidade || 0,
    data.percentualIeduc || 0,
    data.percentualIfiscal || 0,
    data.percentualIgovTi || 0,
    data.percentualIsaude || 0,
    data.percentualIplan || 0
  ];

  const correlacoes = [];
  const codigos = ['I-Amb', 'I-Cidade', 'I-Educ', 'I-Fiscal', 'I-GovTI', 'I-Saude', 'I-Plan'];

  for (let i = 0; i < codigos.length; i++) {
    for (let j = i + 1; j < codigos.length; j++) {
      // Simular correlação baseada na proximidade dos valores
      const diff = Math.abs(valores[i] - valores[j]);
      const correlacao = Math.max(-0.8, Math.min(0.8, 1 - diff * 2));
      
      correlacoes.push({
        id: `${codigos[i]}-${codigos[j]}`,
        indicador1: codigos[i],
        indicador2: codigos[j],
        indicadores: `${codigos[i]} × ${codigos[j]}`,
        valor: correlacao
      });
    }
  }

  return correlacoes;
});

const correlacaoMaisForte = computed(() => {
  if (!correlacoes.value.length) return { indicadores: 'N/A', valor: 0 };
  
  return correlacoes.value.reduce((prev, current) => 
    Math.abs(current.valor) > Math.abs(prev.valor) ? current : prev
  );
});

const correlacoesPositivas = computed(() => {
  return correlacoes.value.filter(c => c.valor > 0.3).length;
});

const correlacoesNegativas = computed(() => {
  return correlacoes.value.filter(c => c.valor < -0.3).length;
});

const totalCorrelacoes = computed(() => correlacoes.value.length);

const topCorrelacoesPositivas = computed(() => {
  return correlacoes.value
    .filter(c => c.valor > 0.3)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
});

const topCorrelacoesNegativas = computed(() => {
  return correlacoes.value
    .filter(c => c.valor < -0.3)
    .sort((a, b) => a.valor - b.valor)
    .slice(0, 5);
});

// ============================================================================
// MÉTODOS
// ============================================================================

const getCorrelacao = (indicador1: string, indicador2: string): number => {
  if (indicador1 === indicador2) return 1.0;
  
  const correlacao = correlacoes.value.find(c => 
    (c.indicador1 === indicador1 && c.indicador2 === indicador2) ||
    (c.indicador1 === indicador2 && c.indicador2 === indicador1)
  );
  
  return correlacao?.valor || 0;
};

const formatCorrelacao = (value: number): string => {
  return value.toFixed(3);
};

const formatCorrelacaoShort = (value: number): string => {
  return value.toFixed(2);
};

const getCorrelacaoClass = (value: number): string => {
  const absValue = Math.abs(value);
  
  if (absValue >= 0.7) {
    return value >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  } else if (absValue >= 0.5) {
    return value >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  } else if (absValue >= 0.3) {
    return value >= 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-pink-100 text-pink-800';
  } else {
    return 'bg-gray-100 text-gray-600';
  }
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