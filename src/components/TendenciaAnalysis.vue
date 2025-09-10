<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Análise de Tendência</h3>

    <div v-if="!hasData" class="text-center py-8">
      <p class="text-gray-500">Dados de tendência não disponíveis</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Resumo da Evolução -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-blue-600">Evolução Geral</div>
          <div class="text-2xl font-bold" :class="getEvolucaoColor(evolucaoGeral)">
            {{ formatEvolucao(evolucaoGeral) }}
          </div>
          <div class="text-xs text-blue-600">
            {{ evolucaoGeral > 0 ? 'Melhoria' : evolucaoGeral < 0 ? 'Queda' : 'Estável' }}
          </div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-green-600">Melhor Indicador</div>
          <div class="text-lg font-bold text-green-900">{{ melhorIndicador.nome }}</div>
          <div class="text-xs text-green-600">{{ formatEvolucao(melhorIndicador.evolucao) }}</div>
        </div>

        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-red-600">Pior Indicador</div>
          <div class="text-lg font-bold text-red-900">{{ piorIndicador.nome }}</div>
          <div class="text-xs text-red-600">{{ formatEvolucao(piorIndicador.evolucao) }}</div>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-purple-600">Indicadores Melhorados</div>
          <div class="text-2xl font-bold text-purple-900">{{ indicadoresMelhorados }}</div>
          <div class="text-xs text-purple-600">de 7 indicadores</div>
        </div>
      </div>

      <!-- Gráfico de Tendência -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Evolução por Indicador</h4>
        <div class="h-64 bg-gray-50 rounded-lg p-4">
          <canvas ref="tendenciaCanvas" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Tabela de Evolução -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Detalhamento da Evolução</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicador
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ano Anterior
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ano Atual
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evolução
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="indicador in evolucaoIndicadores" :key="indicador.codigo">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ indicador.nome }}</div>
                  <div class="text-sm text-gray-500">{{ indicador.codigo }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatPercentual(indicador.anterior) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatPercentual(indicador.atual) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold" :class="getEvolucaoColor(indicador.evolucao)">
                    {{ formatEvolucao(indicador.evolucao) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(indicador.evolucao)"
                  >
                    {{ getStatusText(indicador.evolucao) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
// REFS
// ============================================================================

const tendenciaCanvas = ref<HTMLCanvasElement>();

// ============================================================================
// COMPUTED
// ============================================================================

const hasData = computed(() => iegmData.data.value);

// Dados simulados para demonstração - em produção viriam da API
const evolucaoIndicadores = computed(() => {
  if (!iegmData.data.value) return [];

  const atual = iegmData.data.value;
  const anterior = {
    percentualIamb: (atual.percentualIamb || 0) - 0.05,
    percentualIcidade: (atual.percentualIcidade || 0) + 0.03,
    percentualIeduc: (atual.percentualIeduc || 0) - 0.02,
    percentualIfiscal: (atual.percentualIfiscal || 0) + 0.08,
    percentualIgovTi: (atual.percentualIgovTi || 0) - 0.01,
    percentualIsaude: (atual.percentualIsaude || 0) + 0.04,
    percentualIplan: (atual.percentualIplan || 0) + 0.06
  };

  return [
    {
      codigo: 'i-Amb',
      nome: 'Meio Ambiente',
      anterior: anterior.percentualIamb,
      atual: atual.percentualIamb || 0,
      evolucao: (atual.percentualIamb || 0) - anterior.percentualIamb
    },
    {
      codigo: 'i-Cidade',
      nome: 'Cidades',
      anterior: anterior.percentualIcidade,
      atual: atual.percentualIcidade || 0,
      evolucao: (atual.percentualIcidade || 0) - anterior.percentualIcidade
    },
    {
      codigo: 'i-Educ',
      nome: 'Educação',
      anterior: anterior.percentualIeduc,
      atual: atual.percentualIeduc || 0,
      evolucao: (atual.percentualIeduc || 0) - anterior.percentualIeduc
    },
    {
      codigo: 'i-Fiscal',
      nome: 'Gestão Fiscal',
      anterior: anterior.percentualIfiscal,
      atual: atual.percentualIfiscal || 0,
      evolucao: (atual.percentualIfiscal || 0) - anterior.percentualIfiscal
    },
    {
      codigo: 'i-GovTI',
      nome: 'Governança TI',
      anterior: anterior.percentualIgovTi,
      atual: atual.percentualIgovTi || 0,
      evolucao: (atual.percentualIgovTi || 0) - anterior.percentualIgovTi
    },
    {
      codigo: 'i-Saude',
      nome: 'Saúde',
      anterior: anterior.percentualIsaude,
      atual: atual.percentualIsaude || 0,
      evolucao: (atual.percentualIsaude || 0) - anterior.percentualIsaude
    },
    {
      codigo: 'i-Plan',
      nome: 'Planejamento',
      anterior: anterior.percentualIplan,
      atual: atual.percentualIplan || 0,
      evolucao: (atual.percentualIplan || 0) - anterior.percentualIplan
    }
  ];
});

const evolucaoGeral = computed(() => {
  if (!evolucaoIndicadores.value.length) return 0;
  const soma = evolucaoIndicadores.value.reduce((sum, ind) => sum + ind.evolucao, 0);
  return soma / evolucaoIndicadores.value.length;
});

const melhorIndicador = computed(() => {
  if (!evolucaoIndicadores.value.length) return { nome: 'N/A', evolucao: 0 };
  return evolucaoIndicadores.value.reduce((prev, current) =>
    current.evolucao > prev.evolucao ? current : prev
  );
});

const piorIndicador = computed(() => {
  if (!evolucaoIndicadores.value.length) return { nome: 'N/A', evolucao: 0 };
  return evolucaoIndicadores.value.reduce((prev, current) =>
    current.evolucao < prev.evolucao ? current : prev
  );
});

const indicadoresMelhorados = computed(() => {
  if (!evolucaoIndicadores.value.length) return 0;
  return evolucaoIndicadores.value.filter(ind => ind.evolucao > 0).length;
});

// ============================================================================
// MÉTODOS
// ============================================================================

const formatPercentual = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatEvolucao = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
};

const getEvolucaoColor = (value: number): string => {
  if (value > 0.05) return 'text-green-600';
  if (value > 0) return 'text-blue-600';
  if (value > -0.05) return 'text-yellow-600';
  return 'text-red-600';
};

const getStatusClass = (value: number): string => {
  if (value > 0.05) return 'bg-green-100 text-green-800';
  if (value > 0) return 'bg-blue-100 text-blue-800';
  if (value > -0.05) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getStatusText = (value: number): string => {
  if (value > 0.05) return 'Melhoria Significativa';
  if (value > 0) return 'Melhoria';
  if (value > -0.05) return 'Estável';
  return 'Queda';
};

const drawTendenciaChart = () => {
  if (!tendenciaCanvas.value || !hasData.value) return;

  const canvas = tendenciaCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Configurar canvas
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const data = evolucaoIndicadores.value;
  const barWidth = (rect.width - 100) / data.length;
  const maxEvolucao = Math.max(...data.map(d => Math.abs(d.evolucao)));
  const scale = (rect.height - 80) / (maxEvolucao * 2);

  // Desenhar linha zero
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, rect.height / 2);
  ctx.lineTo(rect.width - 20, rect.height / 2);
  ctx.stroke();

  // Desenhar barras
  data.forEach((item, index) => {
    const x = 60 + index * barWidth;
    const barHeight = Math.abs(item.evolucao) * scale;
    const y = item.evolucao >= 0 ? rect.height / 2 - barHeight : rect.height / 2;

    // Cor da barra
    ctx.fillStyle = item.evolucao >= 0 ? '#10b981' : '#ef4444';

    // Desenhar barra
    ctx.fillRect(x, y, barWidth * 0.8, barHeight);

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    // Label do indicador
    ctx.save();
    ctx.translate(x + barWidth / 2, rect.height - 15);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(item.codigo, 0, 0);
    ctx.restore();

    // Valor da evolução
    const valueY = item.evolucao >= 0 ? y - 10 : y + barHeight + 15;
    ctx.fillText(formatEvolucao(item.evolucao), x + barWidth / 2, valueY);
  });

  // Eixo Y
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 20);
  ctx.lineTo(50, rect.height - 30);
  ctx.stroke();

  // Labels do eixo Y
  ctx.fillStyle = '#374151';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 4; i++) {
    const y = 20 + (rect.height - 50) * i / 4;
    const value = maxEvolucao * (1 - i / 2);
    ctx.fillText(formatEvolucao(value), 45, y);
  }
};

// ============================================================================
// WATCHERS
// ============================================================================

watch([iegmData.data], () => {
  if (hasData.value) {
    drawTendenciaChart();
  }
}, { immediate: true });

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  if (hasData.value) {
    drawTendenciaChart();
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
