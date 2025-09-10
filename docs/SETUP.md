# Guia de Configuração - Dashboard IEGM

Este guia fornece instruções detalhadas para configurar o ambiente de desenvolvimento do Dashboard IEGM em diferentes sistemas operacionais.

## 📋 Pré-requisitos

### Node.js
- **Versão mínima**: 18.0.0
- **Versão recomendada**: 20.11.0 LTS
- **Download**: https://nodejs.org/

### Yarn
- **Versão mínima**: 1.22.0
- **Instalação**: `npm install -g yarn`

### Git
- **Download**: https://git-scm.com/

## 🖥️ Configuração por Sistema Operacional

### Windows

#### 1. Instalar Node.js
```bash
# Baixe e instale o Node.js 20 LTS de https://nodejs.org/
# Ou use o Windows Subsystem for Linux (WSL) para melhor compatibilidade

# Verifique a instalação
node --version
npm --version
```

#### 2. Instalar Yarn
```bash
npm install -g yarn
yarn --version
```

#### 3. Configurar Git Bash (Recomendado)
```bash
# Use Git Bash em vez do CMD para melhor compatibilidade
# Baixe em: https://git-scm.com/download/win
```

#### 4. Instalar Visual Studio Build Tools (se necessário)
```bash
# Para dependências nativas como better-sqlite3
npm install --global --production windows-build-tools
```

### Linux (Ubuntu/Debian)

#### 1. Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Instalar dependências do sistema
```bash
sudo apt install -y curl wget git build-essential
```

#### 3. Instalar Node.js
```bash
# Adicionar repositório do Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

#### 4. Instalar Yarn
```bash
# Adicionar repositório do Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# Instalar Yarn
sudo apt update && sudo apt install yarn

# Verificar instalação
yarn --version
```

### macOS

#### 1. Instalar Homebrew (se não tiver)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Instalar Node.js
```bash
brew install node
node --version
npm --version
```

#### 3. Instalar Yarn
```bash
brew install yarn
yarn --version
```

#### 4. Instalar Xcode Command Line Tools (se necessário)
```bash
xcode-select --install
```

## 🚀 Configuração do Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/dashboard-iegm.git
cd dashboard-iegm
```

### 2. Instalar dependências
```bash
yarn install
```

### 3. Configurar ambiente
```bash
# O script postinstall será executado automaticamente
# Ele configurará permissões e verificará o ambiente
```

### 4. Configurar banco de dados

#### Opção A: Banco Local (Recomendado para iniciantes)
```bash
# Gerar migrações
yarn db:generate

# Aplicar migrações
yarn db:migrate

# Popular dados de exemplo
yarn data:seed

# Migrar dados
yarn data:migrate
```

#### Opção B: Cloudflare D1 (Para desenvolvimento avançado)
```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Fazer login no Cloudflare
wrangler login

# Criar banco D1 (apenas na primeira vez)
yarn cf:db:create

# Aplicar migrações
yarn cf:db:migrate
```

## 🛠️ Modos de Desenvolvimento

### Desenvolvimento Local com API
```bash
# Terminal 1: Servidor API
yarn local:server

# Terminal 2: Frontend
yarn dev
```

**URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Desenvolvimento com Cloudflare D1
```bash
# Desenvolvimento completo
yarn cf:dev:d1
```

**URLs:**
- Aplicação: http://localhost:8788
- API: http://localhost:8788/api

## 🔧 Scripts Úteis

### Desenvolvimento
```bash
yarn dev              # Frontend apenas
yarn local:server     # API local
yarn cf:dev:d1        # Desenvolvimento completo
```

### Banco de Dados
```bash
yarn db:generate      # Gerar migrações
yarn db:migrate       # Aplicar migrações
yarn db:studio        # Abrir Drizzle Studio
yarn data:seed        # Popular dados
yarn data:reset       # Reset completo
```

### Testes
```bash
yarn test:unit        # Testes unitários
yarn test:e2e         # Testes E2E
yarn test:unit:watch  # Testes em modo watch
```

### Qualidade
```bash
yarn lint             # Linting
yarn format           # Formatação
yarn type-check       # Verificação de tipos
```

## 🚨 Troubleshooting

### Problemas Comuns

#### Erro: "Permission denied"
```bash
# Linux/macOS
chmod +x scripts/*.ts

# Windows
# Use PowerShell ou Git Bash
```

#### Erro: "better-sqlite3 not found"
```bash
# Windows
npm install --global --production windows-build-tools

# Linux
sudo apt-get install build-essential

# macOS
xcode-select --install
```

#### Erro: "D1Database not available"
```bash
# Verificar login
wrangler login

# Verificar banco
wrangler d1 list

# Aplicar migrações
yarn cf:db:migrate
```

#### Erro: "Port already in use"
```bash
# Encontrar processo
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### Verificações de Ambiente

#### Verificar Node.js
```bash
node --version  # Deve ser >= 18.0.0
npm --version   # Deve ser >= 8.0.0
```

#### Verificar Yarn
```bash
yarn --version  # Deve ser >= 1.22.0
```

#### Verificar Git
```bash
git --version
```

#### Verificar Wrangler (opcional)
```bash
wrangler --version
```

## 📚 Recursos Adicionais

- [Documentação do Vue 3](https://vuejs.org/)
- [Documentação do TypeScript](https://www.typescriptlang.org/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/)
- [Documentação do Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/)

## 🤝 Suporte

Se você encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Execute `yarn clean` e reinstale as dependências
3. Verifique os logs de erro
4. Abra uma [issue](https://github.com/seu-usuario/dashboard-iegm/issues) no GitHub

---

**Desenvolvido com ❤️ para funcionar em Windows, Linux e macOS**