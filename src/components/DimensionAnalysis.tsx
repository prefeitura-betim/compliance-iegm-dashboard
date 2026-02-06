import { IEGMData } from '@/hooks/useIEGMData'
import { getFaixaLabel, formatPercentual } from '@/lib/iegmUtils'
import { BookOpen, HeartPulse, Coins, TreePine, Building2, ClipboardList, Laptop } from 'lucide-react'
import ImprovementAnalysis from './ImprovementAnalysis'

interface DimensionAnalysisProps {
    data: IEGMData
}

const dimensoes = [
    {
        key: 'percentualIeduc',
        faixaKey: 'faixaIeduc',
        nome: 'Educação',
        icon: BookOpen,
        descricao: 'Avalia infraestrutura escolar, formação docente, recursos pedagógicos e resultados educacionais.',
        cor: 'betim-blue',
    },
    {
        key: 'percentualIsaude',
        faixaKey: 'faixaIsaude',
        nome: 'Saúde',
        icon: HeartPulse,
        descricao: 'Avalia atenção básica, vigilância sanitária, recursos humanos e infraestrutura de saúde.',
        cor: 'betim-red',
    },
    {
        key: 'percentualIfiscal',
        faixaKey: 'faixaIfiscal',
        nome: 'Gestão Fiscal',
        icon: Coins,
        descricao: 'Avalia transparência, controle interno, gestão orçamentária e responsabilidade fiscal.',
        cor: 'betim-green',
    },
    {
        key: 'percentualIamb',
        faixaKey: 'faixaIamb',
        nome: 'Meio Ambiente',
        icon: TreePine,
        descricao: 'Avalia políticas ambientais, gestão de resíduos, saneamento e preservação.',
        cor: 'betim-teal',
    },
    {
        key: 'percentualIcidade',
        faixaKey: 'faixaIcidade',
        nome: 'Cidades',
        icon: Building2,
        descricao: 'Avalia mobilidade urbana, habitação, urbanismo e infraestrutura municipal.',
        cor: 'betim-blue-light',
    },
    {
        key: 'percentualIplan',
        faixaKey: 'faixaIplan',
        nome: 'Planejamento',
        icon: ClipboardList,
        descricao: 'Avalia planos municipais, metas, indicadores e gestão estratégica.',
        cor: 'betim-orange',
    },
    {
        key: 'percentualIgovTi',
        faixaKey: 'faixaIgovTi',
        nome: 'Governança de TI',
        icon: Laptop,
        descricao: 'Avalia sistemas de informação, segurança digital e governo eletrônico.',
        cor: 'betim-blue-dark',
    },
]

export default function DimensionAnalysis({ data }: DimensionAnalysisProps) {
    if (!data.resultados) {
        return null
    }

    const resultados = data.resultados

    // Função para cor da barra baseada na faixa e valor (Design System Betim)
    const getProgressColor = (valor: number | null, faixa: string | null) => {
        if (!valor) return 'bg-gray-200'

        const f = faixa?.toUpperCase()
        if (f === 'A' || f === 'B+') return 'bg-betim-green-dark'
        if (f === 'B') return 'bg-betim-yellow'
        if (f === 'C+') return 'bg-betim-orange'
        if (f === 'C') return 'bg-betim-red'

        // Fallback por valor se a faixa não estiver disponível
        if (valor >= 0.75) return 'bg-betim-green-dark'
        if (valor >= 0.60) return 'bg-betim-green'
        if (valor >= 0.50) return 'bg-betim-orange'
        return 'bg-betim-red'
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-betim border border-gray-100">
            <h2 className="text-lg font-bold text-betim-blue-dark mb-6 font-heading border-b border-gray-100 pb-2">
                Análise por Dimensão
            </h2>

            <div className="space-y-4">
                {dimensoes.map((dim) => {
                    const valor = resultados[dim.key as keyof typeof resultados] as number | null
                    const faixa = resultados[dim.faixaKey as keyof typeof resultados] as string | null
                    const percentual = valor ? valor * 100 : 0

                    return (
                        <div key={dim.key} className="border border-gray-100 rounded-lg p-5 hover:shadow-betim-md transition-all duration-300 hover:border-betim-blue-light group bg-white">
                            <div className="flex items-start gap-5">
                                <span className="text-betim-blue-dark group-hover:text-betim-blue group-hover:scale-110 transition-all duration-300 bg-gray-50 p-3 rounded-lg">
                                    <dim.icon size={32} strokeWidth={1.5} />
                                </span>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-800 font-heading">{dim.nome}</h3>
                                        <div className="flex items-center gap-3 mt-2 md:mt-0">
                                            <span className="text-2xl font-bold text-betim-blue-dark font-heading">
                                                {formatPercentual(valor)}
                                            </span>
                                            {faixa && (
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${faixa.startsWith('A') || faixa === 'B+'
                                                    ? 'bg-betim-green/10 text-betim-green-dark' :
                                                    faixa === 'B'
                                                        ? 'bg-betim-yellow/10 text-betim-yellow' :
                                                        faixa.startsWith('C+')
                                                            ? 'bg-betim-orange/10 text-betim-orange' :
                                                            'bg-betim-red/10 text-betim-red'
                                                    }`}>
                                                    Faixa {faixa} - {getFaixaLabel(faixa)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 font-sans leading-relaxed">{dim.descricao}</p>

                                    {/* Barra de progresso */}
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(valor, faixa)}`}
                                            style={{ width: `${percentual}%` }}
                                        />
                                    </div>

                                    {/* Análise Qualitativa */}
                                    <ImprovementAnalysis
                                        municipio={data.municipio?.municipio || 'BETIM'} // Fallback seguro
                                        ano={data.municipio?.anoRef || 2024}
                                        indicador={{
                                            'percentualIeduc': 'i-Educ',
                                            'percentualIsaude': 'i-Saude',
                                            'percentualIfiscal': 'i-Fiscal',
                                            'percentualIamb': 'i-Amb',
                                            'percentualIcidade': 'i-Cidade',
                                            'percentualIplan': 'i-Plan',
                                            'percentualIgovTi': 'i-GovTI',
                                        }[dim.key] || 'i-Educ'}
                                        cor={dim.cor}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
