import { useState, useEffect } from 'react'
import { defaultIEGMApiService as iegmApiService } from '@/services/iegm/iegmApiService'
import { Loader2, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const results = await iegmApiService.getEvolucaoQuestoes(municipio)
                // Filtrar para mostrar apenas as que têm evolução (mais de um ano)
                setData(results.filter((q: QuestionHistory) => q.historico.length > 1))
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

    const filteredData = data.filter(q =>
        q.questao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.indicador.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
        const prev = sorted[sorted.length - 2].pontuacao

        if (last > prev) return <ArrowUpRight className="text-betim-green" size={18} />
        if (last < prev) return <ArrowDownRight className="text-betim-red" size={18} />
        return <Minus className="text-gray-400" size={18} />
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-betim-blue mb-4" size={40} />
                <p className="text-gray-500 font-medium tracking-wide">Analisando evolução das perguntas...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 shadow-sm">
                <AlertCircle className="text-red-500 shrink-0" size={24} />
                <div>
                    <h3 className="text-red-800 font-bold text-lg mb-1">Erro de Carregamento</h3>
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="bg-betim-blue/10 p-3 rounded-xl shadow-inner">
                        <TrendingUp className="text-betim-blue" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 font-heading tracking-tight uppercase">Foco em Evolução (Início Negativo)</h2>
                        <p className="text-gray-500 text-sm font-medium tracking-wide">Mostrando apenas itens que iniciaram com nota 0% em 2022 em {municipio}</p>
                    </div>
                </div>
                <div className="w-full md:w-80">
                    <input
                        type="search"
                        placeholder="Filtrar por pergunta ou indicador..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-betim-blue/20 focus:border-betim-blue outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-betim-blue/20 transition-all group">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                <div className="space-y-2">
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-gray-200 group-hover:bg-betim-blue/10 group-hover:text-betim-blue group-hover:border-betim-blue/20 transition-colors">
                                        {item.indicador}
                                    </span>
                                    <h3 className="text-gray-800 font-bold text-base leading-relaxed tracking-tight group-hover:text-betim-blue-dark transition-colors">{item.questao}</h3>
                                </div>
                                <div className="flex items-center gap-3 self-start md:self-center shrink-0 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shadow-inner">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Tendência</span>
                                    {calculateTrend(item.historico)}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {item.historico.sort((a, b) => a.ano - b.ano).map((h, i) => (
                                    <div key={i} className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center gap-2 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                                        <span className="text-xs font-black text-gray-500 tracking-[0.2em]">{h.ano}</span>
                                        <div className={`px-3 py-1 rounded-lg text-sm font-black shadow-sm ${getScoreColor(h.pontuacao)}`}>
                                            {(h.pontuacao).toFixed(0)}%
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase truncate w-full text-center px-1" title={h.resposta}>
                                            {h.resposta}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl py-20 text-center border-2 border-dashed border-gray-200">
                        <TrendingUp className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Nenhuma pergunta com evolução encontrada</p>
                    </div>
                )}
            </div>
        </div>
    )
}
