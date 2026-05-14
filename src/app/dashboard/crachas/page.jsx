"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CreditCard, ArrowRightLeft, Undo2, AlertTriangle,
  Search, Filter, X, Download, Plus, Check,
  ChevronDown, MoreHorizontal, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
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
            Adicione um novo crachá ao inventário do sistema. Ele será iniciado com status &quot;Disponível&quot;.
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
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
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
      <td className="py-3 px-4 text-right">
        <button className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/8 hover:text-primary">
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
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todas");

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

  const aplicarFiltros = () => {
    setStatusFiltro(tempStatusFiltro);
  };

  const limparFiltros = () => {
    setTempStatusFiltro("Todas");
    setStatusFiltro("Todas");
    setBusca("");
  };

  return (
    <>
      {modalAberto && (
        <ModalCadastrarTag
          onClose={() => setModalAberto(false)}
          onSave={carregarCrachas}
        />
      )}

      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        <Topbar
          title="Dashboard Crachás"
          subtitle="Gestão de inventário de crachás e status de TAGs"
          buttonText="Cadastrar Crachá"
          onButtonClick={() => setModalAberto(true)}
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
            valueClassName="text-secondary"
            icon={<ArrowRightLeft size={17} className="text-secondary" />}
            sub="visitantes ativos"
            accentVar="var(--chart-2)"
          />
          <StatCard
            label="Disponíveis"
            value={stats.disponiveis}
            valueClassName="text-foreground"
            icon={<Check size={17} className="text-foreground" />}
            sub="em estoque"
            accentVar="var(--chart-4)"
          />
          <StatCard
            label="Perdidos"
            value={stats.perdidos}
            valueClassName="text-amber-600"
            icon={<Undo2 size={17} className="text-amber-600" />}
            sub="precisam reposição"
            accentVar="var(--chart-3)"
          />
          <StatCard
            label="Alertas"
            value={stats.alertas}
            valueClassName="text-destructive"
            icon={<AlertTriangle size={17} className="text-destructive" />}
            sub="tempo excedido"
            accentVar="var(--destructive)"
          />
        </div>

        {/* Barra de Filtros Padronizada */}
        <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por ID, visitante ou empresa..."
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
                {statusFiltro !== "Todas" && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
                {filtrados.length} resultado(s)
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV(filtrados)}
                className="h-11 gap-2 rounded-xl border-border/60"
              >
                <Download size={14} />
                Exportar CSV
              </Button>
            </div>
          </div>

          {(statusFiltro !== "Todas" || busca) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {statusFiltro !== "Todas" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {STATUS_LABEL[statusFiltro] || statusFiltro}
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

        <div className="bg-card border border-border rounded-[24px] shadow-md overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm">Inventário de Crachás</h3>
            <p className="text-xs text-muted-foreground">Controle de TAGs e vinculações</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 px-4">TAG</th>
                  <th className="py-3 px-4">Usuário Atual</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Setor</th>
                  <th className="py-3 px-4">Entrega</th>
                  <th className="py-3 px-4">Devolução</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando crachás...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum crachá encontrado com os filtros aplicados.
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
              Status do Crachá
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_FILTER_OPTS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempStatusFiltro(status)}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    tempStatusFiltro === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {status === "Todas" ? "Todos os Status" : STATUS_LABEL[status] || status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Info:</strong> Crachás com status &quot;Alerta&quot; ou &quot;Perdido&quot; devem ser revisados imediatamente para evitar brechas de segurança.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
