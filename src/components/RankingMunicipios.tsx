import { IEGMData } from '@/hooks/useIEGMData'
import { BarChart3, MapPin, ChevronRight } from 'lucide-react'

interface RankingMunicipiosProps {
    data: IEGMData
    municipio: string
}

const getFaixaGradient = (faixa: string) => {
    if (faixa?.startsWith('A')) return 'from-green-500 to-emerald-600'
    if (faixa === 'B+') return 'from-emerald-400 to-green-500'
    if (faixa === 'B') return 'from-yellow-400 to-amber-500'
    if (faixa === 'C+') return 'from-orange-400 to-orange-500'
    return 'from-red-400 to-red-500'
}

const getPositionStyle = (position: number) => {
    if (position === 1) return { bg: 'bg-gradient-to-br from-betim-blue to-indigo-600', textColor: 'text-white' }
    if (position === 2) return { bg: 'bg-gradient-to-br from-gray-500 to-gray-600', textColor: 'text-white' }
    if (position === 3) return { bg: 'bg-gradient-to-br from-amber-600 to-amber-700', textColor: 'text-white' }
    return { bg: 'bg-gray-100', textColor: 'text-gray-600' }
}

const getFaixaColor = (faixa: string) => {
    if (faixa?.startsWith('A')) return { bg: 'bg-blue-600', text: 'text-blue-600' }
    if (faixa === 'B+') return { bg: 'bg-emerald-600', text: 'text-emerald-600' }
    if (faixa === 'B') return { bg: 'bg-yellow-500', text: 'text-yellow-600' }
    if (faixa === 'C+') return { bg: 'bg-orange-600', text: 'text-orange-600' }
    return { bg: 'bg-red-600', text: 'text-red-600' }
}

export default function RankingMunicipios({ data, municipio }: RankingMunicipiosProps) {
    if (!data.ranking || data.ranking.length === 0) {
        return null
    }

    const top10 = data.ranking.slice(0, 10)
    const municipioIndex = data.ranking.findIndex(
        r => r.municipio.toUpperCase() === municipio.toUpperCase()
    )
    const currentMunicipioData = data.ranking[municipioIndex]

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Ranking Estadual</h2>
                            <p className="text-white/70 text-sm">Top 10 Melhores Municípios</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-white/60 text-xs uppercase tracking-wider">Total</span>
                        <p className="text-2xl font-bold">{data.ranking.length}</p>
                        <span className="text-white/70 text-xs">municípios</span>
                    </div>
                </div>
            </div>

            {/* Ranking List */}
            <div className="p-6">
                <div className="space-y-3">
                    {top10.map((item, index) => {
                        const isCurrentMunicipio = item.municipio.toUpperCase() === municipio.toUpperCase()
                        const positionStyle = getPositionStyle(index + 1)

                        return (
                            <div
                                key={`${item.municipio}-${index}`}
                                className={`
                                    relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group
                                    ${isCurrentMunicipio
                                        ? 'bg-gradient-to-r from-betim-blue/10 to-indigo-100 border-2 border-betim-blue shadow-lg scale-[1.02]'
                                        : 'bg-white hover:bg-gray-50 border border-gray-100 hover:shadow-md hover:scale-[1.01]'
                                    }
                                `}
                            >
                                {/* Position Badge */}
                                <div className={`w-12 h-12 rounded-xl ${positionStyle.bg} flex items-center justify-center shadow-md`}>
                                    <span className={`font-bold text-lg ${positionStyle.textColor}`}>
                                        {index + 1}°
                                    </span>
                                </div>

                                {/* Municipality Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold truncate ${isCurrentMunicipio ? 'text-betim-blue' : 'text-gray-900'}`}>
                                            {item.municipio}
                                        </h3>
                                        {isCurrentMunicipio && (
                                            <span className="bg-betim-blue text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-sm">
                                                <MapPin size={10} />
                                                Betim
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${getFaixaGradient(item.faixa)} transition-all duration-1000`}
                                            style={{ width: `${item.percentual * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <div className="text-2xl font-black text-gray-900">
                                        {(item.percentual * 100).toFixed(1)}%
                                    </div>
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold text-white bg-gradient-to-r ${getFaixaGradient(item.faixa)} shadow-sm`}>
                                        {item.faixa}
                                    </span>
                                </div>

                                {/* Hover indicator */}
                                <ChevronRight size={20} className={`${isCurrentMunicipio ? 'text-betim-blue' : 'text-gray-300'} group-hover:translate-x-1 transition-transform`} />
                            </div>
                        )
                    })}
                </div>

                {/* Neighborhood View (Contexto do Município) */}
                {municipioIndex >= 10 && currentMunicipioData && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <MapPin className="text-betim-blue" size={18} />
                                <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider">
                                    Contexto no Ranking
                                </h3>
                            </div>
                            <span className="text-xs text-gray-400">Vizinhos de posição</span>
                        </div>

                        <div className="flex flex-col gap-1 relative">
                            {/* Linha conectora vertical sutil */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>

                            {(() => {
                                // Pega 2 acima e 2 abaixo, respeitando os limites do array
                                const start = Math.max(0, municipioIndex - 2)
                                const end = Math.min(data.ranking.length - 1, municipioIndex + 2)
                                const neighbors = data.ranking.slice(start, end + 1)

                                return neighbors.map((item, idx) => {
                                    const realRank = start + idx + 1 // Ranking é 1-based
                                    const isCurrent = item.municipio.toUpperCase() === municipio.toUpperCase()

                                    return (
                                        <div
                                            key={item.municipio}
                                            className={`
                                                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                                                ${isCurrent
                                                    ? 'bg-white border-2 border-betim-blue shadow-xl shadow-blue-900/10 scale-105 z-10 my-2'
                                                    : 'bg-white/50 border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                                                }
                                            `}
                                        >
                                            {/* Posição */}
                                            <div className={`
                                                w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                                                ${isCurrent ? 'bg-betim-blue text-white' : 'bg-gray-100 text-gray-500'}
                                            `}>
                                                {realRank}°
                                            </div>

                                            {/* Nome e Barra */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-bold truncate ${isCurrent ? 'text-gray-900 text-base' : 'text-gray-500 text-sm'}`}>
                                                        {item.municipio}
                                                    </span>
                                                    <span className={`font-bold ${isCurrent ? 'text-betim-blue text-base' : 'text-gray-400 text-sm'}`}>
                                                        {(item.percentual * 100).toFixed(1)}%
                                                    </span>
                                                </div>

                                                {/* Barra de progresso */}
                                                <div className={`h-1.5 rounded-full overflow-hidden ${isCurrent ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                                    <div
                                                        className={`h-full rounded-full ${isCurrent ? 'bg-betim-blue' : 'bg-gray-300'}`}
                                                        style={{ width: `${item.percentual * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Tag de Faixa (apenas no atual para limpar o visual ou se quiser em todos, descomentar) */}
                                            {isCurrent && (
                                                <div className={`
                                                    hidden sm:flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                    ${getFaixaColor(item.faixa).bg} text-white
                                                `}>
                                                    {item.faixa}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
