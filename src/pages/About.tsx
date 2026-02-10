
import { BookOpen, HeartPulse, Coins, TreePine, Building2, ClipboardList, Laptop, Info, Target, FileText, CheckCircle2, TrendingUp, Award, ExternalLink } from 'lucide-react'

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
    { faixa: 'C+', label: 'Em Fase de Adequação', criterio: '50,00% a 59,99%', cor: 'bg-gradient-to-r from-orange-400 to-orange-500', text: 'text-white' },
    { faixa: 'C', label: 'Baixo Nível de Adequação', criterio: '< 49,99%', cor: 'bg-gradient-to-r from-red-400 to-red-500', text: 'text-white' },
]

export default function About() {
    return (
        <div className="min-h-screen bg-slate-50 space-y-12 animate-fade-in pb-20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 pt-8">

                {/* Hero Section - Mais Impactante */}
                {/* Hero Section - Mais Impactante */}
                <div className="bg-gradient-to-br from-betim-blue via-indigo-600 to-indigo-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative text-white mb-20 group">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/10 transition-colors duration-700" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 animate-pulse-slow" />

                    <div className="p-8 md:p-16 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                                    <Info size={14} />
                                    <span>Conhecimento & Transparência</span>
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight max-w-4xl drop-shadow-sm">
                                    Índice de Efetividade da <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-200">Gestão Municipal</span>
                                </h1>

                                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light max-w-2xl border-l-4 border-sky-400 pl-6">
                                    Uma visão detalhada sobre como o IEGM avalia, classifica e impulsiona a qualidade dos serviços públicos em todo o Brasil.
                                </p>
                            </div>

                            {/* Card Destacado Lateral - Estilo Glassmorphism (Classic) */}
                            <div className="w-full lg:w-[28rem] bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl relative overflow-hidden group/card transition-all hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] duration-500 hover:shadow-sky-900/20">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/30 rounded-full blur-3xl group-hover/card:bg-sky-400/40 transition-all duration-500"></div>

                                <h3 className="font-bold text-white text-2xl mb-6 flex items-center gap-3 relative z-10">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <Target className="text-sky-300" size={28} />
                                    </div>
                                    Objetivo Central
                                </h3>
                                <p className="text-white/90 text-lg leading-relaxed relative z-10 mb-8 font-medium">
                                    O foco está no <strong>resultado prático</strong> para o cidadão (efetividade), superando a análise puramente burocrática da legalidade das contas.
                                </p>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-default">
                                        <TrendingUp className="mx-auto text-sky-300 mb-2 drop-shadow" size={28} />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Eficiência</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-default">
                                        <CheckCircle2 className="mx-auto text-emerald-300 mb-2 drop-shadow" size={28} />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Qualidade</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de Detalhes - Cards Flutuantes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-24 px-4 relative z-20 mb-16">
                    <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] opacity-50 group-hover:bg-purple-100 transition-colors"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
                            <Target size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Finalidade</h3>
                        <p className="text-gray-600 leading-relaxed text-lg relative z-10">
                            Subsidiar fiscalizações dos Tribunais de Contas, orientar gestores e fornecer informações aos cidadãos, visando melhorias na qualidade dos serviços.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] opacity-50 group-hover:bg-amber-100 transition-colors"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 relative z-10">
                            <ClipboardList size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Funcionamento</h3>
                        <p className="text-gray-600 leading-relaxed text-lg relative z-10">
                            Municípios preenchem questionários obrigatórios baseados em dados do exercício anterior. O não cumprimento pode gerar sanções e multas ao gestor.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
                    <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-8 shadow-betim border border-blue-100/50 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-14 h-14 bg-blue-100 text-betim-blue rounded-full flex items-center justify-center shrink-0">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Importância Estratégica</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Atua como instrumento de transparência pública e serve de base para o cálculo de repasses estaduais (como o ICMS) em alguns estados, incentivando a melhoria contínua.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl p-8 shadow-betim border border-green-100/50 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                            <Award size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Classificação por Resultados</h3>
                            <p className="text-gray-600 leading-relaxed">
                                O índice classifica as prefeituras em 5 faixas de desempenho, permitindo comparações justas entre municípios e destacando boas práticas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Como funciona - Método */}
                <div className="bg-white rounded-3xl shadow-betim border border-gray-100 overflow-hidden p-8 md:p-12 mb-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-betim-blue rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            <Award size={14} />
                            Metodologia
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">
                            Como funciona a Pontuação?
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Entenda a lógica de cálculo, desde a pontuação por questão até o peso de cada dimensão.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                            <h4 className="font-bold text-betim-blue text-xl mb-3 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">01</span>
                                Por Questão
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                                Cada questão recebe <strong>pontos absolutos</strong> (não percentuais). A pontuação máxima (Pmáx) varia conforme a complexidade da pergunta (ex: 2, 5, 10 pts).
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                            <h4 className="font-bold text-betim-blue text-xl mb-3 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">02</span>
                                Por Indicador
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                                A soma dos pontos obtidos gera a nota bruta, que é convertida em percentual (0-100%) para definir a classificação na faixa correspondente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Faixas de Classificação - Agora Lado a Lado (Grid) */}
                <div className="bg-white rounded-3xl shadow-betim border border-gray-100 overflow-hidden p-8 md:p-12">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            <Award size={14} />
                            Sistema de Notas
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">
                            Faixas de Classificação
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Entenda o que cada nota representa no resultado final da avaliação de efetividade.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {faixas.map((f) => (
                            <div
                                key={f.faixa}
                                className="group relative flex flex-col items-center p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                            >
                                {/* Background decoration on hover */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl ${f.cor.replace('text-white', '')}`}></div>

                                <div className={`${f.cor} w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                                    {f.faixa}
                                </div>

                                <h4 className="font-bold text-gray-900 text-center mb-2">{f.label}</h4>
                                <p className="text-xs text-gray-400 text-center mb-3 font-mono">{f.criterio}</p>
                                <div className={`h-1 w-8 rounded-full ${f.cor.replace('text-white', '').replace('bg-gradient-to-r', 'bg')}`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dimensões */}
                <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200/50">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <span className="p-2 bg-betim-blue rounded-lg text-white">
                                    <BookOpen size={20} />
                                </span>
                                7 Dimensões Avaliadas
                            </h2>
                            <p className="text-gray-500">
                                Índices setoriais que compõem a nota final
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dimensoes.map((dim) => {
                            const Icon = dim.icone
                            return (
                                <div
                                    key={dim.nome}
                                    className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dim.cor} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                            <Icon size={24} className="text-white" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                {dim.nome}
                                            </span>
                                            <span className="text-[10px] font-black text-betim-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100" title="Peso na Nota Geral">
                                                {dim.peso}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-betim-blue transition-colors">
                                        {dim.titulo}
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {dim.descricao}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-12 mt-12 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-px bg-gray-300"></span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Fonte Oficial
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="https://tce.mg.gov.br/" target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-betim-blue transition-colors hover:underline">
                            TCEMG
                        </a>
                        <span className="text-gray-300">|</span>
                        <a
                            href="https://iegm.irbcontas.org.br"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-white bg-betim-blue hover:bg-betim-blue-dark px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Portal IEGM
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>

            </div> {/* Container End */}
        </div>
    )
}
