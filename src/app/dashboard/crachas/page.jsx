"use client";

import { useState, useMemo } from "react";
import {
  CreditCard, ArrowRightLeft, Undo2, AlertTriangle,
  Search, Filter, X, Download, Plus, Check,
  ChevronDown, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CRACHAS_MOCK = [
  { id: 1,  tagId: "TAG-001", visitante: "João Carvalho",    empresa: "SupliTec",   setor: "Produção",      entrega: "29/07/2025 · 08:02", devolucao: null,                status: "alerta"     },
  { id: 2,  tagId: "TAG-002", visitante: "Marina Souza",     empresa: "NutriFab",   setor: "Laboratório",   entrega: "29/07/2025 · 08:15", devolucao: null,                status: "emprestado" },
  { id: 3,  tagId: "TAG-003", visitante: "Carlos Mendes",    empresa: "AçoForte",   setor: "Almoxarifado",  entrega: "29/07/2025 · 08:34", devolucao: "29/07/2025 · 11:20", status: "devolvido"  },
  { id: 4,  tagId: "TAG-004", visitante: "Beatriz Ramos",    empresa: "Carrefour",  setor: "Diretoria",     entrega: "29/07/2025 · 09:00", devolucao: "29/07/2025 · 10:45", status: "devolvido"  },
  { id: 5,  tagId: "TAG-005", visitante: "André Costa",      empresa: "SupliTec",   setor: "Produção",      entrega: "29/07/2025 · 09:10", devolucao: null,                status: "emprestado" },
  { id: 6,  tagId: "TAG-006", visitante: "Fernanda Lima",    empresa: "LogisBR",    setor: "Recepção",      entrega: "29/07/2025 · 09:30", devolucao: null,                status: "ativo"      },
  { id: 7,  tagId: "TAG-007", visitante: "Ricardo Pereira",  empresa: "MecParts",   setor: "Manutenção",    entrega: "29/07/2025 · 10:05", devolucao: null,                status: "alerta"     },
  { id: 8,  tagId: "TAG-008", visitante: "Camila Torres",    empresa: "VigilSec",   setor: "Portaria",      entrega: "29/07/2025 · 10:22", devolucao: "29/07/2025 · 12:00", status: "devolvido"  },
  { id: 9,  tagId: "TAG-009", visitante: "Paulo Nascimento", empresa: "FoodAudit",  setor: "Laboratório",   entrega: "29/07/2025 · 11:00", devolucao: null,                status: "emprestado" },
  { id: 10, tagId: "TAG-010", visitante: "Larissa Fonseca",  empresa: "NutriFab",   setor: "Produção",      entrega: "29/07/2025 · 11:45", devolucao: null,                status: "ativo"      },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  ativo:       "Ativo",
  emprestado:  "Emprestado",
  devolvido:   "Devolvido",
  alerta:      "Alerta",
};

const STATUS_STYLE = {
  ativo:      "bg-green-100 text-green-700",
  emprestado: "bg-amber-100 text-amber-700",
  devolvido:  "bg-blue-100  text-blue-700",
  alerta:     "bg-red-100   text-red-600",
};

const STATUS_DOT = {
  ativo:      "bg-green-500",
  emprestado: "bg-amber-500",
  devolvido:  "bg-blue-500",
  alerta:     "bg-red-500",
};

const SETOR_STYLE = {
  "Produção":     "bg-violet-100 text-violet-700",
  "Laboratório":  "bg-blue-100   text-blue-700",
  "Almoxarifado": "bg-amber-100  text-amber-700",
  "Diretoria":    "bg-red-100    text-red-700",
  "Recepção":     "bg-green-100  text-green-700",
  "Manutenção":   "bg-zinc-100   text-zinc-600",
  "Portaria":     "bg-teal-100   text-teal-700",
};

const SETOR_DOT = {
  "Produção":     "bg-violet-500",
  "Laboratório":  "bg-blue-500",
  "Almoxarifado": "bg-amber-500",
  "Diretoria":    "bg-red-500",
  "Recepção":     "bg-green-500",
  "Manutenção":   "bg-zinc-400",
  "Portaria":     "bg-teal-500",
};

const STATUS_FILTER_OPTS = ["Todas", "ativo", "emprestado", "devolvido", "alerta"];

function toCSV(rows) {
  const cols = ["Tag ID", "Visitante", "Empresa", "Setor", "Entrega", "Devolução", "Status"];
  const lines = rows.map((r) =>
    [r.tagId, r.visitante, r.empresa, r.setor, r.entrega, r.devolucao ?? "—", STATUS_LABEL[r.status]].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "crachas.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Modal Cadastrar Nova TAG (Refatorado) ────────────────────────────────────
// Este modal agora é APENAS para cadastro de TAGs físicas, não para criar visitas.

function ModalCadastrarTag({ onClose, onSave }) {
  const [form, setForm] = useState({
    tagId: ""
  });

  function handleSubmit() {
    if (!form.tagId.trim()) {
      alert("Preencha o ID da TAG.");
      return;
    }
    
    // Validar se a TAG já existe
    const tagExistente = CRACHAS_MOCK.some(c => c.tagId.toUpperCase() === form.tagId.toUpperCase());
    if (tagExistente) {
      alert("Esta TAG já foi cadastrada no sistema.");
      return;
    }

    onSave({
      id: Date.now(),
      tagId: form.tagId.toUpperCase(),
      visitante: null,
      empresa: null,
      setor: null,
      entrega: null,
      devolucao: null,
      status: "disponivel"
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Cadastrar Nova TAG</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Cadastre um novo crachá físico no sistema. Este será vinculado a um visitante quando necessário.
          </p>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">ID da TAG *</label>
            <input
              type="text"
              value={form.tagId}
              placeholder="Ex: TAG-011"
              onChange={(e) => setForm({ tagId: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Use o formato TAG-XXX (ex: TAG-011, TAG-100)
            </p>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit}>
            <Check size={13} /> Cadastrar TAG
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Linha da Tabela ──────────────────────────────────────────────────────────

function LinhaCracha({ c }) {
  const isDisponivel = c.status === "disponivel";
  
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors">
      <td className="py-3 px-4">
        <span className="text-xs font-semibold font-mono text-primary">{c.tagId}</span>
      </td>
      <td className="py-3 px-4 text-sm font-medium text-foreground whitespace-nowrap">
        {c.visitante || "—"}
      </td>
      <td className="py-3 px-4 text-sm text-primary font-medium whitespace-nowrap">
        {c.empresa || "—"}
      </td>
      <td className="py-3 px-4">
        {c.setor ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SETOR_STYLE[c.setor] ?? "bg-muted text-muted-foreground"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${SETOR_DOT[c.setor] ?? "bg-muted-foreground"}`} />
            {c.setor}
          </span>
        ) : "—"}
      </td>
      <td className="py-3 px-4 text-sm text-foreground whitespace-nowrap">{c.entrega || "—"}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{c.devolucao ?? "—"}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isDisponivel 
            ? "bg-gray-100 text-gray-700" 
            : STATUS_STYLE[c.status] ?? "bg-muted text-muted-foreground"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isDisponivel 
              ? "bg-gray-500" 
              : STATUS_DOT[c.status] ?? "bg-muted-foreground"
          }`} />
          {isDisponivel ? "Disponível" : STATUS_LABEL[c.status] ?? c.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </td>
    </tr>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CrachasPage() {
  const [crachas, setCrachas]         = useState(CRACHAS_MOCK);
  const [modalAberto, setModalAberto] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState("Todas");
  const [busca, setBusca]             = useState("");

  const filtrados = useMemo(() => {
    return crachas.filter((c) => {
      const matchStatus = statusFiltro === "Todas" || c.status === statusFiltro;
      const q = busca.trim().toLowerCase();
      const matchBusca = !q ||
        c.tagId.toLowerCase().includes(q) ||
        (c.visitante && c.visitante.toLowerCase().includes(q)) ||
        (c.empresa && c.empresa.toLowerCase().includes(q)) ||
        (c.setor && c.setor.toLowerCase().includes(q));
      return matchStatus && matchBusca;
    });
  }, [crachas, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:      crachas.length,
    ativos:     crachas.filter((c) => c.status === "ativo").length,
    emprestados:crachas.filter((c) => c.status === "emprestado" || c.status === "alerta").length,
    devolvidos: crachas.filter((c) => c.status === "devolvido").length,
    alertas:    crachas.filter((c) => c.status === "alerta").length,
  }), [crachas]);

  function handleSave(novo) {
    setCrachas((p) => [novo, ...p]);
  }

  return (
    <>
      {modalAberto && (
        <ModalCadastrarTag
          onClose={() => setModalAberto(false)}
          onSave={handleSave}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard Crachás</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gestão de inventário de crachás e status de TAGs
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Cadastrar TAG
          </button>
        </header>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Total de TAGs"
            value={stats.total}
            valueClassName="text-primary"
            icon={<CreditCard size={17} className="text-primary" />}
            sub="crachás cadastrados"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Em Uso"
            value={stats.ativos}
            valueClassName="text-chart-1"
            icon={<ArrowRightLeft size={17} className="text-chart-1" />}
            sub="visitantes ativos"
            accentVar="var(--chart-1)"
          />
          <StatCard
            label="Emprestados"
            value={stats.emprestados}
            valueClassName="text-chart-2"
            icon={<AlertTriangle size={17} className="text-chart-2" />}
            sub="pendentes de devolução"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Devolvidos"
            value={stats.devolvidos}
            valueClassName="text-chart-3"
            icon={<Undo2 size={17} className="text-chart-3" />}
            sub="100% sem pendências"
            accentVar="var(--chart-3)"
          />
          <StatCard
            label="Alertas"
            value={stats.alertas}
            valueClassName="text-red-600"
            icon={<AlertTriangle size={17} className="text-red-600" />}
            sub="requerem atenção"
            accentVar="var(--red)"
          />
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">Filtrar:</span>
          {STATUS_FILTER_OPTS.map((opt) => {
            const isAlerta = opt === "alerta";
            const isActive = statusFiltro === opt;
            return (
              <button
                key={opt}
                onClick={() => setStatusFiltro(opt)}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${isActive
                    ? isAlerta
                      ? "bg-red-600 text-white border border-red-600"
                      : "bg-foreground text-background border border-foreground"
                    : isAlerta
                      ? "text-red-600 border border-red-200 bg-red-50 hover:bg-red-100"
                      : "text-muted-foreground border border-border hover:bg-accent"
                  }
                `}
              >
                {isAlerta && <AlertTriangle size={11} />}
                {opt === "Todas" ? "Todas" : STATUS_LABEL[opt]}
              </button>
            );
          })}
          {/* Busca */}
          <div className="ml-auto relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar tag, visitante…"
              className="h-8 pl-8 pr-3 w-52 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header da tabela */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Registro de Crachás</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {crachas.length} crachás cadastrados · mostrando {Math.min(10, filtrados.length)} por página
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Filter size={13} />
              </button>
              <button
                onClick={() => downloadCSV(filtrados)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Tag ID", "Visitante", "Empresa", "Setor Vinculado", "Data de Entrega", "Data de Devolução", "Status", ""].map((col) => (
                    <th
                      key={col}
                      className="py-2.5 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum crachá encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtrados.slice(0, 10).map((c) => <LinhaCracha key={c.id} c={c} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
