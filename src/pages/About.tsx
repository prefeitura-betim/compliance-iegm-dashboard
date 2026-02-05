
import { BookOpen, HeartPulse, Coins, TreePine, Building2, ClipboardList, Laptop, Info, Target, FileText, CheckCircle2, TrendingUp, Award } from 'lucide-react'

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
    { faixa: 'C+', label: 'Em Fase de Adequação', cor: 'bg-gradient-to-r from-orange-400 to-orange-500', text: 'text-white' },
    { faixa: 'C', label: 'Baixo Nível de Adequação', cor: 'bg-gradient-to-r from-red-400 to-red-500', text: 'text-white' },
]

export default function About() {
    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-10">

            {/* Hero Section - Mais Impactante */}
            <div className="bg-gradient-to-br from-betim-blue via-indigo-600 to-indigo-800 rounded-3xl shadow-2xl overflow-hidden relative text-white">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="p-8 md:p-16 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full text-sm font-bold uppercase tracking-wider">
                                <Info size={14} />
                                <span>Conhecimento & Transparência</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl">
                                Índice de Efetividade da <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-200">Gestão Municipal</span>
                            </h1>

                            <p className="text-xl text-blue-50 leading-relaxed font-light max-w-2xl">
                                Uma visão detalhada sobre como o IEGM avalia, classifica e impulsiona a qualidade dos serviços públicos em todo o Brasil.
                            </p>
                        </div>

                        {/* Card Destacado Lateral - Estilo Glassmorphism (Classic) */}
                        <div className="w-full lg:w-96 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl relative overflow-hidden group transition-all hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] duration-300">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl group-hover:bg-sky-500/30 transition-all"></div>

                            <h3 className="font-bold text-white text-xl mb-4 flex items-center gap-2 relative z-10">
                                <Target className="text-sky-300" />
                                Objetivo Central
                            </h3>
                            <p className="text-white/90 leading-relaxed relative z-10 mb-6 font-medium">
                                O foco está no <strong>resultado prático</strong> para o cidadão (efetividade), superando a análise puramente burocrática da legalidade das contas.
                            </p>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/10 hover:bg-white/10 transition-colors">
                                    <TrendingUp className="mx-auto text-sky-300 mb-1" size={24} />
                                    <span className="text-xs font-bold text-white uppercase tracking-wide">Eficiência</span>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/10 hover:bg-white/10 transition-colors">
                                    <CheckCircle2 className="mx-auto text-emerald-300 mb-1" size={24} />
                                    <span className="text-xs font-bold text-white uppercase tracking-wide">Qualidade</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Detalhes - Cards Flutuantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-20 px-4 md:px-12 relative z-20">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:-translate-y-1 transition-transform group">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                        <Target size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Finalidade</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Subsidiar fiscalizações dos Tribunais de Contas, orientar gestores e fornecer informações aos cidadãos, visando melhorias na qualidade dos serviços.
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:-translate-y-1 transition-transform group">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                        <ClipboardList size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Funcionamento</h3>
                    <p className="text-gray-600 leading-relaxed">
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
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        {dim.nome}
                                    </span>
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

        </div>
    )
}
