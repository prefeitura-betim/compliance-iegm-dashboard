import { useState } from 'react'
import { IEGMData } from '@/hooks/useIEGMData'
import { FAIXA_THRESHOLDS } from '@/lib/faixaThresholds'
import { ArrowUp, Target, CheckCircle } from 'lucide-react'

interface GapChartProps {
    data: IEGMData
}

const indicadores = [
    { key: 'percentualIeduc', faixaKey: 'faixaIeduc', nome: 'Educação', shortName: 'iEduc' },
    { key: 'percentualIsaude', faixaKey: 'faixaIsaude', nome: 'Saúde', shortName: 'iSaúde' },
    { key: 'percentualIfiscal', faixaKey: 'faixaIfiscal', nome: 'Gestão Fiscal', shortName: 'iFiscal' },
    { key: 'percentualIamb', faixaKey: 'faixaIamb', nome: 'Meio Ambiente', shortName: 'iAmb' },
    { key: 'percentualIcidade', faixaKey: 'faixaIcidade', nome: 'Cidades', shortName: 'iCidade' },
    { key: 'percentualIplan', faixaKey: 'faixaIplan', nome: 'Planejamento', shortName: 'iPlan' },
    { key: 'percentualIgovTi', faixaKey: 'faixaIgovTi', nome: 'Governança TI', shortName: 'iGovTI' },
]

const faixaOptions = FAIXA_THRESHOLDS.filter(f => f.faixa !== 'C') // Não faz sentido "atingir C"

const getBarColor = (gap: number, achieved: boolean) => {
    if (achieved) return 'bg-emerald-500'
    if (gap <= 5) return 'bg-amber-400'
    if (gap <= 15) return 'bg-orange-400'
    return 'bg-red-400'
}

const getBarBg = (achieved: boolean) => {
    return achieved ? 'bg-emerald-100' : 'bg-gray-100'
}

export default function GapChart({ data }: GapChartProps) {
    const [selectedFaixa, setSelectedFaixa] = useState('B')

    if (!data.resultados) return null

    const targetThreshold = FAIXA_THRESHOLDS.find(f => f.faixa === selectedFaixa)
    if (!targetThreshold) return null

    // Calcular gap de cada indicador para a faixa selecionada
    const gaps = indicadores.map(ind => {
        const valor = (data.resultados as any)?.[ind.key] as number | null
        const faixa = (data.resultados as any)?.[ind.faixaKey] as string | null
        const valorPercent = valor ? valor * 100 : 0
        const targetPercent = targetThreshold.min * 100
        const gap = targetPercent - valorPercent
        const achieved = gap <= 0

        return {
            ...ind,
            valor: valorPercent,
            faixa: faixa || 'N/D',
            gap: Math.max(0, gap),
            achieved,
        }
    })

    // Ordenar: não atingidos primeiro (maior gap) → atingidos
    const sorted = [...gaps].sort((a, b) => {
        if (a.achieved && !b.achieved) return 1
        if (!a.achieved && b.achieved) return -1
        return b.gap - a.gap
    })

    const totalAchieved = sorted.filter(g => g.achieved).length

    return (
        <div className="bg-white rounded-xl p-6 shadow-betim border border-gray-100">
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Target className="text-betim-blue" size={22} />
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Distância para a Meta</h3>
                        <p className="text-xs text-gray-500">Quanto falta em cada indicador</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Meta:</span>
                    <select
                        value={selectedFaixa}
                        onChange={(e) => setSelectedFaixa(e.target.value)}
                        className="text-sm font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:border-betim-blue focus:border-betim-blue focus:ring-1 focus:ring-betim-blue/20 outline-none transition-colors cursor-pointer"
                    >
                        {faixaOptions.map(f => (
                            <option key={f.faixa} value={f.faixa}>
                                Faixa {f.faixa} ({(f.min * 100).toFixed(0)}%)
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Progress summary */}
            <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className={`w-2 h-2 rounded-full ${totalAchieved === 7 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs text-gray-600">
                    <strong className={totalAchieved === 7 ? 'text-emerald-600' : 'text-gray-800'}>{totalAchieved}</strong> de 7 indicadores já atingiram a Faixa {selectedFaixa}
                </span>
            </div>

            {/* Bars */}
            <div className="space-y-3">
                {sorted.map((item) => (
                    <div key={item.key} className="group">
                        <div className="flex items-center gap-3">
                            {/* Label */}
                            <div className="w-28 sm:w-32 flex-shrink-0">
                                <span className="text-xs font-semibold text-gray-700 leading-tight block truncate" title={item.nome}>
                                    {item.nome}
                                </span>
                                <span className="text-[10px] text-gray-400">{item.valor.toFixed(1)}% · {item.faixa}</span>
                            </div>

                            {/* Bar area */}
                            <div className="flex-1 min-w-0">
                                {item.achieved ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`flex-1 h-6 rounded-md ${getBarBg(true)} overflow-hidden`}>
                                            <div
                                                className={`h-full rounded-md ${getBarColor(0, true)} transition-all duration-700 flex items-center justify-end pr-2`}
                                                style={{ width: '100%' }}
                                            >
                                                <CheckCircle size={13} className="text-white" />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 w-20 text-right whitespace-nowrap">
                                            Atingida ✓
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className={`flex-1 h-6 rounded-md ${getBarBg(false)} overflow-hidden relative`}>
                                            <div
                                                className={`h-full rounded-md ${getBarColor(item.gap, false)} transition-all duration-700`}
                                                style={{ width: `${Math.max(item.gap, 2)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 w-20 text-right whitespace-nowrap">
                                            Faltam {item.gap.toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer hint */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center">
                    <ArrowUp size={10} className="inline mr-1" />
                    Indicadores ordenados por prioridade — maiores gaps primeiro
                </p>
            </div>
        </div>
    )
}
