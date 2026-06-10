# GET IN - Front-end

Front-end do **GET IN**, um sistema web para controle de acesso corporativo, gestao de visitantes, operacao de portaria, aprovacao de requisicoes e auditoria de circulacao em ambientes empresariais.

Este repositorio contem a interface web desenvolvida com **Next.js**, consumindo a API do projeto `get_in-Backend`.

---

## Indice

- [Visao geral](#visao-geral)
- [Principais funcionalidades](#principais-funcionalidades)
- [Stack tecnologica](#stack-tecnologica)
- [Pre-requisitos](#pre-requisitos)
- [Configuracao de ambiente](#configuracao-de-ambiente)
- [Instalacao e execucao](#instalacao-e-execucao)
- [Scripts disponiveis](#scripts-disponiveis)
- [Fluxos de usuario](#fluxos-de-usuario)
- [Autenticacao e permissao](#autenticacao-e-permissao)
- [Integracao com a API](#integracao-com-a-api)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Telas principais](#telas-principais)
- [Exportacao e relatorios](#exportacao-e-relatorios)
- [Boas praticas de desenvolvimento](#boas-praticas-de-desenvolvimento)
- [Back-end relacionado](#back-end-relacionado)

---

## Visao geral

O GET IN e uma aplicacao para controlar a entrada, permanencia, aprovacao e saida de pessoas em uma empresa. A interface separa as responsabilidades por perfil de usuario:

- **Administrador (`adm`)**: acompanha indicadores, gerencia cadastros, permissoes, crachas, empresas, setores e relatorios.
- **Portaria (`port`)**: opera o fluxo diario de visitantes, criando visitas, acompanhando pendencias, registrando check-out e consultando historico.
- **Supervisor (`sup`)**: analisa e aprova ou recusa requisicoes de visitantes para setores sob sua responsabilidade.

O front-end se comunica com a API por HTTP usando JWT, mantem sessao no navegador e aplica redirecionamento automatico conforme o perfil autenticado.

---

## Principais funcionalidades

- Login com persistencia opcional de sessao.
- Redirecionamento automatico por perfil de acesso.
- Dashboard administrativo com cards, graficos e alertas.
- Gestao de visitantes ativos, pendentes, expirados e finalizados.
- Cadastro de novos visitantes com empresa, setor, motivo, tag/cracha e validade.
- Fluxo de portaria com operacao em tempo real, check-out, edicao e exclusao de visitantes.
- Fluxo de supervisor com analise de solicitacoes e aprovacao em lote por setor.
- Cadastro e manutencao de funcionarios.
- Gestao de empresas, setores, crachas, tags e permissoes.
- Historicos e relatorios com filtros.
- Exportacao de tabelas para PDF.
- Preferencias do usuario, tema claro/escuro e configuracoes pessoais.
- Internacionalizacao interna para formatos e textos de interface.

---

## Stack tecnologica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 |
| UI | React 19 |
| Estilizacao | Tailwind CSS 4 |
| Componentes | Componentes locais, Radix UI e padrao shadcn |
| Icones | Lucide React |
| Graficos | Recharts |
| Exportacao | jsPDF |
| Scroll/animacao | Lenis |
| Utilitarios | clsx, tailwind-merge, class-variance-authority |
| Qualidade | ESLint 9 com configuracao Next |

---

## Pre-requisitos

- Node.js compativel com Next.js 16.
- npm.
- Back-end GET IN em execucao ou uma URL publica da API.
- Banco de dados e servicos externos configurados no back-end.

Para desenvolvimento local, o fluxo esperado e:

- Front-end: `http://localhost:3000`
- Back-end/API: `http://localhost:8080`

---

## Configuracao de ambiente

Crie um arquivo `.env.local` na raiz deste repositorio:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Variaveis

| Variavel | Obrigatoria | Descricao |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Nao, mas recomendada | URL base da API consumida pelo front-end. |

Caso a variavel nao seja definida, a aplicacao usa como fallback:

```text
https://api.getin.dev.br
```

> Nunca coloque tokens, senhas, `JWT_SECRET`, `DATABASE_URL` ou chaves privadas no `.env.local` do front-end. Variaveis com prefixo `NEXT_PUBLIC_` ficam expostas ao navegador.

---

## Instalacao e execucao

Na raiz do projeto front-end:

```bash
npm install
```

Crie o `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Execute em desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Para gerar build de producao:

```bash
npm run build
npm run start
```

---

## Scripts disponiveis

| Script | Comando | Descricao |
| --- | --- | --- |
| Desenvolvimento | `npm run dev` | Inicia o Next.js com webpack em modo desenvolvimento. |
| Build | `npm run build` | Gera a build de producao. |
| Producao | `npm run start` | Sobe o servidor Next usando a build gerada. |
| Lint | `npm run lint` | Executa ESLint no projeto. |

---

## Fluxos de usuario

### Administrador (`adm`)

O perfil administrador acessa o modulo `/dashboard`, com funcionalidades de gestao e auditoria.

Rotas principais:

| Rota | Finalidade |
| --- | --- |
| `/dashboard` | Painel com indicadores, graficos, ultimos movimentos e alertas. |
| `/dashboard/visitantes` | Listagem consolidada de visitantes, pendencias e historico. |
| `/dashboard/visitantes/novo` | Cadastro de novo visitante. |
| `/dashboard/funcionarios` | Consulta, edicao e remocao de funcionarios. |
| `/dashboard/funcionarios/registrarFuncionario` | Registro de funcionario. |
| `/dashboard/crachas` | Gestao de crachas e associacao com tags fisicas. |
| `/dashboard/setores` | Cadastro e manutencao de setores. |
| `/dashboard/empresas` | Cadastro e manutencao de empresas visitantes. |
| `/dashboard/circulacao` | Consulta de logs e movimentacao por setor/dispositivo. |
| `/dashboard/permissao` | Configuracao de regras de permissao. |
| `/dashboard/relatorios` | Relatorios filtraveis e exportaveis. |

### Portaria (`port`)

O perfil de portaria acessa o modulo `/portaria`, focado no fluxo operacional diario.

Rotas principais:

| Rota | Finalidade |
| --- | --- |
| `/portaria` | Operacao de visitantes presentes, check-out, edicao e exclusao. |
| `/portaria/novo` | Cadastro de novo visitante pela portaria. |
| `/portaria/pendencias` | Pendencias de entrada e solicitacoes aguardando decisao. |
| `/portaria/aprovacoes` | Acompanhamento de aprovacoes relacionadas a visitantes. |
| `/portaria/historico` | Historico de visitas e requisicoes. |

### Supervisor (`sup`)

O perfil supervisor acessa o modulo `/supervisor`, voltado a aprovar ou recusar acessos.

Rotas principais:

| Rota | Finalidade |
| --- | --- |
| `/supervisor` | Painel resumido de solicitacoes. |
| `/supervisor/aprovacoes` | Analise de requisicoes de visitantes por setor. |
| `/supervisor/historico` | Historico de aprovacoes e recusas. |

### Configuracoes

A rota `/configuracoes` fica disponivel para usuarios autenticados e permite alterar perfil, senha, avatar e preferencias visuais.

---

## Autenticacao e permissao

O login e realizado por meio de `POST /auth/login` na API. Quando a autenticacao e bem-sucedida, o front-end armazena:

- `getin_token`: token JWT usado no header `Authorization`.
- `getin_user`: dados seguros do usuario autenticado.
- `getin_funcionario`: dados funcionais e perfil.
- `getin_session`: cookie usado pelo middleware do Next.js para proteger rotas.
- `getin_tipo`: cookie com o tipo normalizado do usuario.

O token pode ser salvo em:

- `localStorage`, quando a sessao deve ser lembrada.
- `sessionStorage`, quando a sessao deve durar apenas ate fechar a aba/navegador.

O middleware protege as areas:

| Area | Perfil exigido |
| --- | --- |
| `/dashboard` | `adm` |
| `/portaria` | `port` |
| `/supervisor` | `sup` |
| `/configuracoes` | Usuario autenticado |

Aliases aceitos no front-end:

| Entrada | Perfil normalizado |
| --- | --- |
| `administrador`, `admin`, `adm` | `adm` |
| `porteiro`, `portaria`, `port` | `port` |
| `supervisor`, `sup` | `sup` |

---

## Integracao com a API

A comunicacao HTTP fica centralizada em:

```text
src/services/api.js
```

Esse servico:

- Normaliza a URL base da API.
- Adiciona `Authorization: Bearer <token>` quando existe token salvo.
- Faz parsing de respostas JSON.
- Retorna mensagens padronizadas para erros de autenticacao, permissao, recurso inexistente e falha de conexao.
- Expoe metodos `get`, `post`, `put`, `delete` e `upload`.

Chamadas importantes usadas pelo front-end:

| Recurso | Endpoints consumidos |
| --- | --- |
| Login | `/auth/login` |
| Estatisticas publicas | `/public/stats` |
| Dashboard | `/requisicao-visitante`, `/portaria/vlocal`, `/logs` |
| Visitantes | `/portaria/vlocal`, `/portaria/pendencias`, `/portaria/historico`, `/requisicao-visitante` |
| Portaria | `/portaria/checkout`, `/portaria/visitante/:id`, `/empresas`, `/setores` |
| Supervisor | `/requisicao-visitante`, `/requisicao-visitante/lote` |
| Funcionarios | `/func/view`, `/func/:id`, `/auth` |
| Empresas | `/empresas`, `/empresas/:id` |
| Setores | `/setores`, `/views/gestores` |
| Crachas e tags | `/cracha`, `/tags/disponiveis`, `/tags/virtual/assign`, `/tags/code/:codigoTag/assign` |
| Usuario | `/user`, `/user/me/profile`, `/user/me/password`, `/user/me/preferences` |
| Avatar | `/avatar/:funcId` |
| Relatorios | `/relatorios/acessos` |
| Permissoes | `/permissoes` |

---

## Estrutura do projeto

```text
get_in/
├── public/                  # Logos e assets publicos
├── src/
│   ├── app/                 # Rotas App Router do Next.js
│   │   ├── dashboard/       # Fluxo administrativo
│   │   ├── portaria/        # Fluxo operacional da portaria
│   │   ├── supervisor/      # Fluxo de aprovacao do supervisor
│   │   ├── configuracoes/   # Perfil, senha, avatar e preferencias
│   │   ├── layout.jsx       # Providers globais
│   │   └── page.jsx         # Login
│   ├── components/          # Componentes compartilhados e de dominio
│   ├── hooks/               # Hooks de paginacao, auto-refresh e dashboard
│   ├── lib/                 # Auth, tema, i18n, exportacao PDF e normalizadores
│   └── services/            # Cliente HTTP e servicos de dados
├── middleware.js            # Protecao e redirecionamento por perfil
├── package.json             # Dependencias e scripts
└── next.config.mjs          # Configuracao Next
```

---

## Telas principais

### Login

A tela inicial apresenta o formulario de login e estatisticas publicas vindas de `/public/stats`. Se o usuario ja estiver autenticado, ele e redirecionado automaticamente para o fluxo correspondente ao perfil.

### Dashboard administrativo

O dashboard administrativo consolida:

- Visitantes do dia.
- Entradas e saidas.
- Visitantes ativos dentro da empresa.
- Alertas de permanencia.
- Graficos por periodo.
- Ultimos check-ins e check-outs.

### Visitantes

A pagina de visitantes consolida dados de:

- Visitantes no local.
- Pendencias.
- Historico.

Ela permite busca, filtro por status, visualizacao de detalhes, paginacao e exportacao em PDF.

### Portaria

A operacao de portaria permite:

- Visualizar visitantes presentes.
- Realizar check-out.
- Editar dados de visitante.
- Excluir registros quando necessario.
- Exportar lista atual para PDF.
- Criar novas solicitacoes de visita.

### Supervisor

O modulo supervisor permite:

- Ver solicitacoes do dia.
- Agrupar setores solicitados por visitante.
- Aprovar ou recusar acessos.
- Consultar historico.
- Exportar aprovacoes filtradas.

---

## Exportacao e relatorios

O projeto usa `jsPDF` para gerar PDFs a partir das tabelas exibidas na interface. A funcao compartilhada fica em:

```text
src/lib/exportPdf.js
```

As telas que usam exportacao aplicam filtros antes de gerar o documento, para que o arquivo reflita a visao atual do usuario.

---

## Boas praticas de desenvolvimento

- Configure `NEXT_PUBLIC_API_URL` para apontar para a API correta antes de iniciar o front-end.
- Mantenha o back-end rodando enquanto desenvolve telas que dependem de dados reais.
- Nao versionar `.env.local` com valores sensiveis.
- Rode `npm run lint` antes de entregar alteracoes.
- Ao criar novas chamadas HTTP, centralize o uso em `src/services/api.js` ou em services de dominio.
- Ao criar novas rotas protegidas, atualize `middleware.js` e o fluxo de autenticacao quando necessario.

---

## Back-end relacionado

O back-end deste projeto fica em:

```text
C:\Users\25171033\Documents\get_in-Backend
```

Consulte o README desse repositorio para detalhes sobre API, banco PostgreSQL, Prisma, Supabase Storage, MQTT, variaveis de ambiente e endpoints disponiveis.
