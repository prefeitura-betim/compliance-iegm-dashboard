/**
 * Retorna a cor de fundo baseada na faixa do IEGM
 */
export function getFaixaColor(faixa: string | null): string {
    switch (faixa?.toUpperCase()) {
        case 'A':
            return 'bg-green-100 text-green-800'
        case 'B+':
            return 'bg-emerald-100 text-emerald-800'
        case 'B':
            return 'bg-betim-yellow/10 text-betim-yellow'
        case 'C+':
            return 'bg-orange-100 text-orange-800'
        case 'C':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

/**
 * Retorna o gradiente de cores baseado na faixa do IEGM
 * Cores padrão: A=Verde, B+=Esmeralda, B=Amarelo, C+=Laranja, C=Vermelho
 */
export function getFaixaGradient(faixa: string | null): string {
    switch (faixa?.toUpperCase()) {
        case 'A':
            return 'from-green-500 to-emerald-500'
        case 'B+':
            return 'from-emerald-400 to-green-500'
        case 'B':
            return 'from-betim-yellow to-amber-500'
        case 'C+':
            return 'from-orange-400 to-orange-500'
        case 'C':
            return 'from-red-400 to-red-500'
        default:
            return 'from-gray-400 to-gray-500'
    }
}

/**
 * Retorna o label da faixa do IEGM
 */
export function getFaixaLabel(faixa: string | null): string {
    switch (faixa?.toUpperCase()) {
        case 'A':
            return 'Altamente Efetiva'
        case 'B+':
            return 'Muito Efetiva'
        case 'B':
            return 'Efetiva'
        case 'C+':
            return 'Em Fase de Adequação'
        case 'C':
            return 'Baixo Nível de Adequação'
        default:
            return 'Não Avaliado'
    }
}

/**
 * Formata percentual para exibição
 */
export function formatPercentual(valor: number | null): string {
    if (valor === null || valor === undefined) return 'N/D'
    return `${(valor * 100).toFixed(1)}%`
}

/**
 * Retorna a cor do gráfico baseada no valor percentual
 */
export function getChartColor(valor: number): string {
    if (valor >= 0.75) return '#22c55e' // green-500
    if (valor >= 0.5) return '#eab308'  // yellow-500
    if (valor >= 0.25) return '#f97316' // orange-500
    return '#ef4444' // red-500
}

/**
 * Cores padrão para os indicadores IEGM
 */
export const INDICADOR_COLORS = {
    'i-Educ': '#3b82f6',    // blue-500
    'i-Saude': '#ef4444',   // red-500
    'i-Fiscal': '#22c55e',  // green-500
    'i-Amb': '#10b981',     // emerald-500
    'i-Cidade': '#8b5cf6',  // violet-500
    'i-Plan': '#f59e0b',    // amber-500
    'i-GovTI': '#6366f1',   // indigo-500
}
