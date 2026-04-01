export const ROLES = {
  GERENTE: "gerente",
  SUPERVISOR: "supervisor",
  VISITANTE: "visitante",
};

export const MENU_ITEMS = {
  gerente: {
    principal: [
      { id: "dashboard", label: "Dashboard Geral", icon: "LayoutDashboard", href: "/dashboard" },
      { id: "visitantes", label: "Visitantes", icon: "Users", href: "/visitantes", badge: 2 },
      { id: "setores", label: "Setores", icon: "Building2", href: "/setores" },
      { id: "crachas", label: "Crachás", icon: "CreditCard", href: "/crachas" },
    ],
    operacao: [
      { id: "checkin", label: "Check-in / Out", icon: "ArrowLeftRight", href: "/checkin" },
      { id: "empresas", label: "Empresas", icon: "Briefcase", href: "/empresas" },
      { id: "relatorios", label: "Relatórios", icon: "FileBarChart", href: "/relatorios" },
    ],
    admin: [
      { id: "usuarios", label: "Usuários", icon: "UserCog", href: "/usuarios" },
      { id: "configuracoes", label: "Configurações", icon: "Settings", href: "/configuracoes" },
    ],
  },
  supervisor: {
    principal: [
      { id: "dashboard", label: "Dashboard Geral", icon: "LayoutDashboard", href: "/dashboard" },
      { id: "visitantes", label: "Visitantes", icon: "Users", href: "/visitantes", badge: 2 },
      { id: "setores", label: "Setores", icon: "Building2", href: "/setores" },
    ],
    operacao: [
      { id: "checkin", label: "Check-in / Out", icon: "ArrowLeftRight", href: "/checkin" },
      { id: "empresas", label: "Empresas", icon: "Briefcase", href: "/empresas" },
      { id: "relatorios", label: "Relatórios", icon: "FileBarChart", href: "/relatorios" },
    ],
  },
  visitante: {
    principal: [
      { id: "minha-visita", label: "Minha Visita", icon: "User", href: "/minha-visita" },
      { id: "checkin", label: "Check-in / Out", icon: "ArrowLeftRight", href: "/checkin" },
    ],
  },
};

export const CURRENT_USER = {
  name: "Rafael Silva",
  role: "gerente",
  title: "Segurança Patrimonial",
  initials: "RS",
};

export const STATS_TODAY = {
  visitantes: { value: 38, delta: 12, deltaDir: "up" },
  entradas: { value: 38, pct: 100 },
  saidas: { value: 24, aindaDentro: 14 },
  ativos: { value: 14, alertas: 2 },
};

export const ENTRADAS_POR_HORA = [
  { hora: "08h", value: 2 },
  { hora: "09h", value: 4 },
  { hora: "10h", value: 6 },
  { hora: "11h", value: 8 },
  { hora: "12h", value: 5 },
  { hora: "13h", value: 3 },
  { hora: "14h", value: 2 },
  { hora: "15h", value: 1 },
  { hora: "16h", value: 1 },
  { hora: "17h", value: 0 },
];

export const PICO_MOVIMENTO = [
  { hora: "06h", value: 0 },
  { hora: "07h", value: 1 },
  { hora: "08h", value: 3 },
  { hora: "09h", value: 6 },
  { hora: "10h", value: 6 },
  { hora: "11h", value: 8 },
  { hora: "12h", value: 8 },
  { hora: "13h", value: 5 },
  { hora: "14h", value: 3 },
  { hora: "15h", value: 2 },
  { hora: "16h", value: 2 },
  { hora: "17h", value: 1 },
  { hora: "18h", value: 0 },
];

export const TIPOS_VISITANTE = [
  { name: "Técnico / Manutenção", value: 14, color: "var(--chart-1)" },
  { name: "Auditor / Fiscal", value: 9, color: "var(--chart-2)" },
  { name: "Fornecedor", value: 8, color: "var(--chart-3)" },
  { name: "Visitante Geral", value: 7, color: "var(--chart-5)" },
];

export const STATUS_VISITANTES = [
  { name: "Dentro da fábrica", value: 14, color: "var(--chart-2)" },
  { name: "Aguard. aprovação", value: 2, color: "var(--chart-3)" },
  { name: "Alerta permanência", value: 1, color: "var(--chart-5)" },
  { name: "Check-out realizado", value: 24, color: "var(--muted)" },
];

export const ULTIMOS_CHECKINS = [
  { nome: "Marina Souza", empresa: "Nutrilab", setor: "Lab", hora: "12:34" },
  { nome: "Carlos Mendes", empresa: "FiltraTec", setor: "Alm.", hora: "11:52" },
  { nome: "Ana Ferreira", empresa: "ConsTech", setor: "Prod.", hora: "11:40" },
];

export const ULTIMOS_CHECKOUTS = [
  { nome: "André Costa", empresa: "SupilTec", setor: "Prod.", hora: "12:03" },
  { nome: "Beatriz Ramos", empresa: "CleanRio", setor: "Alm.", hora: "11:48" },
  { nome: "Lucas Pinto", empresa: "LogiMax", setor: "Adm.", hora: "11:30" },
];

export const NA_EMPRESA_AGORA = [
  { nome: "João Carvalho", desde: "08:12", setor: "Prod.", status: "alerta" },
  { nome: "Marina Souza", desde: "09:45", setor: "Lab", status: "ativo" },
  { nome: "Pedro Lima", desde: "10:20", setor: "Alm.", status: "ativo" },
];