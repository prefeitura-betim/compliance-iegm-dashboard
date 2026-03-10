import { useQuery } from '@tanstack/react-query'
import { defaultIEGMApiService as iegmApiService } from '@/services/iegm/iegmApiService'
import type { Municipio } from '@/services/iegm/types'

export interface IEGMData {
    municipio: Municipio | null
    anoRef?: number
    resultados: {
        percentualIamb: number | null
        percentualIcidade: number | null
        percentualIeduc: number | null
        percentualIfiscal: number | null
        percentualIgovTi: number | null
        percentualIsaude: number | null
        percentualIplan: number | null
        percentualIegmMunicipio: number | null
        faixaIamb: string | null
        faixaIcidade: string | null
        faixaIeduc: string | null
        faixaIfiscal: string | null
        faixaIgovTi: string | null
        faixaIsaude: string | null
        faixaIplan: string | null
        faixaIegmMunicipio: string | null
    } | null
    comparativoEstadual: {
        mediaEstadual: number
        posicaoRanking: number
        totalMunicipios: number
    } | null
    ranking: Array<{
        municipio: string
        percentual: number
        faixa: string
    }>
}

async function fetchIEGMData(
    municipioNome: string,
    ano: number,
    tribunal: string
): Promise<IEGMData> {
    try {
        // Buscar dados do município e ranking em paralelo
        const [municipios, rankingData] = await Promise.all([
            iegmApiService.getMunicipios(ano, tribunal, municipioNome),
            iegmApiService.getRankingMunicipios(ano, tribunal, 1000),
        ])

        const municipio = municipios.find(
            m => m.municipio?.toUpperCase() === municipioNome.toUpperCase()
        ) || null

        if (!municipio) {
            console.warn(`Município ${municipioNome} não encontrado`)
            return {
                municipio: null,
                resultados: null,
                comparativoEstadual: null,
                ranking: []
            }
        }

        // Montar resultados a partir dos dados do município
        const resultados = {
            percentualIamb: municipio.percentualIamb,
            percentualIcidade: municipio.percentualIcidade,
            percentualIeduc: municipio.percentualIeduc,
            percentualIfiscal: municipio.percentualIfiscal,
            percentualIgovTi: municipio.percentualIgovTi,
            percentualIsaude: municipio.percentualIsaude,
            percentualIplan: municipio.percentualIplan,
            percentualIegmMunicipio: municipio.percentualIegmMunicipio,
            faixaIamb: municipio.faixaIamb,
            faixaIcidade: municipio.faixaIcidade,
            faixaIeduc: municipio.faixaIeduc,
            faixaIfiscal: municipio.faixaIfiscal,
            faixaIgovTi: municipio.faixaIgovTi,
            faixaIsaude: municipio.faixaIsaude,
            faixaIplan: municipio.faixaIplan,
            faixaIegmMunicipio: municipio.faixaIegmMunicipio,
        }

        const ranking = rankingData.map(r => ({
            municipio: r.municipio,
            percentual: r.percentualIegmMunicipio || 0,
            faixa: r.faixaIegmMunicipio || 'N/D'
        }))

        // Calcular posição no ranking
        const posicaoRanking = ranking.findIndex(
            r => r.municipio.toUpperCase() === municipioNome.toUpperCase()
        ) + 1

        // Calcular média estadual
        const mediaEstadual = ranking.length > 0
            ? ranking.reduce((sum, r) => sum + r.percentual, 0) / ranking.length
            : 0

        return {
            municipio,
            anoRef: municipio.anoRef,
            resultados,
            comparativoEstadual: {
                mediaEstadual,
                posicaoRanking,
                totalMunicipios: ranking.length
            },
            ranking
        }
    } catch (error) {
        console.error('Erro ao buscar dados IEGM:', error)
        throw error
    }
}

export function useIEGMData(municipioNome: string, ano: number, tribunal: string) {
    return useQuery({
        queryKey: ['iegm', municipioNome, ano, tribunal],
        queryFn: () => fetchIEGMData(municipioNome, ano, tribunal),
        enabled: !!municipioNome && !!ano && !!tribunal,
        retry: 2,
        staleTime: 1000 * 60 * 10, // 10 minutos
    })
}
