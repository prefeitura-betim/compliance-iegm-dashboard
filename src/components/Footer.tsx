import { Phone, MapPin, Clock, Home, Eye, FileText, Mic, LayoutDashboard } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-[#073091] to-[#0439d9] dark:from-gray-900 dark:to-black text-white mt-auto pt-12">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    {/* Logo, Título e Descrição */}
                    <div className="lg:col-span-1">
                        <div className="mb-4">
                            <img
                                src="/logo/logo-footer.png"
                                alt="Prefeitura de Betim"
                                className="h-12 w-auto mb-3"
                            />
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
                                <LayoutDashboard className="w-5 h-5" />
                                Dashboard IEGM
                            </h3>
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed mb-4">
                            Sistema de visualização e monitoramento do Índice de Efetividade da Gestão Municipal (IEGM) para a Prefeitura de Betim.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                LGPD
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                Seguro
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                24/7
                            </span>
                        </div>
                    </div>

                    {/* Contato */}
                    <div className="lg:col-span-1">
                        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contato
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="text-sm">
                                    <strong className="text-white block mb-0.5">Central de Atendimento</strong>
                                    <a href="tel:08002563236" className="text-white/90 hover:text-white transition-colors">
                                        0800 256 3236
                                    </a>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="text-sm">
                                    <strong className="text-white block mb-0.5">Horário de Atendimento</strong>
                                    <span className="text-white/90">Segunda-feira a sexta-feira das 9h às 17h</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="text-sm">
                                    <strong className="text-white block mb-0.5">Endereço</strong>
                                    <span className="text-white/90">Rua Pará de Minas, 640 • Brasileia • Betim-MG - Betim / MG</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Links Úteis e Redes Sociais */}
                    <div className="lg:col-span-1">
                        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                            </svg>
                            Links Úteis
                        </h4>
                        <ul className="text-sm space-y-2 mb-6">
                            <li>
                                <a href="https://betim.mg.gov.br" className="text-white/90 hover:text-white transition-colors flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                                    <Home className="w-3.5 h-3.5" />
                                    <span>Portal da Prefeitura</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://ouvidoria.betim.mg.gov.br" className="text-white/90 hover:text-white transition-colors flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                                    <Mic className="w-3.5 h-3.5" />
                                    <span>Ouvidoria</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://transparencia.betim.mg.gov.br" className="text-white/90 hover:text-white transition-colors flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Transparência</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://oficial.betim.mg.gov.br" className="text-white/90 hover:text-white transition-colors flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Diário Oficial</span>
                                </a>
                            </li>
                        </ul>

                        {/* Redes Sociais */}
                        <div className="mt-6">
                            <h5 className="text-sm font-bold text-white mb-3">Redes Sociais</h5>
                            <div className="flex gap-3 flex-wrap">
                                <a href="https://facebook.com/prefeitura.betim" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a href="https://instagram.com/prefeitura.betim" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a href="https://linkedin.com/company/prefeitura-betim" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href="https://youtube.com/@prefeitura.betim" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="YouTube">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="py-8">
                    <div className="flex flex-col items-center justify-center gap-4 mb-6">
                        {/* Desenvolvido por */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
                            <span className="text-sm text-white/80 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Desenvolvido por
                            </span>
                            <div className="flex items-center gap-2">
                                <img
                                    src="/logo/logo_beta.png"
                                    alt="Fundação Beta"
                                    className="h-5 w-auto"
                                />
                                <span className="text-white/60 text-sm">+</span>
                                <span className="text-sm text-white/90">Secretaria de Tecnologia da Informação</span>
                            </div>
                        </div>

                        <div className="w-full max-w-3xl border-t border-white/10"></div>

                        {/* Apoio */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
                            <span className="text-sm text-white/80 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                Apoio
                            </span>
                            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-sm text-white/90">
                                <span>Secretaria Adjunta de Planejamento</span>
                                <span className="hidden sm:inline text-white/60">•</span>
                                <span>Secretaria Municipal de Gestão e Finanças</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-white/10 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-white/80 text-center md:text-left">
                            © <span>2025 Prefeitura de Betim - Todos os direitos reservados</span>
                        </div>
                        <div className="flex items-center gap-3 text-center">
                            <span className="text-sm text-white/80 flex items-center gap-1"><LayoutDashboard className="w-4 h-4" /> Dashboard IEGM</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
