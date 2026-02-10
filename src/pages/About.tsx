
import { BookOpen, HeartPulse, Coins, TreePine, Building2, ClipboardList, Laptop, Info, Target, Award, ExternalLink } from 'lucide-react'

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
        <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans selection:bg-betim-blue selection:text-white">
            <div className="max-w-[1400px] mx-auto px-6 pt-12 md:pt-20">

                {/* 1. Minimal Header */}
                <header className="mb-20 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
                        <Info size={12} />
                        <span>Sobre o Projeto</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                        Mensurando a <span className="text-betim-blue relative inline-block">
                            Efetividade
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                        </span> da Gestão Pública.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed max-w-2xl">
                        O IEGM é a bússola que orienta os gestores rumo à excelência, avaliando não apenas a legalidade, mas a qualidade e o impacto das políticas públicas.
                    </p>
                </header>

                {/* 2. Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">

                    {/* Card Principal: Objetivo */}
                    <div className="md:col-span-2 lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group shadow-2xl shadow-slate-200">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-betim-blue/30 to-purple-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                                    <Target className="text-sky-400" size={32} />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Foco em Resultados</h3>
                                <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                                    Superamos a visão burocrática. O objetivo é responder: a ação governamental mudou a vida do cidadão para melhor?
                                </p>
                            </div>
                            <div className="flex gap-4 mt-12">
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/80">Eficiência</div>
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/80">Eficácia</div>
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/80">Efetividade</div>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card: Dimensões */}
                    <div className="md:col-span-1 lg:col-span-1 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center justify-center text-center group hover:border-blue-100 transition-colors">
                        <div className="w-20 h-20 bg-blue-50 text-betim-blue rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-[url('/grid.svg')]">
                            <BookOpen size={32} />
                        </div>
                        <span className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">7</span>
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Áreas Temáticas</span>
                    </div>

                    {/* Stat Card: Municípios (Exemplo) */}
                    <div className="md:col-span-1 lg:col-span-1 bg-betim-blue rounded-[2.5rem] p-10 shadow-xl shadow-blue-200 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <Award className="text-white/80 mb-6" size={40} />
                            <h3 className="text-white font-bold text-2xl leading-tight">Classificação por Faixas</h3>
                        </div>
                        <div className="relative z-10 mt-4">
                            <div className="flex -space-x-2">
                                {['A', 'B', 'C'].map((l, i) => (
                                    <div key={l} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white font-bold text-xs" style={{ zIndex: 3 - i }}>
                                        {l}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Wide Card: Metodologia */}
                    <div className="md:col-span-3 lg:col-span-4 bg-slate-50 rounded-[2.5rem] p-10 md:p-14 border border-slate-100">
                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            <div className="md:w-1/3">
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Metodologia de Pontuação</h3>
                                <p className="text-slate-500 mb-8">
                                    O cálculo é rigoroso e transparente, dividindo-se em duas etapas fundamentais.
                                </p>
                                <a
                                    href="https://iegm.irbcontas.org.br"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-betim-blue font-bold hover:gap-3 transition-all"
                                >
                                    Ler manual completo <ExternalLink size={16} />
                                </a>
                            </div>
                            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Etapa 01</span>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Pontuação Absoluta</h4>
                                    <p className="text-slate-600 text-sm">Cada questão tem um valor fixo em pontos (ex: 2, 5, 10). Não há subjetividade.</p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Etapa 02</span>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Conversão Percentual</h4>
                                    <p className="text-slate-600 text-sm">A soma bruta é convertida em 0-100% para definir a faixa final (A, B, C...).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Section Title */}
                <div className="flex items-end justify-between mb-12 border-b border-slate-100 pb-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Dimensões Avaliadas</h2>
                    <span className="hidden md:block text-slate-400 font-mono text-sm">INDEX: 01-07</span>
                </div>

                {/* 4. Grid de Dimensões (Clean Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {dimensoes.map((dim, idx) => {
                        const Icon = dim.icone
                        return (
                            <div key={dim.nome} className="group bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-300 hover:shadow-xl transition-all duration-300 relative">
                                <div className="absolute top-8 right-8 text-slate-200 font-black text-4xl opacity-50 group-hover:opacity-20 transition-opacity">
                                    0{idx + 1}
                                </div>
                                <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-betim-blue group-hover:text-white transition-colors duration-300`}>
                                    <Icon size={28} />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        {dim.nome}
                                    </span>
                                    <span className="text-[10px] font-bold text-betim-blue bg-blue-50 px-2 py-1 rounded-full">
                                        Peso {dim.peso}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{dim.titulo}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {dim.descricao}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* 5. Faixas Table (Minimalist) */}
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Classificação de Resultados</h2>
                    <p className="text-slate-400 mb-12 max-w-2xl mx-auto">Entenda o que cada faixa representa no contexto da gestão municipal eficiente.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {faixas.map((f) => (
                            <div key={f.faixa} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-default">
                                <div className={`w-12 h-12 rounded-xl ${f.cor} flex items-center justify-center text-xl font-black mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                                    {f.faixa}
                                </div>
                                <h4 className="font-bold text-white mb-2">{f.label}</h4>
                                <p className="text-xs text-slate-400 font-mono">{f.criterio}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="mt-24 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm">
                    <p>© 2024 Compliance IEGM</p>
                    <p className="flex items-center gap-2">
                        Dados oficiais <span className="font-bold text-slate-600">TCEMG</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
