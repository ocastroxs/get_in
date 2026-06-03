"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Search, X,
  Check, Shield, Eye,
  Mail, Phone, Building2, Briefcase,
  Trash2, Edit, Loader2, Filter, AlertTriangle, Download
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import ModalPortal from "@/components/ui/ModalPortal";
import PaginationControls from "@/components/ui/PaginationControls";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { exportTableToPdf } from "@/lib/exportPdf";
import { api } from "@/services/api";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────

const TIPO_LABEL = {
  port: "Portaria",
  sup: "Supervisor",
  adm: "Administrador"
};

const TIPO_STYLE = {
  port: "bg-blue-100 text-blue-700",
  sup: "bg-green-100 text-green-700",
  adm: "bg-red-100 text-red-700",
};

const TIPO_ICON = {
  port: <Shield size={14} />,
  sup: <Eye size={14} />,
  adm: <Briefcase size={14} />,
};

const CARGOS_VISIVEIS = new Set(["port", "sup", "adm"]);

const formatarTelefone = (tel) => {
  if (!tel) return "";
  const t = String(tel).replace(/\D/g, "");
  if (t.length === 11) {
    return t.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return t; // Retorna o bruto se não tiver 11 dígitos
};


const formatarCPF = (cpf) => {
  if (!cpf) return "000.000.000-00";

  const cpfLimpo = String(cpf).replace(/\D/g, "");

  return cpfLimpo
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const mascararTelefone = (value) => {
  const numeros = String(value || "").replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 6) return numeros.replace(/(\d{2})(\d+)/, "($1) $2");
  if (numeros.length <= 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  }

  return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


// ─── MODAL DE EDIÇÃO ─────────────────────────────────────────────────────────

function CampoEditarFuncionario({ label, icon, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <Input
          className={`h-10 rounded-xl border-border/70 bg-background text-sm ${icon ? "pl-9" : ""}`}
          {...props}
        />
      </div>
    </div>
  );
}

function ModalEditarFuncionario({ funcionario, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    nome: funcionario?.usuario_nome || funcionario?.nome || "",
    email: funcionario?.email || "",
    celular: mascararTelefone(funcionario?.celular || funcionario?.telefone || ""),
    tipo: funcionario?.cargo || funcionario?.tipo || "port",
  }));
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  if (!funcionario) return null;

  const nomeExibicao = form.nome.trim() || funcionario.usuario_nome || funcionario.nome || "Funcionário";
  const primeiraLetra = nomeExibicao.charAt(0).toUpperCase();
  const departamento = funcionario.departamento_nome || funcionario.departamentos?.nome || "Geral";

  const setCampo = (campo) => (event) => {
    const value = campo === "celular" ? mascararTelefone(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [campo]: value }));
    if (erro) setErro("");
  };

  async function handleSubmit(event) {
    event.preventDefault();

    const nome = form.nome.trim();
    const email = form.email.trim();
    const celular = form.celular.trim();
    const tipo = form.tipo;

    if (!funcionario.id) {
      setErro("Não foi possível identificar o funcionário.");
      return;
    }

    if (!nome) {
      setErro("Nome é obrigatório.");
      return;
    }

    if (!email) {
      setErro("E-mail é obrigatório.");
      return;
    }

    if (!validarEmail(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (!CARGOS_VISIVEIS.has(tipo)) {
      setErro("Selecione um nível de acesso válido.");
      return;
    }

    setSaving(true);
    setErro("");
    let salvou = false;

    try {
      const response = await api.put(`/func/${funcionario.id}`, {
        nome,
        email,
        celular,
        tipo,
      });

      if (response.sucesso) {
        salvou = true;
        onClose();
        onSave();
        return;
      }

      setErro(response.mensagem || "Erro ao atualizar funcionário.");
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      setErro("Erro de conexão com o servidor.");
    } finally {
      if (!salvou) setSaving(false);
    }
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Edit size={17} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Editar funcionário</h2>
              <p className="text-xs text-muted-foreground">Atualize os dados de acesso do colaborador</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-5" data-lenis-prevent>
            <div className="mb-5 rounded-2xl border border-border/60 bg-muted/25 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {primeiraLetra}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{nomeExibicao}</p>
                    <p className="font-mono text-xs text-muted-foreground">{formatarCPF(funcionario.cpf)}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <Building2 size={14} />
                  {departamento}
                </div>
              </div>
            </div>

            {erro && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <CampoEditarFuncionario
                label="Nome completo *"
                value={form.nome}
                onChange={setCampo("nome")}
                disabled={saving}
                className="md:col-span-2"
              />
              <CampoEditarFuncionario
                label="E-mail *"
                type="email"
                icon={<Mail size={14} />}
                value={form.email}
                onChange={setCampo("email")}
                disabled={saving}
              />
              <CampoEditarFuncionario
                label="Celular"
                type="tel"
                icon={<Phone size={14} />}
                placeholder="(11) 99999-9999"
                value={form.celular}
                onChange={setCampo("celular")}
                disabled={saving}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Nível de acesso *</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {["adm", "sup", "port"].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, tipo }));
                      if (erro) setErro("");
                    }}
                    disabled={saving}
                    className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all disabled:pointer-events-none disabled:opacity-60 ${
                      form.tipo === tipo
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {TIPO_ICON[tipo]}
                      {TIPO_LABEL[tipo]}
                    </span>
                    {form.tipo === tipo && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="h-10 gap-2 rounded-xl">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaFuncionario({ f, onEdit, onDelete }) {
  // Se f não existir por algum motivo bizarro, paramos aqui
  if (!f) return null;
  
  // Se o nome não existir, usamos um placeholder para não quebrar o .charAt(0)
  const nomeExibicao = f.usuario_nome || "Usuário sem Nome";
  const primeiraLetra = nomeExibicao.charAt(0).toUpperCase();

  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {primeiraLetra}
          </div>
          <div>
            <div className="font-medium text-sm text-foreground whitespace-nowrap">
              {nomeExibicao}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {f.cpf ? formatarCPF(f.cpf) : "000.000.000-00"}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} /> {f.email || "sem@email.com"}
          </div>
          {f.celular && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={12} /> {f.celular}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Building2 size={14} className="text-muted-foreground" />
          {f.departamento_nome || "Geral"}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${TIPO_STYLE[f.cargo] || "bg-gray-100 text-gray-700"}`}>
          {TIPO_ICON[f.cargo] || <Briefcase size={14} />}
          {TIPO_LABEL[f.cargo] || f.tipo || "Sem tipo"}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(f)} className="rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-primary/8 hover:text-primary">
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(f)} className="rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-destructive/8 hover:text-destructive">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function FuncionariosPage() {
  const router = useRouter();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroTipo, setTempFiltroTipo] = useState("Todos");
  const [modalEditar, setModalEditar] = useState({ open: false, data: null });

 const carregarFuncionarios = async ({ silent = false } = {}) => {
  if (!silent) setLoading(true);
  try {
    const response = await api.get('/func/view');
    

    // Se a sua API retorna { sucesso: true, data: [...] }
    if (response?.data?.sucesso || response?.sucesso) {
      const lista = response.data?.data || response.data || [];
      setFuncionarios(lista.filter((funcionario) => CARGOS_VISIVEIS.has(funcionario.cargo)));
    } 
    // Se a API retornar o array direto
    else if (Array.isArray(response)) {
      setFuncionarios(response.filter((funcionario) => CARGOS_VISIVEIS.has(funcionario.cargo)));
    }
  } catch (error) {
    console.error("Erro ao carregar funcionários:", error);
  } finally {
    // Adicionamos um pequeno delay para garantir que o React processe a mudança de estado
    setTimeout(() => setLoading(false), 300);
  }
};

  useAutoRefresh(carregarFuncionarios);

const filtrados = useMemo(() => {
  return funcionarios.filter((f) => {
    // 1. Filtro de Tipo
    const matchTipo = filtroTipo === "Todos" || f.cargo === filtroTipo;

    // 2. Filtro de Busca (Blindado contra campos nulos)
    const termo = busca.toLowerCase();
    
    // Convertemos tudo para string com fallback "" para evitar o erro de undefined
    const nome = (f.usuario_nome || "").toLowerCase();
    const cpf = (f.cpf || "");
    const email = (f.email || "").toLowerCase();

    const matchBusca = busca.trim() === "" ||
      nome.includes(termo) ||
      cpf.includes(termo) ||
      email.includes(termo);

    return matchTipo && matchBusca;
  });
}, [funcionarios, filtroTipo, busca]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: funcionariosPagina,
  } = usePagination(filtrados);

  const stats = useMemo(() => ({
    total: funcionarios.length,
    administradores: funcionarios.filter(f => f.cargo === 'adm').length,
    supervisores: funcionarios.filter(f => f.cargo === 'sup').length,
    portaria: funcionarios.filter(f => f.cargo === 'port').length,
  }), [funcionarios]);

  const aplicarFiltros = () => {
    setFiltroTipo(tempFiltroTipo);
  };

  const limparFiltros = () => {
    setTempFiltroTipo("Todos");
    setFiltroTipo("Todos");
    setBusca("");
  };

  async function exportarPDF() {
    if (filtrados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Funcionários",
        subtitle: "Gestão de colaboradores e níveis de acesso do sistema",
        fileName: `funcionarios_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroTipo !== "Todos" ? `Nível: ${TIPO_LABEL[filtroTipo] || filtroTipo}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Funcionário", weight: 1.3 },
          { header: "CPF", weight: 1 },
          { header: "E-mail", weight: 1.4 },
          { header: "Telefone", weight: 1 },
          { header: "Departamento", weight: 1.1 },
          { header: "Nível de Acesso", weight: 1 },
        ],
        rows: filtrados.map((funcionario) => [
          funcionario.usuario_nome || funcionario.nome || "Sem Nome",
          formatarCPF(funcionario.cpf),
          funcionario.email || "-",
          formatarTelefone(funcionario.celular || funcionario.telefone),
          funcionario.departamento_nome || "Geral",
          TIPO_LABEL[funcionario.cargo] || funcionario.cargo || funcionario.tipo || "-",
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível exportar o PDF.");
    }
  }

  const handleEditar = (funcionario) => {
    setModalEditar({ open: true, data: funcionario });
  };

  const handleExcluir = async (funcionario) => {
    if (!window.confirm(`Excluir funcionário ${funcionario.usuario_nome || funcionario.nome || ""}?`)) {
      return;
    }

    const response = await api.delete(`/func/${funcionario.id}`);
    if (response.sucesso) {
      setFuncionarios((prev) => prev.filter((item) => item.id !== funcionario.id));
    } else {
      alert(response.mensagem || "Erro ao excluir funcionário.");
    }
  };

  return (
    <>
    {modalEditar.open && (
      <ModalEditarFuncionario
        funcionario={modalEditar.data}
        onClose={() => setModalEditar({ open: false, data: null })}
        onSave={carregarFuncionarios}
      />
    )}
    <div className="flex flex-col gap-5 animate-in fade-in duration-700">
      <Topbar
        title="Funcionários"
        subtitle="Gestão de colaboradores e níveis de acesso do sistema"
        buttonText="Novo Funcionário"
        onButtonClick={() => router.push('/dashboard/funcionarios/registrarFuncionario')}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total"
          value={stats.total}
          valueClassName="text-primary"
          icon={<Users size={17} className="text-primary" />}
          sub="colaboradores"
          accentVar="var(--primary)"
        />
        <StatCard
          label="Administradores"
          value={stats.administradores}
          valueClassName="text-foreground"
          icon={<Briefcase size={17} className="text-foreground" />}
          sub="gestão"
          accentVar="var(--chart-4)"
        />
        <StatCard
          label="Supervisores"
          value={stats.supervisores}
          valueClassName="text-secondary"
          icon={<Eye size={17} className="text-secondary" />}
          sub="supervisão"
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Portaria"
          value={stats.portaria}
          valueClassName="text-primary"
          icon={<Shield size={17} className="text-primary" />}
          sub="acesso"
          accentVar="var(--primary)"
        />
      </div>

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <Button
              type="button"
              onClick={() => setModalFiltroAberto(true)}
              variant="outline"
              className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filtros</span>
              {filtroTipo !== "Todos" && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <Button
              type="button"
              onClick={exportarPDF}
              variant="outline"
              disabled={loading || filtrados.length === 0}
              className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
            <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
              {filtrados.length} resultado(s)
            </div>
          </div>
        </div>

        {(filtroTipo !== "Todos" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {filtroTipo !== "Todos" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Nível: {TIPO_LABEL[filtroTipo] || filtroTipo}
              </span>
            )}
            <Button
              variant="ghost"
              onClick={limparFiltros}
              className="h-7 px-2 text-[10px] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
            >
              Limpar tudo
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-md">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-bold text-sm">Listagem de Colaboradores</h3>
          <p className="text-xs text-muted-foreground">Gerenciamento de acessos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Funcionário</th>
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Nível de Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando funcionários...</p>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length > 0 ? (
                funcionariosPagina.map((f, index) => (
                  <LinhaFuncionario
                    key={f.id || f.cpf || index}
                    f={f}
                    onEdit={handleEditar}
                    onDelete={handleExcluir}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-muted/30" />
                      <p className="text-sm text-muted-foreground">Nenhum funcionário encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          currentCount={funcionariosPagina.length}
          onPageChange={setPage}
          itemLabel="funcionário(s)"
        />
      </div>

      {/* Modal de Filtro Padronizado */}
      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Nível de Acesso
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Todos", "adm", "sup", "port"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTempFiltroTipo(tipo)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroTipo === tipo
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{tipo === "Todos" ? "Todos os Níveis" : TIPO_LABEL[tipo]}</span>
                  {tempFiltroTipo === tipo && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </ModalFiltro>
    </div>
    </>
  );
}
