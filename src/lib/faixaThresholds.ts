/**
 * Limiares das faixas do IEGM (valores em escala 0-1)
 * C:  0.00 – 0.50
 * C+: 0.50 – 0.60
 * B:  0.60 – 0.75
 * B+: 0.75 – 0.90
 * A:  0.90 – 1.00
 */

export const FAIXA_THRESHOLDS = [
    { faixa: 'C', min: 0, max: 0.50 },
    { faixa: 'C+', min: 0.50, max: 0.60 },
    { faixa: 'B', min: 0.60, max: 0.75 },
    { faixa: 'B+', min: 0.75, max: 0.90 },
    { faixa: 'A', min: 0.90, max: 1.00 },
] as const

/**
 * Retorna informações sobre a próxima faixa acima da atual.
 * Se já estiver na faixa A, retorna null.
 *
 * @param currentPercentual - valor em escala 0-1 (ex: 0.65 = 65%)
 */
export function getNextFaixa(currentPercentual: number | null): {
    faixa: string
    threshold: number
    gap: number
    gapPercent: number
} | null {
    if (currentPercentual === null || currentPercentual === undefined) return null

    // Encontrar a faixa atual
    for (let i = 0; i < FAIXA_THRESHOLDS.length; i++) {
        const current = FAIXA_THRESHOLDS[i]
        if (currentPercentual < current.max || (i === FAIXA_THRESHOLDS.length - 1)) {
            // Se já está na faixa A (última), não há próxima
            if (i === FAIXA_THRESHOLDS.length - 1) return null

            const next = FAIXA_THRESHOLDS[i + 1]
            const gap = next.min - currentPercentual
            return {
                faixa: next.faixa,
                threshold: next.min,
                gap: Math.max(0, gap),
                gapPercent: Math.max(0, gap * 100),
            }
        }
    }

    return null
}

/**
 * Calcula especificamente quanto falta para atingir a Faixa B (60%).
 * Se já estiver na faixa B ou acima, retorna null.
 *
 * @param currentPercentual - valor em escala 0-1
 */
export function getGapToFaixaB(currentPercentual: number | null): {
    gap: number
    gapPercent: number
} | null {
    if (currentPercentual === null || currentPercentual === undefined) return null
    if (currentPercentual >= 0.60) return null

    const gap = 0.60 - currentPercentual
    return {
        gap,
        gapPercent: gap * 100,
    }
}
