
import { IEGMData } from '@/hooks/useIEGMData'
import { formatPercentual } from '@/lib/iegmUtils'
import { TrendingUp, TrendingDown, Target, Trophy } from 'lucide-react'

interface ComparativoEstadualProps {
    data: IEGMData
    municipio: string
}

export default function ComparativoEstadual({ data, municipio }: ComparativoEstadualProps) {
    if (!data.comparativoEstadual || !data.resultados) {
        return null
    }

    const { mediaEstadual, posicaoRanking, totalMunicipios } = data.comparativoEstadual
    const percentualMunicipio = data.resultados.percentualIegmMunicipio || 0
    const diferencaMedia = percentualMunicipio - mediaEstadual

    // Cálculos de contexto
    const percentil = 100 - ((posicaoRanking / totalMunicipios) * 100)
    const isAboveAverage = diferencaMedia >= 0
    const isTop10 = posicaoRanking <= 10
    const isTop25 = percentil >= 75
    const isTop50 = percentil >= 50

    const faixa = data.resultados.faixaIegmMunicipio || 'N/D'

    // Helper para cores baseado na faixa (Mesma lógica do IEGM Municipal)
    const getColorTheme = (faixa: string) => {
        if (faixa === 'A') return { bg: 'bg-blue-50', solidBg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', ring: 'ring-blue-100', iconBg: 'bg-blue-100', groupHover: 'group-hover:bg-blue-600' }
        if (faixa === 'B+') return { bg: 'bg-emerald-50', solidBg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100', ring: 'ring-emerald-100', iconBg: 'bg-emerald-100', groupHover: 'group-hover:bg-emerald-600' }
        if (faixa === 'B') return { bg: 'bg-yellow-50', solidBg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-100', ring: 'ring-yellow-100', iconBg: 'bg-yellow-100', groupHover: 'group-hover:bg-yellow-600' }
        if (faixa === 'C+') return { bg: 'bg-orange-50', solidBg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-100', ring: 'ring-orange-100', iconBg: 'bg-orange-100', groupHover: 'group-hover:bg-orange-600' }
        return { bg: 'bg-red-50', solidBg: 'bg-red-600', text: 'text-red-600', border: 'border-red-100', ring: 'ring-red-100', iconBg: 'bg-red-100', groupHover: 'group-hover:bg-red-600' }
    }

    const theme = getColorTheme(faixa)

    return (
        <div className="bg-white rounded-xl p-6 shadow-betim border border-gray-100 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Trophy className="text-betim-blue" size={24} />
                        Comparativo Estadual
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Análise de desempenho em relação aos outros {totalMunicipios} municípios de Minas Gerais.
                    </p>
                </div>
            </div>

            {/* Narrativa Dinâmica */}
            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                <p className="text-gray-600 leading-relaxed text-sm text-center">
                    <strong>{municipio}</strong> ocupa a <strong className="text-gray-900">{posicaoRanking}<sup className="font-normal">ª</sup> posição</strong> no ranking estadual.
                    {isAboveAverage
                        ? (
                            <span> O desempenho é <span className="text-green-600 font-bold">superior à média do estado</span> (+{(diferencaMedia * 100).toFixed(1)}%).
                                {isTop10 && " Excelente resultado, estando entre os 10 melhores do estado!"}
                                {!isTop10 && isTop25 && " Um ótimo resultado, superando 75% dos municípios mineiros."}
                                {!isTop10 && !isTop25 && isTop50 && " O município está na metade superior do ranking."}
                            </span>
                        )
                        : (
                            <span> O desempenho está <span className="text-red-600 font-bold">abaixo da média estadual</span> ({(diferencaMedia * 100).toFixed(1)}%).
                                É recomendado focar nas dimensões com "Pontos de Atenção" para subir no ranking.
                            </span>
                        )
                    }
                </p>
            </div>

            {/* Cards Reinventados - Visual Limpo e Premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 mt-6">
                {/* Visual Ranking - Colorido por Faixa */}
                <div className={`relative overflow-hidden bg-white rounded-2xl shadow-sm border transition-all duration-300 group hover:shadow-xl ${theme.border}`}>
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <Trophy size={120} className={theme.text} />
                    </div>

                    <div className="p-8 relative z-10 flex flex-col items-center">
                        <div className={`p-4 rounded-2xl mb-5 group-hover:scale-110 transition-all duration-300 shadow-sm ring-1 text-white ${theme.solidBg} ${theme.groupHover} ring-black/5`}>
                            <Trophy size={32} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col items-center mb-4">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Ranking Estadual</span>
                            <div className={`text-5xl font-bold tracking-tight ${theme.text}`}>
                                {posicaoRanking}<span className="text-2xl ml-1">º</span>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 font-bold rounded-full text-xs text-white border-0 transition-colors ${theme.solidBg}`}>
                            Top {Math.ceil((posicaoRanking / totalMunicipios) * 100)}% de {totalMunicipios}
                        </div>
                    </div>
                </div>

                {/* Diferença da Média */}
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
                    <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity ${isAboveAverage ? 'text-green-600' : 'text-red-600'}`}>
                        {isAboveAverage
                            ? <TrendingUp size={120} />
                            : <TrendingDown size={120} />
                        }
                    </div>

                    <div className="p-8 relative z-10 flex flex-col items-center">
                        <div className={`p-4 rounded-2xl mb-5 group-hover:scale-110 transition-all duration-300 shadow-sm ring-1 ${isAboveAverage
                            ? 'bg-green-50/80 text-green-600 ring-green-100 group-hover:bg-green-600 group-hover:text-white'
                            : 'bg-red-50/80 text-red-600 ring-red-100 group-hover:bg-red-600 group-hover:text-white'
                            }`}>
                            {isAboveAverage
                                ? <TrendingUp size={32} strokeWidth={2} />
                                : <TrendingDown size={32} strokeWidth={2} />
                            }
                        </div>
                        <div className="flex flex-col items-center mb-4">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Diferença da Média</span>
                            <div className={`text-5xl font-bold tracking-tight ${isAboveAverage ? 'text-green-600' : 'text-red-600'}`}>
                                {isAboveAverage ? '+' : ''}{(diferencaMedia * 100).toFixed(1)}<span className="text-2xl">%</span>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 font-bold rounded-full text-xs border transition-colors ${isAboveAverage
                            ? 'text-green-700 bg-green-50 border-green-100 group-hover:bg-green-100'
                            : 'text-red-700 bg-red-50 border-red-100 group-hover:bg-red-100'
                            }`}>
                            {isAboveAverage ? 'Acima da Média' : 'Abaixo da Média'}
                        </div>
                    </div>
                </div>

                {/* Média Estadual */}
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <Target size={120} className="text-gray-600" />
                    </div>

                    <div className="p-8 relative z-10 flex flex-col items-center">
                        <div className="p-4 bg-gray-50/80 rounded-2xl text-gray-600 mb-5 group-hover:scale-110 group-hover:bg-gray-600 group-hover:text-white transition-all duration-300 shadow-sm ring-1 ring-gray-100">
                            <Target size={32} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col items-center mb-4">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Média Minas Gerais</span>
                            <div className="text-5xl font-bold text-gray-900 tracking-tight">
                                {formatPercentual(mediaEstadual)}
                            </div>
                        </div>
                        <div className="px-4 py-1.5 bg-gray-100 text-gray-600 font-bold rounded-full text-xs border border-gray-200 group-hover:bg-gray-200 transition-colors">
                            Pontuação de Referência
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra Visual com Gradiente Ajustado e Legendas Precisas */}
            <div className="relative pt-10 pb-4 px-2 bg-gray-50/50 rounded-xl border border-gray-100 mt-6">

                {/* Legendas com Posicionamento Absoluto (Centradas em suas faixas) */}
                <div className="absolute top-2 left-0 w-full h-8 text-[10px] sm:text-xs font-bold text-gray-400 tracking-wider">
                    {/* C: 0-50 (Centro ~25%) */}
                    <span className="absolute left-[25%] -translate-x-1/2 text-red-500">Baixo (C)</span>
                    {/* C+: 50-60 (Centro 55%) */}
                    <span className="absolute left-[55%] -translate-x-1/2 text-orange-500 whitespace-nowrap">Em Adequação (C+)</span>
                    {/* B: 60-75 (Centro 67.5%) */}
                    <span className="absolute left-[67.5%] -translate-x-1/2 text-yellow-600">Efetiva (B)</span>
                    {/* B+: 75-90 (Centro 82.5%) */}
                    <span className="absolute left-[82.5%] -translate-x-1/2 text-emerald-600 whitespace-nowrap">Muito Efetiva (B+)</span>
                    {/* A: 90-100 (Centro 95%) */}
                    <span className="absolute left-[95%] -translate-x-1/2 text-blue-600">Altamente (A)</span>
                </div>

                <div className="relative h-4 rounded-full shadow-inner ring-1 ring-black/5 mx-1 mt-2">
                    {/* Background com Gradiente Suave (Interpolado) - Cores Ancoradas nos Centros das Faixas */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-full"
                        style={{
                            background: `linear-gradient(to right, 
                                #ef4444 25%,   /* C (0-50) -> Center: 25% */
                                #f97316 55%,   /* C+ (50-60) -> Center: 55% */
                                #eab308 67.5%, /* B (60-75) -> Center: 67.5% */
                                #10b981 82.5%, /* B+ (75-90) -> Center: 82.5% */
                                #3b82f6 95%    /* A (90-100) -> Center: 95% */
                            )`
                        }}
                    >
                        {/* Grid Lines para separar as faixas visualmente (opcional, mantendo sutil) */}
                        <div className="absolute top-0 bottom-0 border-r border-white/20" style={{ left: '50%' }}></div>
                        <div className="absolute top-0 bottom-0 border-r border-white/20" style={{ left: '60%' }}></div>
                        <div className="absolute top-0 bottom-0 border-r border-white/20" style={{ left: '75%' }}></div>
                        <div className="absolute top-0 bottom-0 border-r border-white/20" style={{ left: '90%' }}></div>
                    </div>

                    {/* Marcador Média Estadual */}
                    <div
                        className="absolute -top-3 -bottom-3 w-0.5 bg-gray-800 z-10 opacity-60"
                        style={{ left: `${mediaEstadual * 100}%` }}
                    />
                    <div
                        className="absolute -top-7 text-[10px] font-bold text-gray-600 transform -translate-x-1/2 bg-white/80 px-1 rounded backdrop-blur-sm"
                        style={{ left: `${mediaEstadual * 100}%` }}
                    >
                        Média
                    </div>

                    {/* Marcador do Município */}
                    <div
                        className="absolute top-1/2 w-5 h-5 bg-white border-[3px] border-gray-900 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-1000 flex items-center justify-center -mt-[1px]"
                        style={{ left: `${percentualMunicipio * 100}%` }}
                    >
                        <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                    </div>

                    {/* Label Flutuante do Município */}
                    <div
                        className="absolute -bottom-9 font-bold text-xs bg-white border border-gray-200 shadow-sm px-2 py-1 rounded text-gray-800 transform -translate-x-1/2 whitespace-nowrap z-30 flex flex-col items-center"
                        style={{ left: `${percentualMunicipio * 100}%` }}
                    >
                        <div className="absolute -top-1 w-2 h-2 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                        Betim ({formatPercentual(percentualMunicipio)})
                    </div>
                </div>
            </div>
        </div>
    )
}
