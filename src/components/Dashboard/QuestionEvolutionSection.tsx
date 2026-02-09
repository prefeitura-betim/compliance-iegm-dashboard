import { useState, useEffect, useMemo } from 'react'
import { defaultIEGMApiService as iegmApiService } from '@/services/iegm/iegmApiService'
import { Loader2, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, Search, Filter } from 'lucide-react'

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

    // Extrair indicadores únicos para as abas
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

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'bg-betim-green text-white'
        if (score >= 75) return 'bg-betim-green-teal text-white'
        if (score >= 60) return 'bg-betim-yellow text-white'
        if (score >= 50) return 'bg-betim-orange text-white'
        return 'bg-betim-red text-white'
    }

    const calculateTrend = (history: any[]) => {
        if (history.length < 2) return null
        const sorted = [...history].sort((a, b) => a.ano - b.ano)
        const last = sorted[sorted.length - 1].pontuacao
        const prev = sorted[0].pontuacao // Comparar com o primeiro (2022)

        if (last > prev) return <ArrowUpRight className="text-betim-green animate-pulse" size={20} />
        if (last < prev) return <ArrowDownRight className="text-betim-red animate-pulse" size={20} />
        return <Minus className="text-gray-400" size={20} />
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-betim-blue mb-6" size={48} />
                <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Mapeando evolução histórica...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-10 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-6 shadow-sm">
                <AlertCircle className="text-red-500 shrink-0" size={28} />
                <div>
                    <h3 className="text-red-800 font-black text-xl mb-2 uppercase tracking-tight">Erro na Análise</h3>
                    <p className="text-red-600 font-medium leading-relaxed">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header com Filtros */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="bg-betim-blue/5 p-4 rounded-2xl border border-betim-blue/10">
                            <TrendingUp className="text-betim-blue" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 font-heading tracking-tighter uppercase">Itens de Melhoria Estrita</h2>
                            <p className="text-gray-500 font-medium tracking-tight mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 bg-betim-blue rounded-full animate-pulse"></span>
                                Comparativo focado em itens que iniciaram com 0% em 2022 e possuem histórico em 2023 e 2024
                            </p>
                        </div>
                    </div>
                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-betim-blue transition-colors" size={20} />
                        <input
                            type="search"
                            placeholder="Buscar pergunta ou indicador..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-betim-blue/10 focus:border-betim-blue outline-none transition-all placeholder:text-gray-400 font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Abas de Indicadores */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                    {indicators.map((ind) => (
                        <button
                            key={ind}
                            onClick={() => setActiveIndicator(ind)}
                            className={`
                                px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                                ${activeIndicator === ind
                                    ? 'bg-betim-blue text-white shadow-lg shadow-betim-blue/20 scale-105'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-betim-blue'
                                }
                            `}
                        >
                            {ind}
                        </button>
                    ))}
                </div>
            </div>

            {/* Listagem de Itens */}
            <div className="grid grid-cols-1 gap-6">
                {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-betim-blue/30 transition-all duration-500 group relative overflow-hidden">
                            {/* Decorativo Lateral */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-100 group-hover:bg-betim-blue transition-colors duration-500"></div>

                            <div className="flex flex-col lg:row justify-between gap-6 mb-8">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center px-4 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-gray-100 group-hover:bg-betim-blue group-hover:text-white group-hover:border-betim-blue transition-all duration-500">
                                            {item.indicador}
                                        </span>
                                    </div>
                                    <h3 className="text-gray-800 font-bold text-lg leading-tight tracking-tight group-hover:text-betim-blue-dark transition-colors">{item.questao}</h3>
                                </div>
                                <div className="flex items-center gap-5 self-start lg:self-center shrink-0 bg-gray-50/50 px-6 py-4 rounded-[2rem] border border-gray-100 shadow-inner group-hover:bg-white transition-colors duration-500">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progressão</span>
                                        <span className="text-xs font-bold text-gray-600">2022 → 2024</span>
                                    </div>
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        {calculateTrend(item.historico)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                                {/* Conectores visuais entre os anos */}
                                <div className="hidden sm:block absolute top-[40%] left-[25%] right-[25%] h-px bg-dashed bg-gray-200 -z-10 border-t border-dashed"></div>

                                {item.historico.sort((a, b) => a.ano - b.ano).map((h, i) => (
                                    <div key={i} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center gap-4 group-hover:bg-white group-hover:shadow-md transition-all duration-500 relative z-10">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-black text-gray-400 tracking-[0.3em] mb-1">{h.ano}</span>
                                            <div className={`px-5 py-2 rounded-xl text-lg font-black shadow-lg shadow-opacity-20 ${getScoreColor(h.pontuacao)}`}>
                                                {(h.pontuacao).toFixed(0)}%
                                            </div>
                                        </div>
                                        <div className="h-px w-8 bg-gray-200"></div>
                                        <span className="text-[11px] text-gray-500 font-bold uppercase text-center px-4 leading-relaxed" title={h.resposta}>
                                            {h.resposta}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[3rem] py-32 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
                        <div className="bg-gray-50 p-8 rounded-full mb-8">
                            <Filter className="text-gray-200" size={64} />
                        </div>
                        <h4 className="text-gray-400 font-black tracking-[0.2em] uppercase text-lg">Nenhum item encontrado</h4>
                        <p className="text-gray-300 font-medium mt-2">Tente ajustar os filtros ou o termo de busca</p>
                    </div>
                )}
            </div>
        </div>
    )
}
