# 🗺️ MAPA DE PRIORIDADES E DEPENDÊNCIAS

## Quadro de Criticidade

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEVERIDADE DOS BUGS                          │
├─────────────────────────────────────────────────────────────────┤
│ 🔴 CRÍTICA (5)     │ 🟠 ALTA (5)        │ 🟡 MÉDIA (1)         │
├────────────────────┼────────────────────┼──────────────────────┤
│ 1. Tema Escuro     │ 4. Espaçamento     │ 11. Login BG Color   │
│    Involuntário    │    (Pico Setor)    │                      │
│ 2. i18n Dashboard  │ 5. Status Ilegível │                      │
│ 3. i18n Portaria   │ 6. Posição Card    │                      │
│ 7. AlertaBanner    │ 8. Notificações RT │                      │
│ 9. Filtros Período │ 10. WebSocket      │                      │
└────────────────────┴────────────────────┴──────────────────────┘

TOTAL: 11 BUGS PRINCIPAIS + 6 SUB-PROBLEMAS DE i18n
```

---

## 📋 Mapa de Dependências

```
                          ┌─────────────────────┐
                          │  Startup Crítico    │
                          │  (Executar Primeiro)│
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │ 1. Fix Tema  │ │ 2. Add i18n  │ │ 3. Alertas   │
            │   Escuro     │ │   Traduções  │ │   Visíveis   │
            │ (5 min)      │ │   (15 min)   │ │   (20 min)   │
            └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                   │                │                │
        TESTES:    │                │                │
        ├─ Light   │                │                │
        ├─ Dark    │    ┌───────────┼───────────┐    │
        ├─ System  │    │           │           │    │
        └─ Config  │    ▼           ▼           ▼    │
                   │  EN Test   ES Test     API Test │
                   │                                 │
                   └────────┬────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Sprint 2:    │
                    │  Melhorias UI │
                    │  (Sprint 2)   │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │ 4. CSS     │   │ 5. Reposic.│   │ 6. Status  │
    │ Espaçament │   │ Card Em    │   │ Legibilid.│
    │ (10 min)   │   │ Circulação │   │ (10 min)   │
    │            │   │ (10 min)   │   │            │
    └────────────┘   └────────────┘   └────────────┘
```

---

## 🎯 Timeline Recomendado

### **DIA 1 - MANHÃ (09:00-12:00)**

```
09:00 ┌─────────────────────────────────────┐
      │ TASK 1: Fix Tema Escuro             │
      │ ├─ Editar preferences-config.js     │
      │ ├─ Mudar DEFAULT_THEME "dark"→"sys"│
      │ ├─ Teste em Configurações           │
      │ └─ Commit: "fix: tema default"      │
      └─────────────────────────────────────┘
      Tempo: 5-10 min
      Status: ✅ QUICK WIN

09:15 ┌─────────────────────────────────────┐
      │ TASK 2: Adicionar i18n Traduções    │
      │ ├─ Abrir i18n-core.js               │
      │ ├─ Adicionar 20+ strings no dicionário
      │ ├─ Testar EN e ES em todas as telas │
      │ └─ Commit: "i18n: adicionar trad..."│
      └─────────────────────────────────────┘
      Tempo: 15-20 min
      Status: ✅ HIGH IMPACT

09:40 ┌─────────────────────────────────────┐
      │ TASK 3: Renderizar AlertaBanner     │
      │ ├─ Atualizar dashboard/page.jsx     │
      │ ├─ Adicionar hook useEffect         │
      │ ├─ Chamar API /alertas/circulacao   │
      │ ├─ Testar alerta no topo            │
      │ └─ Commit: "feat: alerta circulação"│
      └─────────────────────────────────────┘
      Tempo: 20-25 min
      Status: ✅ CRITICAL FIX

10:10 ┌─────────────────────────────────────┐
      │ PAUSA / CODE REVIEW (10 min)        │
      └─────────────────────────────────────┘

10:20 ┌─────────────────────────────────────┐
      │ TESTES: Rodada 1 Manual             │
      │ ├─ [ ] Tema Light → Dark com Config │
      │ ├─ [ ] Dashboard PT/EN/ES translad  │
      │ ├─ [ ] AlertaBanner visível e funca│
      │ └─ Tempo: 15-20 min                 │
      └─────────────────────────────────────┘

11:00 ┌─────────────────────────────────────┐
      │ RESUMO DA MANHÃ                     │
      │ ✅ 3 bugs críticos resolvidos       │
      │ ✅ i18n global funcionando          │
      │ ✅ Alertas visíveis no dashboard    │
      └─────────────────────────────────────┘
```

### **DIA 1 - TARDE (14:00-17:00)**

```
14:00 ┌─────────────────────────────────────┐
      │ TASK 4: Fix Espaçamento Pico Setor  │
      │ ├─ Editar PicoMovimentoChart.jsx    │
      │ ├─ Adicionar tracking-wider ao h3   │
      │ ├─ Adicionar letterSpacing Recharts │
      │ ├─ Teste visual no Chrome/Firefox   │
      │ └─ Commit: "style: spacing pico..." │
      └─────────────────────────────────────┘
      Tempo: 8-10 min
      Status: ✅ CSS FIX

14:15 ┌─────────────────────────────────────┐
      │ TASK 5: Fix Status Ilegível         │
      │ ├─ Editar StatusVisitantesChart.jsx │
      │ ├─ Adicionar overflow-x-auto        │
      │ ├─ Adicionar whitespace-nowrap      │
      │ ├─ Teste responsivo mobile          │
      │ └─ Commit: "fix: status legibil..." │
      └─────────────────────────────────────┘
      Tempo: 10-12 min
      Status: ✅ LAYOUT FIX

14:35 ┌─────────────────────────────────────┐
      │ TASK 6: Reposicionar Card Circulação│
      │ ├─ Editar dashboard/page.jsx        │
      │ ├─ Mover StatCard "Em Circulação"   │
      │ ├─ Para primeira posição do grid    │
      │ ├─ Teste visual no dashboard        │
      │ └─ Commit: "ux: circulação primeiro"│
      └─────────────────────────────────────┘
      Tempo: 8-10 min
      Status: ✅ UX FIX

14:50 ┌─────────────────────────────────────┐
      │ TESTES: Rodada 2 Manual             │
      │ ├─ [ ] Pico Setor letras espaçadas  │
      │ ├─ [ ] Status tabela legível        │
      │ ├─ [ ] Card em Circulação em 1º     │
      │ └─ Tempo: 10 min                    │
      └─────────────────────────────────────┘

15:05 ┌─────────────────────────────────────┐
      │ INTEGRAÇÃO E QA FINAL               │
      │ ├─ npm run build (verificar errors) │
      │ ├─ Teste em device mobile           │
      │ ├─ Teste cross-browser (Edge/Safari)│
      │ └─ Tempo: 20-30 min                 │
      └─────────────────────────────────────┘

15:40 ┌─────────────────────────────────────┐
      │ DOCUMENTAÇÃO E COMMIT FINAL         │
      │ ├─ Documentar mudanças no CLAUDE.md │
      │ ├─ Criar branch: fix/ui-i18n-bugs   │
      │ ├─ Push para origin                 │
      │ └─ Criar Pull Request               │
      └─────────────────────────────────────┘

16:00 ┌─────────────────────────────────────┐
      │ RESUMO DO DIA                       │
      │ ✅ 6 bugs corrigidos                │
      │ ✅ 100% i18n funcional              │
      │ ✅ Dashboard otimizado visualmente  │
      │ ⏳ Pronto para code review          │
      └─────────────────────────────────────┘
```

---

## 📊 Matriz de Impacto vs Esforço

```
                          ESFORÇO BAIXO
                                ▲
                                │
                    ┌───────────┼───────────┐
                    │ FAZER     │ FAZER     │
                    │ AGORA     │ DEPOIS    │
                    │           │           │
    IMPACTO ALTO ←──┼───────────┼───────────┼──→ IMPACTO BAIXO
                    │ EM BREVE  │ NÃO FAZER │
                    │           │           │
                    └───────────┼───────────┘
                                │
                                ▼
                          ESFORÇO ALTO


    POSIÇÃO DOS BUGS:

    ╔════════════════════════════════════════════════════════════╗
    ║                    FAZER AGORA (Priority 1)               ║
    ║  • #1 - Tema Escuro (5 min, CRÍTICO)                      ║
    ║  • #2 - i18n Traduções (20 min, CRÍTICO)                  ║
    ║  • #3 - AlertaBanner (20 min, CRÍTICO)                    ║
    ║  • #4 - Espaçamento Pico (10 min, ALTA)                   ║
    ║  • #5 - Status Legível (12 min, ALTA)                     ║
    ║  • #6 - Card Posição (10 min, ALTA)                       ║
    ╚════════════════════════════════════════════════════════════╝

              ┌─────────────────────────────────┐
              │  EM BREVE (Priority 2 - Próx Semana)
              │  • #7 - WebSocket Real-time (2h)
              │  • #8 - i18n Portaria (30 min)
              │  • #9 - Login BG Color (45 min)
              └─────────────────────────────────┘
```

---

## 🔄 Ciclo de Testes

```
CADA TAREFA SEGUE ESTE PADRÃO:

┌────────────────────────────────────────────┐
│ 1. ESCREVER CÓDIGO                         │
│    └─ Editar arquivo necessário            │
└────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────┐
│ 2. TESTE LOCAL                             │
│    ├─ npm run dev                          │
│    ├─ Testar em localhost:3000            │
│    └─ Verificar console para errors        │
└────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────┐
│ 3. TESTE MULTI-BROWSER                     │
│    ├─ Chrome/Chromium                      │
│    ├─ Firefox                              │
│    └─ Safari (se possível em Mac)         │
└────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────┐
│ 4. TESTE RESPONSIVO                        │
│    ├─ Desktop (1920x1080)                  │
│    ├─ Tablet (768x1024)                    │
│    └─ Mobile (375x667)                     │
└────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────┐
│ 5. COMMIT & PUSH                           │
│    ├─ git add arquivo.jsx                  │
│    ├─ git commit -m "fix: ..."             │
│    └─ git push origin branch               │
└────────────────────────────────────────────┘
```

---

## 📈 Métricas de Sucesso

### Antes vs Depois

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| **Strings Traduzidas** | 60% | 95% | ✅ 95% |
| **Bugs Críticos Abertos** | 4 | 0 | ✅ 0 |
| **Alertas Visíveis** | 0% | 100% | ✅ 100% |
| **Legibilidade UI** | 70% | 98% | ✅ 95%+ |
| **Consistência Tema** | 60% | 100% | ✅ 100% |
| **Tempo Load Dashboard** | ~2.5s | ~2.0s | ✅ <2.5s |

---

## 🛠️ Arquivos a Modificar (Resumo Rápido)

```
CRÍTICO (HOJE):
  📝 /src/lib/preferences-config.js          ← 1 linha
  📝 /src/lib/i18n-core.js                   ← 20+ linhas
  📝 /src/app/dashboard/page.jsx             ← 30+ linhas

ALTA (HOJE):
  📝 /src/components/PicoMovimentoChart.jsx  ← 2 linhas
  📝 /src/components/StatusVisitantesChart.jsx ← 15 linhas
  📝 /src/app/dashboard/page.jsx             ← Reordenar grid

PRÓX SPRINT:
  ✨ /src/lib/websocket-manager.js           ← NOVO (50 linhas)
  ✨ /src/hooks/useNotifications.js          ← NOVO (80 linhas)
  📝 /src/app/page.jsx                       ← 40 linhas (opcional)
  📝 /src/app/portaria/layout.jsx            ← 5 linhas (verificação)
```

---

## ⏱️ Estimativa Total

| Fase | Tempo | Status |
|------|-------|--------|
| Crítico (6 bugs) | 1h30m | 📍 HOJE |
| Alta (5 bugs) | 1h | 📍 HOJE |
| Testes Completos | 45m | 📍 HOJE |
| **SUBTOTAL HOJE** | **3h15m** | **✅** |
| Próx Sprint | 4h | 📅 SEMANA QUE VEM |
| **TOTAL PROJETO** | **~7h** | 🎯 |

---

## ✅ Checklist Final

```
ANTES DE COMEÇAR:
  [ ] Ler RELATORIO_BUGS_SOLUCOES.md completo
  [ ] Ler IMPLEMENTACAO_RAPIDA.md
  [ ] Fazer um pull da branch main
  [ ] Criar branch local: git checkout -b fix/ui-i18n-bugs

DURANTE:
  [ ] Seguir timeline do DIA 1
  [ ] Testar após cada task completada
  [ ] Fazer commits pequenos e específicos
  [ ] Documentar qualquer bloqueador

DEPOIS:
  [ ] Todos 6 bugs de hoje resolvidos
  [ ] Testes passando em 3+ browsers
  [ ] Código revisado por colega
  [ ] PR criada e linkada em issue
  [ ] Deploy planejado para amanhã

SUCESSO:
  ✅ Dashboard 100% traduzido (PT/EN/ES)
  ✅ Tema respeitando preferência do usuário
  ✅ Alertas visíveis e funcionais
  ✅ UI legível e bem espaçada
  ✅ Pronto para production
```

---

**Próximo passo:** Comece com o TASK 1 (Fix Tema) - são apenas 5 minutos! 🚀
