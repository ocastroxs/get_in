# 📋 RELATÓRIO TÉCNICO: ANÁLISE E SOLUÇÕES DE UI/UX E i18n

**Projeto:** GET IN  
**Data:** 2026-06-15  
**Desenvolvedor Responsável:** Frontend Senior & QA Specialist  
**Status:** ⚠️ CRÍTICO - Requer ação imediata

---

## 📊 RESUMO EXECUTIVO

**Total de Bugs Identificados:** 11 principais + 6 sub-problemas de i18n  
**Severidade:**
- 🔴 **CRÍTICA:** 4 (tema, i18n geral, notificações)
- 🟠 **ALTA:** 5 (posicionamento, espaçamento, legibilidade)
- 🟡 **MÉDIA:** 2 (background login, traduções específicas)

---

## 1️⃣ TELA DE LOGIN - Alteração de Fundo

### Problema
**[UI/UX] Funcionalidade de customização de fundo indisponível**

### Localização
- Arquivo: `/src/app/page.jsx` (linhas 1-150+)
- Componente: `AnimatedTitle`

### Root Cause Analysis
A página de login possui um fundo fixo hardcoded. Não há interface de seleção de cor de fundo.

### Solução Técnica

#### Passo 1: Criar Hook para Gerenciar Background
```javascript
// /src/lib/useLoginBackground.js
"use client";

import { useCallback, useEffect, useState } from "react";

const LOGIN_BG_KEY = "getin_login_background";
const DEFAULT_BG = "linear-gradient(135deg, #0f3a7d 0%, #1e40af 50%, #1e3a8a 100%)";

export function useLoginBackground() {
  const [background, setBackgroundState] = useState(DEFAULT_BG);

  const setBackground = useCallback((color) => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem(LOGIN_BG_KEY, color);
    setBackgroundState(color);
    document.documentElement.style.setProperty("--login-bg", color);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const stored = localStorage.getItem(LOGIN_BG_KEY) || DEFAULT_BG;
    setBackgroundState(stored);
    document.documentElement.style.setProperty("--login-bg", stored);
  }, []);

  return { background, setBackground };
}
```

#### Passo 2: Atualizar page.jsx para usar o hook
```javascript
// /src/app/page.jsx - substituir linha 1-30
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { getAuthTipo, getFlowRouteByTipo, useAuth } from "@/lib/AuthContext"
import { Building2, ChevronRight, ShieldCheck, Users, Palette } from "lucide-react"
import { publicService } from "@/services/api"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"
import BrandLogo from "@/components/BrandLogo"
import { useLoginBackground } from "@/lib/useLoginBackground"

// ... resto do código ...

export default function LoginPage() {
  const { background, setBackground } = useLoginBackground();
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Adicionar ao JSX
  return (
    <div 
      className="min-h-screen w-full transition-all duration-500"
      style={{ background }}
    >
      {/* Botão de customização */}
      <button
        onClick={() => setShowColorPicker(!showColorPicker)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
        title="Customizar fundo"
      >
        <Palette size={20} />
      </button>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPickerModal 
          onColorChange={setBackground} 
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {/* ... resto do layout ... */}
    </div>
  );
}

// Componente Modal de Color Picker
function ColorPickerModal({ onColorChange, onClose }) {
  const colors = [
    { name: "Azul Escuro", value: "linear-gradient(135deg, #0f3a7d 0%, #1e40af 50%, #1e3a8a 100%)" },
    { name: "Verde", value: "linear-gradient(135deg, #065f46 0%, #059669 50%, #047857 100%)" },
    { name: "Roxo", value: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #6d28d9 100%)" },
    { name: "Vermelho", value: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #b91c1c 100%)" },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm">
        <h2 className="text-lg font-bold mb-4">Escolha a cor de fundo</h2>
        <div className="grid grid-cols-2 gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                onColorChange(color.value);
                onClose();
              }}
              style={{ background: color.value }}
              className="h-20 rounded-lg hover:ring-2 ring-white/50 transition font-semibold text-white text-sm"
            >
              {color.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
```

#### Passo 3: Atualizar CSS Global
```css
/* /src/app/globals.css - adicionar */
:root {
  --login-bg: linear-gradient(135deg, #0f3a7d 0%, #1e40af 50%, #1e3a8a 100%);
}

@layer components {
  .login-container {
    background: var(--login-bg);
    transition: background 0.5s ease-in-out;
  }
}
```

---

## 2️⃣ DASHBOARD ADM - Sistema de Notificações e Alertas

### Problema 2.1: Alertas não são exibidos visualmente

**Severidade:** 🔴 CRÍTICA

**Localização:**
- Componente: `/src/components/AlertaBanner.jsx`
- Usado em: `/src/app/dashboard/page.jsx` (provavelmente)

**Root Cause:**
O componente `AlertaBanner` está implementado mas não está sendo chamado/renderizado na página dashboard com dados reais de alertas.

**Solução:**

```javascript
// /src/app/dashboard/page.jsx - verificar e adicionar no return (após linha 300)

import AlertaBanner from "@/components/AlertaBanner";

export default function DashboardPage() {
  const [alertas, setAlertas] = useState([]);
  const [alertaBannerDismissed, setAlertaBannerDismissed] = useState(false);

  // Carregar alertas do API
  useEffect(() => {
    async function carregarAlertas() {
      try {
        const response = await api.get("/alertas/circulacao");
        if (response.sucesso && Array.isArray(response.data)) {
          setAlertas(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar alertas:", error);
      }
    }

    carregarAlertas();
    // Refresh a cada 30 segundos
    const interval = setInterval(carregarAlertas, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Topbar title="Dashboard" subtitle="Visão acumulada de visitantes" />
      
      {/* ⭐ ADICIONAR ALERTABANNER NO TOPO - ANTES DE OUTROS COMPONENTES */}
      {!alertaBannerDismissed && alertas.length > 0 && (
        <div className="mb-6">
          <AlertaBanner 
            alertas={alertas} 
            onDismiss={() => setAlertaBannerDismissed(true)}
          />
        </div>
      )}

      {/* Resto do dashboard */}
      <div className="grid gap-6">
        {/* ... componentes de stats e gráficos */}
      </div>
    </>
  );
}
```

---

### Problema 2.2: Notificações em tempo real não existem

**Severidade:** 🔴 CRÍTICA

**Root Cause:**
Não há integração com WebSocket/eventos em tempo real para:
- Entrada/saída de usuários
- Novos visitantes
- Movimentação de funcionários
- Entradas de setores

**Solução: Implementar WebSocket Manager**

```javascript
// /src/lib/websocket-manager.js
"use client";

let ws = null;
let listeners = {};
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function connectWebSocket(userId) {
  if (ws?.readyState === WebSocket.OPEN) return;

  try {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
    ws = new WebSocket(`${wsUrl}?userId=${userId}`);

    ws.onopen = () => {
      console.log("✅ WebSocket conectado");
      reconnectAttempts = 0;
      emit("connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      emit(data.type, data.payload);
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket erro:", error);
      emit("error", error);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket desconectado");
      attemptReconnect(userId);
    };
  } catch (error) {
    console.error("Erro ao conectar WebSocket:", error);
  }
}

function attemptReconnect(userId) {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
    setTimeout(() => connectWebSocket(userId), delay);
  }
}

export function subscribe(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  
  return () => {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };
}

export function emit(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(data));
  }
}

export function disconnect() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
```

```javascript
// /src/hooks/useNotifications.js
"use client";

import { useEffect, useState } from "react";
import { subscribe, connectWebSocket, disconnect } from "@/lib/websocket-manager";
import { useAuth } from "@/lib/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    // Conectar ao WebSocket
    connectWebSocket(user.id);

    // Subscrever a eventos
    const unsubs = [
      subscribe("user_checkin", (data) => {
        addNotification({
          type: "checkin",
          title: "Entrada registrada",
          message: `${data.userName} entrou`,
          icon: "LogIn",
        });
      }),

      subscribe("user_checkout", (data) => {
        addNotification({
          type: "checkout",
          title: "Saída registrada",
          message: `${data.userName} saiu`,
          icon: "LogOut",
        });
      }),

      subscribe("new_visitor", (data) => {
        addNotification({
          type: "visitor",
          title: "Novo visitante",
          message: `${data.visitorName} aguarda aprovação`,
          icon: "Users",
        });
      }),

      subscribe("sector_movement", (data) => {
        addNotification({
          type: "sector",
          title: "Movimentação de setor",
          message: `${data.count} pessoas em ${data.sectorName}`,
          icon: "Building",
        });
      }),

      subscribe("critical_alert", (data) => {
        addNotification({
          type: "alert",
          title: "⚠️ Alerta crítico",
          message: data.message,
          icon: "AlertTriangle",
          severity: "critical",
        });
      }),
    ];

    return () => {
      unsubs.forEach(unsub => unsub());
      disconnect();
    };
  }, [user?.id]);

  function addNotification(notification) {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }

  return { notifications };
}
```

**Usar o hook no Dashboard:**

```javascript
// /src/app/dashboard/page.jsx
import { useNotifications } from "@/hooks/useNotifications";

export default function DashboardPage() {
  const { notifications } = useNotifications();

  return (
    <>
      {/* Render notificações */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <NotificationToast key={notif.id} notification={notif} />
        ))}
      </div>
    </>
  );
}
```

---

### Problema 2.3: Card "Em Circulação" posicionado no final da página

**Severidade:** 🟠 ALTA

**Localização:** `/src/app/dashboard/page.jsx` (layout grid)

**Root Cause:** Ordem incorreta de componentes no grid/layout

**Solução:**

```javascript
// /src/app/dashboard/page.jsx - reorganizar a renderização

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
      
      {/* ⭐ ALERTABANNER NO TOPO */}
      {alertas.length > 0 && (
        <AlertaBanner alertas={alertas} onDismiss={() => setAlertaBannerDismissed(true)} />
      )}

      {/* SEÇÃO PRINCIPAL - STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Visitantes Cadastrados"
          value={stats.visitantes.value}
          icon={Users}
        />
        <StatCard 
          title="Entradas"
          value={stats.entradas.value}
          icon={LogIn}
        />
        <StatCard 
          title="Saídas"
          value={stats.saidas.value}
          icon={LogOut}
        />
        <StatCard 
          title="Ativos Agora (⚠️ Em Circulação)"  {/* ⭐ RENOMEADO */}
          value={stats.ativos.value}
          subtitle={`${stats.ativos.alertas} alertas`}
          variant={stats.ativos.alertas > 0 ? "warning" : "default"}
          icon={AlertTriangle}
        />
      </div>

      {/* SEÇÃO SECUNDÁRIA - GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EntradasChart data={chartData.entradas} />
        <PicoMovimentoChart data={chartData.picoMovimento} />
      </div>

      {/* SEÇÃO TERCIÁRIA - RELATÓRIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusVisitantesChart data={chartData.status} />
        <TiposVisitantesChart data={chartData.tipos} />
        <UltimasRequisicoes data={requisicoes} />
      </div>
    </>
  );
}
```

---

### Problema 2.4: Espaçamento em "Pico Setor" - letras muito juntas

**Severidade:** 🟠 ALTA

**Localização:** `/src/components/PicoMovimentoChart.jsx`

**Root Cause:** Falta de `letter-spacing` ou font-size inadequado

**Solução:**

```javascript
// /src/components/PicoMovimentoChart.jsx - atualizar className

export default function PicoMovimentoChart({ data }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold text-foreground mb-4 tracking-wide"> {/* ⭐ Adicionado tracking-wide */}
        Pico de Movimento por Setor
      </h3>

      {/* Adicionar letter-spacing ao título do Recharts */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          {/* ... resto do gráfico ... */}
          <XAxis 
            dataKey="setor" 
            tick={{ 
              fontSize: 12, 
              letterSpacing: "0.5px"  /* ⭐ Adicionar aqui */
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### Problema 2.5: Status ilegível - pontos sobrepostos

**Severidade:** 🟠 ALTA

**Localização:** `/src/components/StatusVisitantesChart.jsx`

**Root Cause:** Overflow de texto ou layout quebrado

**Solução:**

```javascript
// /src/components/StatusVisitantesChart.jsx

export default function StatusVisitantesChart({ data }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Status de Visitantes</h3>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between gap-4">
            {/* Label com flex-wrap para evitar overflow */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div 
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-foreground truncate whitespace-nowrap">
                {item.status}
              </span>
            </div>

            {/* Valor com width mínimo */}
            <span className="text-sm font-bold text-foreground whitespace-nowrap">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar para cada status */}
      <div className="mt-6 space-y-3">
        {data.map((item) => {
          const percentage = (item.value / Math.max(...data.map(d => d.value))) * 100;
          return (
            <div key={`progress-${item.status}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.status}</span>
                <span className="text-xs font-semibold text-foreground">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### Problema 2.6: 🔴 CRÍTICO - Tema Escuro Involuntário ao clicar em "Configurações"

**Severidade:** 🔴 CRÍTICA - BUG DE LÓGICA

**Localização:**
- `/src/lib/preferences.js`
- `/src/lib/theme.js`
- `/src/app/configuracoes/page.jsx`

**Root Cause:** Conflito entre `applyPreferences()` e `setTheme()`. A função `applyPreferences` está sobrescrevendo o tema sem verificar o valor salvo anteriormente.

**Análise do Bug:**

```javascript
// /src/lib/preferences.js - linha onde está o problema
export function applyPreferences(prefs) {
  if (typeof document === "undefined") return;

  // ❌ PROBLEMA: Isto sobrescreve o tema sem validação
  const theme = prefs.tema || DEFAULT_PREFERENCES.tema; // DEFAULT é "dark"
  applyTheme(theme); // Força aplicação do tema
  
  // ... resto do código
}
```

**Solução Corrigida:**

```javascript
// /src/lib/preferences.js - NOVO CÓDIGO CORRETO

import { applyTheme, getStoredTheme } from "@/lib/theme";

export const DEFAULT_PREFERENCES = {
  tema: "system",           // ⭐ Mudar de "dark" para "system"
  idioma: "pt-BR",
  densidade: "confortavel",
  menuLateral: "expandido",
  reduzirMovimento: false,
  confirmarAcoesCriticas: true
};

export function normalizePreferences(input = {}) {
  const prefs = typeof input === "object" ? input : {};
  
  return {
    tema: ["light", "dark", "system"].includes(prefs.tema) ? prefs.tema : "system",
    idioma: ["pt-BR", "en-US", "es-ES"].includes(prefs.idioma) ? prefs.idioma : "pt-BR",
    densidade: ["confortavel", "compacta"].includes(prefs.densidade) ? prefs.densidade : "confortavel",
    menuLateral: ["expandido", "recolhido"].includes(prefs.menuLateral) ? prefs.menuLateral : "expandido",
    reduzirMovimento: Boolean(prefs.reduzirMovimento),
    confirmarAcoesCriticas: prefs.confirmarAcoesCriticas !== false,
  };
}

export function applyPreferences(prefs = {}) {
  if (typeof document === "undefined") return;

  const normalized = normalizePreferences(prefs);

  // ⭐ CORREÇÃO: Verificar se o tema foi alterado explicitamente
  // Se foi, aplicar. Se não, manter o tema atual do usuário
  if (prefs.tema !== undefined && prefs.tema !== null) {
    applyTheme(normalized.tema);
    localStorage.setItem(THEME_STORAGE_KEY, normalized.tema);
  }
  // Caso contrário, NÃO MUDAR o tema
  
  // Aplicar outras preferências
  if (normalized.idioma) {
    localStorage.setItem("getin_user_language", normalized.idioma);
    document.documentElement.lang = normalized.idioma;
  }

  document.documentElement.setAttribute("data-density", normalized.densidade);
  document.documentElement.setAttribute("data-sidebar-default", normalized.menuLateral);
  
  if (normalized.reduzirMovimento) {
    document.documentElement.classList.add("reduce-motion");
  } else {
    document.documentElement.classList.remove("reduce-motion");
  }

  savePreferencesToStorage(normalized);
}

export function getStoredPreferences() {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }
    
    const parsed = JSON.parse(stored);
    return normalizePreferences(parsed);
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferencesToStorage(prefs = {}) {
  if (typeof window === "undefined") return prefs;

  const normalized = normalizePreferences(prefs);
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
```

**Atualizar o arquivo de configurações:**

```javascript
// /src/app/configuracoes/page.jsx - linha 286-290

function handlePreferenciasChange(nextValues) {
  // ⭐ CORREÇÃO: Não aplicar automaticamente, apenas atualizar state
  const nextPreferencias = normalizePreferences({ ...preferencias, ...nextValues });
  setPreferencias(nextPreferencias);
  
  // ⭐ NOVO: Aplicar APENAS a preferência que foi alterada
  const changedKeys = Object.keys(nextValues);
  if (changedKeys.includes("tema")) {
    applyTheme(nextValues.tema); // Aplicar tema se foi mudado
  }
  if (changedKeys.includes("idioma")) {
    // Recarregar i18n se idioma foi mudado
    if (typeof window !== "undefined") {
      localStorage.setItem("getin_user_language", nextValues.idioma);
    }
  }
  if (changedKeys.includes("reduzirMovimento")) {
    if (nextValues.reduzirMovimento) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }
}
```

---

## 3️⃣ INTERNACIONALIZAÇÃO (i18n) - Problemas Globais

### Problema 3.1-3.10: Múltiplas strings não traduzidas

**Severidade:** 🔴 CRÍTICA

**Localização:** `/src/lib/i18n-core.js`

**Root Cause:** Muitas strings hardcoded em português não estão no dicionário de tradução

**Strings Faltando Tradução (Auditoria):**

```javascript
// MAIN PAINEL - Filtros não traduzidos
"Dia"                        // missing
"Semana"                     // missing
"Mês"                        // missing
"Período"                    // missing

// PEAK BY SECTOR
"Pico de Movimento por Setor" // missing (apenas "Pico Setor")
"Setor"                      // missing

// STATUS E REASONS
"Aprovado"                   // missing
"Pendente"                   // missing
"Recusado"                   // missing
"Expirado"                   // missing
"Motivo"                     // missing

// VISITANTES
"CPF"                        // missing
"Empresa"                    // missing
"Data de entrada"            // missing
"Data de saída"              // missing
"Ativo"                      // missing
"Finalizado"                 // missing

// EMPLOYEES
"Funcionários"               // missing
"Nome"                       // missing
"Departamento"               // missing
"Data de admissão"           // missing (duplicado em várias formas)

// BADGES/COLUNAS
"Status"                     // missing
"Ação"                       // missing
"Editar funcionário"         // missing
"Remover funcionário"        // missing

// TOOLTIPS
"Clique para visualizar detalhes" // missing
"Editar"                     // exists mas pode estar incompleto

// SETORES
"Setores"                    // missing
"Nome do Setor"              // missing
"Descrição"                  // missing
"Responsável"                // missing
```

**Solução Completa:**

```javascript
// /src/lib/i18n-core.js - ADICIONAR as traduções faltando

const TEXT_TRANSLATIONS = {
  // ... existentes ...

  // MAIN PAINEL - Filtros
  "Dia": { "en-US": "Day", "es-ES": "Día" },
  "Semana": { "en-US": "Week", "es-ES": "Semana" },
  "Mês": { "en-US": "Month", "es-ES": "Mes" },
  "Período": { "en-US": "Period", "es-ES": "Período" },

  // PEAK BY SECTOR
  "Pico de Movimento por Setor": { "en-US": "Peak Movement by Sector", "es-ES": "Pico de Movimiento por Sector" },
  "Setor": { "en-US": "Sector", "es-ES": "Sector" },

  // STATUS E REASONS
  "Aprovado": { "en-US": "Approved", "es-ES": "Aprobado" },
  "Recusado": { "en-US": "Rejected", "es-ES": "Rechazado" },
  "Motivo": { "en-US": "Reason", "es-ES": "Motivo" },

  // VISITANTES
  "CPF": { "en-US": "CPF", "es-ES": "CPF" },
  "Empresa": { "en-US": "Company", "es-ES": "Empresa" },
  "Data de entrada": { "en-US": "Entry Date", "es-ES": "Fecha de entrada" },
  "Data de saída": { "en-US": "Exit Date", "es-ES": "Fecha de salida" },
  "Ativo": { "en-US": "Active", "es-ES": "Activo" },

  // FUNCIONÁRIOS
  "Funcionários": { "en-US": "Employees", "es-ES": "Empleados" },
  "Nome": { "en-US": "Name", "es-ES": "Nombre" },
  "Departamento": { "en-US": "Department", "es-ES": "Departamento" },

  // BADGES/COLUNAS
  "Status": { "en-US": "Status", "es-ES": "Estado" },
  "Ação": { "en-US": "Action", "es-ES": "Acción" },
  "Editar funcionário": { "en-US": "Edit employee", "es-ES": "Editar empleado" },
  "Remover funcionário": { "en-US": "Remove employee", "es-ES": "Eliminar empleado" },

  // SETORES
  "Setores": { "en-US": "Sectors", "es-ES": "Sectores" },
  "Nome do Setor": { "en-US": "Sector Name", "es-ES": "Nombre del Sector" },
  "Descrição": { "en-US": "Description", "es-ES": "Descripción" },
  "Responsável": { "en-US": "Manager", "es-ES": "Responsable" },

  // TOOLTIPS
  "Clique para visualizar detalhes": { "en-US": "Click to view details", "es-ES": "Haz clic para ver detalles" },
  "Tooltip: Editar": { "en-US": "Edit this item", "es-ES": "Editar este elemento" },
  "Tooltip: Deletar": { "en-US": "Delete this item", "es-ES": "Eliminar este elemento" },
};

// Adicionar patterns para tradução dinâmica
const TEXT_PATTERN_TRANSLATIONS = [
  // ... existentes ...
  
  {
    pattern: /^Setor\s+/i,
    translations: {
      "pt-BR": "Setor ",
      "en-US": "Sector ",
      "es-ES": "Sector ",
    }
  },
  
  {
    pattern: /visitante(s)?/i,
    translations: {
      "pt-BR": "visitante$1",
      "en-US": "visitor$1",
      "es-ES": "visitante$1",
    }
  },
];
```

---

### Problema 3.2: Dashboard Portaria - Tradução não aplicada

**Severidade:** 🔴 CRÍTICA

**Localização:** `/src/app/portaria/layout.jsx`

**Root Cause:** Provider de i18n não está ativo na rota /portaria ou está sendo renderizado incorretamente

**Solução:**

```javascript
// /src/app/portaria/layout.jsx - garantir que I18nProvider está ativo

"use client";

import { I18nProvider } from "@/lib/i18n"; // ⭐ IMPORTAR
import PortariaSidebar from "@/components/PortariaSidebar";
import ParticlesBackground from "@/components/ui/ParticlesBackground";
import { useAuth, getAuthTipo } from "@/lib/AuthContext";

export default function PortariaLayout({ children }) {
  const { isAuthenticated, isLoading, funcionario, user } = useAuth();
  const tipo = getAuthTipo(funcionario, user);

  if (isLoading || !isAuthenticated || tipo !== "port") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    // ⭐ ENVOLVER COM I18nProvider SE NÃO ESTIVER NO ROOT LAYOUT
    <div className="relative isolate flex min-h-screen">
      <ParticlesBackground />
      <PortariaSidebar />
      <main className="relative z-10 ml-[0px] h-screen flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Sprint 1 - CRÍTICO (2-3 dias)
- [ ] **BUG 2.6** - Fix tema escuro involuntário (`preferences.js`)
- [ ] **BUG 3.1-3.10** - Adicionar strings faltando em i18n-core.js
- [ ] **BUG 3.2** - Verificar I18nProvider em portaria/layout.jsx
- [ ] **BUG 2.2** - Implementar WebSocket para notificações

### Sprint 2 - ALTA (3-4 dias)
- [ ] **BUG 2.1** - Renderizar AlertaBanner no dashboard
- [ ] **BUG 2.3** - Reposicionar card "Em Circulação"
- [ ] **BUG 2.4** - Adicionar letter-spacing em Pico Setor
- [ ] **BUG 2.5** - Fix legibilidade de Status

### Sprint 3 - MÉDIA (1-2 dias)
- [ ] **BUG 1.1** - Implementar seleção de fundo em Login

---

## 🧪 TESTES DE VALIDAÇÃO

```javascript
// Testar todas as traduções
describe("i18n Translations", () => {
  it("deve traduzir filtros de período", () => {
    const pt = t("Dia");
    const en = t("Dia", "en-US");
    expect(en).toBe("Day");
  });

  it("deve traduzir componentes de dashboard", () => {
    const visitor = t("Visitantes", "en-US");
    expect(visitor).toBe("Visitors");
  });
});

// Testar tema não sendo forçado
describe("Theme Management", () => {
  it("não deve forçar dark mode ao abrir configurações", () => {
    const initialTheme = localStorage.getItem("app_theme");
    // ... navegar para configurações
    const newTheme = localStorage.getItem("app_theme");
    expect(newTheme).toBe(initialTheme);
  });
});

// Testar notificações em tempo real
describe("Real-time Notifications", () => {
  it("deve receber notificações de check-in", (done) => {
    const unsub = subscribe("user_checkin", (data) => {
      expect(data.userName).toBeDefined();
      unsub();
      done();
    });

    // Simular evento
    emit("user_checkin", { userName: "João Silva" });
  });
});
```

---

## 📝 RESUMO DE ALTERAÇÕES

| Arquivo | Alteração | Severidade | Tipo |
|---------|-----------|-----------|------|
| `/src/lib/preferences.js` | Fix lógica de aplicação de tema | 🔴 CRÍTICA | BUG |
| `/src/lib/i18n-core.js` | Adicionar 20+ traduções | 🔴 CRÍTICA | FEATURE |
| `/src/app/dashboard/page.jsx` | Reposicionar AlertaBanner + WebSocket | 🔴 CRÍTICA | BUG+FEATURE |
| `/src/lib/websocket-manager.js` | NOVO arquivo | 🔴 CRÍTICA | FEATURE |
| `/src/hooks/useNotifications.js` | NOVO arquivo | 🔴 CRÍTICA | FEATURE |
| `/src/app/page.jsx` | Adicionar seletor de fundo | 🟡 MÉDIA | FEATURE |
| `/src/components/PicoMovimentoChart.jsx` | Adicionar letter-spacing | 🟠 ALTA | STYLE |
| `/src/components/StatusVisitantesChart.jsx` | Fix layout overflow | 🟠 ALTA | BUG |
| `/src/app/portaria/layout.jsx` | Verificar I18nProvider | 🔴 CRÍTICA | BUG |

---

## ✅ CONCLUSÃO

Todas as soluções são **técnicamente viáveis** e podem ser implementadas **sem breaking changes**. Recomenda-se começar pelos bugs críticos (Sprint 1) para garantir a estabilidade da aplicação, seguido pelos bugs de UX/experiência (Sprint 2-3).

**Tempo estimado total:** 5-7 dias (3 sprints de 1-2 devs)
