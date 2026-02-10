import { useState, useEffect, useMemo } from 'react'
import { defaultIEGMApiService as iegmApiService } from '@/services/iegm/iegmApiService'
import { Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, Search, TrendingUp, AlertTriangle, Target, ChevronDown, ChevronRight } from 'lucide-react'

interface QuestionHistory {
    questao: string
    indicador: string
    historico: Array<{
        ano: number
        resposta: string
        pontuacao: number
        nota: number
    }>
}

interface QuestionEvolutionSectionProps {
    municipio: string
}

type AnalysisMode = 'success' | 'regression'

export default function QuestionEvolutionSection({ municipio }: QuestionEvolutionSectionProps) {
    const [rawData, setRawData] = useState<QuestionHistory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeIndicator, setActiveIndicator] = useState<string>('TODOS')
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('success')
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const results = await iegmApiService.getEvolucaoQuestoes(municipio)
                setRawData(results)
            } catch (err: any) {
                setError(err.message || 'Erro ao carregar evolução de questões')
            } finally {
                setIsLoading(false)
            }
        }

        if (municipio) {
            fetchData()
        }
    }, [municipio])

    // Filtrar dados com base no modo de análise
    const data = useMemo(() => {
        return rawData.filter(item => {
            // Excluir perguntas específicas que não devem aparecer
            if (item.questao.includes('Informe a data da última entrega na escola')) return false

            const sorted = [...item.historico].sort((a, b) => a.ano - b.ano)
            if (sorted.length < 3) return false // Precisa ter os 3 anos

            const y2022 = sorted.find(h => h.ano === 2022)
            const y2023 = sorted.find(h => h.ano === 2023)
            const y2024 = sorted.find(h => h.ano === 2024)

            if (!y2022 || !y2023 || !y2024) return false

            const p2022 = Number(y2022.pontuacao)
            const p2023 = Number(y2023.pontuacao)
            const p2024 = Number(y2024.pontuacao)

            // Excluir itens que ficaram em 0% o tempo todo ou terminaram em 0%
            if (p2022 === 0 && p2023 === 0 && p2024 === 0) return false
            if (p2024 === 0 && p2022 === 0) return false

            if (analysisMode === 'success') {
                return p2022 === 0 && p2023 >= p2022 && p2024 >= p2023 && p2024 > 0
            } else {
                return p2024 < p2023
            }
        })
    }, [rawData, analysisMode])

    const indicators = useMemo(() => {
        const set = new Set(data.map(item => item.indicador))
        return ['TODOS', ...Array.from(set).sort()]
    }, [data])

    const filteredData = useMemo(() => {
        return data.filter(q => {
            const matchesSearch = q.questao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.indicador.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesIndicator = activeIndicator === 'TODOS' || q.indicador === activeIndicator
            return matchesSearch && matchesIndicator
        })
    }, [data, searchTerm, activeIndicator])

    // Agrupar dados filtrados por indicador
    const groupedData = useMemo(() => {
        const groups: Record<string, QuestionHistory[]> = {}
        filteredData.forEach(item => {
            if (!groups[item.indicador]) {
                groups[item.indicador] = []
            }
            groups[item.indicador].push(item)
        })
        // Ordenar grupos por nome do indicador
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [filteredData])

    const toggleGroup = (indicador: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev)
            if (next.has(indicador)) {
                next.delete(indicador)
            } else {
                next.add(indicador)
            }
            return next
        })
    }

    // Cor da barra de progresso baseada na pontuação
    const getBarColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500'
        if (score >= 60) return 'bg-amber-400'
        if (score >= 40) return 'bg-orange-400'
        if (score > 0) return 'bg-red-400'
        return 'bg-gray-200'
    }

    const getBarBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-100'
        if (score >= 60) return 'bg-amber-100'
        if (score >= 40) return 'bg-orange-100'
        if (score > 0) return 'bg-red-100'
        return 'bg-gray-100'
    }

    // Calcula a evolução TOTAL (2024 vs 2022)
    // No modo regressão, mostramos a queda de 2023→2024 como foco principal
    const calculateTrend = (history: any[]) => {
        if (history.length < 2) return { icon: null, text: 'N/A', color: 'text-gray-400', bgColor: 'bg-gray-50' }
        const sorted = [...history].sort((a, b) => a.ano - b.ano)

        if (analysisMode === 'regression') {
            // No modo regressão, mostrar a queda 2023→2024
            const y2023 = sorted.find(h => h.ano === 2023)
            const y2024 = sorted.find(h => h.ano === 2024)
            if (!y2023 || !y2024) return { icon: null, text: 'N/A', color: 'text-gray-400', bgColor: 'bg-gray-50' }
            const p2023 = Number(y2023.pontuacao)
            const p2024 = Number(y2024.pontuacao)
            const diff = p2024 - p2023 // sempre negativo neste modo
            return {
                icon: <ArrowDownRight size={14} />,
                text: `${diff.toFixed(0)}`,
                color: 'text-red-700',
                bgColor: 'bg-red-50 border-red-200'
            }
        }

        // Modo sucesso: evolução total 2022→2024
        const last = Number(sorted[sorted.length - 1].pontuacao)
        const first = Number(sorted[0].pontuacao)
        const diff = last - first

        if (diff > 0) return {
            icon: <ArrowUpRight size={14} />,
            text: `+${diff.toFixed(0)}`,
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50 border-emerald-200'
        }
        if (diff < 0) return {
            icon: <ArrowDownRight size={14} />,
            text: `${diff.toFixed(0)}`,
            color: 'text-red-700',
            bgColor: 'bg-red-50 border-red-200'
        }
        return {
            icon: <Minus size={14} />,
            text: '0',
            color: 'text-gray-500',
            bgColor: 'bg-gray-50 border-gray-200'
        }
    }

    // Variação ano-a-ano (seta pequena)
    // No modo regressão, cores invertidas: queda = vermelho (ruim), subida = cinza neutro
    const getYearDelta = (historico: any[], year: number) => {
        const sorted = [...historico].sort((a, b) => a.ano - b.ano)
        const idx = sorted.findIndex(h => h.ano === year)
        if (idx <= 0) return null
        const current = Number(sorted[idx].pontuacao)
        const previous = Number(sorted[idx - 1].pontuacao)
        const diff = current - previous
        if (diff === 0) return null

        if (analysisMode === 'regression') {
            // No modo regressão: queda é vermelho, subida é cinza (não verde)
            return {
                diff,
                text: diff > 0 ? `+${diff.toFixed(0)}` : `${diff.toFixed(0)}`,
                color: diff < 0 ? 'text-red-600 font-bold' : 'text-gray-400'
            }
        }

        return {
            diff,
            text: diff > 0 ? `+${diff.toFixed(0)}` : `${diff.toFixed(0)}`,
            color: diff > 0 ? 'text-emerald-600' : 'text-red-500'
        }
    }

    // Cor do badge de indicador
    const getIndicatorColor = (ind: string) => {
        const colors: Record<string, string> = {
            'i-Educ': 'bg-blue-100 text-blue-800 border-blue-200',
            'i-Saude': 'bg-rose-100 text-rose-800 border-rose-200',
            'i-Fiscal': 'bg-violet-100 text-violet-800 border-violet-200',
            'i-Amb': 'bg-green-100 text-green-800 border-green-200',
            'i-Cidade': 'bg-orange-100 text-orange-800 border-orange-200',
            'i-Plan': 'bg-cyan-100 text-cyan-800 border-cyan-200',
            'i-GovTI': 'bg-slate-100 text-slate-800 border-slate-200',
            'i-Gov TI': 'bg-slate-100 text-slate-800 border-slate-200',
        }
        return colors[ind] || 'bg-gray-100 text-gray-800 border-gray-200'
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-white rounded-full p-6 shadow-xl">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                </div>
                <p className="mt-6 text-gray-500 font-semibold text-sm tracking-wide">Analisando evolução histórica...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-2xl flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-xl">
                    <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                    <h3 className="text-red-800 font-bold text-lg">Erro ao carregar dados</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
            </div>
        )
    }




    // Componente de barra de progresso inline — valor absoluto
    const ScoreBar = ({ score, yearLabel, delta, maxScore = 100 }: { score: number, yearLabel?: string, delta: ReturnType<typeof getYearDelta>, maxScore?: number }) => {
        // Calcular largura relativa (limitada a 100%)
        const width = Math.min((score / (maxScore || 100)) * 100, 100)

        return (
            <div className="min-w-0">
                {/* Linha com ano + valor + delta */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-baseline gap-1.5">
                        {yearLabel && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{yearLabel}</span>
                        )}
                        <span className="text-sm font-black text-gray-800 tabular-nums">
                            {score.toFixed(1).replace('.0', '')}
                        </span>
                    </div>
                    {delta && (
                        <span className={`text-[10px] font-semibold ${delta.color} tabular-nums`}>
                            {delta.text}
                        </span>
                    )}
                </div>
                {/* Barra de progresso */}
                <div className={`w-full h-2 rounded-full ${getBarBg(score)} overflow-hidden`}>
                    <div
                        className={`h-full rounded-full ${getBarColor(score)} transition-all duration-500`}
                        style={{ width: `${Math.max(width, 2)}%` }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {/* Toggle de Modo de Análise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                    onClick={() => setAnalysisMode('success')}
                    className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${analysisMode === 'success'
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${analysisMode === 'success' ? 'bg-white/20' : 'bg-emerald-100'}`}>
                            <TrendingUp className={analysisMode === 'success' ? 'text-white' : 'text-emerald-600'} size={18} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className={`font-bold text-sm sm:text-lg ${analysisMode === 'success' ? 'text-white' : 'text-gray-800'}`}>
                                Casos de Sucesso
                            </h3>
                            <p className={`text-xs sm:text-sm hidden sm:block ${analysisMode === 'success' ? 'text-emerald-100' : 'text-gray-500'}`}>
                                Saíram de 0% e evoluíram
                            </p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setAnalysisMode('regression')}
                    className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${analysisMode === 'regression'
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${analysisMode === 'regression' ? 'bg-white/20' : 'bg-orange-100'}`}>
                            <AlertTriangle className={analysisMode === 'regression' ? 'text-white' : 'text-orange-600'} size={18} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className={`font-bold text-sm sm:text-lg ${analysisMode === 'regression' ? 'text-white' : 'text-gray-800'}`}>
                                Pontos de Atenção
                            </h3>
                            <p className={`text-xs sm:text-sm hidden sm:block ${analysisMode === 'regression' ? 'text-orange-100' : 'text-gray-500'}`}>
                                Começaram bem e decaíram
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Header com Filtros */}
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-xl ${analysisMode === 'success'
                ? 'bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900'
                : 'bg-gradient-to-br from-slate-900 via-orange-900 to-red-900'
                }`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                            {analysisMode === 'success' ? <TrendingUp className="text-emerald-400" size={20} /> : <AlertTriangle className="text-orange-400" size={20} />}
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight">
                                {analysisMode === 'success' ? 'Itens que Evoluíram' : 'Itens que Regrediram'}
                            </h2>
                            <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                                <Target size={11} />
                                {filteredData.length} {filteredData.length === 1 ? 'pergunta' : 'perguntas'} encontradas
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={15} />
                        <input
                            type="search"
                            placeholder="Buscar pergunta..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs de Indicadores */}
                <div className="relative mt-3 flex flex-wrap gap-1.5">
                    {indicators.map((ind) => (
                        <button
                            key={ind}
                            onClick={() => setActiveIndicator(ind)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200
                                ${activeIndicator === ind
                                    ? 'bg-white text-slate-900 shadow-lg'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                                }
                            `}
                        >
                            {ind}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabela agrupada por indicador */}
            {groupedData.length > 0 ? (
                <div className="space-y-3">
                    {groupedData.map(([indicador, items]) => {
                        const isCollapsed = collapsedGroups.has(indicador)

                        // Calcular pontuação máxima neste grupo para normalizar as barras
                        const maxGroupScore = Math.max(
                            ...items.flatMap(item => item.historico.map(h => Number(h.pontuacao)))
                        ) || 100

                        return (
                            <div key={indicador} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                {/* Cabeçalho do grupo (indicador) */}
                                <button
                                    onClick={() => toggleGroup(indicador)}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50/80 hover:bg-gray-100/80 transition-colors border-b border-gray-100"
                                >
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getIndicatorColor(indicador)}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                                        {indicador}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {items.length} {items.length === 1 ? 'pergunta' : 'perguntas'}
                                    </span>
                                    <div className="ml-auto text-gray-400">
                                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </button>

                                {/* Conteúdo do grupo */}
                                {!isCollapsed && (
                                    <div>
                                        {/* Cabeçalho da tabela - desktop */}
                                        <div className="hidden lg:grid lg:grid-cols-[1fr_140px_140px_140px_90px] gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50/40">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pergunta</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">2022</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">2023</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">2024</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Evolução</span>
                                        </div>

                                        {/* Linhas da tabela */}
                                        {items.map((item, idx) => {
                                            const sorted = [...item.historico].sort((a, b) => a.ano - b.ano)
                                            const y2022 = sorted.find(h => h.ano === 2022)
                                            const y2023 = sorted.find(h => h.ano === 2023)
                                            const y2024 = sorted.find(h => h.ano === 2024)
                                            const trend = calculateTrend(item.historico)

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`group px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-blue-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                                                >
                                                    {/* Layout Desktop: linha única */}
                                                    <div className="hidden lg:grid lg:grid-cols-[1fr_140px_140px_140px_90px] gap-3 items-center">
                                                        <p className="text-[13px] text-gray-700 font-medium leading-snug pr-4 group-hover:text-blue-800 transition-colors">
                                                            {item.questao}
                                                        </p>

                                                        {/* 2022 */}
                                                        <div>
                                                            <ScoreBar
                                                                score={Number(y2022?.pontuacao || 0)}
                                                                delta={null}
                                                                maxScore={maxGroupScore}
                                                            />
                                                        </div>

                                                        {/* 2023 */}
                                                        <div>
                                                            <ScoreBar
                                                                score={Number(y2023?.pontuacao || 0)}
                                                                delta={getYearDelta(item.historico, 2023)}
                                                                maxScore={maxGroupScore}
                                                            />
                                                        </div>

                                                        {/* 2024 */}
                                                        <div>
                                                            <ScoreBar
                                                                score={Number(y2024?.pontuacao || 0)}
                                                                delta={getYearDelta(item.historico, 2024)}
                                                                maxScore={maxGroupScore}
                                                            />
                                                        </div>

                                                        {/* Evolução total */}
                                                        <div className="flex justify-end">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border ${trend.bgColor} ${trend.color}`}>
                                                                {trend.icon}
                                                                {trend.text}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Layout Mobile: empilhado */}
                                                    <div className="lg:hidden space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-[13px] text-gray-700 font-medium leading-snug flex-1">
                                                                {item.questao}
                                                            </p>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border shrink-0 ${trend.bgColor} ${trend.color}`}>
                                                                {trend.icon}
                                                                {trend.text}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {[
                                                                { year: 2022, data: y2022 },
                                                                { year: 2023, data: y2023 },
                                                                { year: 2024, data: y2024 },
                                                            ].map(({ year, data: yearData }) => (
                                                                <div key={year} className="flex items-center gap-3">
                                                                    <span className="text-[11px] font-bold text-gray-400 w-8 shrink-0 tabular-nums">{year}</span>
                                                                    <div className="flex-1">
                                                                        <ScoreBar
                                                                            score={Number(yearData?.pontuacao || 0)}
                                                                            delta={year > 2022 ? getYearDelta(item.historico, year) : null}
                                                                            maxScore={maxGroupScore}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl py-16 text-center border border-gray-200">
                    <div className="bg-white p-5 rounded-full inline-block mb-4 shadow-lg">
                        <Search className="text-gray-300" size={32} />
                    </div>
                    <h4 className="text-gray-500 font-bold text-base">Nenhum item encontrado</h4>
                    <p className="text-gray-400 text-sm mt-1">Ajuste os filtros ou busca</p>
                </div>
            )}
        </div>
    )
}
