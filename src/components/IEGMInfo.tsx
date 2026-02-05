import { BookOpen, HeartPulse, Coins, TreePine, Building2, ClipboardList, Laptop, Info, ExternalLink } from 'lucide-react'

const dimensoes = [
    {
        icone: BookOpen,
        nome: 'i-Educ',
        titulo: 'Educação',
        descricao: 'Infraestrutura escolar, formação docente e resultados educacionais',
        cor: 'from-blue-500 to-blue-600'
    },
    {
        icone: HeartPulse,
        nome: 'i-Saúde',
        titulo: 'Saúde',
        descricao: 'Atenção básica, vigilância sanitária e recursos de saúde',
        cor: 'from-red-500 to-rose-600'
    },
    {
        icone: Coins,
        nome: 'i-Fiscal',
        titulo: 'Gestão Fiscal',
        descricao: 'Transparência, controle interno e gestão orçamentária',
        cor: 'from-amber-500 to-orange-600'
    },
    {
        icone: TreePine,
        nome: 'i-Amb',
        titulo: 'Meio Ambiente',
        descricao: 'Políticas ambientais, gestão de resíduos e saneamento',
        cor: 'from-green-500 to-emerald-600'
    },
    {
        icone: Building2,
        nome: 'i-Cidade',
        titulo: 'Cidades',
        descricao: 'Mobilidade urbana, habitação e planejamento urbanístico',
        cor: 'from-purple-500 to-violet-600'
    },
    {
        icone: ClipboardList,
        nome: 'i-Plan',
        titulo: 'Planejamento',
        descricao: 'Planos municipais, definição de metas e indicadores',
        cor: 'from-cyan-500 to-teal-600'
    },
    {
        icone: Laptop,
        nome: 'i-GovTI',
        titulo: 'Governança TI',
        descricao: 'Sistemas de informação, segurança e governo eletrônico',
        cor: 'from-indigo-500 to-blue-600'
    },
]

const faixas = [
    { faixa: 'A', label: 'Altamente Efetiva', cor: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-white' },
    { faixa: 'B+', label: 'Muito Efetiva', cor: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white' },
    { faixa: 'B', label: 'Efetiva', cor: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-white' },
    { faixa: 'C+', label: 'Em Adequação', cor: 'bg-gradient-to-r from-orange-400 to-orange-500', text: 'text-white' },
    { faixa: 'C', label: 'Baixo Nível', cor: 'bg-gradient-to-r from-red-400 to-red-500', text: 'text-white' },
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
                        <p className="text-white/80 text-sm">Índice de Efetividade da Gestão Municipal</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Descrição */}
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed">
                        O <strong className="text-betim-blue">IEGM</strong> é uma ferramenta desenvolvida pelos Tribunais de Contas brasileiros,
                        sob coordenação do <strong>Instituto Rui Barbosa (IRB)</strong>, para avaliar a qualidade
                        dos serviços públicos oferecidos pelos municípios em <strong>7 dimensões</strong>.
                    </p>
                </div>

                {/* Dimensões */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-betim-blue rounded-full"></span>
                        Dimensões Avaliadas
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
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${dim.cor} flex items-center justify-center mb-3 shadow-sm`}>
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">{dim.nome}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dim.descricao}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Faixas de Classificação */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-betim-blue rounded-full"></span>
                        Faixas de Classificação
                    </h3>

                    <div className="flex flex-wrap gap-3">
                        {faixas.map((f) => (
                            <div
                                key={f.faixa}
                                className={`${f.cor} ${f.text} px-4 py-2 rounded-xl font-medium text-sm shadow-md flex items-center gap-2`}
                            >
                                <span className="font-bold text-lg">{f.faixa}</span>
                                <span className="opacity-90">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Link */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                        Fonte: Instituto Rui Barbosa (IRB)
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
