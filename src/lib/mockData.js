export const ROLES = {
  GERENTE: "gerente",
  SUPERVISOR: "supervisor",
  VISITANTE: "visitante",
};

export const MENU_ITEMS = {
  gerente: {
    principal: [
      { id: "dashboard", label: "Dashboard Geral", icon: "LayoutDashboard", href: "/dashboard" },
      { id: "visitantes", label: "Visitantes", icon: "Users", href: "/dashboard/visitantes", badge: 2 },
      { id: "setores", label: "Setores", icon: "Building2", href: "/setores" },
      { id: "crachas", label: "Crachás", icon: "CreditCard", href: "/crachas" },
    ],
    operacao: [
      { id: "checkin", label: "Check-in / Out", icon: "ArrowLeftRight", href: "/checkin" },
      { id: "empresas", label: "Empresas", icon: "Briefcase", href: "/empresas" },
      { id: "relatorios", label: "Relatórios", icon: "FileBarChart", href: "/dashboard/relatorios" },
    ],
    admin: [
      { id: "usuarios", label: "Usuários", icon: "UserCog", href: "/usuarios" },
      { id: "configuracoes", label: "Configurações", icon: "Settings", href: "/configuracoes" },
    ],
  },
  supervisor: {
    principal: [
      { id: "dashboard", label: "Dashboard Geral", icon: "LayoutDashboard", href: "/dashboard" },
      { id: "visitantes", label: "Visitantes", icon: "Users", href: "/dashboard/visitantes", badge: 2 },
      { id: "setores", label: "Setores", icon: "Building2", href: "/setores" },
    ],
    operacao: [
      { id: "checkin", label: "Check-in / Out", icon: "ArrowLeftRight", href: "/checkin" },
      { id: "empresas", label: "Empresas", icon: "Briefcase", href: "/empresas" },
      { id: "relatorios", label: "Relatórios", icon: "FileBarChart", href: "/dashboard/relatorios" },
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
  tempo: { value : "1h 24m"}
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

export const STATS_RELATORIOS = {
  visitas: { value: 348, delta: 12, deltaDir: "up", sub: "vs mês anterior" },
  checkouts: { value: 322, delta: 100, deltaDir: "up", sub: "registrados" },
  permanencia: { value: "1h 42m", delta: 8, deltaDir: "down", sub: "vs mês anterior" },
  alertas: { value: 7, delta: 3, deltaDir: "down", sub: "pendentes" },
};

export const HISTORICO_VISITAS = [
  { visitante: "Marina Souza", empresa: "HabLab", tipo: "Técnico", setor: "Laboratório", entrada: "08:12", saida: "10:34", permanenciaStatus: 70, tempo: "2h 22m", status: "CONCLUÍDO" },
  { visitante: "Carlos Mendes", empresa: "FiltraTec", tipo: "Manutenção", setor: "Almoxarifado", entrada: "09:00", saida: "11:15", permanenciaStatus: 50, tempo: "2h 15m", status: "CONCLUÍDO" },
  { visitante: "Ana Ferreira", empresa: "ConsTech", tipo: "Fornecedor", setor: "Produção", entrada: "09:30", saida: "-", permanenciaStatus: 90, tempo: "4h 10m", status: "DENTRO" },
  { visitante: "Roberto Silva", empresa: "LogiMax", tipo: "Geral", setor: "Administração", entrada: "11:20", saida: "-", permanenciaStatus: 20, tempo: "0h 45m", status: "DENTRO" },
  { visitante: "Fernanda Costa", empresa: "Sigma Ltda", tipo: "Auditor", setor: "Qualidade", entrada: "13:00", saida: "16:45", permanenciaStatus: 100, tempo: "3h 45m", status: "CONCLUÍDO" },
];

export const SETORES_MAIS_VISITADOS = [
  { nome: "Produção", visitas: 128 },
  { nome: "Laboratório", visitas: 98 },
  { nome: "Almoxarifado", visitas: 68 },
  { nome: "Administração", visitas: 45 },
];

export const EMPRESAS_MAIS_VISITAS = [
  { nome: "GupiTao", visitas: 88, alertas: 3 },
  { nome: "HabLab", visitas: 82, alertas: 0 },
  { nome: "Sigma Ltda", visitas: 76, alertas: 0 },
  { nome: "FiltraTec", visitas: 54, alertas: 1 },
];
export const VISITANTES_HOJE = [
  { id: 1, nome: "Marina Souza",    empresa: "Nutrilab",          cpf: "012.345.678-90", entrada: "07:42", saida: null,    setor: "Lab",  status: "ativo",     cracha: "TAG-011" },
  { id: 2, nome: "Carlos Mendes",   empresa: "Manutenção Rápida", cpf: "123.456.789-00", entrada: "06:50", saida: null,    setor: "Adm",  status: "semsaida",  cracha: "TAG-018" },
  { id: 3, nome: "Ana Pereira",     empresa: "Auditoria Sul",     cpf: "099.785.432-10", entrada: "08:15", saida: "12:30", setor: "Adm",  status: "finalizado", cracha: "TAG-004" },
  { id: 4, nome: "João Carvalho",   empresa: "TechFix Ltda",      cpf: "321.654.987-55", entrada: "08:00", saida: null,    setor: "Prod", status: "ativo",     cracha: "TAG-022" },
  { id: 5, nome: "Fernanda Lima",   empresa: "ForneSeg",          cpf: "321.654.987-11", entrada: "09:00", saida: "17:45", setor: "Adm",  status: "finalizado", cracha: "TAG-007" },
  { id: 6, nome: "Pedro Rocha",     empresa: "SupriTec",          cpf: "456.789.123-77", entrada: "07:10", saida: null,    setor: "Prod", status: "semsaida",  cracha: "TAG-003" },
  { id: 7, nome: "Marcos Oliveira", empresa: "Manutenção Rápida", cpf: "654.321.098-44", entrada: "10:30", saida: "15:00", setor: "Adm",  status: "finalizado", cracha: "TAG-016" },
  { id: 8, nome: "Lívia Santos",    empresa: "Nutrilab",          cpf: "111.222.333-44", entrada: "11:00", saida: null,    setor: "Lab",  status: "ativo",     cracha: "TAG-031" },
  { id: 9, nome: "Roberto Faria",   empresa: "LogiMax",           cpf: "555.666.777-88", entrada: "08:30", saida: "13:00", setor: "Prod", status: "finalizado", cracha: "TAG-009" },
  { id: 10, nome: "Tatiane Braga",  empresa: "Auditoria Sul",     cpf: "999.888.777-66", entrada: "09:45", saida: null,    setor: "Adm",  status: "ativo",     cracha: "TAG-025" },
  { id: 11, nome: "Eduardo Lima",   empresa: "TechFix Ltda",      cpf: "432.109.876-32", entrada: "13:00", saida: "16:00", setor: "Lab",  status: "finalizado", cracha: "TAG-041" },
  { id: 12, nome: "Camila Torres",  empresa: "SupriTec",          cpf: "876.543.210-11", entrada: "14:20", saida: null,    setor: "Prod", status: "ativo",     cracha: "TAG-052" },
];

export const ALERTAS_VISITANTES = [
  { nome: "Carlos Mendes", setor: "Almox" },
  { nome: "Pedro Rocha",   setor: "Prod" },
];