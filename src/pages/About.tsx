
import { BookOpen, HeartPulse, Coins, TreePine, ShieldAlert, ClipboardList, Laptop, Target, Award, ExternalLink } from 'lucide-react'

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
        icone: ShieldAlert,
        nome: 'i-Cidade',
        titulo: 'Defesa Civil',
        descricao: 'Prevenção de desastres, plano de contingência e recursos de defesa civil',
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
        <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-betim-blue selection:text-white relative overflow-x-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 pt-12 md:pt-20 relative z-10">

                {/* 1. Impact Header */}
                <header className="mb-20 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full text-xs font-bold uppercase tracking-widest text-betim-blue mb-8 shadow-sm">
                        <Award size={14} />
                        <span>Excelência em Gestão</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-tight">
                        Índice de Efetividade da <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-betim-blue to-indigo-600 relative">
                            Gestão Municipal (IEGM)
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed max-w-4xl mx-auto">
                        Ferramenta do Tribunal de Contas (TCESP/TCEMG) para medir a qualidade e eficiência das administrações, promovendo fiscalização, transparência e melhoria contínua.
                    </p>
                </header>

                {/* 2. Bento Grid Layout - VIBRANT */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-24">

                    {/* Card Principal: Objetivo (Azul Betim Vibrante) */}
                    <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-betim-blue to-blue-700 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group shadow-xl shadow-blue-200 text-white">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-inner">
                                    <Target className="text-white" size={32} />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-6">Principais Características</h3>
                                <p className="text-blue-50 text-lg leading-relaxed max-w-md font-medium">
                                    O índice reflete o esforço da administração em transformar recursos públicos em serviços de qualidade para o cidadão.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card: Dimensões (Clean White with Color Accents) */}
                    <div className="md:col-span-1 lg:col-span-1 bg-white rounded-[2.5rem] p-10 border border-blue-50 shadow-xl shadow-slate-100 flex flex-col items-center justify-center text-center group relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-50/50 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-blue-100 text-betim-blue rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform bg-[url('/grid.svg')]">
                                <BookOpen size={32} />
                            </div>
                            <span className="text-7xl font-black text-slate-900 mb-2 tracking-tighter block group-hover:text-betim-blue transition-colors">7</span>
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Setores Avaliados</span>
                        </div>
                    </div>

                    {/* Stat Card: Classificação (Dark Blue) */}
                    <div className="md:col-span-1 lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-300 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-betim-blue/20 to-transparent opacity-50"></div>
                        <div className="relative z-10">
                            <Award className="text-yellow-400 mb-4 drop-shadow-lg" size={32} />
                            <h3 className="text-white font-bold text-lg leading-tight mb-1">Faixas de Resultado</h3>
                        </div>
                        <div className="relative z-10 mt-4 space-y-2">
                            {faixas.map((f) => (
                                <div key={f.faixa} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg ${f.cor} flex items-center justify-center text-xs font-black text-white shadow shrink-0`}>
                                        {f.faixa}
                                    </div>
                                    <span className="text-slate-300 text-xs font-medium truncate">{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Wide Card: Finalidade e Obrigatoriedade (Glassy White) */}
                    <div className="md:col-span-3 lg:col-span-4 bg-white rounded-[2.5rem] p-10 md:p-14 border border-blue-50 shadow-lg shadow-blue-50 relative overflow-hidden">
                        {/* REMOVED LEFT BORDER as requested: <div className="absolute top-0 left-0 w-2 h-full bg-betim-blue"></div> */}
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="md:w-1/3 relative z-10">
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Finalidade e Obrigatoriedade</h3>
                                <p className="text-slate-500 mb-8 text-lg">
                                    Funciona como um indicador de desempenho para fiscalização e correção de falhas na gestão.
                                </p>
                                <a
                                    href="https://www.iegm.irbcontas.org.br/manual/I%CC%81NDICE%20DE%20EFETIVIDADE%20DA%20GESTA%CC%83O%20MUNICIPAL%20-%20IEGM%202025%20-%20ANO%20BASE%202024.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-white bg-betim-blue hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
                                >
                                    Ver Manual Técnico <ExternalLink size={18} />
                                </a>
                            </div>
                            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full relative z-10">
                                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-betim-blue font-bold shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">1</div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Fiscalização</h4>
                                    <p className="text-slate-600 text-sm">Ajuda tribunais de contas a fiscalizar e prefeitos a corrigir falhas e melhorar a gestão.</p>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-betim-blue font-bold shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">2</div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Obrigatoriedade</h4>
                                    <p className="text-slate-600 text-sm">O preenchimento é obrigatório e a omissão pode gerar sanções ao gestor municipal (TCEMG).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Section Title */}
                <div className="text-center mb-16">
                    <span className="text-betim-blue font-bold tracking-widest uppercase text-sm mb-2 block">Abrangência</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">7 Dimensões da Gestão</h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-betim-blue to-indigo-500 mx-auto rounded-full"></div>
                </div>

                {/* 4. Grid de Dimensões (Vibrant Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {dimensoes.map((dim) => {
                        const Icon = dim.icone
                        return (
                            <div key={dim.nome} className="group bg-white rounded-[2rem] p-8 border border-slate-100 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${dim.cor} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-opacity group-hover:opacity-20`}></div>

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dim.cor} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                        <Icon size={28} />
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                                            {dim.nome}
                                        </span>
                                        <span className="h-px bg-slate-200 flex-1"></span>
                                        <span className={`text-[10px] font-bold text-white bg-gradient-to-r ${dim.cor} px-2 py-0.5 rounded-full`}>
                                            {dim.peso}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{dim.titulo}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                        {dim.descricao}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* 5. Faixas Table (Highlight) */}
                <div className="bg-slate-900 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-betim-blue/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Níveis de Classificação</h2>
                        <p className="text-slate-400 mb-16 max-w-2xl mx-auto text-lg">Entenda o padrão de excelência exigido pelo Tribunal de Contas.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {faixas.map((f) => (
                                <div key={f.faixa} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 group cursor-default backdrop-blur-sm min-h-[220px] flex flex-col justify-center">
                                    <div className={`w-14 h-14 rounded-2xl ${f.cor} flex items-center justify-center text-xl font-black mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform bg-opacity-90`}>
                                        {f.faixa}
                                    </div>
                                    <h4 className="font-bold text-white mb-3 text-lg leading-tight">{f.label}</h4>
                                    <div className="w-8 h-1 bg-white/20 mx-auto rounded-full mb-3"></div>
                                    <p className="text-xs text-slate-300 font-mono tracking-wide">{f.criterio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 6. Como Interpretar o Diagnóstico */}
                <div className="mt-24 mb-24">
                    <div className="text-center mb-16">
                        <span className="text-betim-blue font-bold tracking-widest uppercase text-sm mb-2 block">Metodologia</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Como Interpretar o Diagnóstico</h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-betim-blue to-indigo-500 mx-auto rounded-full"></div>
                        <p className="text-slate-500 mt-6 max-w-3xl mx-auto text-lg">
                            Cada dimensão do IEGM é composta por questões respondidas pelo município. As respostas são classificadas em três categorias conforme a metodologia do Tribunal de Contas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Conformidade */}
                        <div className="bg-white rounded-[2rem] p-8 border border-green-100 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-10 rounded-bl-full -mr-8 -mt-8 group-hover:opacity-20 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white mb-6 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Conformidade</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Questões onde o município <strong className="text-green-700">obteve pontuação positiva</strong>. Representam práticas, ações e políticas que estão sendo executadas adequadamente.
                                </p>
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                    <p className="text-xs text-green-700 font-medium">
                                        <strong>Critério:</strong> pontuação &gt; 0 — o município atendeu ao quesito avaliado e recebeu pontos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pontos de Atenção */}
                        <div className="bg-white rounded-[2rem] p-8 border border-red-100 hover:shadow-xl hover:shadow-red-100/50 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-rose-500 opacity-10 rounded-bl-full -mr-8 -mt-8 group-hover:opacity-20 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white mb-6 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Pontos de Atenção</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Questões onde o município recebeu <strong className="text-red-700">nota negativa (penalidade)</strong>. Indicam não-conformidades que impactam diretamente na nota da dimensão.
                                </p>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                    <p className="text-xs text-red-700 font-medium">
                                        <strong>Critério:</strong> nota &lt; 0 — penalidade aplicada pelo descumprimento de requisitos obrigatórios.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Informativo */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-300 to-gray-400 opacity-10 rounded-bl-full -mr-8 -mt-8 group-hover:opacity-20 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white mb-6 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Informativo</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Quesitos de caráter <strong className="text-slate-700">exclusivamente informativo</strong>. Não recebem pontuação, mas alimentam o banco de dados para pesquisas e ações de controle externo.
                                </p>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <p className="text-xs text-slate-600 font-medium">
                                        <strong>Critério:</strong> pontuação = 0 — dados contextuais como valores orçamentários, estrutura organizacional, etc.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
                    <p>© 2024 Compliance IEGM - Prefeitura de Betim</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-betim-blue transition-colors">Termos de Uso</a>
                        <a href="#" className="hover:text-betim-blue transition-colors">Política de Privacidade</a>
                        <span className="flex items-center gap-2">
                            Fonte: <span className="font-bold text-slate-700">TCEMG</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
