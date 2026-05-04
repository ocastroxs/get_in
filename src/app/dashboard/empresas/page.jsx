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
  Users,
  Loader2,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { EMPRESAS_LISTA } from "@/lib/mockData";

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

function toCSV(rows) {
  const cols = ["Empresa", "CNPJ", "Responsável", "Contato", "Visitantes", "Última Visita", "Status"];
  const lines = rows.map((r) =>
    [r.nome, r.cnpj, r.responsavel, r.contato || "—", r.visitantes, r.ultimaVisita || "—", r.status].join(";")
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

function LinhaEmpresa({ emp, maxVisitantes }) {
  if (!emp) return null;

  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: emp.color || "#3b82f6" }}
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
                width: maxVisitantes > 0 ? `${(emp.visitantes / maxVisitantes) * 100}%` : "0%",
                backgroundColor: emp.color || "#3b82f6",
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

  const carregarEmpresas = async () => {
    setLoading(true);
    try {
      // 🔌 Endpoint futuro: /empresas ou /terceirizadas
      // Por enquanto, usamos dados mockados pois o back-end ainda não possui este modelo
      const response = await api.get('/empresas');
      if (response.sucesso) {
        setEmpresas(response.data || []);
      } else {
        // Fallback para dados mockados enquanto o back-end não implementa
        setEmpresas(EMPRESAS_LISTA);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      // Fallback para dados mockados
      setEmpresas(EMPRESAS_LISTA);
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

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Empresas Terceirizadas</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestão de empresas terceirizadas e visitantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(empresasFiltradas)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Download size={16} /> Exportar
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Cadastrar Empresa
          </button>
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

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground px-2 shrink-0">Status:</span>
            {["Todas", "Ativa", "Inativa", "Suspensa"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filtroStatus === status
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {status}
              </button>
            ))}
            {(busca || filtroStatus !== "Todas") && (
              <button
                onClick={() => { setBusca(""); setFiltroStatus("Todas"); }}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Buscar empresa, CNPJ..."
              className="pl-9 h-9 text-xs"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Registro de Empresas</h3>
            <p className="text-[10px] text-muted-foreground">{empresasFiltradas.length} empresas • mostrando por página</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => downloadCSV(empresasFiltradas)}>
              <Download size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
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
                empresasFiltradas.map((emp) => (
                  <LinhaEmpresa key={emp.id} emp={emp} maxVisitantes={maxVisitantes} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
