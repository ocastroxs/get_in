"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useState, useMemo } from "react";
import {
  Download,
  Plus,
  Search,
  X,
  Edit2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Loader2,
  Filter,
  Check,
  Trash2,
  AlertTriangle
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────

const STATUS_LABEL = {
  "Ativa": "Ativa",
  "Inativa": "Inativa",
  "Suspensa": "Suspensa"
};

const STATUS_STYLE = {
  "Ativa": "bg-green-100 text-green-700",
  "Inativa": "bg-gray-100 text-gray-700",
  "Suspensa": "bg-red-100 text-red-700"
};

const STATUS_DOT = {
  "Ativa": "bg-green-500",
  "Inativa": "bg-gray-500",
  "Suspensa": "bg-red-500"
};

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
const EMPRESA_VAZIA = {
  nome: "",
  categoria: "",
  cnpj: "",
  responsavel: "",
  celular: "",
  contato: "",
  status: "Ativa",
};

function formatarUltimaVisita(value) {
  if (!value) return null;
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return value;
  return data.toLocaleString(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ModalEmpresa({ empresa, onClose, onSave }) {
  const isEdicao = Boolean(empresa?.id);
  const [form, setForm] = useState({ ...EMPRESA_VAZIA, ...(empresa || {}) });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const set = (campo) => (event) => setForm((prev) => ({ ...prev, [campo]: event.target.value }));

  async function handleSubmit() {
    if (!form.nome.trim()) {
      setErro("Nome da empresa e obrigatorio.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const payload = {
        nome: form.nome,
        categoria: form.categoria,
        cnpj: form.cnpj,
        responsavel: form.responsavel,
        celular: form.celular,
        contato: form.contato,
        status: form.status,
      };
      const response = isEdicao
        ? await api.put(`/empresas/${empresa.id}`, payload)
        : await api.post("/empresas", payload);

      if (response.sucesso) {
        onSave(response.data, isEdicao);
        onClose();
      } else {
        setErro(response.mensagem || "Erro ao salvar empresa.");
      }
    } catch (error) {
      console.error(error);
      setErro("Erro de conexao com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {isEdicao ? <Edit2 size={15} className="text-primary" /> : <Plus size={15} className="text-primary" />}
            </div>
            <h2 className="font-semibold text-foreground">{isEdicao ? "Editar Empresa" : "Cadastrar Empresa"}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          {erro && (
            <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {erro}
            </div>
          )}
          <CampoEmpresa label="Nome *" value={form.nome} onChange={set("nome")} className="md:col-span-2" />
          <CampoEmpresa label="Categoria" value={form.categoria || ""} onChange={set("categoria")} />
          <CampoEmpresa label="CNPJ" value={form.cnpj || ""} onChange={set("cnpj")} />
          <CampoEmpresa label="Responsavel" value={form.responsavel || ""} onChange={set("responsavel")} />
          <CampoEmpresa label="Celular" value={form.celular || ""} onChange={set("celular")} />
          <CampoEmpresa label="Contato" value={form.contato || ""} onChange={set("contato")} />
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={form.status || "Ativa"}
              onChange={set("status")}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {["Ativa", "Inativa", "Suspensa"].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function CampoEmpresa({ label, value, onChange, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function ModalConfirmarExclusao({ empresa, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle size={16} className="text-destructive" />
          </div>
          <h2 className="font-semibold text-foreground">Excluir Empresa</h2>
        </div>
        <p className="px-6 py-5 text-sm text-muted-foreground">
          Confirma a exclusao de <strong className="text-foreground">{empresa?.nome}</strong>?
        </p>
        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={onConfirm}>
            <Trash2 size={13} />
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaEmpresa({ emp, maxVisitantes, index, onEdit, onDelete }) {
  if (!emp) return null;

  const color = emp.color || COLORS[index % COLORS.length];

  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035] group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {(emp.nome || "?").substring(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold leading-none">{emp.nome || "—"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {[emp.categoria, emp.cnpj ? `CNPJ ${emp.cnpj}` : null].filter(Boolean).join(" / ") || "Sem dados complementares"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{emp.cnpj || "—"}</td>
      <td className="px-4 py-3">
        <p className="text-xs font-bold leading-none">{emp.responsavel || "—"}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{emp.celular || "—"}</p>
      </td>
      <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{emp.contato || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-[100px]">
          <span className="text-xs font-bold w-4">{emp.visitantes || 0}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: maxVisitantes > 0 ? `${((emp.visitantes || 0) / maxVisitantes) * 100}%` : "0%",
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-[11px] font-medium leading-none">{formatarUltimaVisita(emp.ultimaVisita) || "—"}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[emp.status] ?? "bg-gray-100 text-gray-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[emp.status] ?? "bg-gray-400"}`} />
          {emp.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl border-border/70 bg-white/75 px-3 text-[10px] hover:border-primary/20 hover:bg-white" onClick={() => onEdit(emp)}>
            <Edit2 size={10} /> Editar
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => onDelete(emp)}>
            <Trash2 size={12} className="text-muted-foreground" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [modalEmpresa, setModalEmpresa] = useState({ open: false, data: null });
  const [modalExcluir, setModalExcluir] = useState({ open: false, data: null });
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todas");

  const carregarEmpresas = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/empresas');
      if (response.sucesso) {
        setEmpresas(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(carregarEmpresas);

  const empresasFiltradas = useMemo(() => {
    return empresas.filter((emp) => {
      const matchesStatus = filtroStatus === "Todas" || emp.status === filtroStatus;
      const matchesBusca = !busca.trim() ||
        (emp.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
        (emp.cnpj || "").includes(busca);
      return matchesStatus && matchesBusca;
    });
  }, [empresas, filtroStatus, busca]);

  const stats = useMemo(() => {
    const ativas = empresas.filter((e) => e.status === "Ativa").length;
    const maisVisitada = empresas.reduce((a, b) => (b.visitantes || 0) > (a.visitantes || 0) ? b : a, empresas[0]);
    const menosVisitada = empresas.reduce((a, b) => (b.visitantes || 0) < (a.visitantes || 0) ? b : a, empresas[0]);
    
    return {
      total: empresas.length,
      ativas,
      pctAtivas: empresas.length > 0 ? Math.round((ativas / empresas.length) * 100) : 0,
      maisVisitada: maisVisitada || {},
      menosVisitada: menosVisitada || {},
    };
  }, [empresas]);

  const maxVisitantes = useMemo(() => Math.max(...empresas.map((e) => e.visitantes || 0), 1), [empresas]);

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todas");
    setFiltroStatus("Todas");
    setBusca("");
  };

  async function exportarPDF() {
    if (empresasFiltradas.length === 0) {
      alert("Nao ha dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Empresas Terceirizadas",
        subtitle: "Gestao de empresas terceirizadas e visitantes",
        fileName: `empresas_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "Todas" ? `Status: ${filtroStatus}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Empresa", weight: 1.4 },
          { header: "CNPJ", weight: 1 },
          { header: "Responsavel", weight: 1.1 },
          { header: "Contato", weight: 1 },
          { header: "Visitantes", weight: 0.8 },
          { header: "Ultima Visita", weight: 1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: empresasFiltradas.map((empresa) => [
          empresa.nome || "-",
          empresa.cnpj || "-",
          empresa.responsavel || "-",
          empresa.contato || "-",
          empresa.visitantes || 0,
          formatarUltimaVisita(empresa.ultimaVisita) || "-",
          empresa.status || "-",
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Nao foi possivel exportar o PDF.");
    }
  }

  const handleSaveEmpresa = (empresa, isEdicao) => {
    if (!empresa?.id) {
      carregarEmpresas();
      return;
    }

    setEmpresas((prev) => (
      isEdicao
        ? prev.map((item) => (item.id === empresa.id ? empresa : item))
        : [empresa, ...prev]
    ));
  };

  const handleExcluirEmpresa = async () => {
    const id = modalExcluir.data?.id;
    if (!id) return;

    const response = await api.delete(`/empresas/${id}`);
    if (response.sucesso) {
      setEmpresas((prev) => prev.filter((empresa) => empresa.id !== id));
      setModalExcluir({ open: false, data: null });
    } else {
      alert(response.mensagem || "Erro ao excluir empresa.");
    }
  };

  return (
    <>
    {modalEmpresa.open && (
      <ModalEmpresa
        empresa={modalEmpresa.data}
        onClose={() => setModalEmpresa({ open: false, data: null })}
        onSave={handleSaveEmpresa}
      />
    )}
    {modalExcluir.open && (
      <ModalConfirmarExclusao
        empresa={modalExcluir.data}
        onClose={() => setModalExcluir({ open: false, data: null })}
        onConfirm={handleExcluirEmpresa}
      />
    )}
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Topbar
        title="Empresas Terceirizadas"
        subtitle="Gestão de empresas terceirizadas e visitantes"
        buttonText="Cadastrar Empresa"
        onButtonClick={() => setModalEmpresa({ open: true, data: null })}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          valueClassName="text-primary"
          icon={<Briefcase size={17} className="text-primary" />}
          sub="cadastradas"
          accentVar="var(--primary)"
        />
        <StatCard
          label="Ativas"
          value={stats.ativas}
          valueClassName="text-secondary"
          icon={<CheckCircle2 size={17} className="text-secondary" />}
          sub={`${stats.pctAtivas}% do total`}
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Mais Visitada"
          value={stats.maisVisitada?.nome || "—"}
          valueClassName="text-foreground font-bold text-sm"
          icon={<TrendingUp size={17} className="text-foreground" />}
          sub={`${stats.maisVisitada?.visitantes || 0} visitas`}
          accentVar="var(--chart-4)"
        />
        <StatCard
          label="Menos Visitada"
          value={stats.menosVisitada?.nome || "—"}
          valueClassName="text-foreground font-bold text-sm"
          icon={<TrendingDown size={17} className="text-muted-foreground" />}
          sub={`${stats.menosVisitada?.visitantes || 0} visitas`}
          accentVar="var(--border)"
        />
      </div>

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar empresa, CNPJ..."
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
              {filtroStatus !== "Todas" && (
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
              disabled={loading || empresasFiltradas.length === 0}
              className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
            <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/20">
              {empresasFiltradas.length} resultado(s)
            </div>
          </div>
        </div>

        {(filtroStatus !== "Todas" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {filtroStatus !== "Todas" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Status: {filtroStatus}
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

      <div className="bg-card rounded-[24px] border border-border overflow-hidden shadow-md">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Registro de Empresas</h3>
            <p className="text-[10px] text-muted-foreground">{empresasFiltradas.length} empresas encontradas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">CNPJ</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Visitantes</th>
                <th className="px-4 py-3">Última Visita</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando empresas...</span>
                    </div>
                  </td>
                </tr>
              ) : empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-sm text-muted-foreground">
                    Nenhuma empresa encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map((emp, i) => (
                  <LinhaEmpresa
                    key={emp.id || i}
                    emp={emp}
                    maxVisitantes={maxVisitantes}
                    index={i}
                    onEdit={(data) => setModalEmpresa({ open: true, data })}
                    onDelete={(data) => setModalExcluir({ open: true, data })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
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
              Status da Empresa
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Todas", "Ativa", "Inativa", "Suspensa"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroStatus === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{status === "Todas" ? "Todos os Status" : status}</span>
                  {tempFiltroStatus === status && <Check size={14} />}
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
