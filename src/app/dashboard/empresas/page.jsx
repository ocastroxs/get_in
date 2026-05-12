"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Download,
  Plus,
  Search,
  X,
  Edit2,
  History,
  Printer,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Loader2,
  Filter,
  Check
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";

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

function toCSV(rows) {
  const cols = ["Empresa", "CNPJ", "Responsável", "Contato", "Visitantes", "Última Visita", "Status"];
  const lines = rows.map((r) =>
    [r.nome || "—", r.cnpj || "—", r.responsavel || "—", r.contato || "—", r.visitantes || 0, r.ultimaVisita || "—", r.status || "—"].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "empresas.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaEmpresa({ emp, maxVisitantes, index }) {
  if (!emp) return null;

  const color = emp.color || COLORS[index % COLORS.length];

  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors group">
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
            <p className="text-[10px] text-muted-foreground mt-1">{emp.categoria || "—"}</p>
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
        <p className="text-[11px] font-medium leading-none">{emp.ultimaVisita ? emp.ultimaVisita.split(" ")[0] : "—"}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{emp.ultimaVisita ? emp.ultimaVisita.split(" ")[1] : ""}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[emp.status] ?? "bg-gray-100 text-gray-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[emp.status] ?? "bg-gray-400"}`} />
          {emp.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5 px-2">
            <Edit2 size={10} /> Editar
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <History size={12} className="text-muted-foreground" />
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
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todas");

  const carregarEmpresas = async () => {
    setLoading(true);
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

  useEffect(() => {
    carregarEmpresas();
  }, []);

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

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Empresas Terceirizadas</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestão de empresas terceirizadas e visitantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV(empresasFiltradas)}
            className="gap-2 rounded-xl"
          >
            <Download size={14} />
            Exportar CSV
          </Button>
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
          >
            <Plus size={14} />
            Cadastrar Empresa
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total"
          value={stats.total}
          valueClassName="text-blue-600"
          icon={<Briefcase size={17} className="text-blue-600" />}
          sub="cadastradas"
          accentVar="var(--blue-500)"
        />
        <StatCard
          label="Ativas"
          value={stats.ativas}
          valueClassName="text-green-600"
          icon={<CheckCircle2 size={17} className="text-green-600" />}
          sub={`${stats.pctAtivas}% do total`}
          accentVar="var(--green-500)"
        />
        <StatCard
          label="Mais Visitada"
          value={stats.maisVisitada?.nome || "—"}
          valueClassName="text-cyan-600 font-bold text-sm"
          icon={<TrendingUp size={17} className="text-cyan-600" />}
          sub={`${stats.maisVisitada?.visitantes || 0} visitas`}
          accentVar="var(--cyan-500)"
        />
        <StatCard
          label="Menos Visitada"
          value={stats.menosVisitada?.nome || "—"}
          valueClassName="text-yellow-600 font-bold text-sm"
          icon={<TrendingDown size={17} className="text-yellow-600" />}
          sub={`${stats.menosVisitada?.visitantes || 0} visitas`}
          accentVar="var(--yellow-500)"
        />
      </div>

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar empresa, CNPJ..."
                className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm"
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
              className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80"
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

          <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
            {empresasFiltradas.length} resultado(s)
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
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Limpar tudo
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Registro de Empresas</h3>
            <p className="text-[10px] text-muted-foreground">{empresasFiltradas.length} empresas encontradas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => downloadCSV(empresasFiltradas)}>
              <Download size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
              <Printer size={14} />
            </Button>
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
                  <LinhaEmpresa key={emp.id || i} emp={emp} maxVisitantes={maxVisitantes} index={i} />
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
          
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <p className="text-[10px] text-cyan-600 leading-relaxed">
              <strong>Dica:</strong> Empresas inativas ou suspensas não podem ter visitantes autorizados na portaria.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
