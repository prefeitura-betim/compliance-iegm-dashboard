<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Comparativo Estadual</h3>

    <div v-if="!hasData" class="text-center py-8">
      <p class="text-gray-500">Dados do comparativo estadual não disponíveis</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Resumo Geral -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-blue-600">Municípios que Responderam</div>
          <div class="text-2xl font-bold text-blue-900">
            {{ comparativo?.quantidadeMunicipiosResponderam || 0 }}
          </div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-green-600">Média Estadual IEGM</div>
          <div class="text-2xl font-bold text-green-900">
            {{ formatPercentual(comparativo?.percentualIegmEstado || 0) }}
          </div>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-purple-600">Faixa Estadual</div>
          <div class="text-2xl font-bold text-purple-900">
            {{ comparativo?.faixaIegmEstado || 'N/A' }}
          </div>
        </div>
      </div>

      <!-- Comparativo por Indicador -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Comparativo por Indicador</h4>
        <div class="space-y-3">
          <div
            v-for="indicador in indicadoresComparativo"
            :key="indicador.codigo"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ indicador.nome }}</div>
              <div class="text-sm text-gray-500">{{ indicador.codigo }}</div>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Município -->
              <div class="text-center">
                <div class="text-sm text-gray-500">Município</div>
                <div class="font-bold" :class="getScoreColor(indicador.municipio)">
                  {{ formatPercentual(indicador.municipio) }}
                </div>
                <div class="text-xs text-gray-400">{{ indicador.faixaMunicipio }}</div>
              </div>

              <!-- Estado -->
              <div class="text-center">
                <div class="text-sm text-gray-500">Estado</div>
                <div class="font-bold" :class="getScoreColor(indicador.estado)">
                  {{ formatPercentual(indicador.estado) }}
                </div>
                <div class="text-xs text-gray-400">{{ indicador.faixaEstado }}</div>
              </div>

              <!-- Diferença -->
              <div class="text-center min-w-[60px]">
                <div class="text-sm text-gray-500">Dif.</div>
                <div
                  class="font-bold text-sm"
                  :class="getDifferenceColor(indicador.diferenca)"
                >
                  {{ formatDifference(indicador.diferenca) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Barras -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-4">Visualização Comparativa</h4>
        <div class="h-64 bg-gray-50 rounded-lg p-4">
          <canvas ref="barCanvas" class="w-full h-full"></canvas>
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

const { iegmData, comparativoEstadual } = useIEGMQueries(props.municipioId, props.ano);

// ============================================================================
// REFS
// ============================================================================

const barCanvas = ref<HTMLCanvasElement>();

// ============================================================================
// COMPUTED
// ============================================================================

const hasData = computed(() =>
  iegmData.data.value && comparativoEstadual.data.value
);

const comparativo = computed(() => comparativoEstadual.data.value);

const indicadoresComparativo = computed(() => {
  if (!hasData.value) return [];

  const municipio = iegmData.data.value;
  const estado = comparativoEstadual.data.value;

  return [
    {
      codigo: 'i-Amb',
      nome: 'Meio Ambiente',
      municipio: municipio?.percentualIamb || 0,
      estado: estado?.percentualIamb || 0,
      faixaMunicipio: municipio?.faixaIamb || 'N/A',
      faixaEstado: estado?.faixaIamb || 'N/A',
      diferenca: (municipio?.percentualIamb || 0) - (estado?.percentualIamb || 0)
    },
    {
      codigo: 'i-Cidade',
      nome: 'Cidades',
      municipio: municipio?.percentualIcidade || 0,
      estado: estado?.percentualIcidade || 0,
      faixaMunicipio: municipio?.faixaIcidade || 'N/A',
      faixaEstado: estado?.faixaIcidade || 'N/A',
      diferenca: (municipio?.percentualIcidade || 0) - (estado?.percentualIcidade || 0)
    },
    {
      codigo: 'i-Educ',
      nome: 'Educação',
      municipio: municipio?.percentualIeduc || 0,
      estado: estado?.percentualIeduc || 0,
      faixaMunicipio: municipio?.faixaIeduc || 'N/A',
      faixaEstado: estado?.faixaIeduc || 'N/A',
      diferenca: (municipio?.percentualIeduc || 0) - (estado?.percentualIeduc || 0)
    },
    {
      codigo: 'i-Fiscal',
      nome: 'Gestão Fiscal',
      municipio: municipio?.percentualIfiscal || 0,
      estado: estado?.percentualIfiscal || 0,
      faixaMunicipio: municipio?.faixaIfiscal || 'N/A',
      faixaEstado: estado?.faixaIfiscal || 'N/A',
      diferenca: (municipio?.percentualIfiscal || 0) - (estado?.percentualIfiscal || 0)
    },
    {
      codigo: 'i-GovTI',
      nome: 'Governança TI',
      municipio: municipio?.percentualIgovTi || 0,
      estado: estado?.percentualIgovTi || 0,
      faixaMunicipio: municipio?.faixaIgovTi || 'N/A',
      faixaEstado: estado?.faixaIgovTi || 'N/A',
      diferenca: (municipio?.percentualIgovTi || 0) - (estado?.percentualIgovTi || 0)
    },
    {
      codigo: 'i-Saude',
      nome: 'Saúde',
      municipio: municipio?.percentualIsaude || 0,
      estado: estado?.percentualIsaude || 0,
      faixaMunicipio: municipio?.faixaIsaude || 'N/A',
      faixaEstado: estado?.faixaIsaude || 'N/A',
      diferenca: (municipio?.percentualIsaude || 0) - (estado?.percentualIsaude || 0)
    },
    {
      codigo: 'i-Plan',
      nome: 'Planejamento',
      municipio: municipio?.percentualIplan || 0,
      estado: estado?.percentualIplan || 0,
      faixaMunicipio: municipio?.faixaIplan || 'N/A',
      faixaEstado: estado?.faixaIplan || 'N/A',
      diferenca: (municipio?.percentualIplan || 0) - (estado?.percentualIplan || 0)
    }
  ];
});

// ============================================================================
// MÉTODOS
// ============================================================================

const formatPercentual = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatDifference = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
};

const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-blue-600';
  if (score >= 0.4) return 'text-yellow-600';
  if (score >= 0.2) return 'text-orange-600';
  return 'text-red-600';
};

const getDifferenceColor = (value: number): string => {
  if (value > 0.05) return 'text-green-600';
  if (value > 0) return 'text-blue-600';
  if (value > -0.05) return 'text-yellow-600';
  return 'text-red-600';
};

const drawBarChart = () => {
  if (!barCanvas.value || !hasData.value) return;

  const canvas = barCanvas.value;
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

  const data = indicadoresComparativo.value;
  const barWidth = (rect.width - 100) / data.length;
  const maxValue = Math.max(...data.map(d => Math.max(d.municipio, d.estado)));
  const scale = (rect.height - 80) / maxValue;

  // Desenhar eixos
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;

  // Eixo Y
  ctx.beginPath();
  ctx.moveTo(50, 20);
  ctx.lineTo(50, rect.height - 30);
  ctx.stroke();

  // Eixo X
  ctx.beginPath();
  ctx.moveTo(50, rect.height - 30);
  ctx.lineTo(rect.width - 20, rect.height - 30);
  ctx.stroke();

  // Desenhar barras
  data.forEach((item, index) => {
    const x = 60 + index * barWidth;
    const municipioHeight = item.municipio * scale;
    const estadoHeight = item.estado * scale;

    // Barra do estado (fundo)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.fillRect(x, rect.height - 30 - estadoHeight, barWidth * 0.8, estadoHeight);

    // Barra do município
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + barWidth * 0.1, rect.height - 30 - municipioHeight, barWidth * 0.6, municipioHeight);

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

    // Valores
    ctx.fillText(formatPercentual(item.municipio), x + barWidth / 2, rect.height - 35 - municipioHeight);
  });

  // Legenda
  ctx.fillStyle = '#374151';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(rect.width - 120, 10, 15, 15);
  ctx.fillStyle = '#374151';
  ctx.fillText('Município', rect.width - 100, 22);

  ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.fillRect(rect.width - 120, 30, 15, 15);
  ctx.fillStyle = '#374151';
  ctx.fillText('Estado', rect.width - 100, 42);
};

// ============================================================================
// WATCHERS
// ============================================================================

watch([iegmData.data, comparativoEstadual.data], () => {
  if (hasData.value) {
    drawBarChart();
  }
}, { immediate: true });

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  if (hasData.value) {
    drawBarChart();
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
