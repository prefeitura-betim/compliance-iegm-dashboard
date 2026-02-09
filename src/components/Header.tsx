import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { highContrast, toggleHighContrast, fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

    return (
        <>
            {/* Barra de Acessibilidade */}
            <div className={`py-2 px-4 text-white text-sm transition-colors ${highContrast ? 'bg-black' : 'bg-betim-blue'}`}>
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex gap-2 sm:gap-4 items-center">
                        <button
                            onClick={toggleHighContrast}
                            className={`hover:underline flex gap-1 items-center px-2 py-1 rounded transition-colors ${highContrast ? 'bg-yellow-400 text-black font-bold' : ''}`}
                            title={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
                        >
                            {highContrast ? <Moon size={14} /> : <Sun size={14} />}
                            <span className="hidden sm:inline">Alto Contraste</span>
                            <span className="sm:hidden">Contraste</span>
                        </button>
                        <div className="flex items-center gap-1 border-l border-white/30 pl-2 sm:pl-4">
                            <button
                                onClick={increaseFontSize}
                                className="hover:bg-white/20 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                title="Aumentar fonte"
                                disabled={fontSize >= 22}
                            >
                                <ZoomIn size={14} />
                                <span className="font-bold">A+</span>
                            </button>
                            <button
                                onClick={decreaseFontSize}
                                className="hover:bg-white/20 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                title="Diminuir fonte"
                                disabled={fontSize <= 14}
                            >
                                <ZoomOut size={14} />
                                <span className="font-bold">A-</span>
                            </button>
                            <button
                                onClick={resetFontSize}
                                className="hover:bg-white/20 px-1.5 py-1 rounded transition-colors hidden sm:flex items-center gap-1"
                                title="Restaurar tamanho padrão"
                            >
                                <RotateCcw size={12} />
                            </button>
                            <span className="text-xs opacity-70 hidden md:inline ml-1">{fontSize}px</span>
                        </div>
                    </div>
                    <a href="https://betim.mg.gov.br" target="_blank" rel="noopener noreferrer" className="hover:underline text-xs sm:text-sm">Portal de Betim</a>
                </div>
            </div>

            {/* Header Principal */}
            <header className={`shadow-sm border-b transition-colors ${highContrast ? 'bg-black text-white border-white' : 'bg-white dark:bg-gray-900 dark:border-gray-800'}`}>
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">

                    {/* Logo Area */}
                    <div className="flex items-center gap-4">
                        {/* Logo da Prefeitura */}
                        <img
                            src="/logo-header.png"
                            alt="Prefeitura de Betim"
                            className={`h-12 w-auto ${highContrast ? 'brightness-0 invert' : ''}`}
                        />

                        <div className={`hidden sm:block w-px h-8 ${highContrast ? 'bg-white' : 'bg-gray-300'}`}></div>

                        <div className="flex flex-col">
                            <span className={`font-semibold text-sm uppercase tracking-wider ${highContrast ? 'text-yellow-400' : 'text-gray-500'}`}>Dashboard</span>
                            <span className={`font-bold text-lg leading-none ${highContrast ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>IEGM</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex gap-6 font-medium">
                        <Link to="/" className={`transition-colors ${highContrast ? 'text-yellow-400 hover:text-white' : 'text-gray-700 hover:text-betim-blue'}`}>Início</Link>
                        <a href="https://iegm.irbcontas.org.br" target="_blank" rel="noreferrer" className={`transition-colors ${highContrast ? 'text-yellow-400 hover:text-white' : 'text-gray-700 hover:text-betim-blue'}`}>Portal IEGM</a>
                        <Link to="/sobre" className={`transition-colors ${highContrast ? 'text-yellow-400 hover:text-white' : 'text-gray-700 hover:text-betim-blue'}`}>Sobre</Link>
                    </nav>

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`lg:hidden ${highContrast ? 'text-white' : 'text-gray-700'}`}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <nav className={`lg:hidden border-t p-4 flex flex-col gap-2 ${highContrast ? 'bg-black border-white' : 'bg-white'}`}>
                        <Link to="/" className={`p-2 rounded ${highContrast ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>Início</Link>
                        <a href="https://iegm.irbcontas.org.br" target="_blank" rel="noreferrer" className={`p-2 rounded ${highContrast ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>Portal IEGM</a>
                        <Link to="/sobre" className={`p-2 rounded ${highContrast ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>Sobre</Link>
                    </nav>
                )}
            </header>
        </>
    );
}
