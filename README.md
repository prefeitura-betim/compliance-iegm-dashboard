<p align="center">
  <img src="https://img.shields.io/static/v1?label=Vue.js&message=3.5%2B&color=42b883&style=for-the-badge&logo=vue.js"/>
  <img src="https://img.shields.io/static/v1?label=TypeScript&message=5.8%2B&color=3178c6&style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/static/v1?label=Vite&message=build-tool&color=646cff&style=for-the-badge&logo=vite"/>
  <img src="https://img.shields.io/static/v1?label=Cloudflare%20D1&message=serverless%20DB&color=F38020&style=for-the-badge&logo=cloudflare"/>
  <img src="https://img.shields.io/static/v1?label=Drizzle%20ORM&message=type-safe&color=8e44ad&style=for-the-badge"/>
  <img src="https://img.shields.io/static/v1?label=TailwindCSS&message=4%2B&color=38bdf8&style=for-the-badge&logo=tailwindcss"/>
  <img src="https://img.shields.io/static/v1?label=Vitest&message=testes%20unit%C3%A1rios&color=6e9f18&style=for-the-badge&logo=vitest"/>
  <img src="https://img.shields.io/static/v1?label=Playwright&message=testes%20e2e&color=45ba63&style=for-the-badge&logo=playwright"/>
  <img src="https://img.shields.io/static/v1?label=MIT&message=Licen%C3%A7a&color=yellow&style=for-the-badge"/>
</p>

# Dashboard IEGM

> **Status do Projeto:** 🚧 Em desenvolvimento

O Dashboard IEGM é uma aplicação web moderna para análise do **Índice de Efetividade da Gestão Municipal (IEGM)**, oferecendo painéis interativos e análises avançadas para municípios brasileiros. Construído com Vue 3, TypeScript, Vite, Cloudflare D1 e Drizzle ORM, o projeto prioriza performance, escalabilidade e experiência do desenvolvedor.

---

## ✨ Funcionalidades

- **Dashboard Interativo** para análise da gestão municipal
- **Análise Multidimensional**: Educação, Saúde, Fiscal, Meio Ambiente, Cidades, Planejamento, Governança de TI
- **Ranking e Comparativos**
- **Questionários Detalhados e Recomendações**
- **Exportação de Relatórios** (PDF/Excel)
- **Banco Serverless Cloudflare D1**
- **ORM type-safe com Drizzle**
- **UI moderna com TailwindCSS**
- **Testes Unitários e E2E** (Vitest, Playwright)
- **Cross-platform**: Windows, Linux, macOS

---

## 📚 Sumário
- [Primeiros Passos](#primeiros-passos)
- [Como Rodar](#como-rodar)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Contribuindo](#contribuindo)
- [Issues e Roadmap](#issues-e-roadmap)
- [Autores](#autores)

---

## 🚀 Primeiros Passos

### Pré-requisitos

- **Git**
- **Node.js** >= 18.x (recomendado: 20.x)
- **Yarn** >= 1.22.x ou **npm** >= 8.x
- **Wrangler CLI** (opcional, para Cloudflare D1)

### Instalação

```sh
/* Clone o repositório */
git clone https://github.com/fundacaobeta/dashboard-iegm.git
cd dashboard-iegm

/* Instale as dependências */
yarn install
/* ou */
npm install
/* OBS: Recomendado yarn pela maior velocidade para instalar dependencias */

/* Copie o arquivo de variáveis de ambiente */
cp .env.example .env
/* No Windows, copie manualmente e renomeie para .env */
```

---

## ⚙️ Como Rodar

### Desenvolvimento Local (Recomendado)

```sh
/* Inicie o servidor de API local (Terminal 1) */
yarn local:server

/* Inicie o frontend (Terminal 2) */
yarn dev
```

### Desenvolvimento Paralelo (API + Frontend)
```sh
yarn dev:parallel
```

### Desenvolvimento com Cloudflare D1
```sh
yarn cf:dev:d1
```

### Configuração do Banco de Dados (Primeira vez)
```sh
yarn setup
/* Ou para um setup rápido: */
yarn setup:quick
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - [Vue 3](https://vuejs.org/) (Composition API)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [TailwindCSS](https://tailwindcss.com/)
  - [Pinia](https://pinia.vuejs.org/) (Gerenciamento de estado)
  - [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/)
- **Backend/API:**
  - [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
  - [Cloudflare D1](https://developers.cloudflare.com/d1/)
  - [Drizzle ORM](https://orm.drizzle.team/)
  - [Express.js](https://expressjs.com/) (para desenvolvimento local)
- **Testes:**
  - [Vitest](https://vitest.dev/) (testes unitários)
  - [Playwright](https://playwright.dev/) (testes E2E)
- **Dev Experience:**
  - [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [npm-run-all2](https://www.npmjs.com/package/npm-run-all2)

---

## 📦 Estrutura do Projeto

```sh
/* Principais pastas e suas finalidades */
dashboard-iegm/
  src/
    components/    /* Componentes Vue */
    views/         /* Páginas principais */
    stores/        /* Stores Pinia */
    services/      /* Serviços de API/dados */
    hooks/         /* Composables Vue */
    db/            /* Schema Drizzle e migrações */
    config/        /* Configurações da aplicação */
    types/         /* Tipos TypeScript */
  functions/api/   /* Cloudflare Pages Functions */
  scripts/         /* Scripts de desenvolvimento e setup */
  docs/            /* Documentação */
  terraform/       /* Infraestrutura como código */
```

---

## 📝 Exemplo: Usando Variáveis de Ambiente

```js
/* Exemplo de uso de variáveis de ambiente no Node.js */
const dbUrl = process.env.DATABASE_URL;
console.log('URL do banco de dados:', dbUrl);
```

---

## 🧑‍💻 Desenvolvimento & Qualidade

- **Checagem de Tipos:**
  ```sh
  yarn type-check
  ```
- **Lint e Formatação:**
  ```sh
  yarn lint
  yarn format
  ```
- **Testes:**
  ```sh
  yarn test:unit      /* Testes unitários */
  yarn test:e2e       /* Testes end-to-end */
  ```
- **Build:**
  ```sh
  yarn build
  ```

---

## 🧩 Contribuindo

Contribuições são bem-vindas! Confira nosso [board de projeto e issues](https://github.com/orgs/fundacaobeta/projects/1) para tarefas, bugs e novas features.

- Faça um fork do repositório e crie sua branch: `git checkout -b feature/sua-feature`
- Commit suas alterações: `git commit -m 'Adiciona nova feature'`
- Envie para o seu fork: `git push origin feature/sua-feature`
- Abra um Pull Request

Para dúvidas, sugestões ou reportar bugs, abra uma [issue](https://github.com/orgs/fundacaobeta/projects/1).

---

## 🗺️ Issues e Roadmap

- [Board do Projeto & Issues](https://github.com/orgs/fundacaobeta/projects/1)
- [Issues Abertas](https://github.com/fundacaobeta/dashboard-iegm/issues)

---

## ✒️ Autores

- **Fundação Beta** - [GitHub](https://github.com/fundacaobeta)
- Veja também a lista de [contribuidores](https://github.com/fundacaobeta/dashboard-iegm/graphs/contributors)

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

---

## 💡 Observações

- Todos os comentários de código estão em português e usam o padrão `/* ... */` para clareza e consistência.
- Para dúvidas, abra uma [issue](https://github.com/fundacaobeta/dashboard-iegm/issues).

---

<p align="center">
  <b>Feito pela Fundação Beta para transparência e eficiência na gestão pública</b>
</p>
