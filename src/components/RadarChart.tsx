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
            // Faixas de Contexto (Background Bands) - Ordem do maior para o menor para sobreposição correta
            {
                label: 'Faixa A (Altamente Efetiva)',
                data: indicadores.map(() => 100),
                backgroundColor: 'rgba(34, 197, 94, 0.1)', // Green-500 low opacity
                borderColor: 'transparent',
                pointRadius: 0,
                fill: true,
                order: 4
            },
            {
                label: 'Faixa B+ (Muito Efetiva)',
                data: indicadores.map(() => 90),
                // Usando cor sólida para criar o anel visual
                // Na verdade, para criar anéis perfeitos com cores diferentes, precisamos:
                // 1. Desenhar 100% com cor A.
                // 2. Desenhar 90% com cor B+. (Isso cobre o centro do A)
                // 3. Desenhar 75% com cor B. (Isso cobre o centro do B+)
                backgroundColor: 'rgba(16, 185, 129, 0.15)', // Emerald-500
                borderColor: 'transparent',
                pointRadius: 0,
                fill: true,
                order: 3
            },
            {
                label: 'Faixa B (Efetiva)',
                data: indicadores.map(() => 75),
                backgroundColor: 'rgba(245, 158, 11, 0.15)', // Amber-500
                borderColor: 'transparent',
                pointRadius: 0,
                fill: true,
                order: 2
            },
            {
                label: 'Abaixo de B',
                data: indicadores.map(() => 60),
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // "Limpa" o centro
                borderColor: 'rgba(200, 200, 200, 0.3)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: true,
                order: 1
            },
            // Dados do Município (Por cima de tudo)
            {
                label: data.municipio?.municipio || 'Município',
                data: indicadores.map(i => {
                    const valor = resultados[i.key as keyof typeof resultados] as number | null
                    return valor ? valor * 100 : 0
                }),
                backgroundColor: 'rgba(0, 114, 231, 0.3)',
                borderColor: '#0072e7',
                borderWidth: 3,
                pointBackgroundColor: '#0072e7',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0072e7',
                pointRadius: 5,
                pointHoverRadius: 7,
                order: 0 // Menor ordem = desenhado por último (topo) no Chart.js? Não, Chart.js desenha array index 0 primeiro.
                // Mas com 'order', menor = z-index maior (topo).
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
                min: 0, // Importante fixar 0-100 para as faixas ficarem corretas
                max: 100,
                ticks: {
                    stepSize: 20,
                    callback: (value: number) => `${value}%`,
                    backdropColor: 'transparent',
                    font: {
                        family: 'Karla',
                        size: 10
                    },
                    z: 10 // Tenta colocar labels acima das faixas
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
                    // Filtra para remover as faixas da legenda se desejar limpar
                    filter: (item: any) => {
                        return !item.text.includes('Faixa') && !item.text.includes('Abaixo')
                    }
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
                        if (context.dataset.label.includes('Faixa') || context.dataset.label.includes('Abaixo')) {
                            return null
                        }
                        return `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                    },
                },
                filter: (e: any) => {
                    // Hide tooltip for bands
                    return !e.dataset.label.includes('Faixa') && !e.dataset.label.includes('Abaixo')
                }
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
