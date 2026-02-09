import { useState, useEffect, useMemo } from 'react'
import { defaultIEGMApiService as iegmApiService } from '@/services/iegm/iegmApiService'
import { Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, Search, Sparkles, Target } from 'lucide-react'

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

export default function QuestionEvolutionSection({ municipio }: QuestionEvolutionSectionProps) {
    const [data, setData] = useState<QuestionHistory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeIndicator, setActiveIndicator] = useState<string>('TODOS')

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const results = await iegmApiService.getEvolucaoQuestoes(municipio)
                setData(results)
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

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-green-600'
        if (score >= 60) return 'from-amber-400 to-yellow-500'
        if (score >= 40) return 'from-orange-400 to-amber-500'
        return 'from-red-500 to-rose-600'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-50 border-emerald-200'
        if (score >= 60) return 'bg-amber-50 border-amber-200'
        if (score >= 40) return 'bg-orange-50 border-orange-200'
        return 'bg-red-50 border-red-200'
    }

    const calculateTrend = (history: any[]) => {
        if (history.length < 2) return { icon: null, text: 'N/A', color: 'text-gray-400' }
        const sorted = [...history].sort((a, b) => a.ano - b.ano)
        const last = sorted[sorted.length - 1].pontuacao
        const first = sorted[0].pontuacao
        const diff = last - first

        if (diff > 0) return {
            icon: <ArrowUpRight className="text-emerald-500" size={18} />,
            text: `+${diff.toFixed(0)}%`,
            color: 'text-emerald-600 bg-emerald-50'
        }
        if (diff < 0) return {
            icon: <ArrowDownRight className="text-red-500" size={18} />,
            text: `${diff.toFixed(0)}%`,
            color: 'text-red-600 bg-red-50'
        }
        return {
            icon: <Minus className="text-gray-400" size={18} />,
            text: '0%',
            color: 'text-gray-500 bg-gray-50'
        }
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

    return (
        <div className="space-y-6">
            {/* Hero Header com Gradiente */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl"></div>

                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                            <Sparkles className="text-yellow-400" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                Evolução de Desempenho
                                <span className="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full font-bold">2022-2024</span>
                            </h2>
                            <p className="text-blue-200 text-sm mt-1 flex items-center gap-2">
                                <Target size={14} />
                                Itens que iniciaram com 0% em 2022
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                        <input
                            type="search"
                            placeholder="Buscar pergunta..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs de Indicadores */}
                <div className="relative mt-6 flex flex-wrap gap-2">
                    {indicators.map((ind) => (
                        <button
                            key={ind}
                            onClick={() => setActiveIndicator(ind)}
                            className={`
                                px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                                ${activeIndicator === ind
                                    ? 'bg-white text-slate-900 shadow-lg scale-105'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                                }
                            `}
                        >
                            {ind}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <p className="text-white/50 text-xs font-semibold uppercase">Total Itens</p>
                        <p className="text-2xl font-black mt-1">{data.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <p className="text-white/50 text-xs font-semibold uppercase">Indicadores</p>
                        <p className="text-2xl font-black mt-1">{indicators.length - 1}</p>
                    </div>
                    <div className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/20">
                        <p className="text-emerald-300 text-xs font-semibold uppercase">Melhoraram</p>
                        <p className="text-2xl font-black mt-1 text-emerald-400">
                            {data.filter(item => {
                                const sorted = [...item.historico].sort((a, b) => a.ano - b.ano)
                                return sorted.length >= 2 && sorted[sorted.length - 1].pontuacao > sorted[0].pontuacao
                            }).length}
                        </p>
                    </div>
                    <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/20">
                        <p className="text-red-300 text-xs font-semibold uppercase">Estagnados</p>
                        <p className="text-2xl font-black mt-1 text-red-400">
                            {data.filter(item => {
                                const sorted = [...item.historico].sort((a, b) => a.ano - b.ano)
                                return sorted.length >= 2 && sorted[sorted.length - 1].pontuacao <= sorted[0].pontuacao
                            }).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de Cards */}
            <div className="space-y-4">
                {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => {
                        const trend = calculateTrend(item.historico)
                        return (
                            <div
                                key={idx}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-500"
                            >
                                {/* Card Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                    {item.indicador}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${trend.color}`}>
                                                    {trend.icon}
                                                    {trend.text}
                                                </span>
                                            </div>
                                            <h3 className="text-gray-800 font-semibold text-sm leading-relaxed group-hover:text-blue-700 transition-colors">
                                                {item.questao}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline de Anos */}
                                <div className="px-6 pb-6">
                                    <div className="relative">
                                        {/* Linha conectora */}
                                        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-blue-200 to-gray-200 hidden sm:block"></div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {item.historico.sort((a, b) => a.ano - b.ano).map((h, i) => (
                                                <div key={i} className={`relative rounded-xl p-4 border transition-all duration-300 hover:scale-105 ${getScoreBg(h.pontuacao)}`}>
                                                    {/* Conector */}
                                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-300 rounded-full hidden sm:block z-10"></div>

                                                    <div className="text-center space-y-3">
                                                        <span className="text-xs font-black text-gray-400 tracking-widest">{h.ano}</span>

                                                        <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreGradient(h.pontuacao)} flex items-center justify-center shadow-lg`}>
                                                            <span className="text-white text-xl font-black">{h.pontuacao.toFixed(0)}%</span>
                                                        </div>

                                                        <div className="pt-2 border-t border-gray-200/50">
                                                            <p className="text-[10px] text-gray-600 font-medium break-all line-clamp-2 leading-relaxed" title={h.resposta}>
                                                                {h.resposta || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl py-16 text-center border border-gray-200">
                        <div className="bg-white p-6 rounded-full inline-block mb-4 shadow-lg">
                            <Search className="text-gray-300" size={40} />
                        </div>
                        <h4 className="text-gray-500 font-bold text-lg">Nenhum item encontrado</h4>
                        <p className="text-gray-400 text-sm mt-2">Ajuste os filtros ou busca</p>
                    </div>
                )}
            </div>
        </div>
    )
}
