import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout principal da aplicação seguindo o Design System Betim
 * Estrutura: Header + Main Content + Footer
 */
export default function Layout() {
    return (
        <div className="font-sans antialiased min-h-screen flex flex-col bg-betim-gray-light dark:bg-black text-betim-gray">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Renderiza o conteúdo da rota atual */}
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
