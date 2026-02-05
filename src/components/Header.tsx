import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun } from 'lucide-react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Barra de Acessibilidade */}
            <div className="py-2 px-4 bg-betim-blue dark:bg-black text-white text-sm">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex gap-4">
                        <button className="hover:underline flex gap-1 items-center"><Sun size={14} /> Alto Contraste</button>
                        <button className="hover:underline">A+</button>
                        <button className="hover:underline">A-</button>
                    </div>
                    <a href="https://betim.mg.gov.br" target="_blank" rel="noopener noreferrer" className="hover:underline">Portal de Betim</a>
                </div>
            </div>

            {/* Header Principal */}
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">

                    {/* Logo Area */}
                    <div className="flex items-center gap-4">
                        {/* Logo da Prefeitura */}
                        <img
                            src="/logo-header.png"
                            alt="Prefeitura de Betim"
                            className="h-12 w-auto"
                        />

                        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Dashboard</span>
                            <span className="font-bold text-lg text-gray-700 dark:text-gray-200 leading-none">IEGM</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex gap-6 font-medium">
                        <Link to="/" className="text-gray-700 hover:text-betim-blue transition-colors">Início</Link>
                        <a href="https://iegm.irbcontas.org.br" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-betim-blue transition-colors">Portal IEGM</a>
                        <Link to="/sobre" className="text-gray-700 hover:text-betim-blue transition-colors">Sobre</Link>
                    </nav>

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-gray-700">
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <nav className="lg:hidden border-t p-4 flex flex-col gap-2 bg-white">
                        <Link to="/" className="p-2 hover:bg-gray-100 rounded text-gray-700">Início</Link>
                        <a href="https://iegm.irbcontas.org.br" target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 rounded text-gray-700">Portal IEGM</a>
                    </nav>
                )}
            </header>
        </>
    );
}
