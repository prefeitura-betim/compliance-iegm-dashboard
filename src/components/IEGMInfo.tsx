import { BookOpen, HeartPulse, Coins, TreePine, Building2, ClipboardList, Laptop, Info, ExternalLink } from 'lucide-react'

const dimensoes = [
    {
        icone: BookOpen,
        nome: 'i-Educ',
        titulo: 'Educação',
        descricao: 'Infraestrutura escolar, formação docente e resultados educacionais',
        cor: 'from-blue-500 to-blue-600',
        peso: '20%'
    },
    {
        icone: HeartPulse,
        nome: 'i-Saúde',
        titulo: 'Saúde',
        descricao: 'Atenção básica, vigilância sanitária e recursos de saúde',
        cor: 'from-red-500 to-rose-600',
        peso: '20%'
    },
    {
        icone: Coins,
        nome: 'i-Fiscal',
        titulo: 'Gestão Fiscal',
        descricao: 'Transparência, controle interno e gestão orçamentária',
        cor: 'from-amber-500 to-orange-600',
        peso: '20%'
    },
    {
        icone: TreePine,
        nome: 'i-Amb',
        titulo: 'Meio Ambiente',
        descricao: 'Políticas ambientais, gestão de resíduos e saneamento',
        cor: 'from-green-500 to-emerald-600',
        peso: '10%'
    },
    {
        icone: Building2,
        nome: 'i-Cidade',
        titulo: 'Cidades',
        descricao: 'Mobilidade urbana, habitação e planejamento urbanístico',
        cor: 'from-purple-500 to-violet-600',
        peso: '5%'
    },
    {
        icone: ClipboardList,
        nome: 'i-Plan',
        titulo: 'Planejamento',
        descricao: 'Planos municipais, definição de metas e indicadores',
        cor: 'from-cyan-500 to-teal-600',
        peso: '20%'
    },
    {
        icone: Laptop,
        nome: 'i-GovTI',
        titulo: 'Governança TI',
        descricao: 'Sistemas de informação, segurança e governo eletrônico',
        cor: 'from-indigo-500 to-blue-600',
        peso: '5%'
    },
]

const faixas = [
    { faixa: 'A', label: 'Altamente Efetiva', criterio: '≥ 90% (e 5 notas A)', cor: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-white' },
    { faixa: 'B+', label: 'Muito Efetiva', criterio: '75,00% a 89,99%', cor: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white' },
    { faixa: 'B', label: 'Efetiva', criterio: '60,00% a 74,99%', cor: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-white' },
    { faixa: 'C+', label: 'Em Adequação', criterio: '50,00% a 59,99%', cor: 'bg-gradient-to-r from-orange-400 to-orange-500', text: 'text-white' },
    { faixa: 'C', label: 'Baixo Nível', criterio: '< 49,99%', cor: 'bg-gradient-to-r from-red-400 to-red-500', text: 'text-white' },
]

export default function IEGMInfo() {
    return (
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-betim-blue to-betim-blue-dark p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                        <Info size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Sobre o IEGM</h2>
                        <p className="text-white/80 text-sm">Metodologia, Pesos e Classificação</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-10">
                {/* 1. Descrição Geral */}
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed">
                        O <strong className="text-betim-blue">IEGM</strong> é uma ferramenta desenvolvida pelos Tribunais de Contas brasileiros,
                        sob coordenação do <strong>Instituto Rui Barbosa (IRB)</strong>, para avaliar a qualidade
                        dos serviços públicos oferecidos pelos municípios.
                    </p>
                </div>

                {/* 2. Metodologia de Pontuação */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-betim-blue rounded-full"></span>
                        Como funciona a Pontuação?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-betim-blue mb-2 flex items-center gap-2">
                                <span className="bg-blue-100 p-1 rounded-md text-xs">01</span> Por Questão
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Cada questão recebe <strong>pontos absolutos</strong> (não percentual).
                                A pontuação máxima (Pmáx) varia conforme a complexidade da pergunta.
                            </p>
                            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-500 font-mono">
                                Ex: Pmáx = 2 pontos, 10 pontos, 18 pontos...
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-betim-blue mb-2 flex items-center gap-2">
                                <span className="bg-blue-100 p-1 rounded-md text-xs">02</span> Por Indicador
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                A soma dos pontos obtidos em todas as questões gera a <strong>nota bruta</strong> do indicador.
                                Essa nota é então convertida em um percentual (0-100%) para fins de classificação.
                            </p>
                            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-500 font-mono">
                                Nota Bruta → Percentual → Faixa
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Dimensões e Pesos */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-betim-blue rounded-full"></span>
                        Dimensões Avaliadas e Pesos (IEGM Geral)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {dimensoes.map((dim) => {
                            const Icon = dim.icone
                            return (
                                <div
                                    key={dim.nome}
                                    className="group relative bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${dim.cor} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`}></div>
                                    <div className="relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${dim.cor} flex items-center justify-center shadow-sm`}>
                                                <Icon size={20} className="text-white" />
                                            </div>
                                            <span className="text-xs font-black px-2 py-1 bg-gray-100 rounded-md text-gray-600" title="Peso na Nota Geral">
                                                {dim.peso}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900">{dim.nome}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dim.descricao}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 4. Faixas de Classificação Detalhadas */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-betim-blue rounded-full"></span>
                        Faixas de Classificação
                    </h3>

                    <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Faixa</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Classificação</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Critério (Nota)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {faixas.map((f) => (
                                    <tr key={f.faixa} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className={`${f.cor} ${f.text} inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shadow-sm`}>
                                                {f.faixa}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-700">{f.label}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-medium font-mono">
                                            {f.criterio}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Link */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                        Fonte: <a href="https://tce.mg.gov.br/" target="_blank" rel="noreferrer" className="hover:underline">TCEMG</a> / Instituto Rui Barbosa
                    </span>
                    <a
                        href="https://iegm.irbcontas.org.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-betim-blue hover:text-betim-blue-dark font-medium transition-colors"
                    >
                        Acessar Portal IEGM
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    )
}
