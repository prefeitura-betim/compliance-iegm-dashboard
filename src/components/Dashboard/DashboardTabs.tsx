import { LayoutDashboard, TrendingUp, GitCompare, FileText } from 'lucide-react'

export type TabType = 'overview' | 'comparison' | 'history' | 'questions' | 'details'

interface Tab {
    id: TabType
    label: string
    icon: React.ReactNode
    description: string
}

const tabs: Tab[] = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={18} />, description: 'Resumo e indicadores' },
    { id: 'comparison', label: 'Comparativo', icon: <GitCompare size={18} />, description: 'Compare com outros municípios' },
    { id: 'history', label: 'Evolução IEGM', icon: <TrendingUp size={18} />, description: 'Histórico 2022-2024' },
    { id: 'questions', label: 'Evolução Perguntas', icon: <TrendingUp size={18} />, description: 'Comparativo de perguntas identicas' },
    { id: 'details', label: 'Detalhes', icon: <FileText size={18} />, description: 'Análise por dimensão' },
]

interface DashboardTabsProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex flex-wrap border-b border-gray-100">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all duration-300
                                border-b-2 group
                                ${isActive
                                    ? 'bg-betim-blue text-white border-betim-blue shadow-md'
                                    : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-betim-blue hover:scale-105'
                                }
                            `}
                        >
                            <span className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-betim-blue'}`}>
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                        </button>
                    )
                })}

                {/* Legenda de Faixas - Alinhada à direita */}
                {/* Legenda de Faixas - Alinhada à direita */}
                {/* Legenda de Faixas - Alinhada à direita */}
                <div className="ml-auto flex items-center pr-6 py-2 hidden xl:flex">
                    <div className="flex items-center gap-3 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100/50">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Legendas:</span>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-blue-600 px-2.5 py-1 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-help" title="Nota entre 90 e 100">
                                <span className="text-blue-100 opacity-75 mr-0.5 border-r border-blue-400/50 pr-1.5">A</span> Altamente Efetiva
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-help" title="Nota entre 75 e 89.9">
                                <span className="text-emerald-100 opacity-75 mr-0.5 border-r border-emerald-400/50 pr-1.5">B+</span> Muito Efetiva
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-yellow-500 px-2.5 py-1 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-help" title="Nota entre 60 e 74.9">
                                <span className="text-yellow-100 opacity-75 mr-0.5 border-r border-yellow-300/50 pr-1.5">B</span> Efetiva
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-orange-500 px-2.5 py-1 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-help" title="Nota entre 50 e 59.9">
                                <span className="text-orange-100 opacity-75 mr-0.5 border-r border-orange-300/50 pr-1.5">C+</span> Em Adequação
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-red-600 px-2.5 py-1 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-help" title="Nota abaixo de 50">
                                <span className="text-red-100 opacity-75 mr-0.5 border-r border-red-400/50 pr-1.5">C</span> Baixo Nível
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Tab Description */}
            <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <p className="text-sm text-gray-500">
                    {tabs.find(t => t.id === activeTab)?.description}
                </p>
            </div>
        </div>
    )
}
