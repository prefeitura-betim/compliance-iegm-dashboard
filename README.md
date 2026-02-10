# Dashboard de Compliance IEGM

Este projeto é um dashboard interativo desenvolvido para a **Prefeitura Municipal de Betim** com o objetivo de analisar e monitorar o **Índice de Efetividade da Gestão Municipal (IEGM)** do Tribunal de Contas do Estado de Minas Gerais (TCEMG).

A ferramenta permite a visualização detalhada de indicadores, facilitando a tomada de decisões e o acompanhamento das metas de compliance e eficiência na gestão pública.

## 🚀 Tecnologias Utilizadas

O projeto utiliza um stack moderno e performático, focado em escalabilidade e experiência do usuário:

### Frontend
- **React 19** & **TypeScript 5**: Base sólida e tipada para a interface.
- **Vite 7**: Build tool de última geração para desenvolvimento rápido.
- **Tailwind CSS 4**: Framework de estilização utilitária e responsiva.
- **React Router DOM 7**: Gerenciamento de rotas da aplicação.
- **TanStack Query**: Gerenciamento de estado de servidor, cache e sincronização de dados.
- **Zustand**: Gerenciamento de estado global leve e flexível.

### Visualização de Dados & UI
- **Recharts** & **Chart.js**: Bibliotecas para criação de gráficos interativos e dinâmicos para indicadores.
- **Headless UI** & **Lucide React**: Componentes acessíveis e ícones modernos.
- **jsPDF** & **html2canvas**: Funcionalidades para exportação de relatórios em PDF e imagem.

### Backend & Dados
- **Cloudflare Workers & Pages**: Infraestrutura serverless de alta performance para deploy.
- **Cloudflare D1**: Banco de dados SQL serverless na edge.
- **Drizzle ORM**: ORM TypeScript completo para interação segura e eficiente com o banco de dados.
- **Better SQLite3**: Utilizado para o ambiente de desenvolvimento local (simulando o D1).
- **Express**: Servidor local para desenvolvimento (`scripts/api-server.ts`).

### Ferramentas de Desenvolvimento e Qualidade
- **ESLint** & **Prettier**: Padronização e qualidade de código.
- **Vitest**: Framework de testes unitários rápido.
- **Playwright**: Testes E2E (Ponta a Ponta) para garantir o funcionamento dos fluxos críticos.
- **Terraform**: Infraestrutura como código (IaC) para gerenciamento de recursos.

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **Yarn** (Gerenciador de pacotes recomendado)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd compliance-iegm-dashboard
    ```

2.  Instale as dependências:
    ```bash
    yarn install
    ```

3.  Configure as variáveis de ambiente:
    Copie o arquivo `.env.example` para `.env` e ajuste conforme necessário.

## 💻 Executando Localmente

Para um ambiente de desenvolvimento completo (Frontend + API Local), utilize o comando:

```bash
yarn dev:full
```

Este comando executa concorrentemente:
- **Frontend (Vite)**: `http://localhost:3000`
- **API Local (Express)**: `http://localhost:8787` (Simula os Workers)

O Vite está configurado para encaminhar requisições `/api` para o servidor local na porta 8787.

### Comandos Individuais
Se preferir executar separadamente:

- **Apenas Frontend:** `yarn dev`
- **Apenas API Local:** `yarn api:dev`

## 🗄️ Gerenciamento do Banco de Dados

O projeto utiliza **Drizzle ORM** para gerenciar o esquema do banco de dados e migrações.

### Comandos Úteis

- **Gerar migrações (Schema):**
  Cria arquivos SQL baseados nas mudanças do schema (`src/db/schema.ts`).
  ```bash
  yarn db:generate
  ```

- **Aplicar migrações (Local):**
  Aplica as mudanças no banco de dados local (`local.db`).
  ```bash
  yarn db:migrate
  ```

- **Visualizar Banco de Dados:**
  Abre o Drizzle Studio para visualizar e editar dados localmente.
  ```bash
  yarn db:studio
  ```

- **Resetar Dados Locais:**
  Remove o banco local, recria as tabelas e insere dados de seed.
  ```bash
  yarn data:reset
  ```

## 🧪 Testes

Garanta a qualidade do código executando os testes:

- **Testes Unitários:**
  ```bash
  yarn test
  ```

- **Testes E2E (End-to-End):**
  ```bash
  yarn test:e2e
  ```

## 📦 Build e Deploy

### Produção
Para gerar a versão otimizada para produção:

```bash
yarn build
```

Para visualizar a versão de build localmente:

```bash
yarn preview
```

### Deploy (Cloudflare)
O projeto é implantado na Cloudflare Pages.

```bash
yarn cf:deploy
```

## 📂 Estrutura do Projeto

```
compliance-iegm-dashboard/
├── src/                # Código fonte da aplicação
│   ├── components/     # Componentes React reutilizáveis
│   ├── services/       # Integração com APIs e serviços externos
│   ├── db/             # Schemas e configuração do Drizzle ORM
│   ├── routes/         # Definição de rotas
│   └── ...
├── scripts/            # Scripts de automação (API local, seeds, migrações)
├── data/               # Arquivos de dados brutos (CSV, XLSX)
├── e2e/                # Testes end-to-end com Playwright
├── dist/               # Arquivos gerados para produção (após build)
├── local.db            # Banco de dados SQLite local (gerado)
└── ...
```

## 📄 Licença

Este projeto é de propriedade da **Prefeitura Municipal de Betim**. Todos os direitos reservados.

---
*Atualizado em Fevereiro de 2026.*
