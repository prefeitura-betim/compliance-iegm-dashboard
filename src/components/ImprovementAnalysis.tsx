
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Search, ChevronUp, AlertTriangle, MinusCircle } from 'lucide-react'

interface ImprovementAnalysisProps {
    municipio: string
    ano: number
    indicador: string // ex: i-Educ
    cor: string // ex: betim-blue
}

import { QUESTION_METADATA } from '../data/question_metadata'

// ... existing imports

interface RespostaDetalhada {
    id: number
    tribunal: string
    codigoIbge: string
    municipio: string
    indicador: string
    questao: string
    resposta: string
    pontuacao: number | null
    peso: number | null
    nota: number | null
    anoRef: number
    rotulo?: string
    chave_questao?: string // Campo vindo do banco (snake_case)
    chaveQuestao?: string // Possivel variação (camelCase)
}

async function fetchRespostasDetalhadas(municipio: string, ano: number, indicador: string): Promise<RespostaDetalhada[]> {
    const res = await fetch(`/api/municipio/respostas-detalhadas?municipio=${encodeURIComponent(municipio)}&ano=${ano}&indicador=${encodeURIComponent(indicador)}`)
    if (!res.ok) return []
    return res.json()
}

type TabType = 'atencao' | 'padrao' | 'conformidade';

export default function ImprovementAnalysis({ municipio, ano, indicador, cor }: ImprovementAnalysisProps) {
    const [activeTab, setActiveTab] = useState<TabType>('conformidade')
    const [search, setSearch] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)

    const { data: respostas = [], isLoading } = useQuery({
        queryKey: ['respostas-detalhadas', municipio, ano, indicador],
        queryFn: () => fetchRespostasDetalhadas(municipio, ano, indicador),
        enabled: isExpanded,
    })

    const filteredData = useMemo(() => {
        if (!respostas) return { atencao: [], padrao: [], conformidade: [] }

        const searchLower = search.toLowerCase()
        const items = respostas.filter(r =>
            r.questao.toLowerCase().includes(searchLower) ||
            r.resposta.toLowerCase().includes(searchLower)
        )

        // Classificação OTIMIZADA com base no Manual IEGM
        // - Pontos de Atenção: 
        //   1. Nota negativa (Penalidade)
        //   2. Nota 0 e Pmax > 0 (Perdeu a pontuação que poderia ter ganho)
        // - Conformidade: Nota > 0 (Ganhou ponto)
        // - Informativo: Nota 0 e Pmax = 0 (Não vale ponto)

        const atencao = items.filter(r => {
            const chave = r.chave_questao || r.chaveQuestao || r.rotulo || '';
            // Tenta buscar pelo ID exato ou fallback se necessário
            const pmax = QUESTION_METADATA[chave];

            // Se Pmax não for encontrada, assumimos comportamento padrão antigo ou conservador?
            // Se não achou Pmax, e nota é 0, fica em Informativo para não alarmar falso positivo, 
            // a menos que seja explicitamente penalidade.
            const maxScore = pmax !== undefined ? pmax : 0;
            const nota = r.nota ?? 0;

            return nota < 0 || (nota === 0 && maxScore > 0);
        })

        const conformidade = items.filter(r => (r.nota ?? 0) > 0)

        // Informativos puros (score 0 e max score 0)
        const padrao = items.filter(r => {
            const chave = r.chave_questao || r.chaveQuestao || r.rotulo || '';
            const pmax = QUESTION_METADATA[chave];

            const maxScore = pmax !== undefined ? pmax : 0;
            const nota = r.nota ?? 0;

            // Se nota é 0 e não caiu no filtro de atenção (maxScore > 0), então é informativo.
            // Mas vamos ser explícitos:
            return nota === 0 && maxScore === 0;
        })

        return { atencao, padrao, conformidade }
    }, [respostas, search])

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className={`mt-4 w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 
                    text-sm font-bold bg-gray-50 text-gray-600 hover:bg-${cor} hover:text-betim-blue-dark 
                    transition-all duration-300 border border-gray-200 hover:border-${cor}`}
            >
                <Search size={16} />
                Ver Diagnóstico Detalhado
            </button>
        )
    }

    const renderItems = (items: RespostaDetalhada[], type: TabType) => {
        if (items.length === 0) {
            const emptyStates = {
                atencao: { icon: <CheckCircle2 size={48} className="mx-auto text-green-400 mb-2" />, text: 'Nenhuma penalidade encontrada!' },
                padrao: { icon: <MinusCircle size={48} className="mx-auto text-gray-400 mb-2" />, text: 'Nenhum quesito informativo encontrado.' },
                conformidade: { icon: <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-2" />, text: 'Nenhum item pontuado encontrado.' }
            }
            const state = emptyStates[type]
            return (
                <div className="text-center py-8 text-gray-500">
                    {state.icon}
                    <p>{state.text}</p>
                </div>
            )
        }

        const styles = {
            atencao: { border: 'border-red-400', iconColor: 'text-red-500', badgeBg: 'bg-red-50', badgeText: 'text-red-600', badgeBorder: 'border-red-100' },
            padrao: { border: 'border-gray-400', iconColor: 'text-gray-500', badgeBg: 'bg-gray-50', badgeText: 'text-gray-600', badgeBorder: 'border-gray-200' },
            conformidade: { border: 'border-green-400', iconColor: 'text-green-500', badgeBg: 'bg-green-50', badgeText: 'text-green-600', badgeBorder: 'border-green-100' }
        }
        const style = styles[type]
        const Icon = type === 'atencao' ? AlertCircle : type === 'padrao' ? MinusCircle : CheckCircle2

        return items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                    <Icon className={`${style.iconColor} mt-0.5 shrink-0`} size={18} />
                    <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                            {item.rotulo && (
                                <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 shrink-0 mt-0.5">
                                    {item.rotulo}
                                </span>
                            )}
                            <p className="text-gray-800 font-medium text-sm leading-tight">{item.questao}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${style.badgeText} ${style.badgeBg} px-2 py-0.5 rounded border ${style.badgeBorder}`}>
                                Resposta: {item.resposta}
                            </span>
                            <span className={`text-xs font-bold ${style.badgeText} ${style.badgeBg} px-2 py-0.5 rounded border ${style.badgeBorder}`}>
                                Nota: {item.nota ?? 0}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{item.indicador}</span>
                        </div>
                    </div>
                </div>
            </div>
        ))
    }

    const tabs = [
        { key: 'atencao' as TabType, label: 'Pontos de Atenção', icon: AlertTriangle, color: 'red', count: filteredData.atencao.length },
        { key: 'padrao' as TabType, label: 'Informativo', icon: MinusCircle, color: 'gray', count: filteredData.padrao.length },
        { key: 'conformidade' as TabType, label: 'Conformidade', icon: CheckCircle2, color: 'green', count: filteredData.conformidade.length },
    ]

    return (
        <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
            {/* Header com Busca e Fechar */}
            <div className="p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">Diagnóstico: {indicador}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {respostas.length} questões
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar questão..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronUp size={20} />
                    </button>
                </div>
            </div>

            {/* Abas */}
            <div className="flex border-b border-gray-200 bg-white">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === tab.key
                                ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50/50`
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        <span className="bg-white px-1.5 py-0.5 rounded text-xs border border-gray-100 shadow-sm">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Conteúdo */}
            <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {renderItems(filteredData[activeTab], activeTab)}
                    </div>
                )}
            </div>
        </div>
    )
}
