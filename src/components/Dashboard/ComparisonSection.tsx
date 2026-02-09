import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    GitCompare, Building2, Loader2, Search, X, ChevronLeft, ChevronRight,
    ArrowUpRight, ArrowDownRight, Minus, BookOpen, HeartPulse, Coins, TreePine, ClipboardList, Laptop,
    History
} from 'lucide-react'

interface ComparisonSectionProps {
    municipio: string
    ano: number
}

interface MunicipioData {
    municipio: string
    anoRef?: number
    percentualIegmMunicipio: number
    faixaIegmMunicipio: string
    percentualIamb: number
    percentualIcidade: number
    percentualIeduc: number
    percentualIfiscal: number
    percentualIgovTi: number
    percentualIsaude: number
    percentualIplan: number
}

const CIDADES_VIZINHAS: Record<string, string[]> = {
    'BETIM': [
        'CONTAGEM', 'IBIRITÉ', 'SARZEDO', 'SÃO JOAQUIM DE BICAS', 'ESMERALDAS', 'IGARAPÉ',
        'JUATUBA', 'MARIO CAMPOS', 'BRUMADINHO', 'RIBEIRÃO DAS NEVES', 'BELO HORIZONTE'
    ],
    'BELO HORIZONTE': ['CONTAGEM', 'BETIM', 'NOVA LIMA', 'SABARÁ', 'SANTA LUZIA', 'VESPASIANO', 'RIBEIRÃO DAS NEVES', 'IBIRITÉ'],
    'CONTAGEM': ['BETIM', 'BELO HORIZONTE', 'IBIRITÉ', 'RIBEIRÃO DAS NEVES', 'ESMERALDAS', 'NOVA LIMA'],
}

// Cidades de mesmo porte - baseado em população, PIB e perfil econômico
const CIDADES_MESMO_PORTE: Record<string, string[]> = {
    'BETIM': [
        'MONTES CLAROS',       // ~434k hab - "Gêmea" de População
        'UBERLÂNDIA',          // ~754k hab - "Gêmea" de Economia (mesmo PIB)
        'CONTAGEM',            // ~650k hab - Perfil Industrial, vizinha
        'JUIZ DE FORA',        // ~565k hab - Polo da Zona da Mata
        'UBERABA',             // ~354k hab - Economia forte, industrializada
        'RIBEIRÃO DAS NEVES',  // ~344k hab - Porte Populacional, Grande BH
        'IPATINGA',            // ~235k hab - Vocação Industrial (Usiminas)
        'SETE LAGOAS',         // ~238k hab - Indústria Automotiva (Iveco)
        'GOVERNADOR VALADARES', // ~266k hab - Polo Regional (Rio Doce)
        'DIVINÓPOLIS'          // ~242k hab - Polo Regional (Oeste de MG)
    ],
}

const indicadores = [
    { key: 'percentualIeduc', nome: 'Educação', icon: BookOpen, gradient: 'from-blue-500 to-indigo-600' },
    { key: 'percentualIsaude', nome: 'Saúde', icon: HeartPulse, gradient: 'from-red-500 to-rose-600' },
    { key: 'percentualIfiscal', nome: 'Fiscal', icon: Coins, gradient: 'from-amber-500 to-orange-600' },
    { key: 'percentualIamb', nome: 'Ambiente', icon: TreePine, gradient: 'from-green-500 to-emerald-600' },
    { key: 'percentualIcidade', nome: 'Cidades', icon: Building2, gradient: 'from-purple-500 to-violet-600' },
    { key: 'percentualIplan', nome: 'Planej.', icon: ClipboardList, gradient: 'from-cyan-500 to-teal-600' },
    { key: 'percentualIgovTi', nome: 'Gov. TI', icon: Laptop, gradient: 'from-slate-500 to-gray-700' },
]

type ComparisonMode = 'neighbors' | 'similar' | 'custom' | 'history'

async function fetchMunicipioData(nome: string, ano: number): Promise<MunicipioData | null> {
    const res = await fetch(`/api/municipio/nome?nome=${encodeURIComponent(nome)}&ano=${ano}`)
    if (!res.ok) return null
    return res.json()
}

async function fetchMunicipiosLista(ano: number): Promise<string[]> {
    const res = await fetch(`/api/municipios-lista?ano=${ano}`)
    if (!res.ok) return []
    return res.json()
}



export default function ComparisonSection({ municipio, ano }: ComparisonSectionProps) {
    const [mode, setMode] = useState<ComparisonMode>('similar')
    const [selectedCities, setSelectedCities] = useState<string[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [showSearch, setShowSearch] = useState(false)

    const { data: mainData, isLoading: loadingMain } = useQuery({
        queryKey: ['municipio', municipio, ano],
        queryFn: () => fetchMunicipioData(municipio, ano),
    })

    const { data: municipiosLista = [], isLoading: loadingMunicipios } = useQuery({
        queryKey: ['municipios-lista', ano],
        queryFn: () => fetchMunicipiosLista(ano),
        staleTime: 1000 * 60 * 30,
    })

    const getComparisonCities = (): string[] => {
        if (mode === 'neighbors') {
            return CIDADES_VIZINHAS[municipio] || []
        } else if (mode === 'similar') {
            return CIDADES_MESMO_PORTE[municipio] || []
        } else {
            return selectedCities
        }
    }

    const comparisonCities = getComparisonCities()

    const { data: comparisonData = [], isLoading: loadingComparison } = useQuery({
        queryKey: ['comparison', mode, comparisonCities, selectedCities, municipio, ano],
        queryFn: async () => {
            const results: MunicipioData[] = []
            if (mode === 'history') {
                // Buscar anos anteriores para o mesmo município
                const years = [2022, 2023]
                for (const y of years) {
                    const data = await fetchMunicipioData(municipio, y)
                    if (data) results.push(data)
                }
            } else {
                for (const city of comparisonCities) {
                    const data = await fetchMunicipioData(city, ano)
                    if (data) results.push(data)
                }
            }
            return results
        },
        enabled: mode === 'history' || comparisonCities.length > 0,
    })

    // Reset index when mode changes
    useEffect(() => {
        setCurrentIndex(0)
    }, [mode])

    const normalizeText = (text: string) => {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    }

    // Cidades populares para sugestão inicial
    const cidadesPopulares = ['BELO HORIZONTE', 'UBERLANDIA', 'CONTAGEM', 'JUIZ DE FORA', 'BETIM', 'MONTES CLAROS', 'RIBEIRAO DAS NEVES', 'UBERABA', 'GOVERNADOR VALADARES', 'IPATINGA']

    // Filtrar municípios baseado no searchTerm ou mostrar populares
    const filteredMunicipios = searchTerm.length > 0
        ? municipiosLista.filter(m =>
            normalizeText(m).includes(normalizeText(searchTerm)) &&
            m.toUpperCase() !== municipio.toUpperCase() &&
            !selectedCities.includes(m)
        ).slice(0, 10)
        : cidadesPopulares.filter(m => {
            // Verificar se a cidade popular existe na lista (ignorando acentos para ser seguro)
            const exists = municipiosLista.some(ml => normalizeText(ml) === normalizeText(m))
            return exists &&
                m.toUpperCase() !== municipio.toUpperCase() &&
                !selectedCities.includes(m)
        }).slice(0, 6)

    const addCity = (city: string) => {
        if (!selectedCities.includes(city) && city !== municipio) {
            setSelectedCities([...selectedCities, city])
            setSearchTerm('')
            setShowSearch(false)
        }
    }

    const removeCity = (city: string) => {
        setSelectedCities(selectedCities.filter(c => c !== city))
    }

    const nextCity = () => {
        if (currentIndex < comparisonData.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const prevCity = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const currentComparison = comparisonData[currentIndex]

    const getDiffIndicator = (mainValue: number, compValue: number) => {
        const diff = (mainValue - compValue) * 100
        if (Math.abs(diff) < 0.5) return { icon: Minus, color: 'text-gray-400', bg: 'bg-gray-100' }
        if (diff > 0) return { icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-100' }
        return { icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-100' }
    }

    if (loadingMain) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-10 w-10 text-betim-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header com seleção de modo */}
            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-xl border border-blue-100/50">
                <div className="bg-gradient-to-r from-betim-blue to-indigo-600 p-4 sm:p-6 text-white rounded-t-xl sm:rounded-t-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur">
                                <GitCompare size={20} className="sm:hidden" />
                                <GitCompare size={24} className="hidden sm:block" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold">Comparativo Municipal</h2>
                                <p className="text-white/70 text-xs sm:text-sm">Compare {municipio} com outros municípios</p>
                            </div>
                        </div>

                        {/* Botões de Modo */}
                        <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 sm:flex-wrap">
                            {[
                                { id: 'similar', label: 'Mesmo Porte', shortLabel: 'Porte', icon: Building2 },
                                { id: 'neighbors', label: 'Vizinhas', shortLabel: 'Vizinhas', icon: Building2 },
                                { id: 'history', label: 'Histórico', shortLabel: 'Hist.', icon: History },
                                { id: 'custom', label: 'Personalizado', shortLabel: 'Custom', icon: Building2 },
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id as ComparisonMode)}
                                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${mode === m.id
                                        ? 'bg-white text-betim-blue shadow-lg'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    <m.icon size={14} className="sm:hidden" />
                                    <m.icon size={16} className="hidden sm:block" />
                                    <span className="sm:hidden">{m.shortLabel}</span>
                                    <span className="hidden sm:inline">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Busca personalizada */}
                {mode === 'custom' && (
                    <div className="p-6 border-b border-blue-100">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Digite para buscar um município..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setShowSearch(true) }}
                                onFocus={() => setShowSearch(true)}
                                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-betim-blue transition-all text-gray-900 placeholder-gray-400"
                            />

                            {/* Dropdown de sugestões */}
                            {showSearch && (
                                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-blue-100 max-h-72 overflow-y-auto">
                                    {loadingMunicipios ? (
                                        <div className="px-5 py-4 text-center text-gray-500 flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            Carregando municípios...
                                        </div>
                                    ) : filteredMunicipios.length > 0 ? (
                                        <>
                                            {!searchTerm && (
                                                <div className="px-4 py-2 text-xs text-betim-blue font-semibold bg-blue-50 border-b border-blue-100">
                                                    Sugestões populares ({municipiosLista.length} disponíveis)
                                                </div>
                                            )}
                                            {filteredMunicipios.map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => addCity(m)}
                                                    className="w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                                                >
                                                    <Building2 size={16} className="text-betim-blue" />
                                                    <span className="font-medium text-gray-900">{m}</span>
                                                </button>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="px-5 py-4 text-center text-gray-400">
                                            {searchTerm ? `Nenhum município encontrado para "${searchTerm}"` : 'Digite para buscar...'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedCities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedCities.map(city => (
                                    <span
                                        key={city}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-betim-blue rounded-xl text-sm font-medium shadow-sm"
                                    >
                                        <Building2 size={14} />
                                        {city}
                                        <button onClick={() => removeCity(city)} className="hover:text-blue-900 ml-1">
                                            <X size={16} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Comparação lado a lado */}
            {loadingComparison ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin h-8 w-8 text-betim-blue" />
                </div>
            ) : comparisonData.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">
                        {mode === 'neighbors'
                            ? `Selecione cidades vizinhas de ${municipio}`
                            : mode === 'custom'
                                ? 'Busque e selecione municípios para comparar'
                                : 'Carregando cidades similares...'}
                    </p>
                </div>
            ) : (
                <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
                    {/* Decorações de fundo */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                    {/* Navigation header */}
                    <div className="relative z-10 flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-100/80 via-white/90 to-blue-100/50 border-b border-slate-200/50 backdrop-blur-sm">
                        <button
                            onClick={prevCity}
                            disabled={currentIndex === 0}
                            className={`p-3 rounded-xl transition-all ${currentIndex === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-white hover:text-purple-600 hover:shadow-lg'
                                }`}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="flex items-center gap-3">
                            {comparisonData.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                                        ? 'bg-gradient-to-r from-betim-blue to-indigo-600 scale-125 shadow-lg shadow-blue-300'
                                        : 'bg-gray-300 hover:bg-blue-300'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextCity}
                            disabled={currentIndex === comparisonData.length - 1}
                            className={`p-3 rounded-xl transition-all ${currentIndex === comparisonData.length - 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-white hover:text-betim-blue hover:shadow-lg'
                                }`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Side by side comparison - Cards separados */}
                    {currentComparison && mainData && (
                        <div className="relative z-10 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                {/* Card Betim (Principal) - Fundo Branco */}
                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100 relative overflow-hidden">
                                    <div className="relative z-10">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-betim-blue to-indigo-600 flex items-center justify-center shadow-md">
                                                <Building2 className="text-white" size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Betim</span>
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                                    {municipio} {mode === 'history' ? `(${ano})` : ''}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* IEGM Geral - Colorido pela faixa */}
                                        <div className={`mb-4 p-3 rounded-lg ${mainData.faixaIegmMunicipio === 'A' ? 'bg-green-500' :
                                            mainData.faixaIegmMunicipio === 'B+' ? 'bg-emerald-500' :
                                                mainData.faixaIegmMunicipio === 'B' ? 'bg-yellow-400' :
                                                    mainData.faixaIegmMunicipio === 'C+' ? 'bg-orange-500' :
                                                        'bg-red-500'
                                            }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold text-white/80">IEGM Geral</span>
                                                    <div className="text-2xl sm:text-3xl font-black text-white">
                                                        {(mainData.percentualIegmMunicipio * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg shadow-md ${mainData.faixaIegmMunicipio === 'A' ? 'bg-green-800 text-white' :
                                                    mainData.faixaIegmMunicipio === 'B+' ? 'bg-emerald-800 text-white' :
                                                        mainData.faixaIegmMunicipio === 'B' ? 'bg-yellow-700 text-white' :
                                                            mainData.faixaIegmMunicipio === 'C+' ? 'bg-orange-800 text-white' :
                                                                'bg-red-800 text-white'
                                                    }`}>
                                                    Faixa {mainData.faixaIegmMunicipio}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Indicadores - Design limpo com hover animado */}
                                        <div className="space-y-2">
                                            {indicadores.map(ind => {
                                                const mainValue = mainData[ind.key as keyof MunicipioData] as number
                                                const compValue = currentComparison[ind.key as keyof MunicipioData] as number
                                                const diff = getDiffIndicator(mainValue, compValue)
                                                const diffValue = ((mainValue - compValue) * 100).toFixed(1)
                                                const Icon = ind.icon
                                                // Cores de acento baseadas na nota
                                                const colorScheme = mainValue >= 0.90 ? {
                                                    icon: 'bg-green-500',
                                                    badge: 'bg-green-100 text-green-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-green-900',
                                                    overlay: 'from-green-400 via-green-100 to-transparent'
                                                } : mainValue >= 0.75 ? {
                                                    icon: 'bg-emerald-500',
                                                    badge: 'bg-emerald-100 text-emerald-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-emerald-900',
                                                    overlay: 'from-emerald-400 via-emerald-100 to-transparent'
                                                } : mainValue >= 0.60 ? {
                                                    icon: 'bg-yellow-500',
                                                    badge: 'bg-yellow-100 text-yellow-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-yellow-900',
                                                    overlay: 'from-yellow-300 via-yellow-100 to-transparent'
                                                } : mainValue >= 0.50 ? {
                                                    icon: 'bg-orange-500',
                                                    badge: 'bg-orange-100 text-orange-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-orange-900',
                                                    overlay: 'from-orange-400 via-orange-100 to-transparent'
                                                } : {
                                                    icon: 'bg-red-500',
                                                    badge: 'bg-red-100 text-red-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-red-900',
                                                    overlay: 'from-red-400 via-red-100 to-transparent'
                                                }
                                                return (
                                                    <div
                                                        key={ind.key}
                                                        className="group relative flex items-center gap-3 p-2.5 bg-white rounded-lg shadow-sm cursor-pointer overflow-hidden
                                                            transition-all duration-300 ease-out
                                                            hover:shadow-lg hover:scale-[1.02]"
                                                    >
                                                        {/* Overlay gradiente que aparece no hover */}
                                                        <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`} />

                                                        {/* Conteúdo */}
                                                        <div className={`relative z-10 w-8 h-8 rounded-lg ${colorScheme.icon} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                                                            <Icon size={16} className="text-white" />
                                                        </div>
                                                        <span className={`relative z-10 flex-1 text-sm font-medium ${colorScheme.text} ${colorScheme.hoverText} transition-colors duration-300`}>{ind.nome}</span>
                                                        <span className={`relative z-10 text-sm font-bold px-2.5 py-1 rounded-full ${colorScheme.badge} transition-all duration-300 group-hover:shadow-md`}>
                                                            {(mainValue * 100).toFixed(0)}%
                                                        </span>
                                                        <div className={`relative z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 group-hover:scale-105 ${diff.color === 'text-green-600' ? 'bg-green-500 text-white' :
                                                            diff.color === 'text-red-600' ? 'bg-red-500 text-white' :
                                                                'bg-gray-400 text-white'
                                                            }`}>
                                                            <diff.icon size={12} />
                                                            <span>{Math.abs(parseFloat(diffValue))}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Outra Cidade (Comparação) - Fundo Branco */}
                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100 relative overflow-hidden">
                                    <div className="relative z-10">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-betim-blue to-indigo-600 flex items-center justify-center shadow-md">
                                                <Building2 className="text-white" size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                    {mode === 'history' ? 'Histórico' : 'Comparando com'}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                    {currentComparison.municipio} {mode === 'history' ? `(${currentComparison.anoRef})` : ''}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* IEGM Geral - Colorido pela faixa */}
                                        <div className={`mb-4 p-3 rounded-lg ${currentComparison.faixaIegmMunicipio === 'A' ? 'bg-green-500' :
                                            currentComparison.faixaIegmMunicipio === 'B+' ? 'bg-emerald-500' :
                                                currentComparison.faixaIegmMunicipio === 'B' ? 'bg-yellow-400' :
                                                    currentComparison.faixaIegmMunicipio === 'C+' ? 'bg-orange-500' :
                                                        'bg-red-500'
                                            }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold text-white/80">IEGM Geral</span>
                                                    <div className="text-2xl sm:text-3xl font-black text-white">
                                                        {(currentComparison.percentualIegmMunicipio * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg shadow-md ${currentComparison.faixaIegmMunicipio === 'A' ? 'bg-green-800 text-white' :
                                                    currentComparison.faixaIegmMunicipio === 'B+' ? 'bg-emerald-800 text-white' :
                                                        currentComparison.faixaIegmMunicipio === 'B' ? 'bg-yellow-700 text-white' :
                                                            currentComparison.faixaIegmMunicipio === 'C+' ? 'bg-orange-800 text-white' :
                                                                'bg-red-800 text-white'
                                                    }`}>
                                                    Faixa {currentComparison.faixaIegmMunicipio}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Indicadores - Design limpo com acentos coloridos */}
                                        <div className="space-y-2">
                                            {indicadores.map(ind => {
                                                const compValue = currentComparison[ind.key as keyof MunicipioData] as number
                                                const Icon = ind.icon
                                                // Cores de acento baseadas na nota
                                                const colorScheme = compValue >= 0.90 ? {
                                                    icon: 'bg-green-500',
                                                    badge: 'bg-green-100 text-green-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-green-900',
                                                    overlay: 'from-green-400 via-green-100 to-transparent'
                                                } : compValue >= 0.75 ? {
                                                    icon: 'bg-emerald-500',
                                                    badge: 'bg-emerald-100 text-emerald-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-emerald-900',
                                                    overlay: 'from-emerald-400 via-emerald-100 to-transparent'
                                                } : compValue >= 0.60 ? {
                                                    icon: 'bg-yellow-500',
                                                    badge: 'bg-yellow-100 text-yellow-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-yellow-900',
                                                    overlay: 'from-yellow-300 via-yellow-100 to-transparent'
                                                } : compValue >= 0.50 ? {
                                                    icon: 'bg-orange-500',
                                                    badge: 'bg-orange-100 text-orange-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-orange-900',
                                                    overlay: 'from-orange-400 via-orange-100 to-transparent'
                                                } : {
                                                    icon: 'bg-red-500',
                                                    badge: 'bg-red-100 text-red-700',
                                                    text: 'text-gray-700',
                                                    hoverText: 'group-hover:text-red-900',
                                                    overlay: 'from-red-400 via-red-100 to-transparent'
                                                }
                                                return (
                                                    <div
                                                        key={ind.key}
                                                        className="group relative flex items-center gap-3 p-2.5 bg-white rounded-lg shadow-sm cursor-pointer overflow-hidden
                                                            transition-all duration-300 ease-out
                                                            hover:shadow-lg hover:scale-[1.02]"
                                                    >
                                                        {/* Overlay gradiente que aparece no hover */}
                                                        <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`} />

                                                        {/* Conteúdo */}
                                                        <div className={`relative z-10 w-8 h-8 rounded-lg ${colorScheme.icon} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                                                            <Icon size={16} className="text-white" />
                                                        </div>
                                                        <span className={`relative z-10 flex-1 text-sm font-medium ${colorScheme.text} ${colorScheme.hoverText} transition-colors duration-300`}>{ind.nome}</span>
                                                        <span className={`relative z-10 text-sm font-bold px-2.5 py-1 rounded-full ${colorScheme.badge} transition-all duration-300 group-hover:shadow-md`}>
                                                            {(compValue * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick navigation pills */}
            {comparisonData.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {comparisonData.map((comp, idx) => (
                        <button
                            key={`${comp.municipio}-${comp.anoRef || idx}`}
                            onClick={() => setCurrentIndex(idx)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${idx === currentIndex
                                ? 'bg-betim-blue text-white shadow-lg shadow-blue-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                }`}
                        >
                            {comp.municipio} {mode === 'history' ? `(${comp.anoRef})` : ''}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
