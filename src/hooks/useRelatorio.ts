import { ref, computed } from 'vue';
import { useIEGMServices } from './useIEGMServices';
import { useIEGMQueries } from './useIEGMQueries';
import type { Municipio } from '@/types/iegm';

// ============================================================================
// HOOK DE RELATÓRIOS
// ============================================================================

export function useRelatorio(municipioId?: number, ano?: number) {
  const { municipioService, isApiMode } = useIEGMServices();
  const { municipio, iegmData, analise, respostasDetalhadas, comparativoEstadual } = useIEGMQueries(municipioId, ano);

  const isGenerating = ref(false);
  const generationProgress = ref(0);
  const lastGeneratedReport = ref<{ url: string; timestamp: Date } | null>(null);

  // ============================================================================
  // DADOS COMPUTADOS
  // ============================================================================

  const hasData = computed(() =>
    municipio.data.value &&
    iegmData.data.value &&
    analise.data.value
  );

  const reportData = computed(() => ({
    municipio: municipio.data.value,
    iegmData: iegmData.data.value,
    analise: analise.data.value,
    respostasDetalhadas: respostasDetalhadas.data.value,
    comparativoEstadual: comparativoEstadual.data.value,
    metadata: {
      generatedAt: new Date().toISOString(),
      municipioId,
      ano,
      version: '1.0.0'
    }
  }));

  // ============================================================================
  // MÉTODOS DE GERAÇÃO
  // ============================================================================

  const generateReport = async (formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob | null> => {
    if (!hasData.value || !municipioId || !ano) {
      throw new Error('Dados insuficientes para gerar relatório');
    }

    isGenerating.value = true;
    generationProgress.value = 0;

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        if (generationProgress.value < 90) {
          generationProgress.value += 10;
        }
      }, 200);

      let report: Blob | null = null;

      if (isApiMode.value && municipioService.value) {
        // Usar API para gerar relatório
        report = await municipioService.value.gerarRelatorio(municipioId, ano, formato);
      } else {
        // Gerar relatório localmente
        report = await generateLocalReport(formato);
      }

      generationProgress.value = 100;
      clearInterval(progressInterval);

      // Salvar referência do último relatório gerado
      if (report) {
        const url = URL.createObjectURL(report);
        lastGeneratedReport.value = {
          url,
          timestamp: new Date()
        };
      }

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error('Falha ao gerar relatório');
    } finally {
      isGenerating.value = false;
      generationProgress.value = 0;
    }
  };

  const generateLocalReport = async (formato: 'pdf' | 'excel'): Promise<Blob> => {
    // Implementação local de geração de relatório
    const data = reportData.value;

    if (formato === 'pdf') {
      return generatePDFReport(data);
    } else {
      return generateExcelReport(data);
    }
  };

  const generatePDFReport = async (data: any): Promise<Blob> => {
    // Simular geração de PDF
    const content = `
      Relatório IEGM - ${data.municipio?.nome || 'Município'}
      Ano: ${data.metadata.ano}
      Gerado em: ${data.metadata.generatedAt}

      Dados IEGM:
      - Percentual Geral: ${data.iegmData?.percentualIegmMunicipio || 'N/A'}
      - Faixa: ${data.iegmData?.faixaIegmMunicipio || 'N/A'}
    `;

    return new Blob([content], { type: 'application/pdf' });
  };

  const generateExcelReport = async (data: any): Promise<Blob> => {
    // Simular geração de Excel
    const content = `
      Municipio,Ano,PercentualGeral,Faixa
      ${data.municipio?.nome || 'N/A'},${data.metadata.ano},${data.iegmData?.percentualIegmMunicipio || 'N/A'},${data.iegmData?.faixaIegmMunicipio || 'N/A'}
    `;

    return new Blob([content], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  };

  // ============================================================================
  // MÉTODOS DE EXPORTAÇÃO
  // ============================================================================

  const exportData = async (formato: 'csv' | 'json' = 'csv'): Promise<string> => {
    if (!hasData.value || !municipioId || !ano) {
      throw new Error('Dados insuficientes para exportação');
    }

    try {
      if (isApiMode.value && municipioService.value) {
        return await municipioService.value.exportarDados(municipioId, ano, formato);
      } else {
        return exportLocalData(formato);
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw new Error('Falha ao exportar dados');
    }
  };

  const exportLocalData = (formato: 'csv' | 'json'): string => {
    const data = reportData.value;

    if (formato === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return convertToCSV(data);
    }
  };

  const convertToCSV = (data: any): string => {
    const municipio = data.municipio;
    const iegmData = data.iegmData;

    if (!municipio || !iegmData) return '';

    const headers = [
      'Municipio',
      'Ano',
      'Percentual_IEGM',
      'Faixa_IEGM',
      'Percentual_IAmb',
      'Faixa_IAmb',
      'Percentual_ICidade',
      'Faixa_ICidade',
      'Percentual_IEduc',
      'Faixa_IEduc',
      'Percentual_IFiscal',
      'Faixa_IFiscal',
      'Percentual_IGovTI',
      'Faixa_IGovTI',
      'Percentual_ISaude',
      'Faixa_ISaude',
      'Percentual_IPlan',
      'Faixa_IPlan'
    ];

    const values = [
      municipio.nome || '',
      data.metadata.ano || '',
      iegmData.percentualIegmMunicipio || '',
      iegmData.faixaIegmMunicipio || '',
      iegmData.percentualIamb || '',
      iegmData.faixaIamb || '',
      iegmData.percentualIcidade || '',
      iegmData.faixaIcidade || '',
      iegmData.percentualIeduc || '',
      iegmData.faixaIeduc || '',
      iegmData.percentualIfiscal || '',
      iegmData.faixaIfiscal || '',
      iegmData.percentualIgovTi || '',
      iegmData.faixaIgovTi || '',
      iegmData.percentualIsaude || '',
      iegmData.faixaIsaude || '',
      iegmData.percentualIplan || '',
      iegmData.faixaIplan || ''
    ];

    return [headers.join(';'), values.join(';')].join('\n');
  };

  // ============================================================================
  // MÉTODOS DE DOWNLOAD
  // ============================================================================

  const downloadReport = async (formato: 'pdf' | 'excel' = 'pdf'): Promise<void> => {
    try {
      const report = await generateReport(formato);
      if (report) {
        const filename = `relatorio_iegm_${municipio.data.value?.nome || 'municipio'}_${ano}_${Date.now()}.${formato}`;
        downloadBlob(report, filename);
      }
    } catch (error) {
      console.error('Erro ao fazer download do relatório:', error);
      throw error;
    }
  };

  const downloadData = async (formato: 'csv' | 'json' = 'csv'): Promise<void> => {
    try {
      const data = await exportData(formato);
      const filename = `dados_iegm_${municipio.data.value?.nome || 'municipio'}_${ano}_${Date.now()}.${formato}`;
      downloadText(data, filename, formato === 'csv' ? 'text/csv' : 'application/json');
    } catch (error) {
      console.error('Erro ao fazer download dos dados:', error);
      throw error;
    }
  };

  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadText = (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  };

  // ============================================================================
  // MÉTODOS DE LIMPEZA
  // ============================================================================

  const cleanup = (): void => {
    if (lastGeneratedReport.value) {
      URL.revokeObjectURL(lastGeneratedReport.value.url);
      lastGeneratedReport.value = null;
    }
  };

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estados
    isGenerating,
    generationProgress,
    lastGeneratedReport,

    // Dados computados
    hasData,
    reportData,

    // Métodos de geração
    generateReport,
    generateLocalReport,

    // Métodos de exportação
    exportData,
    exportLocalData,

    // Métodos de download
    downloadReport,
    downloadData,

    // Métodos de limpeza
    cleanup
  };
}
