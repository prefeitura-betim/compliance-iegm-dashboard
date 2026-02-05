/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design System Oficial
        betim: {
          blue: {
            DEFAULT: '#0072e7',  // Cor principal (Botões, Links)
            dark: '#023568',     // Azul escuro (Header, Footer detalhes)
            light: '#04a2e1',    // Azul claro (Hover)
          },
          green: {
            DEFAULT: '#00bd39',  // Sucesso, ícones
            dark: '#146c35',
            teal: '#0ebea0',
          },
          red: {
            DEFAULT: '#c52121', // Erro, Alertas
            dark: '#8b0930',
          },
          orange: '#f37b11',     // Destaques secundários
          yellow: '#ebb40a',     // Faixa B - Efetiva
          gray: {
            DEFAULT: '#495156',  // Textos, Cards
            light: '#F5F7F8',    // Fundos de página
            50: '#F5F7F8',
            100: '#e5e7eb',
            200: '#d1d5db',
            300: '#9ca3af',
            400: '#6b7280',
            500: '#495156',
            600: '#374151',
            700: '#1f2937',
            800: '#111827',
            900: '#0a0a0a',
          },
        },
      },
      fontFamily: {
        sans: ["Karla", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        karla: ["Karla", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      borderRadius: {
        'betim': '100px',
        'betim-sm': '3px',
        'betim-md': '5px',
        'betim-lg': '8px',
      },
      boxShadow: {
        'betim': '0 2px 3px rgba(0, 0, 0, 0.2)',
        'betim-md': '0 4px 6px rgba(0, 0, 0, 0.15)',
        'betim-lg': '0 8px 12px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
