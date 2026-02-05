import { IEGMData } from '@/hooks/useIEGMData'
import DimensionAnalysis from '@/components/DimensionAnalysis'
import ComparativoEstadual from '@/components/ComparativoEstadual'
import RankingMunicipios from '@/components/RankingMunicipios'
import IEGMInfo from '@/components/IEGMInfo'

interface DetailsSectionProps {
    data: IEGMData
    municipio: string
}

export default function DetailsSection({ data, municipio }: DetailsSectionProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Análise detalhada por Dimensão */}
            <DimensionAnalysis data={data} />

            {/* Comparativo Estadual */}
            <ComparativoEstadual data={data} municipio={municipio} />

            {/* Ranking completo */}
            <RankingMunicipios data={data} municipio={municipio} />

            {/* Informações sobre o IEGM */}
            <IEGMInfo />
        </div>
    )
}
