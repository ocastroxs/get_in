"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CreditCard, ArrowRightLeft, Undo2, AlertTriangle,
  Search, Filter, X, Download, Plus, Check,
  ChevronDown, MoreHorizontal, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { api } from "@/services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  disponivel: "Disponível",
  emUso:      "Em Uso",
  perdido:    "Perdido",
  alerta:     "Alerta",
  // Fallbacks para compatibilidade com mock anterior
  ativo:      "Ativo",
  emprestado: "Emprestado",
  devolvido:  "Devolvido",
};

const STATUS_STYLE = {
  disponivel: "bg-gray-100 text-gray-700",
  emUso:      "bg-green-100 text-green-700",
  perdido:    "bg-red-100   text-red-600",
  alerta:     "bg-red-100   text-red-600",
  // Fallbacks
  ativo:      "bg-green-100 text-green-700",
  emprestado: "bg-amber-100 text-amber-700",
  devolvido:  "bg-blue-100  text-blue-700",
};

const STATUS_DOT = {
  disponivel: "bg-gray-500",
  emUso:      "bg-green-500",
  perdido:    "bg-red-500",
  alerta:     "bg-red-500",
  // Fallbacks
  ativo:      "bg-green-500",
  emprestado: "bg-amber-500",
  devolvido:  "bg-blue-500",
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

const STATUS_FILTER_OPTS = ["Todas", "disponivel", "emUso", "perdido", "alerta"];

function toCSV(rows) {
  const cols = ["ID", "Status", "Tag Código"];
  const lines = rows.map((r) =>
    [r.id, STATUS_LABEL[r.status] || r.status, r.codigoTag || "—"].join(";")
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

// ─── Modal Cadastrar Nova TAG ────────────────────────────────────────────────

function ModalCadastrarTag({ onClose, onSave }) {
  const [form, setForm] = useState({
    tagId: ""
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.tagId.trim()) {
      alert("Preencha o ID da TAG.");
      return;
    }
    
    setLoading(true);
    try {
      // No back-end atual, precisamos criar um crachá e depois uma tag
      // Ou apenas o crachá se a lógica for simplificada.
      // Por enquanto, vamos simular a chamada que você integrará.
      const response = await api.post('/cracha', { status: 'disponivel' });
      
      if (response.sucesso) {
        onSave();
        onClose();
      } else {
        alert(response.mensagem || "Erro ao cadastrar crachá.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Cadastrar Novo Crachá</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Adicione um novo crachá ao inventário do sistema. Ele será iniciado com status "Disponível".
          </p>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Identificador (Opcional)</label>
            <input
              type="text"
              value={form.tagId}
              placeholder="Ex: TAG-011"
              onChange={(e) => setForm({ tagId: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Confirmar Cadastro
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Linha da Tabela ──────────────────────────────────────────────────────────

function LinhaCracha({ c }) {
  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors">
      <td className="py-3 px-4">
        <span className="text-xs font-semibold font-mono text-primary">#{c.id}</span>
      </td>
      <td className="py-3 px-4 text-sm font-medium text-foreground whitespace-nowrap">
        {c.visitante || <span className="text-muted-foreground italic text-xs">Nenhum vinculado</span>}
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[c.status] ?? "bg-muted text-muted-foreground"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status] ?? "bg-muted-foreground"}`} />
          {STATUS_LABEL[c.status] || c.status}
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
  const [crachas, setCrachas]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState("Todas");
  const [busca, setBusca]             = useState("");

  const carregarCrachas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cracha');
      if (response.sucesso) {
        setCrachas(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar crachás:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCrachas();
  }, []);

  const filtrados = useMemo(() => {
    return crachas.filter((c) => {
      const matchStatus = statusFiltro === "Todas" || c.status === statusFiltro;
      const q = busca.trim().toLowerCase();
      const matchBusca = !q ||
        String(c.id).includes(q) ||
        (c.visitante && c.visitante.toLowerCase().includes(q)) ||
        (c.empresa && c.empresa.toLowerCase().includes(q));
      return matchStatus && matchBusca;
    });
  }, [crachas, statusFiltro, busca]);

  const stats = useMemo(() => ({
    total:      crachas.length,
    emUso:      crachas.filter((c) => c.status === "emUso").length,
    disponiveis:crachas.filter((c) => c.status === "disponivel").length,
    perdidos:   crachas.filter((c) => c.status === "perdido").length,
    alertas:    crachas.filter((c) => c.status === "alerta").length,
  }), [crachas]);

  return (
    <>
      {modalAberto && (
        <ModalCadastrarTag
          onClose={() => setModalAberto(false)}
          onSave={carregarCrachas}
        />
      )}

      <div className="flex flex-col gap-5">
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
            <Plus size={16} /> Cadastrar Crachá
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Total"
            value={stats.total}
            valueClassName="text-primary"
            icon={<CreditCard size={17} className="text-primary" />}
            sub="cadastrados"
            accentVar="var(--primary)"
          />
          <StatCard
            label="Em Uso"
            value={stats.emUso}
            valueClassName="text-green-600"
            icon={<ArrowRightLeft size={17} className="text-green-600" />}
            sub="visitantes ativos"
            accentVar="var(--green-500)"
          />
          <StatCard
            label="Disponíveis"
            value={stats.disponiveis}
            valueClassName="text-blue-600"
            icon={<Check size={17} className="text-blue-600" />}
            sub="prontos para uso"
            accentVar="var(--blue-500)"
          />
          <StatCard
            label="Perdidos"
            value={stats.perdidos}
            valueClassName="text-amber-600"
            icon={<AlertTriangle size={17} className="text-amber-600" />}
            sub="requerem reposição"
            accentVar="var(--amber-500)"
          />
          <StatCard
            label="Alertas"
            value={stats.alertas}
            valueClassName="text-red-600"
            icon={<AlertTriangle size={17} className="text-red-600" />}
            sub="atenção necessária"
            accentVar="var(--red-500)"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">Filtrar:</span>
          {STATUS_FILTER_OPTS.map((opt) => {
            const isAlerta = opt === "alerta" || opt === "perdido";
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
                {STATUS_LABEL[opt] || opt}
              </button>
            );
          })}
          <div className="ml-auto relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por ID ou visitante…"
              className="h-8 pl-8 pr-3 w-52 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Registro de Crachás</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {loading ? "Carregando dados..." : `${crachas.length} crachás encontrados`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={carregarCrachas}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Recarregar"
              >
                <Undo2 size={13} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => downloadCSV(filtrados)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["ID", "Visitante Atual", "Empresa", "Setor", "Entrega", "Devolução", "Status", ""].map((col) => (
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Sincronizando com o servidor...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-8 h-8 text-muted-foreground/30" />
                        <span className="text-sm text-muted-foreground">Nenhum crachá encontrado.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((c) => <LinhaCracha key={c.id} c={c} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
