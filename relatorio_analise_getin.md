# Análise Técnica do Projeto GetIN

**Autor:** Manus AI
**Data:** 17 de Abril de 2026
**Repositório Analisado:** `ocastroxs/get_in`
**Contexto:** Trabalho de Conclusão de Curso (TCC) do SENAI

---

## 1. Visão Geral do Projeto

O projeto **GetIN** (também referenciado internamente como *VisitaTrack*) é uma aplicação web voltada para o controle de acesso inteligente em ambientes corporativos e industriais. O sistema propõe digitalizar o credenciamento, oferecer rastreabilidade em tempo real e manter uma auditoria completa de visitantes e funcionários em diferentes setores de uma fábrica ou empresa.

A aplicação apresenta uma interface moderna, responsiva e rica em elementos visuais (como gráficos e animações), focada na experiência do usuário (UX) para diferentes perfis de acesso, como gerentes, supervisores, portaria e os próprios visitantes.

## 2. Arquitetura e Tecnologias Utilizadas

O projeto foi desenvolvido utilizando um ecossistema moderno de desenvolvimento front-end baseado em JavaScript/React.

### 2.1. Stack Tecnológica Principal

| Tecnologia | Versão | Propósito no Projeto |
| :--- | :--- | :--- |
| **Next.js** | `^16.2.3` | Framework React utilizado para roteamento (App Router) e renderização da aplicação. |
| **React** | `19.2.4` | Biblioteca base para construção das interfaces de usuário. |
| **Tailwind CSS** | `^4.0` | Framework de CSS utilitário para estilização rápida e responsiva. O projeto já utiliza a versão 4 com diretivas `@import "tailwindcss"`. |
| **Shadcn UI / Radix UI** | Várias | Biblioteca de componentes acessíveis e customizáveis, baseada no Tailwind CSS. |
| **Recharts** | `^3.8.1` | Biblioteca para renderização de gráficos de dados no dashboard. |
| **Lucide React** | `^1.7.0` | Biblioteca de ícones vetoriais utilizada em toda a interface. |
| **Styled Components** | `^6.4.0` | Utilizado pontualmente para componentes com animações complexas (ex: tela de carregamento). |

### 2.2. Estrutura do Repositório

A arquitetura de pastas segue o padrão do Next.js (App Router):

*   `src/app/`: Contém as rotas da aplicação.
    *   `/`: Página de login inicial.
    *   `/dashboard/`: Área principal do sistema, contendo sub-rotas para `visitantes`, `crachas` e `relatorios`.
    *   `/registrarFuncionario/`: Fluxo de cadastro de novos funcionários.
    *   `/permissao/`: Interface para gerenciamento de permissões de acesso.
*   `src/components/`: Componentes React reutilizáveis (ex: `Sidebar`, `Topbar`, `StatCard`, gráficos).
    *   `src/components/ui/`: Componentes base de interface (botões, inputs, modais).
*   `src/lib/`: Funções utilitárias e dados simulados (`mockData.js`).

## 3. Análise Funcional e Estado de Desenvolvimento

A análise do código-fonte revela que o projeto GetIN encontra-se em um estágio híbrido entre um **protótipo de alta fidelidade (Mock-driven)** e uma **aplicação funcional com integração inicial de backend**.

### 3.1. Módulo de Dashboard (Protótipo Mock-driven)

A maior parte da aplicação, especificamente a área do `/dashboard` (Visitantes, Crachás, Relatórios), opera inteiramente no lado do cliente (Client-side) utilizando dados simulados.

*   **Gerenciamento de Estado Local:** As páginas utilizam `useState` e `useMemo` do React para gerenciar a listagem, filtragem e busca de visitantes e crachás.
*   **Dados Simulados:** O arquivo `src/lib/mockData.js` atua como um banco de dados em memória, fornecendo arrays estáticos para KPIs (`STATS_TODAY`), gráficos (`ENTRADAS_POR_HORA`), listas de visitantes (`VISITANTES_HOJE`) e configurações de menu baseadas em perfis (Roles).
*   **Ações Simuladas:** Funcionalidades como "Novo Visitante" ou "Novo Crachá" abrem modais funcionais que atualizam o estado local da tabela, mas essas alterações são perdidas ao recarregar a página, pois não há persistência em um banco de dados real.
*   **Exportação de Dados:** O sistema possui uma funcionalidade real de exportação de tabelas para o formato CSV, implementada puramente no front-end.

### 3.2. Módulo de Cadastro (Integração com Backend)

Em contraste com o dashboard, a rota `/registrarFuncionario` demonstra a integração com uma API REST real.

*   **Comunicação com API:** O componente realiza requisições HTTP (`fetch`) para um backend hospedado no Render (`https://get-in-ilp5.onrender.com`).
*   **Endpoints Identificados:**
    *   `GET /dep`: Busca a lista de departamentos disponíveis para preencher o formulário.
    *   `POST /auth`: Envia o payload com os dados do novo funcionário para registro no sistema.
*   **Validações Complexas:** O formulário possui validações robustas no lado do cliente, incluindo máscara e cálculo de dígito verificador para CPF, validação de formato de e-mail e um medidor de força de senha.

### 3.3. Módulo de Permissões

A rota `/permissao` apresenta uma interface avançada para controle de acesso (Matriz de Permissões). No entanto, assim como o dashboard, suas ações de "Salvar" apenas simulam um tempo de carregamento (`setTimeout`) e exibem um alerta de sucesso, sem persistência real.

## 4. Pontos Fortes do Projeto

1.  **Qualidade da Interface (UI/UX):** O projeto possui um design excepcionalmente polido. O uso de gradientes, efeitos de vidro (Glassmorphism), animações de partículas em background e transições suaves demonstram um alto nível de cuidado com a experiência do usuário.
2.  **Arquitetura de Componentes:** O código é bem organizado. A separação entre componentes de UI genéricos (botões, inputs) e componentes de negócio (tabelas, gráficos) facilita a manutenção e escalabilidade.
3.  **Acessibilidade e Padronização:** A adoção do Shadcn UI e Tailwind CSS garante que a interface seja consistente e responsiva.
4.  **Lógica de Validação:** As funções de validação de CPF e força de senha no cadastro de funcionários são implementações sólidas e prontas para produção.

## 5. Oportunidades de Melhoria e Próximos Passos

Considerando que este é um projeto de TCC, as seguintes áreas representam os próximos passos lógicos para evoluir o sistema de um protótipo para uma aplicação completa:

1.  **Integração Completa com Backend:**
    *   Substituir os dados estáticos do `mockData.js` por chamadas reais à API (ex: `GET /visitantes`, `POST /visitantes`).
    *   Implementar a persistência de dados para as ações de check-in, check-out e emissão de crachás.
2.  **Autenticação e Autorização Real:**
    *   A página de login atual (`/`) é puramente visual. É necessário integrar um sistema de autenticação (ex: JWT ou NextAuth.js) para validar credenciais e proteger as rotas do `/dashboard`.
    *   A matriz de permissões (`/permissao`) deve ser conectada ao backend para que as regras de acesso (Gerente, Supervisor, Portaria) sejam aplicadas de fato.
3.  **Tratamento de Erros Globais:**
    *   Implementar um sistema de notificações (Toasts) para feedback de erros de API, substituindo os `alert()` nativos do navegador utilizados atualmente em algumas validações.
4.  **Unificação de Layouts:**
    *   O projeto apresenta duas estruturas de navegação laterais (Sidebars) ligeiramente diferentes: uma para o dashboard e outra para as rotas de cadastro/permissão. Unificar essas estruturas melhoraria a consistência da navegação.

## 6. Conclusão

O projeto **GetIN** apresenta uma base front-end de altíssima qualidade para um sistema de controle de acesso. A interface é profissional, moderna e demonstra um excelente domínio das tecnologias React e Tailwind CSS por parte dos desenvolvedores. 

Para a conclusão do TCC, o foco principal deve ser a expansão da integração com a API (já iniciada no módulo de funcionários) para abranger o fluxo principal de visitantes e crachás, transformando o rico protótipo visual em uma ferramenta de gestão de dados totalmente funcional.
