import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useIEGMData } from '@/hooks/useIEGMData'
import { DEFAULT_MUNICIPIO_CONFIG } from '@/config/municipioConfig'
import DashboardTabs, { TabType } from '@/components/Dashboard/DashboardTabs'
import OverviewSection from '@/components/Dashboard/OverviewSection'
import ComparisonSection from '@/components/Dashboard/ComparisonSection'
import DetailsSection from '@/components/Dashboard/DetailsSection'
import QuestionEvolutionSection from '@/components/Dashboard/QuestionEvolutionSection'
import HistoryChart from '@/components/HistoryChart'
import FiltersPanel from '@/components/FiltersPanel'
import { FileText, FileSpreadsheet, Loader2, AlertCircle, Award, Play, Square, Maximize, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

// Tipos para as cenas cinematográficas
type PresentationScene = 'intro' | 'dimensions' | 'comparison' | 'evolution' | 'questions' | 'ranking'

export default function Dashboard() {
    // ... rest of state
    const [searchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const [isPresentationMode, setIsPresentationMode] = useState(false)
    const [presentationScene, setPresentationScene] = useState<PresentationScene>('intro')
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [sceneDuration, setSceneDuration] = useState(20)
    const [secondsRemaining, setSecondsRemaining] = useState(20)
    const dashboardRef = useRef<HTMLDivElement>(null)
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const municipioNome = searchParams.get('municipio') || DEFAULT_MUNICIPIO_CONFIG.municipio
    const ano = parseInt(searchParams.get('ano') || String(DEFAULT_MUNICIPIO_CONFIG.ano))
    const tribunal = searchParams.get('tribunal') || DEFAULT_MUNICIPIO_CONFIG.tribunal

    const { data, isLoading, error, refetch } = useIEGMData(municipioNome, ano, tribunal)

    // Lógica para o Modo Cinema (Experiência Cinematográfica)
    useEffect(() => {
        let timer: NodeJS.Timeout
        let countdown: NodeJS.Timeout

        const scenes: PresentationScene[] = ['intro', 'dimensions', 'comparison', 'evolution', 'questions', 'ranking']

        const nextScene = () => {
            setIsTransitioning(true)
            setTimeout(() => {
                setPresentationScene(current => {
                    const currentIndex = scenes.indexOf(current)
                    return scenes[(currentIndex + 1) % scenes.length]
                })
                setIsTransitioning(false)
                setSecondsRemaining(20)
                if (isPresentationMode && dashboardRef.current) {
                    dashboardRef.current.scrollTo({ top: 0, behavior: 'auto' })
                } else {
                    window.scrollTo({ top: 0, behavior: 'auto' })
                }
            }, 800)
        }

        const prevScene = () => {
            setIsTransitioning(true)
            setTimeout(() => {
                setPresentationScene(current => {
                    const currentIndex = scenes.indexOf(current)
                    return scenes[(currentIndex - 1 + scenes.length) % scenes.length]
                })
                setIsTransitioning(false)
                setSecondsRemaining(20)
                if (isPresentationMode && dashboardRef.current) {
                    dashboardRef.current.scrollTo({ top: 0, behavior: 'auto' })
                } else {
                    window.scrollTo({ top: 0, behavior: 'auto' })
                }
            }, 800)
        }

        if (isPresentationMode && !isPaused && !isTransitioning) {
            // Calcular tempo necessário para esta cena específica
            const container = dashboardRef.current
            const scrollableHeight = container ? container.scrollHeight - container.clientHeight : 0
            const calculatedDuration = Math.max(15, 12 + Math.ceil(scrollableHeight / 60))

            setSceneDuration(calculatedDuration)
            setSecondsRemaining(calculatedDuration)

            timer = setInterval(nextScene, calculatedDuration * 1000)

            countdown = setInterval(() => {
                setSecondsRemaining(prev => Math.max(0, prev - 1))
            }, 1000)

            // Auto-scroll inteligente: velocidade proporcional ao tempo de cena
            if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)

            const scrollStartTime = 3000 // Iniciar scroll após 3s
            const msInterval = 30
            const sceneStartTime = Date.now()

            scrollIntervalRef.current = setInterval(() => {
                if (!container) return

                const isScrollable = container.scrollHeight > container.clientHeight
                const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5

                // Só começa a rolar depois do delay inicial (3 segundos)
                const elapsedTime = Date.now() - sceneStartTime
                if (isScrollable && !isAtBottom && elapsedTime > scrollStartTime) {
                    // Cálculo da velocidade de scroll:
                    // Queremos terminar o scroll 3 segundos antes do fim da cena (padding de segurança)
                    const timeToScroll = (calculatedDuration - 6) * 1000
                    if (timeToScroll > 0) {
                        const pixelsPerInterval = (container.scrollHeight - container.clientHeight) / (timeToScroll / msInterval)
                        container.scrollBy({ top: pixelsPerInterval, behavior: 'auto' })
                    }
                }
            }, msInterval)
        } else {
            if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)
        }

        // Atalhos de teclado
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPresentationMode) return

            if (e.code === 'Space') {
                e.preventDefault()
                setIsPaused(prev => !prev)
            } else if (e.code === 'ArrowRight') {
                nextScene()
            } else if (e.code === 'ArrowLeft') {
                prevScene()
            } else if (e.code === 'Escape') {
                setIsPresentationMode(false)
                if (document.fullscreenElement) document.exitFullscreen().catch(() => { })
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            clearInterval(timer)
            clearInterval(countdown)
            if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isPresentationMode, isPaused, presentationScene])

    // Lógica para auto-ocultar controles no Modo Cinema
    useEffect(() => {
        let inactivityTimer: NodeJS.Timeout

        const resetTimer = () => {
            setShowControls(true)
            clearTimeout(inactivityTimer)
            if (isPresentationMode) {
                inactivityTimer = setTimeout(() => setShowControls(false), 3000)
            }
        }

        if (isPresentationMode) {
            window.addEventListener('mousemove', resetTimer)
            window.addEventListener('mousedown', resetTimer)
            window.addEventListener('keydown', resetTimer)
            window.addEventListener('touchstart', resetTimer)
            resetTimer()
        } else {
            setShowControls(true)
        }

        return () => {
            window.removeEventListener('mousemove', resetTimer)
            window.removeEventListener('mousedown', resetTimer)
            window.removeEventListener('keydown', resetTimer)
            window.removeEventListener('touchstart', resetTimer)
            clearTimeout(inactivityTimer)
        }
    }, [isPresentationMode])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    const handleDownloadPDF = async () => {
        if (!dashboardRef.current) return
        setIsGeneratingPDF(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 200))
            const width = dashboardRef.current.scrollWidth
            const height = dashboardRef.current.scrollHeight

            const dataUrl = await toPng(dashboardRef.current, {
                width: width,
                height: height,
                cacheBust: true,
                backgroundColor: '#f8fafc',
                style: {
                    transform: 'none',
                    margin: '0',
                    padding: '0',
                    width: `${width}px`,
                    height: `${height}px`
                },
                filter: (node) => {
                    const element = node as HTMLElement
                    return !element.classList?.contains('no-print') &&
                        !element.hasAttribute?.('data-html2canvas-ignore')
                }
            })

            const pdf = new jsPDF({
                orientation: width > height ? 'l' : 'p',
                unit: 'px',
                format: [width, height]
            })

            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
            pdf.save(`IEGM_${municipioNome}_${ano}.pdf`)
        } catch (err: any) {
            console.error('Erro detalhado PDF:', err)
            alert(`Erro ao gerar PDF: ${err.message || 'Erro desconhecido'}`)
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const handleExportCSV = () => {
        if (!data || !data.resultados) return
        const headers = [
            'Município', 'Ano', 'IEGM Geral', 'Faixa Geral',
            'i-Educ', 'i-Saúde', 'i-Plan', 'i-Fiscal', 'i-Amb', 'i-Cidade', 'i-GovTI'
        ]
        const r = data.resultados
        const values = [
            municipioNome, ano,
            (r.percentualIegmMunicipio || 0).toFixed(4),
            r.faixaIegmMunicipio || 'N/D',
            (r.percentualIeduc || 0).toFixed(4),
            (r.percentualIsaude || 0).toFixed(4),
            (r.percentualIplan || 0).toFixed(4),
            (r.percentualIfiscal || 0).toFixed(4),
            (r.percentualIamb || 0).toFixed(4),
            (r.percentualIcidade || 0).toFixed(4),
            (r.percentualIgovTi || 0).toFixed(4)
        ]
        const csvContent = [headers.join(';'), values.join(';')].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `IEGM_${municipioNome}_${ano}.csv`)
        link.click()
    }

    const getFaixaFullColor = (faixa: string | null | undefined) => {
        if (!faixa) return 'bg-gray-500'
        const f = faixa.toUpperCase()
        if (f.startsWith('A')) return 'bg-betim-green'
        if (f === 'B+') return 'bg-betim-green-teal'
        if (f === 'B') return 'bg-betim-yellow'
        if (f === 'C+') return 'bg-betim-orange'
        if (f === 'C') return 'bg-betim-red'
        return 'bg-gray-500'
    }

    const renderTabContent = () => {
        if (!data) return null
        switch (activeTab) {
            case 'overview': return <OverviewSection data={data} municipio={municipioNome} />
            case 'comparison': return <ComparisonSection municipio={municipioNome} ano={ano} />
            case 'history': return (
                <div className="space-y-6">
                    <HistoryChart municipio={municipioNome} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                            <Award className="text-betim-blue mb-2" size={24} />
                            <h3 className="font-semibold text-blue-900">Histórico Consolidado</h3>
                            <p className="text-sm text-blue-700 mt-1">Dados oficiais TCEMG</p>
                        </div>
                    </div>
                </div>
            )
            case 'questions': return <QuestionEvolutionSection municipio={municipioNome} />
            case 'details': return <DetailsSection data={data} municipio={municipioNome} />
            default: return null
        }
    }

    return (
        <div
            ref={dashboardRef}
            className={`space-y-6 font-sans transition-all duration-1000 ${isPresentationMode
                ? 'fixed inset-0 z-[9999] bg-[#0f172a] p-8 overflow-y-auto overflow-x-hidden'
                : ''
                }`}
        >
            {/* Header / Actions - Escondido no Modo Cinema para imersão total */}
            {!isPresentationMode && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-betim-blue to-betim-blue-dark p-6 rounded-xl shadow-lg text-white">
                    <div>
                        <h1 className="text-2xl font-bold font-heading">Dashboard IEGM - {municipioNome}</h1>
                        <p className="text-white/80 mt-1">Análise Completa {ano}</p>
                    </div>
                    <div className="flex flex-wrap gap-2" data-html2canvas-ignore>
                        <button
                            onClick={() => {
                                setIsPresentationMode(true)
                                document.documentElement.requestFullscreen().catch(() => { })
                            }}
                            className="bg-white/10 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-white/20"
                        >
                            <Play size={18} fill="currentColor" />
                            <span>Apresentar</span>
                        </button>
                        <button onClick={toggleFullscreen} className="bg-white/10 hover:bg-white/30 backdrop-blur text-white p-2 rounded-lg transition-all border border-white/20">
                            <Maximize size={18} />
                        </button>
                        <div className="w-px h-8 bg-white/20 mx-1 hidden md:block" />
                        <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                            {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />} {isGeneratingPDF ? 'Gerando...' : 'PDF'}
                        </button>
                        <button onClick={handleExportCSV} className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium">
                            <FileSpreadsheet size={18} /> CSV
                        </button>
                    </div>
                </div>
            )}

            {isLoading && <div className="text-center py-20 bg-white rounded-xl shadow-sm"><Loader2 className="animate-spin h-12 w-12 text-betim-blue mx-auto" /><p className="mt-4 text-gray-500">Carregando dados...</p></div>}
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><AlertCircle className="text-red-500 h-8 w-8 mx-auto mb-2" /><p className="text-red-600 font-medium">{error.message}</p><button onClick={() => refetch()} className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm">Tentar Novamente</button></div>}

            {!isLoading && !error && data && (
                <div className={`space-y-6 animate-fade-in relative ${isPresentationMode ? 'z-50' : ''}`}>
                    {/* BACKDROP CINEMATOGRÁFICO */}
                    {isPresentationMode && (
                        <div className="fixed inset-0 bg-[#0f172a] z-[-1] overflow-hidden no-print">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                        </div>
                    )}
                    {/* BARRA DE PROGRESSO DA CENA (MODO CINEMA) */}
                    {isPresentationMode && (
                        <div className={`fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-[100] no-print transition-all duration-700 ${showControls ? 'opacity-100' : 'opacity-0'}`} data-html2canvas-ignore>
                            <div
                                className="h-full bg-betim-blue transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(0,114,231,0.5)]"
                                style={{ width: `${(secondsRemaining / sceneDuration) * 100}%` }}
                            />
                        </div>
                    )}

                    {/* CONTROLES FLUTUANTES (MODO CINEMA) */}
                    {isPresentationMode && (
                        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-betim-blue-dark/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20 no-print animate-cinematic-in transition-all duration-700 ${showControls ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-32 scale-75 pointer-events-none invisible'}`} data-html2canvas-ignore>
                            <div className="px-4 border-r border-white/10">
                                <span className="text-white/60 text-[10px] uppercase font-bold block">Cena Atual</span>
                                <span className="text-white font-bold text-sm">
                                    {presentationScene === 'intro' ? 'Abertura' :
                                        presentationScene === 'dimensions' ? 'Dimensões' :
                                            presentationScene === 'comparison' ? 'Regional' :
                                                presentationScene === 'evolution' ? 'Evolução' : 'Ranking'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 px-2">
                                <button
                                    onClick={() => {
                                        const scenes: PresentationScene[] = ['intro', 'dimensions', 'comparison', 'evolution', 'ranking']
                                        setPresentationScene(current => {
                                            const idx = scenes.indexOf(current)
                                            return scenes[(idx - 1 + scenes.length) % scenes.length]
                                        })
                                        setSecondsRemaining(20)
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                                    title="Cena Anterior (←)"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    className={`p-3 rounded-xl transition-all ${isPaused ? 'bg-betim-orange text-white shadow-lg scale-110' : 'hover:bg-white/10 text-white'}`}
                                    title={isPaused ? "Retomar (Espaço)" : "Pausar (Espaço)"}
                                >
                                    {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                                </button>

                                <button
                                    onClick={() => {
                                        const scenes: PresentationScene[] = ['intro', 'dimensions', 'comparison', 'evolution', 'ranking']
                                        setPresentationScene(current => {
                                            const idx = scenes.indexOf(current)
                                            return scenes[(idx + 1) % scenes.length]
                                        })
                                        setSecondsRemaining(20)
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                                    title="Próxima Cena (→)"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="w-px h-8 bg-white/10 mx-1" />

                            <button
                                onClick={toggleFullscreen}
                                className="p-3 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all"
                                title="Tela Cheia (F11)"
                            >
                                <Maximize size={20} />
                            </button>

                            <button
                                onClick={() => {
                                    setIsPresentationMode(false)
                                    if (document.fullscreenElement) document.exitFullscreen().catch(() => { })
                                }}
                                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all border border-red-500/50"
                            >
                                <Square size={16} fill="currentColor" />
                                ESC
                            </button>
                        </div>
                    )}

                    {!isPresentationMode && (
                        <>
                            <FiltersPanel municipio={municipioNome} ano={ano} tribunal={tribunal} />
                            <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
                            {renderTabContent()}
                        </>
                    )}

                    {isPresentationMode && (
                        <div className={`transition-all duration-1000 ease-in-out py-8 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                            {presentationScene === 'intro' && (
                                <div className="flex flex-col items-center justify-center min-h-[85vh] text-center animate-cinematic-in p-12 overflow-hidden relative group">
                                    <div className="relative z-10">
                                        <div className="text-blue-400 font-black tracking-[0.3em] uppercase text-2xl mb-12 opacity-80 animate-pulse">Relatório de Gestão Municipal</div>
                                        <h2 className="text-[10rem] font-black text-white mb-6 font-heading tracking-tighter leading-none drop-shadow-2xl">{municipioNome}</h2>
                                        <div className="text-6xl text-blue-200/50 mb-24 font-light italic tracking-wide">IEGM - Exercício {ano}</div>

                                        <div className="flex flex-col items-center space-y-16">
                                            <div className="text-[20rem] font-black leading-none text-white animate-cinematic-scale drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] select-none">
                                                {data.resultados?.percentualIegmMunicipio ? (data.resultados.percentualIegmMunicipio * 100).toFixed(1) : '0'}<span className="text-8xl text-white/30">%</span>
                                            </div>
                                            <div className={`px-24 py-10 text-white text-6xl font-black rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border-4 border-white/10 transition-all duration-1000 transform hover:scale-105 ${getFaixaFullColor(data.resultados?.faixaIegmMunicipio)}`}>
                                                Faixa {data.resultados?.faixaIegmMunicipio}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {presentationScene === 'dimensions' && (
                                <div className="animate-cinematic-in space-y-8 max-w-7xl mx-auto">
                                    <div className="flex items-center gap-6 mb-16"><div className="h-16 w-3 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div><h2 className="text-6xl font-black text-white font-heading">Análise por Dimensão</h2></div>
                                    <div className="bg-white/95 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl">
                                        <OverviewSection data={data} municipio={municipioNome} />
                                    </div>
                                </div>
                            )}

                            {presentationScene === 'comparison' && (
                                <div className="animate-cinematic-in space-y-8 max-w-7xl mx-auto">
                                    <div className="flex items-center gap-6 mb-16"><div className="h-16 w-3 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)]"></div><h2 className="text-6xl font-black text-white font-heading">Comparativo Regional</h2></div>
                                    <div className="bg-white/95 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl">
                                        <ComparisonSection municipio={municipioNome} ano={ano} />
                                    </div>
                                </div>
                            )}

                            {presentationScene === 'evolution' && (
                                <div className="animate-cinematic-in space-y-8 max-w-7xl mx-auto">
                                    <div className="flex items-center gap-6 mb-16"><div className="h-16 w-3 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div><h2 className="text-6xl font-black text-white font-heading">Evolução Histórica</h2></div>
                                    <div className="bg-white/95 backdrop-blur-3xl p-12 rounded-[3rem] shadow-2xl">
                                        <HistoryChart municipio={municipioNome} />
                                    </div>
                                </div>
                            )}

                            {presentationScene === 'questions' && (
                                <div className="animate-cinematic-in space-y-8 max-w-7xl mx-auto">
                                    <div className="flex items-center gap-6 mb-16"><div className="h-16 w-3 bg-betim-blue rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div><h2 className="text-6xl font-black text-white font-heading">Evolução das Perguntas</h2></div>
                                    <div className="bg-white/95 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl">
                                        <QuestionEvolutionSection municipio={municipioNome} />
                                    </div>
                                </div>
                            )}

                            {presentationScene === 'ranking' && (
                                <div className="animate-cinematic-in space-y-8 max-w-7xl mx-auto">
                                    <div className="flex items-center gap-6 mb-16"><div className="h-16 w-3 bg-violet-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div><h2 className="text-6xl font-black text-white font-heading">Posição Geral</h2></div>
                                    <div className="bg-white/95 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl">
                                        <DetailsSection data={data} municipio={municipioNome} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
