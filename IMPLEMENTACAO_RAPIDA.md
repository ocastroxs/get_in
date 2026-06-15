# 🚀 GUIA DE IMPLEMENTAÇÃO IMEDIATO - GET IN

## Prioridade 1️⃣: CRÍTICO (Fazer hoje)

### 1.1 Fix: Tema Escuro Involuntário ao Abrir Configurações
**Arquivo:** `/src/lib/preferences-config.js`  
**Mudança:** Linha 1
```javascript
// ❌ ANTES:
export const DEFAULT_PREFERENCES = {
  tema: "dark", // ← força dark por padrão
  ...
};

// ✅ DEPOIS:
export const DEFAULT_PREFERENCES = {
  tema: "system", // ← respeita preferência do SO
  ...
};
```

**Impacto:** Resolve o bug onde usuários que entravam em Configurações eram forçados para dark mode.

---

### 1.2 Add: Strings Faltando de Tradução
**Arquivo:** `/src/lib/i18n-core.js`  
**Ação:** Adicionar ao objeto `TEXT_TRANSLATIONS` (após linha 199)

```javascript
// Adicionar estas entradas:
"Dia": { "en-US": "Day", "es-ES": "Día" },
"Semana": { "en-US": "Week", "es-ES": "Semana" },
"Mês": { "en-US": "Month", "es-ES": "Mes" },
"Período": { "en-US": "Period", "es-ES": "Período" },
"Pico de Movimento por Setor": { "en-US": "Peak Movement by Sector", "es-ES": "Pico de Movimiento por Sector" },
"Setor": { "en-US": "Sector", "es-ES": "Sector" },
"CPF": { "en-US": "CPF", "es-ES": "CPF" },
"Empresa": { "en-US": "Company", "es-ES": "Empresa" },
"Data de entrada": { "en-US": "Entry Date", "es-ES": "Fecha de entrada" },
"Data de saída": { "en-US": "Exit Date", "es-ES": "Fecha de salida" },
"Ativo": { "en-US": "Active", "es-ES": "Activo" },
"Funcionários": { "en-US": "Employees", "es-ES": "Empleados" },
"Nome": { "en-US": "Name", "es-ES": "Nombre" },
"Departamento": { "en-US": "Department", "es-ES": "Departamento" },
"Status": { "en-US": "Status", "es-ES": "Estado" },
"Ação": { "en-US": "Action", "es-ES": "Acción" },
"Setores": { "en-US": "Sectors", "es-ES": "Sectores" },
```

**Impacto:** Dashboard e Portaria agora traduzem corretamente para EN/ES.

---

### 1.3 Fix: AlertaBanner não está sendo renderizado
**Arquivo:** `/src/app/dashboard/page.jsx`  
**Ação:** Adicionar hook de alertas e renderizar no topo (após linha 2)

```javascript
import AlertaBanner from "@/components/AlertaBanner";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [alertas, setAlertas] = useState([]);
  const [alertaDismissed, setAlertaDismissed] = useState(false);

  useEffect(() => {
    // Carregar alertas de visitantes em circulação
    async function loadAlertas() {
      try {
        const response = await api.get("/visitantes?status=em_circulacao&limite=5");
        if (response.sucesso && Array.isArray(response.data)) {
          // Filtrar apenas visitantes com permanência > 8 horas
          const agora = new Date();
          const alertaList = response.data.filter(v => {
            const entrada = new Date(v.dataEntrada);
            const horas = (agora - entrada) / (1000 * 60 * 60);
            return horas > 8; // 8 horas é o limite padrão
          });
          setAlertas(alertaList);
        }
      } catch (error) {
        console.error("Erro ao carregar alertas:", error);
      }
    }

    loadAlertas();
    const interval = setInterval(loadAlertas, 60000); // Refresh a cada 1 min
    return () => clearInterval(interval);
  }, []);

  // No return, ANTES de qualquer outro componente:
  return (
    <>
      <Topbar title="Dashboard Geral" subtitle="..." />

      {/* ⭐ ALERTABANNER NO TOPO */}
      {!alertaDismissed && alertas.length > 0 && (
        <div className="mb-6">
          <AlertaBanner 
            alertas={alertas} 
            onDismiss={() => setAlertaDismissed(true)}
          />
        </div>
      )}

      {/* Resto do dashboard */}
      <div className="grid ...">
        {/* Stats, gráficos, etc */}
      </div>
    </>
  );
}
```

**Impacto:** Alertas de visitantes em circulação aparecem em destaque no topo do dashboard.

---

## Prioridade 2️⃣: ALTA (Fazer esta semana)

### 2.1 Fix: Espaçamento em "Pico Setor"
**Arquivo:** `/src/components/PicoMovimentoChart.jsx`  
**Ação:** Adicionar `tracking-wider` ao título (linha onde está o h3)

```javascript
// ❌ ANTES:
<h3 className="text-lg font-bold text-foreground mb-4">
  Pico de Movimento por Setor
</h3>

// ✅ DEPOIS:
<h3 className="text-lg font-bold text-foreground mb-4 tracking-wider">
  Pico de Movimento por Setor
</h3>

// Também no Recharts XAxis:
<XAxis 
  dataKey="setor" 
  tick={{ fontSize: 12, letterSpacing: "1px" }}
/>
```

**Impacto:** Letras no gráfico de setores terão espaçamento adequado.

---

### 2.2 Fix: Status ilegível por pontos sobrepostos
**Arquivo:** `/src/components/StatusVisitantesChart.jsx`  
**Ação:** Reescrever o componente com melhor layout (VEJA RELATÓRIO COMPLETO seção 2.5)

**Quick Fix:**
```javascript
// Adicionar classes de overflow handling:
className="overflow-x-auto"  // No container pai
className="whitespace-nowrap truncate"  // Em cada label
className="min-w-max"  // Garantir min-width
```

**Impacto:** Status e dados da tabela ficam legíveis.

---

### 2.3 Reposicionar Card "Em Circulação" para o início
**Arquivo:** `/src/app/dashboard/page.jsx`  
**Ação:** Mover StatCard de "Ativos Agora" para a primeira posição (linha ~250)

```javascript
// Reorganizar o grid de stats para colocar "Em Circulação" em primeiro
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  {/* ⭐ PRIMEIRO: Em Circulação */}
  <StatCard 
    title="Em Circulação ⚠️"
    value={stats.ativos.value}
    subtitle={`${stats.ativos.alertas} alertas`}
    variant="warning"
    icon={AlertTriangle}
  />

  {/* DEPOIS: Os outros */}
  <StatCard title="Visitantes Cadastrados" value={stats.visitantes.value} icon={Users} />
  <StatCard title="Entradas" value={stats.entradas.value} icon={LogIn} />
  <StatCard title="Saídas" value={stats.saidas.value} icon={LogOut} />
</div>
```

**Impacto:** Card crítico de circulação fica em posição de destaque.

---

## Prioridade 3️⃣: MELHORIAS (Fazer no próximo sprint)

### 3.1 Feature: Seletor de Cor de Fundo na Login
**Arquivo:** `/src/app/page.jsx`  
**Ação:** Veja seção 1 do RELATORIO_BUGS_SOLUCOES.md

---

## 📊 Checklist Rápido de Testes

Após fazer cada alteração, teste:

```bash
# 1. Testes de i18n
- [ ] Dashboard em Português ✅
- [ ] Dashboard em Inglês ✅
- [ ] Dashboard em Espanhol ✅
- [ ] Portaria em Inglês ✅

# 2. Testes de Tema
- [ ] Abrir Configurações com tema Light → mantém Light ✅
- [ ] Abrir Configurações com tema Dark → mantém Dark ✅
- [ ] Mudar tema em Configurações → aplica corretamente ✅

# 3. Testes de Alertas
- [ ] AlertaBanner aparece no topo do dashboard ✅
- [ ] AlertaBanner some ao clicar X ✅
- [ ] Visitantes em circulação > 8h aparecem no banner ✅

# 4. Testes de Layout
- [ ] Pico Setor tem letras espaçadas ✅
- [ ] Status tabela é legível (sem pontos sobrepostos) ✅
- [ ] Card "Em Circulação" está em primeiro lugar ✅
```

---

## 🔧 Comandos para Executar

```bash
# Depois das alterações, rode:
npm run lint  # Verifica erros de sintaxe
npm run dev   # Inicia servidor local

# Em outra aba, teste as páginas:
# - http://localhost:3000 (login)
# - http://localhost:3000/dashboard (admin)
# - http://localhost:3000/portaria (portaria)
# - http://localhost:3000/configuracoes (settings)
```

---

## 📌 Ordem de Execução Recomendada

1. **Primeiro (5 min):** Fix tema default em `preferences-config.js`
2. **Segundo (15 min):** Adicionar strings de tradução em `i18n-core.js`
3. **Terceiro (20 min):** Renderizar AlertaBanner em `dashboard/page.jsx`
4. **Quarto (10 min):** Ajustes de CSS (espaçamento, overflow)
5. **Quinto (15 min):** Reposicionar card de circulação
6. **Teste:** Verificar todos os 4 checklists acima

**Tempo Total:** ~75 minutos para tudo

---

**Dúvidas?** Consulte o `RELATORIO_BUGS_SOLUCOES.md` para soluções completas com contexto.
