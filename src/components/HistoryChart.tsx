import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { TrendingUp, Loader2, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

interface HistoryChartProps {
    municipio: string
}

interface HistoryData {
    ano: number
    iegm: number
    faixa: string
}

async function fetchHistory(municipio: string): Promise<HistoryData[]> {
    const anosRes = await fetch('/api/anos-disponiveis')
    if (!anosRes.ok) throw new Error('Erro ao buscar anos')
    const anos: number[] = await anosRes.json()

    const results: HistoryData[] = []

    for (const ano of anos.sort((a, b) => a - b)) {
        const res = await fetch(`/api/municipio/nome?nome=${encodeURIComponent(municipio)}&ano=${ano}`)
        if (res.ok) {
            const data = await res.json()
            if (data.percentualIegmMunicipio) {
                results.push({
                    ano,
                    iegm: data.percentualIegmMunicipio,
                    faixa: data.faixaIegmMunicipio || 'N/D'
                })
            }
        }
    }

    return results
}



export default function HistoryChart({ municipio }: HistoryChartProps) {
    const { data: history, isLoading, error } = useQuery({
        queryKey: ['history', municipio],
        queryFn: () => fetchHistory(municipio),
        staleTime: 1000 * 60 * 10,
    })

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border flex items-center justify-center h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-betim-blue mx-auto" />
                    <p className="mt-4 text-gray-500">Carregando histórico...</p>
                </div>
            </div>
        )
    }

    if (error || !history || history.length === 0) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border flex flex-col items-center justify-center h-[400px]">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-400">Dados históricos não disponíveis</p>
            </div>
        )
    }

    // Calcular variação
    const firstValue = history[0].iegm * 100
    const lastValue = history[history.length - 1].iegm * 100
    const variation = lastValue - firstValue
    const variationPercent = firstValue > 0 ? ((variation / firstValue) * 100).toFixed(1) : '0'

    const chartData = {
        labels: history.map(h => h.ano.toString()),
        datasets: [
            {
                label: 'IEGM',
                data: history.map(h => h.iegm * 100),
                borderColor: '#0072e7',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
                    gradient.addColorStop(0, 'rgba(0, 114, 231, 0.3)')
                    gradient.addColorStop(1, 'rgba(0, 114, 231, 0)')
                    return gradient
                },
                fill: true,
                tension: 0.4,
                pointRadius: 8,
                pointBackgroundColor: '#0072e7',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointHoverRadius: 12,
                pointHoverBackgroundColor: '#0072e7',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 4,
                borderWidth: 4,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 16,
                borderRadius: 12,
                titleFont: { size: 14, weight: 'bold' as const },
                bodyFont: { size: 15 },
                displayColors: false,
                callbacks: {
                    title: (ctx: any) => `Ano ${ctx[0].label}`,
                    label: (ctx: any) => {
                        const idx = ctx.dataIndex
                        const faixa = history[idx].faixa
                        return [`IEGM: ${ctx.raw.toFixed(1)}%`, `Faixa: ${faixa}`]
                    }
                }
            },
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    callback: (value: any) => `${value}%`,
                    stepSize: 25,
                    font: { size: 12 },
                    color: '#9ca3af',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.04)',
                },
            },
            x: {
                ticks: {
                    font: { size: 14, weight: 'bold' as const },
                    color: '#374151',
                },
                grid: {
                    display: false,
                },
            },
        },
    }

    return (
        <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Decorações de fundo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

            {/* Header */}
            <div className="bg-gradient-to-r from-betim-blue to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Evolução Histórica</h3>
                            <p className="text-white/70 text-sm">{history[0].ano} → {history[history.length - 1].ano}</p>
                        </div>
                    </div>

                    {/* Badge de variação */}
                    <div className={`
                        px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg
                        ${variation >= 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-500 text-white'
                        }
                    `}>
                        {variation >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        {variation >= 0 ? '+' : ''}{variationPercent}%
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Gráfico */}
                {/* Gráfico */}
                <div className="h-[250px] mb-6">
                    <Line data={chartData} options={options} />
                </div>

                {/* Cards por ano */}
                <div className="grid grid-cols-3 gap-4">
                    {history.map((h, idx) => {
                        const isLatest = idx === history.length - 1

                        const getCardTheme = (f: string) => {
                            if (f.startsWith('A')) return { text: 'text-green-600', badge: 'bg-green-500 text-white', border: 'border-green-200' }
                            if (f === 'B+') return { text: 'text-emerald-600', badge: 'bg-emerald-500 text-white', border: 'border-emerald-200' }
                            if (f === 'B') return { text: 'text-yellow-500', badge: 'bg-yellow-500 text-white', border: 'border-yellow-200' }
                            if (f === 'C+') return { text: 'text-orange-500', badge: 'bg-orange-500 text-white', border: 'border-orange-200' }
                            return { text: 'text-red-600', badge: 'bg-red-500 text-white', border: 'border-red-200' }
                        }

                        const theme = getCardTheme(h.faixa)

                        return (
                            <div
                                key={h.ano}
                                className={`
                                    relative rounded-xl p-4 transition-all hover:scale-105 border shadow-sm hover:shadow-md bg-white
                                    ${theme.border}
                                    ${isLatest ? 'ring-2 ring-betim-blue ring-offset-2' : ''}
                                `}
                            >
                                {isLatest && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <div className="bg-betim-blue text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            Ano Base
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={14} className={isLatest ? 'text-betim-blue' : 'text-gray-400'} />
                                    <span className={`text-sm font-semibold ${isLatest ? 'text-betim-blue' : 'text-gray-500'}`}>
                                        {h.ano}
                                    </span>
                                </div>

                                <div className={`text-2xl font-black ${theme.text}`}>
                                    {(h.iegm * 100).toFixed(1)}%
                                </div>

                                <div className={`inline-block mt-2 px-2 py-0.5 rounded-md text-xs font-bold ${theme.badge} shadow-sm border border-current/10`}>
                                    Faixa {h.faixa}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

    )
}
