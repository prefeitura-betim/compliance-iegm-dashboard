import { IEGMData } from '@/hooks/useIEGMData'
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
)

interface RadarChartProps {
    data: IEGMData
}

const indicadores = [
    { key: 'percentualIeduc', nome: 'Educação' },
    { key: 'percentualIsaude', nome: 'Saúde' },
    { key: 'percentualIfiscal', nome: 'Gestão Fiscal' },
    { key: 'percentualIamb', nome: 'Meio Ambiente' },
    { key: 'percentualIcidade', nome: 'Cidades' },
    { key: 'percentualIplan', nome: 'Planejamento' },
    { key: 'percentualIgovTi', nome: 'Governança TI' },
]

export default function RadarChart({ data }: RadarChartProps) {
    if (!data.resultados) {
        return null
    }

    const resultados = data.resultados

    const chartData = {
        labels: indicadores.map(i => i.nome),
        datasets: [
            {
                label: data.municipio?.nome || 'Município',
                data: indicadores.map(i => {
                    const valor = resultados[i.key as keyof typeof resultados] as number | null
                    return valor ? valor * 100 : 0
                }),
                // Betim Blue: #0072e7 -> rgba(0, 114, 231, x)
                backgroundColor: 'rgba(0, 114, 231, 0.2)',
                borderColor: 'rgba(0, 114, 231, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 114, 231, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(0, 114, 231, 1)',
                pointRadius: 4,
            },
            {
                label: 'Média Estadual',
                data: indicadores.map(() => data.comparativoEstadual?.mediaEstadual ? data.comparativoEstadual.mediaEstadual * 100 : 50),
                // Laranja para destaque: rgba(249, 115, 22, x)
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderColor: 'rgba(249, 115, 22, 0.8)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                pointLabels: {
                    font: {
                        family: 'Montserrat',
                        size: 11,
                        weight: 'bold' as const
                    },
                    color: '#495156'
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    callback: (value: number) => `${value}%`,
                    backdropColor: 'transparent',
                    font: {
                        family: 'Karla',
                        size: 10
                    }
                },
            },
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    font: {
                        family: 'Karla',
                        size: 12
                    },
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(73, 81, 86, 0.9)',
                titleFont: {
                    family: 'Montserrat',
                    size: 13
                },
                bodyFont: {
                    family: 'Karla',
                    size: 12
                },
                padding: 10,
                cornerRadius: 4,
                callbacks: {
                    label: (context: any) => {
                        return `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                    },
                },
            },
        },
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-betim border border-gray-100">
            <h2 className="text-lg font-bold text-betim-blue-dark mb-6 font-heading border-b border-gray-100 pb-2">
                Visão Geral dos Indicadores
            </h2>
            <div className="h-[450px]">
                <Radar data={chartData} options={options} />
            </div>
        </div>
    )
}
