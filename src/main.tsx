import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import App from './App'
import './assets/main.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            refetchOnWindowFocus: false,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AccessibilityProvider>
                    <App />
                </AccessibilityProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
)

