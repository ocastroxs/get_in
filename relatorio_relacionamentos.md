# Relatório de Análise de Relacionamentos - Projeto GetIN

## Problema Identificado
Atualmente, o sistema possui duas telas distintas que realizam operações sobrepostas, o que gera redundância e inconsistência lógica:
1.  **Tela de Visitantes:** Permite registrar um novo visitante, solicitando nome, empresa, CPF, setor, horário de entrada e um ID de crachá (opcional).
2.  **Tela de Crachás:** Permite registrar um "novo crachá", mas na verdade solicita os mesmos dados de um visitante (nome, empresa, setor, horário de entrega).

Isso cria uma inconsistência:
*   Um crachá não deveria ser "criado" com os dados do visitante. O crachá é um **recurso físico** (uma TAG) que é **atribuído** a uma visita.
*   A "criação" de um registro na tela de crachás está, na prática, criando uma nova visita, o que duplica a função da tela de visitantes.

## Proposta de Melhoria

### 1. Unificação do Fluxo de Entrada
O registro de quem entra na empresa deve ser centralizado na **Tela de Visitantes**.
*   O crachá passa a ser apenas um campo dentro do registro do visitante.
*   Ao registrar um visitante, o sistema associa um crachá disponível a ele.

### 2. Redefinição da Tela de Crachás
A tela de crachás deve deixar de ser um local de "registro de visitas" e passar a ser uma tela de **Gestão de Inventário e Status**:
*   Listar todos os crachás físicos existentes (TAG-001, TAG-002, etc.).
*   Mostrar o status de cada crachá (Disponível, Em Uso, Extraviado, Manutenção).
*   Se estiver "Em Uso", mostrar o link para o visitante que o está utilizando.
*   Remover o botão "Novo Crachá" que solicita dados de visitante. Em seu lugar, haverá um "Cadastrar Nova TAG" (apenas o ID da TAG).

### 3. Relacionamento de Dados
*   **Visitante/Visita:** Possui os dados da pessoa e o vínculo com um `tagId`.
*   **Crachá:** É uma entidade fixa que pode estar vinculada a uma visita ativa ou estar disponível.

## Ações a serem tomadas no Frontend
1.  **Na tela de Visitantes:** Garantir que o campo "Crachá" seja obrigatório ou facilite a escolha de TAGs disponíveis.
2.  **Na tela de Crachás:**
    *   Remover o modal `ModalNovoCracha` que pede dados de visitante.
    *   Implementar um modal simplificado para cadastrar apenas a TAG física.
    *   Alterar a tabela para focar no status do objeto "Crachá".
