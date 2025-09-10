<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Análise Radar dos Indicadores</h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Município vs Estado</span>
        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span class="text-sm text-gray-500">Município</span>
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span class="text-sm text-gray-500">Estado</span>
      </div>
    </div>

    <div v-if="!hasData" class="text-center py-8">
      <p class="text-gray-500">Dados não disponíveis para análise radar</p>
    </div>

    <div v-else class="relative">
      <!-- Canvas para o gráfico radar -->
      <canvas ref="radarCanvas" width="400" height="400" class="mx-auto"></canvas>

      <!-- Informações adicionais -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="indicador in indicadoresData"
          :key="indicador.codigo"
          class="text-center p-3 bg-gray-50 rounded-lg"
        >
          <div class="text-sm font-medium text-gray-900">{{ indicador.nome }}</div>
          <div class="text-lg font-bold" :class="getScoreColor(indicador.score)">
            {{ formatPercentual(indicador.score) }}
          </div>
          <div class="text-xs text-gray-500">{{ indicador.faixa }}</div>
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

const radarCanvas = ref<HTMLCanvasElement>();

// ============================================================================
// COMPUTED
// ============================================================================

const hasData = computed(() =>
  iegmData.data.value && comparativoEstadual.data.value
);

const indicadoresData = computed(() => {
  if (!iegmData.data.value) return [];

  const data = iegmData.data.value;

  return [
    {
      codigo: 'i-Amb',
      nome: 'Meio Ambiente',
      score: data.percentualIamb || 0,
      faixa: data.faixaIamb || 'N/A'
    },
    {
      codigo: 'i-Cidade',
      nome: 'Cidades',
      score: data.percentualIcidade || 0,
      faixa: data.faixaIcidade || 'N/A'
    },
    {
      codigo: 'i-Educ',
      nome: 'Educação',
      score: data.percentualIeduc || 0,
      faixa: data.faixaIeduc || 'N/A'
    },
    {
      codigo: 'i-Fiscal',
      nome: 'Gestão Fiscal',
      score: data.percentualIfiscal || 0,
      faixa: data.faixaIfiscal || 'N/A'
    },
    {
      codigo: 'i-GovTI',
      nome: 'Governança TI',
      score: data.percentualIgovTi || 0,
      faixa: data.faixaIgovTi || 'N/A'
    },
    {
      codigo: 'i-Saude',
      nome: 'Saúde',
      score: data.percentualIsaude || 0,
      faixa: data.faixaIsaude || 'N/A'
    },
    {
      codigo: 'i-Plan',
      nome: 'Planejamento',
      score: data.percentualIplan || 0,
      faixa: data.faixaIplan || 'N/A'
    }
  ];
});

const dadosEstadual = computed(() => {
  if (!comparativoEstadual.data.value) return [];

  const data = comparativoEstadual.data.value;

  return [
    data.percentualIamb || 0,
    data.percentualIcidade || 0,
    data.percentualIeduc || 0,
    data.percentualIfiscal || 0,
    data.percentualIgovTi || 0,
    data.percentualIsaude || 0,
    data.percentualIplan || 0
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

const drawRadarChart = () => {
  if (!radarCanvas.value || !hasData.value) return;

  const canvas = radarCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 40;
  const numIndicadores = indicadoresData.value.length;

  // Configurações
  const labels = indicadoresData.value.map(i => i.nome);
  const municipioData = indicadoresData.value.map(i => i.score);
  const estadualData = dadosEstadual.value;

  // Desenhar círculos concêntricos
  for (let i = 1; i <= 5; i++) {
    const currentRadius = (radius * i) / 5;
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let j = 0; j < numIndicadores; j++) {
      const angle = (j * 2 * Math.PI) / numIndicadores - Math.PI / 2;
      const x = centerX + currentRadius * Math.cos(angle);
      const y = centerY + currentRadius * Math.sin(angle);

      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Desenhar linhas dos indicadores
  for (let i = 0; i < numIndicadores; i++) {
    const angle = (i * 2 * Math.PI) / numIndicadores - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Adicionar labels
    const labelRadius = radius + 20;
    const labelX = centerX + labelRadius * Math.cos(angle);
    const labelY = centerY + labelRadius * Math.sin(angle);

    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Quebrar texto longo
    const words = labels[i].split(' ');
    const lineHeight = 14;
    words.forEach((word, index) => {
      const offsetY = (index - (words.length - 1) / 2) * lineHeight;
      ctx.fillText(word, labelX, labelY + offsetY);
    });
  }

  // Desenhar dados do estado
  if (estadualData.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.lineWidth = 2;

    for (let i = 0; i < numIndicadores; i++) {
      const angle = (i * 2 * Math.PI) / numIndicadores - Math.PI / 2;
      const value = estadualData[i] || 0;
      const currentRadius = radius * value;
      const x = centerX + currentRadius * Math.cos(angle);
      const y = centerY + currentRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Desenhar dados do município
  ctx.beginPath();
  ctx.strokeStyle = '#3b82f6';
  ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  ctx.lineWidth = 3;

  for (let i = 0; i < numIndicadores; i++) {
    const angle = (i * 2 * Math.PI) / numIndicadores - Math.PI / 2;
    const value = municipioData[i] || 0;
    const currentRadius = radius * value;
    const x = centerX + currentRadius * Math.cos(angle);
    const y = centerY + currentRadius * Math.sin(angle);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Adicionar pontos nos vértices
  for (let i = 0; i < numIndicadores; i++) {
    const angle = (i * 2 * Math.PI) / numIndicadores - Math.PI / 2;
    const value = municipioData[i] || 0;
    const currentRadius = radius * value;
    const x = centerX + currentRadius * Math.cos(angle);
    const y = centerY + currentRadius * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
  }
};

// ============================================================================
// WATCHERS
// ============================================================================

watch([iegmData.data, comparativoEstadual.data], () => {
  if (hasData.value) {
    drawRadarChart();
  }
}, { immediate: true });

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  if (hasData.value) {
    drawRadarChart();
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
