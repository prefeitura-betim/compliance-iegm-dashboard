import { IEGMData } from '@/hooks/useIEGMData'
import { getFaixaLabel, getFaixaGradient } from '@/lib/iegmUtils'
import { BookOpen, HeartPulse, Coins, TreePine, Building2, ClipboardList, Laptop, TrendingUp, Target, BarChart3 } from 'lucide-react'

interface SummaryCardsProps {
    data: IEGMData
}

const indicadores = [
    { key: 'percentualIeduc', faixaKey: 'faixaIeduc', nome: 'Educação', icon: BookOpen },
    { key: 'percentualIsaude', faixaKey: 'faixaIsaude', nome: 'Saúde', icon: HeartPulse },
    { key: 'percentualIfiscal', faixaKey: 'faixaIfiscal', nome: 'Gestão Fiscal', icon: Coins },
    { key: 'percentualIamb', faixaKey: 'faixaIamb', nome: 'Meio Ambiente', icon: TreePine },
    { key: 'percentualIcidade', faixaKey: 'faixaIcidade', nome: 'Cidades', icon: Building2 },
    { key: 'percentualIplan', faixaKey: 'faixaIplan', nome: 'Planejamento', icon: ClipboardList },
    { key: 'percentualIgovTi', faixaKey: 'faixaIgovTi', nome: 'Governança TI', icon: Laptop },
]

export default function SummaryCards({ data }: SummaryCardsProps) {
    if (!data.resultados) {
        return (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 text-center">
                <p className="text-yellow-800 font-medium">Nenhum dado disponível para este município.</p>
            </div>
        )
    }

    const resultados = data.resultados

    const getFaixaStyle = (faixa: string | null) => {
        if (!faixa) return 'bg-gray-100 text-gray-600'
        if (faixa.startsWith('A')) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200/50'
        if (faixa === 'B+') return 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-emerald-200/50'
        if (faixa === 'B') return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-yellow-200/50'
        if (faixa === 'C+') return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-orange-200/50'
        return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-200/50'
    }

    return (
        <div className="space-y-6">
            {/* Card Principal - IEGM Geral */}
            {(() => {
                // Definir cores dinâmicas baseadas na faixa
                const faixa = resultados.faixaIegmMunicipio
                const getAccentColors = (f: string | null) => {
                    if (!f) return { glow: 'bg-gray-400/20', border: 'border-white/20', accent: 'text-gray-400', scoreBg: 'bg-gray-500', scoreGlow: 'bg-gray-400/20' }
                    if (f.startsWith('A')) return { glow: 'bg-green-400/30', border: 'border-green-400/30', accent: 'text-green-400', scoreBg: 'bg-green-500', scoreGlow: 'bg-green-400/30' }
                    if (f === 'B+') return { glow: 'bg-emerald-400/25', border: 'border-emerald-400/30', accent: 'text-emerald-400', scoreBg: 'bg-emerald-500', scoreGlow: 'bg-emerald-400/25' }
                    if (f === 'B') return { glow: 'bg-yellow-400/25', border: 'border-yellow-400/30', accent: 'text-yellow-400', scoreBg: 'bg-yellow-500', scoreGlow: 'bg-yellow-400/25' }
                    if (f === 'C+') return { glow: 'bg-orange-400/25', border: 'border-orange-400/30', accent: 'text-orange-400', scoreBg: 'bg-orange-500', scoreGlow: 'bg-orange-400/25' }
                    return { glow: 'bg-red-400/25', border: 'border-red-400/30', accent: 'text-red-400', scoreBg: 'bg-red-500', scoreGlow: 'bg-red-400/25' }
                }
                const colors = getAccentColors(faixa)

                return (
                    <div className="relative bg-gradient-to-br from-betim-blue via-betim-blue-dark to-indigo-900 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
                        {/* Decorative elements with dynamic colors */}
                        <div className={`absolute top-0 right-0 w-96 h-96 ${colors.glow} rounded-full -mr-48 -mt-48 blur-3xl`}></div>
                        <div className={`absolute bottom-0 left-0 w-64 h-64 ${colors.glow} rounded-full -ml-32 -mb-32 blur-2xl`}></div>
                        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                {/* Left: Score */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className={`w-28 h-28 rounded-2xl ${colors.scoreBg} flex items-center justify-center shadow-xl border border-white/20`}>
                                            <div className="text-center">
                                                <span className="text-4xl font-black block text-white">
                                                    {resultados.percentualIegmMunicipio
                                                        ? `${(resultados.percentualIegmMunicipio * 100).toFixed(0)}`
                                                        : 'N/D'}
                                                </span>
                                                <span className="text-white/90 text-xs font-medium">pontos</span>
                                            </div>
                                        </div>
                                        {/* Glow effect with dynamic color */}
                                        <div className={`absolute inset-0 rounded-2xl ${colors.scoreGlow} blur-xl -z-10`}></div>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Índice de Efetividade</p>
                                        <h2 className="text-3xl font-bold mt-1">IEGM Municipal</h2>
                                        <p className={`text-sm mt-2 ${colors.accent}`}>
                                            {resultados.percentualIegmMunicipio
                                                ? `${(resultados.percentualIegmMunicipio * 100).toFixed(1)}%`
                                                : 'N/D'} de efetividade geral
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Faixa */}
                                <div className="flex flex-col items-start lg:items-end gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Faixa</span>
                                    </div>
                                    <div className={`px-6 py-3 rounded-xl text-2xl font-black shadow-lg ${getFaixaStyle(resultados.faixaIegmMunicipio)}`}>
                                        {resultados.faixaIegmMunicipio || 'N/D'}
                                    </div>
                                    <span className={`text-sm ${colors.accent} bg-white/10 px-3 py-1 rounded-lg backdrop-blur`}>
                                        {getFaixaLabel(resultados.faixaIegmMunicipio)}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            {data.comparativoEstadual && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 ${colors.border} border`}>
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className={colors.accent} size={20} />
                                            <div>
                                                <p className="text-white/60 text-xs font-medium">Posição no Ranking</p>
                                                <p className="text-xl font-bold">{data.comparativoEstadual.posicaoRanking}° <span className="text-white/50 text-sm font-normal">de {data.comparativoEstadual.totalMunicipios}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 ${colors.border} border`}>
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="text-emerald-400" size={20} />
                                            <div>
                                                <p className="text-white/60 text-xs font-medium">Média Estadual</p>
                                                <p className="text-xl font-bold">{(data.comparativoEstadual.mediaEstadual * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 ${colors.border} border`}>
                                        <div className="flex items-center gap-3">
                                            <Target className={colors.accent} size={20} />
                                            <div>
                                                <p className="text-white/60 text-xs font-medium">Diferença da Média Estadual</p>
                                                <p className={`text-xl font-bold ${resultados.percentualIegmMunicipio && resultados.percentualIegmMunicipio > data.comparativoEstadual.mediaEstadual ? 'text-green-400' : 'text-orange-400'}`}>
                                                    {resultados.percentualIegmMunicipio
                                                        ? `${resultados.percentualIegmMunicipio > data.comparativoEstadual.mediaEstadual ? '+' : ''}${((resultados.percentualIegmMunicipio - data.comparativoEstadual.mediaEstadual) * 100).toFixed(1)} pts`
                                                        : 'N/D'}
                                                </p>
                                                <p className="text-white/40 text-[10px]">
                                                    {resultados.percentualIegmMunicipio && resultados.percentualIegmMunicipio > data.comparativoEstadual.mediaEstadual
                                                        ? 'Acima da média'
                                                        : 'Abaixo da média'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })()}

            {/* Cards dos Indicadores - Layout Compacto */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {indicadores.map((ind) => {
                    const valor = resultados[ind.key as keyof typeof resultados] as number | null
                    const faixa = resultados[ind.faixaKey as keyof typeof resultados] as string | null
                    const Icon = ind.icon
                    const percentage = valor ? valor * 100 : 0
                    const faixaGradient = getFaixaGradient(faixa)

                    return (
                        <div
                            key={ind.key}
                            className="group relative bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Hover gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${faixaGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                            <div className="relative">
                                {/* Header: Icon + Faixa */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${faixaGradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Icon size={18} className="text-white" />
                                    </div>
                                    {faixa && (
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-white shadow-sm bg-gradient-to-r ${getFaixaStyle(faixa)}`}>
                                            {faixa}
                                        </span>
                                    )}
                                </div>

                                {/* Label */}
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{ind.nome}</h3>

                                {/* Value + Progress */}
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-xl font-black text-gray-900">
                                        {valor ? Math.round(percentage) : 'N/D'}
                                    </span>
                                    {valor && <span className="text-xs text-gray-400 font-medium">%</span>}
                                </div>

                                {/* Mini progress bar */}
                                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${faixaGradient} transition-all duration-700`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

