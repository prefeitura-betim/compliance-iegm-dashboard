#!/bin/bash

# Script de configuração do Dashboard IEGM
# Compatível com Windows (WSL), Linux e macOS

set -e

# Cores para saída
VERMELHO='\033[0;31m'
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
SEM_COR='\033[0m'

log_info() { echo -e "${AZUL}ℹ️  $1${SEM_COR}"; }
log_sucesso() { echo -e "${VERDE}✅ $1${SEM_COR}"; }
log_aviso() { echo -e "${AMARELO}⚠️  $1${SEM_COR}"; }
log_erro() { echo -e "${VERMELHO}❌ $1${SEM_COR}"; }

comando_existe() { command -v "$1" >/dev/null 2>&1; }

detectar_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux";;
        Darwin*)    echo "macos";;
        CYGWIN*|MINGW*|MSYS*) echo "windows";;
        *)          echo "desconhecido";;
    esac
}

configurar_banco() {
    log_info "Configurando banco de dados..."

    if [ ! -f "local.db" ]; then
        log_info "Criando banco de dados..."
        if comando_existe yarn; then
            yarn db:generate
            yarn db:migrate
            yarn data:seed
            yarn data:migrate
        else
            npm run db:generate
            npm run db:migrate
            npm run data:seed
            npm run data:migrate
        fi
        log_sucesso "Banco de dados configurado com sucesso."
    else
        log_aviso "Banco de dados já existe, pulando configuração."
    fi
}

checar_dependencias() {
    log_info "Verificando dependências..."

    if ! comando_existe node; then
        log_erro "Node.js não está instalado."
        exit 1
    fi

    if ! comando_existe yarn && ! comando_existe npm; then
        log_erro "Yarn ou npm não encontrados. Instale um deles."
        exit 1
    fi

    if ! comando_existe wrangler; then
        log_aviso "Wrangler CLI não encontrado (opcional para D1)."
        log_info "Instale com: npm install -g wrangler"
    fi

    log_sucesso "Dependências verificadas."
}

configurar_ambiente() {
    log_info "Configurando ambiente..."

    SO=$(detectar_os)
    log_info "Sistema operacional detectado: $SO"

    if [ "$SO" != "windows" ]; then
        log_info "Ajustando permissões dos scripts..."
        chmod +x scripts/*.ts scripts/*.sh 2>/dev/null || true
    fi

    if [ ! -f ".env.example" ]; then
        log_info "Criando .env.example..."
        cat > .env.example << EOF
# Configuração do Dashboard IEGM
# Repositório: https://github.com/fundacaobeta/dashboard-iegm
NODE_ENV=development
DATABASE_URL=file:./local.db
API_BASE_URL=http://localhost:3001/api
DEFAULT_MUNICIPIO=BETIM
DEFAULT_ANO=2023
DEFAULT_TRIBUNAL=TCEMG
EOF
        log_sucesso ".env.example criado."
    fi

    log_sucesso "Ambiente configurado."
}

main() {
    echo "🚀 Dashboard IEGM - Script de Setup"
    echo "==================================="

    checar_dependencias
    configurar_ambiente
    configurar_banco

    echo ""
    echo "🎉 Setup finalizado com sucesso!"
    echo ""
    echo "📚 Próximos passos:"
    echo "   yarn dev              # Iniciar desenvolvimento"
    echo "   yarn cf:dev:d1        # Iniciar com D1"
    echo "   yarn test:unit        # Rodar testes"
    echo ""
    echo "📖 Consulte o README.md ou https://github.com/fundacaobeta/dashboard-iegm para mais informações"
}

main "$@"