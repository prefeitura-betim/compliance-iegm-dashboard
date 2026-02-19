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
            // 1. Faixa C (0% - 50%)
            // Fill: origin (0) to 50
            {
                label: 'Faixa C (Baixo Nível)',
                data: indicadores.map(() => 50),
                backgroundColor: 'rgba(220, 38, 38, 0.6)', // Red-600
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: 'origin',
                order: 10
            },
            // ANCHOR 50% (Invisible)
            {
                label: 'Anchor 50',
                data: indicadores.map(() => 50),
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                order: 9
            },
            // 2. Faixa C+ (50% - 60%)
            // Fill: Anchor 50 (Index 1)
            {
                label: 'Faixa C+ (Em Adequação)',
                data: indicadores.map(() => 60),
                backgroundColor: 'rgba(249, 115, 22, 0.6)', // Orange-500
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: 1, // Index of Anchor 50
                order: 8
            },
            // ANCHOR 60% (Invisible)
            {
                label: 'Anchor 60',
                data: indicadores.map(() => 60),
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                order: 7
            },
            // 3. Faixa B (60% - 75%)
            // Fill: Anchor 60 (Index 3)
            {
                label: 'Faixa B (Efetiva)',
                data: indicadores.map(() => 75),
                backgroundColor: 'rgba(245, 158, 11, 0.6)', // Amber-500
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: 3, // Index of Anchor 60
                order: 6
            },
            // ANCHOR 75% (Invisible)
            {
                label: 'Anchor 75',
                data: indicadores.map(() => 75),
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                order: 5
            },
            // 4. Faixa B+ (75% - 90%)
            // Fill: Anchor 75 (Index 5)
            {
                label: 'Faixa B+ (Muito Efetiva)',
                data: indicadores.map(() => 90),
                backgroundColor: 'rgba(16, 185, 129, 0.6)', // Emerald-500
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: 5, // Index of Anchor 75
                order: 4
            },
            // ANCHOR 90% (Invisible)
            {
                label: 'Anchor 90',
                data: indicadores.map(() => 90),
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                order: 3
            },
            // 5. Faixa A (90% - 100%)
            // Fill: Anchor 90 (Index 7)
            {
                label: 'Faixa A (Altamente Efetiva)',
                data: indicadores.map(() => 100),
                backgroundColor: 'rgba(37, 99, 235, 0.6)', // Blue-600
                borderColor: 'transparent',
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: 7, // Index of Anchor 90
                order: 2
            },
            // Dados do Município (Por cima de tudo)
            {
                label: data.municipio?.municipio || 'Município',
                data: indicadores.map(i => {
                    const valor = resultados[i.key as keyof typeof resultados] as number | null
                    return valor ? valor * 100 : 0
                }),
                backgroundColor: 'rgba(31, 41, 55, 0)',
                borderColor: '#1f2937', // Gray-800
                borderWidth: 3,
                pointBackgroundColor: '#1f2937',
                pointBorderColor: 'transparent',
                pointHoverBackgroundColor: '#1f2937',
                pointHoverBorderColor: 'transparent',
                pointRadius: 5,
                pointHoverRadius: 7,
                order: 0
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
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20,
                    callback: (value: number) => `${value}%`,
                    backdropColor: 'transparent',
                    font: {
                        family: 'Karla',
                        size: 10
                    },
                    z: 10
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
                    padding: 20,
                    filter: (item: any) => !item.text.includes('Anchor')
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
                filter: (e: any) => !e.dataset.label.includes('Anchor') && !e.dataset.label.includes('Faixa')
            },
        },
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-betim border border-gray-100">
            <h2 className="text-lg font-bold text-betim-blue-dark mb-6 font-heading border-b border-gray-100 pb-2">
                Visão Geral dos Indicadores
            </h2>
            <div className="h-[450px]">
                <Radar data={chartData} options={options as any} />
            </div>
        </div>
    )
}
