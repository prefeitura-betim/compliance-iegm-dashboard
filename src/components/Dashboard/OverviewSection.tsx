import { IEGMData } from '@/hooks/useIEGMData'
import SummaryCards from '@/components/SummaryCards'
import RadarChart from '@/components/RadarChart'
import HistoryChart from '@/components/HistoryChart'

interface OverviewSectionProps {
    data: IEGMData
    municipio: string
}

export default function OverviewSection({ data, municipio }: OverviewSectionProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cards de Resumo - Layout compacto */}
            <SummaryCards data={data} />

            {/* Grid 2 colunas: Radar + Histórico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <RadarChart data={data} />

                {/* Gráfico de Evolução Histórica */}
                <HistoryChart municipio={municipio} />
            </div>
        </div>
    )
}
