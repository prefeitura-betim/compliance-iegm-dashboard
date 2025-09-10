#!/bin/bash

# Script de desenvolvimento do Dashboard IEGM

set -e

# Cores
VERDE='\033[0;32m'
AZUL='\033[0;34m'
AMARELO='\033[1;33m'
SEM_COR='\033[0m'

echo -e "${AZUL}🚀 Dashboard IEGM - Desenvolvimento${SEM_COR}"
echo "==================================="

# Verifica se o banco existe
if [ ! -f "local.db" ]; then
    echo -e "${AMARELO}⚠️  Banco de dados não encontrado${SEM_COR}"
    echo -e "${AZUL}💡 Rode 'yarn setup' para configurar o banco de dados${SEM_COR}"
    echo ""
fi

# Verifica se o servidor API está rodando
if curl -s http://localhost:3001/api/municipios?ano=2023&tribunal=TCEMG > /dev/null 2>&1; then
    echo -e "${VERDE}✅ Servidor API está rodando${SEM_COR}"
else
    echo -e "${AMARELO}⚠️  Servidor API não está rodando${SEM_COR}"
    echo -e "${AZUL}💡 Rode 'yarn local:server' em outro terminal${SEM_COR}"
    echo ""
fi

echo -e "${VERDE}🎉 Iniciando servidor de desenvolvimento...${SEM_COR}"
echo ""

# Inicia o servidor de desenvolvimento
if command -v yarn >/dev/null 2>&1; then
    yarn dev
else
    npm run dev
fi